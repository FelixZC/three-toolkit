import * as THREE from 'three';
import { GUI } from 'lil-gui';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass'
import { OrbitControls, EffectComposer, RenderPass, ShaderPass, UnrealBloomPass, } from 'three-stdlib'
import vertexShader from './vertexshader.glsl'
import fragmentShader from './fragmentshader.glsl'
class Sketch {
  create() {
    // 定义一个常量用于标识需要添加发光效果的场景
    const BLOOM_SCENE = 1;

    // 创建一个图层并设置为发光场景
    const bloomLayer = new THREE.Layers();
    bloomLayer.set(BLOOM_SCENE);

    // 定义发光效果的参数
    const params = {
      threshold: 0,
      strength: 1,
      radius: 0.5,
      exposure: 1
    };

    // 创建一个用于暗化非发光物体的材质
    const darkMaterial = new THREE.MeshBasicMaterial({ color: 'black' });
    const materials: { [key: string]: THREE.Material } = {};

    // 创建WebGL渲染器，并设置各项参数以提高画质
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    document.body.appendChild(renderer.domElement);

    // 创建场景和相机
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 200);
    camera.position.set(0, 0, 20);
    camera.lookAt(0, 0, 0);

    // 添加轨道控制
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.maxPolarAngle = Math.PI * 0.5;
    controls.minDistance = 1;
    controls.maxDistance = 100;
    controls.addEventListener('change', render);

    // 创建渲染通道
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = params.threshold;
    bloomPass.strength = params.strength;
    bloomPass.radius = params.radius;

    // 创建发光合成器
    const bloomComposer = new EffectComposer(renderer);
    bloomComposer.renderToScreen = false;
    bloomComposer.addPass(renderScene);
    bloomComposer.addPass(bloomPass);

    // 创建混合通道
    const mixPass = new ShaderPass(
      new THREE.ShaderMaterial({
        uniforms: {
          baseTexture: { value: null },
          bloomTexture: { value: bloomComposer.renderTarget2.texture }
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        defines: {}
      }), 'baseTexture'
    );
    mixPass.needsSwap = true;

    // 创建输出通道
    const outputPass = new OutputPass();

    // 创建最终合成器，并添加各个通道
    const finalComposer = new EffectComposer(renderer);
    finalComposer.addPass(renderScene);
    finalComposer.addPass(mixPass);
    finalComposer.addPass(outputPass);

    // 创建光线投射器和鼠标坐标
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // 添加鼠标点击事件监听
    window.addEventListener('pointerdown', onPointerDown);

    // 创建GUI界面
    const gui = new GUI();

    // 创建发光效果控制面板
    const bloomFolder = gui.addFolder('bloom');
    bloomFolder.add(params, 'threshold', 0.0, 1.0).onChange(function (value: string) {
      bloomPass.threshold = Number(value);
      render();
    });
    bloomFolder.add(params, 'strength', 0.0, 3).onChange(function (value: string) {
      bloomPass.strength = Number(value);
      render();
    });
    bloomFolder.add(params, 'radius', 0.0, 1.0).step(0.01).onChange(function (value: string) {
      bloomPass.radius = Number(value);
      render();
    });

    // 创建色调映射控制面板
    const toneMappingFolder = gui.addFolder('tone mapping');
    toneMappingFolder.add(params, 'exposure', 0.1, 2).onChange(function (value: number) {
      renderer.toneMappingExposure = Math.pow(value, 4.0);
      render();
    });

    // 初始化场景
    setupScene();

    // 鼠标点击事件处理函数
    function onPointerDown(event: MouseEvent) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, false);
      if (intersects.length > 0) {
        const object = intersects[0].object;
        object.layers.toggle(BLOOM_SCENE);
        render();
      }
    }

    // 窗口尺寸改变时的处理函数
    window.onresize = function () {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      bloomComposer.setSize(width, height);
      finalComposer.setSize(width, height);
      render();
    };

    // 场景设置函数
    function setupScene() {
      //@ts-ignore
      scene.traverse(disposeMaterial);
      scene.children.length = 0;
      const geometry = new THREE.IcosahedronGeometry(1, 15);
      for (let i = 0; i < 50; i++) {
        const color = new THREE.Color();
        color.setHSL(Math.random(), 0.7, Math.random() * 0.2 + 0.05);
        const material = new THREE.MeshBasicMaterial({ color: color });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.x = Math.random() * 10 - 5;
        sphere.position.y = Math.random() * 10 - 5;
        sphere.position.z = Math.random() * 10 - 5;
        sphere.position.normalize().multiplyScalar(Math.random() * 4.0 + 2.0);
        sphere.scale.setScalar(Math.random() * Math.random() + 0.5);
        scene.add(sphere);
        if (Math.random() < 0.25) sphere.layers.enable(BLOOM_SCENE);
      }
      render();
    }

    // 材质释放函数
    function disposeMaterial(obj: THREE.Mesh) {
      if (obj.material) {
        (obj.material as THREE.Material).dispose();
      }
    }


    // 渲染函数
    function render() {
      //@ts-ignore
      scene.traverse(darkenNonBloomed);
      bloomComposer.render();
      //@ts-ignore
      scene.traverse(restoreMaterial);
      finalComposer.render();
    }
    // 暗化非发光物体函数
    function darkenNonBloomed(obj: THREE.Mesh) {
      if (obj.isMesh && bloomLayer.test(obj.layers) === false) {
        materials[obj.uuid] = obj.material;
        obj.material = darkMaterial;
      }
    }

    // 恢复物体材质函数
    function restoreMaterial(obj: THREE.Mesh) {
      if (materials[obj.uuid]) {
        obj.material = materials[obj.uuid];
        delete materials[obj.uuid];
      }
    }
  }
}
// 创建Sketch实例并初始化
const sketch = new Sketch();
sketch.create();
