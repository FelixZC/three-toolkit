

import * as THREE from 'three';
import { GUI } from 'lil-gui';
import { MapControls } from 'three-stdlib'
import * as kokomi from "kokomi.js";
export default class Sketch extends kokomi.Base {
  /**
   * 创建一个三维场景，并配置相关的相机、控件、几何体和灯光。
   * 此函数初始化场景的基本设置，并为场景添加静态盒子几何体和多种光源。
   * 同时，它还处理窗口大小变化事件以适应不同的显示尺寸。
   */
  create() {
    // 保持对当前对象的引用
    const that = this;

    // 设置场景的背景色和雾效果
    that.scene.background = new THREE.Color(0xcccccc);
    that.scene.fog = new THREE.FogExp2(0xcccccc, 0.002);

    // 配置相机参数
    // that.renderer.antialias = true;
    // that.camera.fov = 60
    that.camera.near = 1;
    that.camera.far = 1000;
    that.camera.position.set(0, 200, -400);
    that.camera.updateProjectionMatrix();

    // 创建地图控件，并绑定到相机和渲染器的DOM元素
    const controls = new MapControls(that.camera, that.renderer.domElement);
    // 启用阻尼效果，使得控件操作更平滑
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    // 设置控件的最小和最大距离，以及极角限制
    controls.minDistance = 100;
    controls.maxDistance = 500;
    controls.maxPolarAngle = Math.PI / 2;

    // 创建并添加多个盒子几何体到场景中
    const geometry = new THREE.BoxGeometry();
    geometry.translate(0, 0.5, 0);
    const material = new THREE.MeshPhongMaterial({ color: 0xeeeeee, flatShading: true });

    for (let i = 0; i < 500; i++) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = Math.random() * 1600 - 800;
      mesh.position.y = 0;
      mesh.position.z = Math.random() * 1600 - 800;
      mesh.scale.x = 20;
      mesh.scale.y = Math.random() * 80 + 10;
      mesh.scale.z = 20;
      mesh.updateMatrix();
      mesh.matrixAutoUpdate = false;
      that.scene.add(mesh);
    }

    // 添加多种光源到场景，包括定向光和环境光
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 3);
    dirLight1.position.set(1, 1, 1);
    that.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x002288, 3);
    dirLight2.position.set(-1, -1, -1);
    that.scene.add(dirLight2);

    const ambientLight = new THREE.AmbientLight(0x555555);
    that.scene.add(ambientLight);

    // 处理窗口大小变化事件，以保持相机的宽高比和渲染器的大小
    window.addEventListener('resize', onWindowResize);

    // 创建并配置GUI控件，用于交互式调整控件属性
    const gui = new GUI();
    gui.add(controls, 'zoomToCursor');
    gui.add(controls, 'screenSpacePanning');

    // 窗口大小变化时的处理函数
    function onWindowResize() {
      // 调整相机的宽高比和渲染器的大小
      // that.camera.aspect = window.innerWidth / window.innerHeight;
      that.camera.updateProjectionMatrix();
      that.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // 更新函数，用于在每一帧中更新控件状态
    this.update(() => {
      controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
    });
  }
}
// 创建Sketch实例并初始化
const sketch = new Sketch("#sketch");
sketch.create();
