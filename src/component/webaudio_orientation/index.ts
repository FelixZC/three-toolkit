import * as THREE from 'three';
import * as kokomi from 'kokomi.js';

import { OrbitControls, PositionalAudioHelper, GLTFLoader } from 'three-stdlib';

class Sketch extends kokomi.Base {
  create() {
    const that = this
    // 初始化函数
    function init() {
      // 移除覆盖层
      const overlay = document.getElementById('overlay');
      overlay!.remove();

      // that.camera.fov = 45;
      that.camera.near = 0.1;
      that.camera.far = 100;
      that.camera.position.set(3, 2, 3);

      // 加载环境贴图
      const reflectionCube = new THREE.CubeTextureLoader()
        .setPath(' ../../assets/images/textures/swedish-royal-castle/')
        .load(['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg']);

      // 创建场景并设置背景和雾效
      that.scene.background = new THREE.Color(0xa0a0a0);
      that.scene.fog = new THREE.Fog(0xa0a0a0, 2, 20);

      // 添加灯光
      const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 3);
      hemiLight.position.set(0, 20, 0);
      that.scene.add(hemiLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 3);
      dirLight.position.set(5, 5, 0);
      dirLight.castShadow = true;
      dirLight.shadow.camera.top = 1;
      dirLight.shadow.camera.bottom = - 1;
      dirLight.shadow.camera.left = - 1;
      dirLight.shadow.camera.right = 1;
      dirLight.shadow.camera.near = 0.1;
      dirLight.shadow.camera.far = 20;
      that.scene.add(dirLight);

      // 创建地面网格
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), new THREE.MeshPhongMaterial({ color: 0xcbcbcb, depthWrite: false }));
      mesh.rotation.x = - Math.PI / 2;
      mesh.receiveShadow = true;
      that.scene.add(mesh);

      const grid = new THREE.GridHelper(50, 50, 0xc1c1c1, 0xc1c1c1);
      that.scene.add(grid);

      // 创建音频监听器并添加到相机
      const listener = new THREE.AudioListener();
      that.camera.add(listener);

      // 播放背景音乐
      const audioElement = document.getElementById('music') as HTMLAudioElement;
      audioElement!.play();

      // 创建位置音频对象并设置相关属性
      const positionalAudio = new THREE.PositionalAudio(listener);
      positionalAudio.setMediaElementSource(audioElement);
      positionalAudio.setRefDistance(1);
      positionalAudio.setDirectionalCone(180, 230, 0.1);

      // 创建位置音频辅助器并添加到位置音频对象
      const helper = new PositionalAudioHelper(positionalAudio, 0.1);
      positionalAudio.add(helper);

      // 加载3D模型
      const gltfLoader = new GLTFLoader();
      gltfLoader.load('../../assets/model/gltf/BoomBox.glb', function (gltf) {

        const boomBox = gltf.scene;
        boomBox.position.set(0, 0.2, 0);
        boomBox.scale.set(20, 20, 20);

        boomBox.traverse(function (object) {
          if (object instanceof THREE.Mesh && object.isMesh) {
            object.material.envMap = reflectionCube;
            object.geometry.rotateY(- Math.PI);
            object.castShadow = true;
          }
        });

        boomBox.add(positionalAudio);
        that.scene.add(boomBox);

      });

      // 创建并添加代表声音减弱的墙
      const wallGeometry = new THREE.BoxGeometry(2, 1, 0.1);
      const wallMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.5 });

      const wall = new THREE.Mesh(wallGeometry, wallMaterial);
      wall.position.set(0, 0.5, - 0.5);
      that.scene.add(wall);
      // 创建WebGL渲染器并添加到DOM元素
      that.renderer.shadowMap.enabled = true;

      // 创建轨道控制对象
      const controls = new OrbitControls(that.camera, that.renderer.domElement);
      controls.target.set(0, 0.1, 0);
      controls.update();
      controls.minDistance = 0.5;
      controls.maxDistance = 10;
      controls.maxPolarAngle = 0.5 * Math.PI;

      // 窗口大小调整事件监听器
      window.addEventListener('resize', onWindowResize);

    }

    // 窗口大小调整时的处理函数
    function onWindowResize() {
      // that.camera.aspect = window.innerWidth / window.innerHeight;
      that.camera.updateProjectionMatrix();
      that.renderer.setSize(window.innerWidth, window.innerHeight);

    }
    init()

  }
}

const startButton = document.getElementById('startButton');
startButton!.addEventListener('click', function () {
  // 创建Sketch实例并初始化
  const sketch = new Sketch("#sketch");
  sketch.create();
});
