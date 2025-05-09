import * as THREE from 'three';
import Stats from 'stats.js';

import { OutlineEffect, MMDLoader, MMDAnimationHelper } from 'three-stdlib'
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
    let helper: MMDAnimationHelper;
    let ready = false;
    const that = this;
    /**
     * 初始化函数，包含创建DOM容器、设置相机参数、添加各种Helper对象和光照，
     * 以及加载模型和初始化GUI控制界面
     */
    function init() {
      const overlay = document.getElementById('overlay');
      overlay!.remove();
      window.Ammo = Ammo;
      // 设置相机参数
      that.camera.near = 0.1;
      that.camera.far = 5000;
      that.camera.updateProjectionMatrix();
      that.scene.background = new THREE.Color(0xffffff);

      // 添加地面网格辅助对象
      // const gridHelper = new THREE.PolarGridHelper(30, 8);
      // that.scene.add(gridHelper);

      //
      const listener = new THREE.AudioListener();
      that.camera.add(listener);

      // 添加环境光和定向光
      const ambient = new THREE.AmbientLight(0xaaaaaa, 3);
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
      function onError(error: ErrorEvent | unknown) {
        console.log('An error happened', error);
      }

      const modelFile = '../../assets/model/mmd/roles/gaming/嘉明.pmx';
      const vmdFiles = ['../../assets/model/mmd/vmds/打太极_by_忠实小栗子_05a8212856e03a4d8396be144ead29ea/太极修复版.vmd'];
      const cameraFile = '../../assets/model/mmd/vmds/打太极_by_忠实小栗子_05a8212856e03a4d8396be144ead29ea/cam.vmd';
      const audioFile = '../../assets/model/mmd/vmds/打太极_by_忠实小栗子_05a8212856e03a4d8396be144ead29ea/关山酒DJ.wav';
      const audioParams = {};

      helper = new MMDAnimationHelper();
      const loader = new MMDLoader();

      loader.loadWithAnimation(modelFile, vmdFiles, function (mmd) {
        // 模型加载完成后添加到场景，并初始化动画和物理效果的Helper对象
        const mesh = mmd.mesh;
        helper.add(mesh, {
          animation: mmd.animation,
          physics: true
        });
        that.scene.add(mesh);
        loader.loadAnimation(cameraFile, that.camera, function (cameraAnimation) {

          helper.add(that.camera, {
            animation: cameraAnimation as THREE.AnimationClip
          });

          new THREE.AudioLoader().load(audioFile, function (buffer) {

            const audio = new THREE.Audio(listener).setBuffer(buffer);

            helper.add(audio, audioParams);

            ready = true;

          }, onProgress, onError);

        }, onProgress, onError);

      }, onProgress, onError);

      // 窗口尺寸变化时调整渲染尺寸
      window.addEventListener('resize', onWindowResize);
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
      if (ready) {
        helper.update(that.clock.deltaTime);
      }
      effect.render(that.scene, that.camera);
      stats.update()
    })
    init();
  }
}

const startButton = document.getElementById('startButton');
startButton!.addEventListener('click', function () {
  const sketch = new Sketch("#sketch");
  sketch.create();
});

