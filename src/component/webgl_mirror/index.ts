import * as THREE from 'three';
import * as kokomi from 'kokomi.js';
// 导入OrbitControls和Reflector，用于相机控制和反射效果
import { OrbitControls, Reflector } from 'three-stdlib'
class Sketch extends kokomi.Base {
  /**
   * 创建一个三维场景，包括网格、材质和动画等。
   * 该函数主要负责初始化场景、添加物体和处理鼠标移动事件。
   */
  create() {
    const that = this
    // 初始化相机控制
    let cameraControls: OrbitControls;

    // 初始化球体组和小球体
    let sphereGroup: THREE.Object3D, smallSphere: THREE.Mesh;

    // 初始化地面和垂直镜子
    let groundMirror: Reflector, verticalMirror: Reflector;



    // 初始化函数
    function init() {

      // that.camera.fov = 45;
      that.camera.near = 1;
      that.camera.far = 500;
      that.camera.position.set(0, 75, 160);
      that.camera.updateProjectionMatrix();

      // 创建相机控制
      cameraControls = new OrbitControls(that.camera, that.renderer.domElement);
      cameraControls.target.set(0, 40, 0);
      cameraControls.maxDistance = 400;
      cameraControls.minDistance = 10;
      cameraControls.update();

      // 创建平面几何体
      const planeGeo = new THREE.PlaneGeometry(100.1, 100.1);

      // 创建反射器/镜子
      let geometry, material;

      // 创建地面镜子
      geometry = new THREE.CircleGeometry(40, 64);
      groundMirror = new Reflector(geometry, {
        clipBias: 0.003,
        textureWidth: window.innerWidth * window.devicePixelRatio,
        textureHeight: window.innerHeight * window.devicePixelRatio,
        color: 0xb5b5b5
      });
      groundMirror.position.y = 0.5;
      groundMirror.rotateX(- Math.PI / 2);
      that.scene.add(groundMirror);

      // 创建垂直镜子
      geometry = new THREE.PlaneGeometry(100, 100);
      verticalMirror = new Reflector(geometry, {
        clipBias: 0.003,
        textureWidth: window.innerWidth * window.devicePixelRatio,
        textureHeight: window.innerHeight * window.devicePixelRatio,
        color: 0xc1cbcb
      });
      verticalMirror.position.y = 50;
      verticalMirror.position.z = - 50;
      that.scene.add(verticalMirror);

      // 创建球体组
      sphereGroup = new THREE.Object3D();
      that.scene.add(sphereGroup);

      // 创建球体的几何体和材质
      geometry = new THREE.CylinderGeometry(0.1, 15 * Math.cos(Math.PI / 180 * 30), 0.1, 24, 1);
      material = new THREE.MeshPhongMaterial({ color: 0xffffff, emissive: 0x8d8d8d });
      const sphereCap = new THREE.Mesh(geometry, material);
      sphereCap.position.y = - 15 * Math.sin(Math.PI / 180 * 30) - 0.05;
      sphereCap.rotateX(- Math.PI);

      // 创建半球体
      geometry = new THREE.SphereGeometry(15, 24, 24, Math.PI / 2, Math.PI * 2, 0, Math.PI / 180 * 120);
      const halfSphere = new THREE.Mesh(geometry, material);
      halfSphere.add(sphereCap);
      halfSphere.rotateX(- Math.PI / 180 * 135);
      halfSphere.rotateZ(- Math.PI / 180 * 20);
      halfSphere.position.y = 7.5 + 15 * Math.sin(Math.PI / 180 * 30);

      // 将半球体添加到球体组
      sphereGroup.add(halfSphere);

      // 创建小球体
      geometry = new THREE.IcosahedronGeometry(5, 0);
      material = new THREE.MeshPhongMaterial({ color: 0xffffff, emissive: 0x7b7b7b, flatShading: true });
      smallSphere = new THREE.Mesh(geometry, material);
      that.scene.add(smallSphere);

      // 创建墙壁
      const planeTop = new THREE.Mesh(planeGeo, new THREE.MeshPhongMaterial({ color: 0xffffff }));
      planeTop.position.y = 100;
      planeTop.rotateX(Math.PI / 2);
      that.scene.add(planeTop);

      const planeBottom = new THREE.Mesh(planeGeo, new THREE.MeshPhongMaterial({ color: 0xffffff }));
      planeBottom.rotateX(- Math.PI / 2);
      that.scene.add(planeBottom);

      const planeFront = new THREE.Mesh(planeGeo, new THREE.MeshPhongMaterial({ color: 0x7f7fff }));
      planeFront.position.z = 50;
      planeFront.position.y = 50;
      planeFront.rotateY(Math.PI);
      that.scene.add(planeFront);

      const planeRight = new THREE.Mesh(planeGeo, new THREE.MeshPhongMaterial({ color: 0x00ff00 }));
      planeRight.position.x = 50;
      planeRight.position.y = 50;
      planeRight.rotateY(- Math.PI / 2);
      that.scene.add(planeRight);

      const planeLeft = new THREE.Mesh(planeGeo, new THREE.MeshPhongMaterial({ color: 0xff0000 }));
      planeLeft.position.x = - 50;
      planeLeft.position.y = 50;
      planeLeft.rotateY(Math.PI / 2);
      that.scene.add(planeLeft);

      // 创建光源
      const mainLight = new THREE.PointLight(0xe7e7e7, 2.5, 250, 0);
      mainLight.position.y = 60;
      that.scene.add(mainLight);

      const greenLight = new THREE.PointLight(0x00ff00, 0.5, 1000, 0);
      greenLight.position.set(550, 50, 0);
      that.scene.add(greenLight);

      const redLight = new THREE.PointLight(0xff0000, 0.5, 1000, 0);
      redLight.position.set(- 550, 50, 0);
      that.scene.add(redLight);

      const blueLight = new THREE.PointLight(0xbbbbfe, 0.5, 1000, 0);
      blueLight.position.set(0, 50, 550);
      that.scene.add(blueLight);

      // 监听窗口大小调整事件
      window.addEventListener('resize', onWindowResize);

    }

    // 窗口大小调整时的回调函数
    function onWindowResize() {

      // 调整相机和渲染器的大小
      // that.camera.aspect = window.innerWidth / window.innerHeight;
      that.camera.updateProjectionMatrix();

      that.renderer.setSize(window.innerWidth, window.innerHeight);

      // 调整反射器的大小
      groundMirror.getRenderTarget().setSize(
        window.innerWidth * window.devicePixelRatio,
        window.innerHeight * window.devicePixelRatio
      );
      verticalMirror.getRenderTarget().setSize(
        window.innerWidth * window.devicePixelRatio,
        window.innerHeight * window.devicePixelRatio
      );

    }

    this.update(() => {

      // 更新动画时间
      const timer = Date.now() * 0.01;

      // 旋转球体组
      sphereGroup.rotation.y -= 0.002;

      // 更新小球体的位置和旋转
      smallSphere.position.set(
        Math.cos(timer * 0.1) * 30,
        Math.abs(Math.cos(timer * 0.2)) * 20 + 5,
        Math.sin(timer * 0.1) * 30
      );
      smallSphere.rotation.y = (Math.PI / 2) - timer * 0.1;
      smallSphere.rotation.z = timer * 0.8;

    })

    init();
  }
}
// 创建Sketch实例并初始化
const sketch = new Sketch("#sketch");
sketch.create();
