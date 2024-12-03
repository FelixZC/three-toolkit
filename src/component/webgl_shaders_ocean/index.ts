import * as THREE from 'three';
import * as kokomi from 'kokomi.js';
import Stats from 'stats.js';
import { GUI } from 'lil-gui';
import { OrbitControls, Water, Sky } from 'three-stdlib'
class Sketch extends kokomi.Base {
  create() {
    const that = this;
    // 定义容器和统计对象
    let stats: Stats;
    // 定义控制器、水面、太阳和网格
    let controls, water: Water, sun: THREE.Vector3, mesh: THREE.Mesh;

    // 初始化函数
    function init() {
      // 创建渲染器并设置大小和色调映射
      that.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      that.renderer.toneMappingExposure = 0.5;

      // 创建相机并设置位置
      // that.camera.fov = 55;
      that.camera.near = 1;
      that.camera.far = 20000;
      that.camera.position.set(30, 30, 100);
      that.camera.updateProjectionMatrix()
      // 定义太阳的位置
      sun = new THREE.Vector3();

      // 创建水面
      const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
      water = new Water(
        waterGeometry,
        {
          textureWidth: 512,
          textureHeight: 512,
          waterNormals: new THREE.TextureLoader().load('../../assets/images/textures/waternormals.jpg', function (texture) {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
          }),
          sunDirection: new THREE.Vector3(),
          sunColor: 0xffffff,
          waterColor: 0x001e0f,
          distortionScale: 3.7,
          fog: that.scene.fog !== undefined
        }
      );
      water.rotation.x = - Math.PI / 2;
      that.scene.add(water);

      // 创建天空盒
      const sky = new Sky();
      sky.scale.setScalar(10000);
      that.scene.add(sky);

      const skyUniforms = (sky.material as THREE.ShaderMaterial).uniforms;
      skyUniforms['turbidity'].value = 10;
      skyUniforms['rayleigh'].value = 2;
      skyUniforms['mieCoefficient'].value = 0.005;
      skyUniforms['mieDirectionalG'].value = 0.8;

      // 定义太阳位置的参数
      const parameters = {
        elevation: 2,
        azimuth: 180
      };

      // 创建PMREM生成器和环境场景
      const pmremGenerator = new THREE.PMREMGenerator(that.renderer);
      const sceneEnv = new THREE.Scene();

      let renderTarget: THREE.WebGLRenderTarget | undefined = undefined;

      // 更新太阳位置的函数
      function updateSun() {
        const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
        const theta = THREE.MathUtils.degToRad(parameters.azimuth);
        sun.setFromSphericalCoords(1, phi, theta);
        (sky.material as THREE.ShaderMaterial).uniforms['sunPosition'].value.copy(sun);
        water.material.uniforms['sunDirection'].value.copy(sun).normalize();
        if (renderTarget !== undefined) renderTarget.dispose();
        sceneEnv.add(sky);
        renderTarget = pmremGenerator.fromScene(sceneEnv);
        that.scene.add(sky);
        that.scene.environment = renderTarget.texture;
      }

      // 初始化太阳位置
      updateSun();

      // 创建一个立方体网格
      const geometry = new THREE.BoxGeometry(30, 30, 30);
      const material = new THREE.MeshStandardMaterial({ roughness: 0 });
      mesh = new THREE.Mesh(geometry, material);
      that.scene.add(mesh);

      // 创建轨道控制器
      controls = new OrbitControls(that.camera, that.renderer.domElement);
      controls.maxPolarAngle = Math.PI * 0.495;
      controls.target.set(0, 10, 0);
      controls.minDistance = 40.0;
      controls.maxDistance = 200.0;
      controls.update();

      // 创建统计对象并添加到容器中
      stats = new Stats();
      that.container.appendChild(stats.dom);

      // 创建GUI
      const gui = new GUI();
      const folderSky = gui.addFolder('Sky');
      folderSky.add(parameters, 'elevation', 0, 90, 0.1).onChange(updateSun);
      folderSky.add(parameters, 'azimuth', - 180, 180, 0.1).onChange(updateSun);
      folderSky.open();

      const waterUniforms = water.material.uniforms;
      const folderWater = gui.addFolder('Water');
      folderWater.add(waterUniforms.distortionScale, 'value', 0, 8, 0.1).name('distortionScale');
      folderWater.add(waterUniforms.size, 'value', 0.1, 10, 0.1).name('size');
      folderWater.open();

      // 窗口大小调整事件监听器
      window.addEventListener('resize', onWindowResize);
    }

    // 窗口大小调整处理函数
    function onWindowResize() {
      // that.camera.aspect = window.innerWidth / window.innerHeight;
      that.camera.updateProjectionMatrix();
      that.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    this.update(() => {
      const time = performance.now() * 0.001;
      mesh.position.y = Math.sin(time) * 20 + 5;
      mesh.rotation.x = time * 0.5;
      mesh.rotation.z = time * 0.51;
      water.material.uniforms['time'].value += 1.0 / 60.0;
      stats.update();
    })

    // 初始化函数
    init();

  }
}
// 创建Sketch实例并初始化
const sketch = new Sketch("#sketch");
sketch.create();
