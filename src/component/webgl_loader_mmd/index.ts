

import * as THREE from 'three';

import Stats from 'stats.js';
import { GUI } from 'lil-gui';

import { OrbitControls, OutlineEffect, MMDLoader, MMDAnimationHelper, CCDIKHelper, MMDPhysicsHelper } from 'three-stdlib'
import * as kokomi from 'kokomi.js';
//@ts-ignore
import Ammo from 'ammo.js';
class Sketch extends kokomi.Base {
  /**
   * 创建场景、相机、灯光、模型等所有元素，并进行初始化设置
   */
  create() {
    // 定义Stats对象用于显示帧率等信息，OutlineEffect对象用于边缘检测效果，
    // MMDAnimationHelper对象用于处理MMD动画，CCDIKHelper对象用于处理MMD的IK（反向动力学），
    // MMDPhysicsHelper对象用于处理MMD的物理效果
    let stats: Stats;
    let effect: OutlineEffect;
    let helper: MMDAnimationHelper, ikHelper: CCDIKHelper, physicsHelper: MMDPhysicsHelper;

    const that = this;
    /**
     * 初始化函数，包含创建DOM容器、设置相机参数、添加各种Helper对象和光照，
     * 以及加载模型和初始化GUI控制界面
     */
    function init() {
      window.Ammo = Ammo;
      // 设置相机参数
      that.camera.near = 1;
      that.camera.far = 1000;
      that.camera.position.z = 30;
      that.camera.updateProjectionMatrix();
      that.scene.background = new THREE.Color(0x000000);

      // 添加地面网格辅助对象
      const gridHelper = new THREE.PolarGridHelper(30, 0);
      gridHelper.position.y = - 10;
      that.scene.add(gridHelper);

      // 添加环境光和定向光
      const ambient = new THREE.AmbientLight(0xaaaaaa, 1);
      that.scene.add(ambient);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(- 1, 1, 1).normalize();
      that.scene.add(directionalLight);

      // 初始化边缘检测效果
      effect = new OutlineEffect(that.renderer);

      // 初始化Stats对象用于显示帧率等信息
      stats = new Stats();
      that.container.appendChild(stats.dom);

      // 加载MMD模型
      function onProgress(xhr: ProgressEvent) {
        if (xhr.lengthComputable) {
          const percentComplete = xhr.loaded / xhr.total * 100;
          console.log(Math.round(percentComplete) + '% downloaded');
        }
      }
      const modelFile = '../../assets/model/mmd/roles/marth7th(preserve)/三月七 1.0.pmx';
      // const modelFile = '../../assets/model/mmd/roles/firefly/流萤3.0.pmx';
      // const modelFile = '../../assets/model/mmd/roles/marth7th(hunt)/三月七3.pmx';
      // const modelFile = '../../assets/model/mmd/roles/qiong(harmony)/星穹铁道—开拓者（穹）.pmx';
      // const modelFile = '../../assets/model/mmd/roles/xing(harmony)/星穹铁道—开拓者（星）.pmx';
      const vmdFiles = ['../../assets/model/mmd/vmds/default/wavefile_v2.vmd'];
      helper = new MMDAnimationHelper({
        afterglow: 2.0
      });
      const loader = new MMDLoader();
      loader.loadWithAnimation(modelFile, vmdFiles, function (mmd) {
        // 模型加载完成后添加到场景，并初始化动画和物理效果的Helper对象
        let mesh = mmd.mesh;
        mesh.position.y = - 10;
        // mesh.position.x =  10;
        that.scene.add(mesh);
        helper.add(mesh, {
          animation: mmd.animation,
          physics: true
        });
        ikHelper = helper.objects.get(mesh)!.ikSolver.createHelper();
        ikHelper.visible = false;
        that.scene.add(ikHelper);
        physicsHelper = helper.objects.get(mesh)!.physics!.createHelper();
        physicsHelper.visible = false;
        that.scene.add(physicsHelper);
        initGui();
      }, onProgress, () => { });
      // 添加轨道控制
      const controls = new OrbitControls(that.camera, that.renderer.domElement);
      controls.minDistance = 10;
      controls.maxDistance = 100;

      // 窗口尺寸变化时调整渲染尺寸
      window.addEventListener('resize', onWindowResize);

      /**
       * 初始化GUI控制界面，用于控制动画、IK、边缘检测和物理效果的开关
       */
      function initGui() {
        const api = {
          'animation': true,
          'ik': true,
          'outline': true,
          'physics': true,
          'show IK bones': false,
          'show rigid bodies': false
        };
        const gui = new GUI();
        gui.add(api, 'animation').onChange(function () {
          helper.enable('animation', api['animation']);
        });
        gui.add(api, 'ik').onChange(function () {
          helper.enable('ik', api['ik']);
        });
        gui.add(api, 'outline').onChange(function () {
          effect.enabled = api['outline'];
        });
        gui.add(api, 'physics').onChange(function () {
          helper.enable('physics', api['physics']);
        });
        gui.add(api, 'show IK bones').onChange(function () {
          ikHelper.visible = api['show IK bones'];
        });
        gui.add(api, 'show rigid bodies').onChange(function () {
          if (physicsHelper !== undefined) physicsHelper.visible = api['show rigid bodies'];
        });
      }
    }

    /**
     * 窗口尺寸变化时调整相机和效果的尺寸
     */
    function onWindowResize() {
      that.camera.updateProjectionMatrix();
      effect.setSize(window.innerWidth, window.innerHeight);
    }

    // 设置更新函数，在每个渲染循环中调用
    this.update(() => {
      helper.update(that.clock.deltaTime);
      effect.render(that.scene, that.camera);
      stats.update()
    })
    init();
  }
}

// 创建Sketch实例并初始化
const sketch = new Sketch("#sketch");
sketch.create();
