

import * as THREE from 'three';

import Stats from 'stats.js';
import { GUI } from 'lil-gui';

import { OrbitControls, OutlineEffect, MMDLoader, MMDAnimationHelper } from 'three-stdlib'
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
    let mesh: THREE.SkinnedMesh;
    const that = this;
    const vpds: object[] = [];

    /**
     * 初始化函数，包含创建DOM容器、设置相机参数、添加各种Helper对象和光照，
     * 以及加载模型和初始化GUI控制界面
     */
    function init() {
      window.Ammo = Ammo;

      // 设置相机参数
      that.camera.near = 1;
      that.camera.far = 2000;
      that.camera.position.z = 25;
      that.camera.updateProjectionMatrix();
      that.scene.background = new THREE.Color(0xffffff);

      // 添加地面网格辅助对象
      const gridHelper = new THREE.PolarGridHelper(30, 0);
      gridHelper.position.y = - 10;
      that.scene.add(gridHelper);

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
      function onError(error: ErrorEvent) {
        console.log('An error happened', error);
      }
      // const modelFile = '../../assets/model/mmd/roles/marth7th(preserve)/三月七 1.0.pmx';
      // const modelFile = '../../assets/model/mmd/roles/firefly/流萤3.0.pmx';
      const modelFile = '../../assets/model/mmd/roles/marth7th(hunt)/三月七3.pmx';
      // const modelFile = '../../assets/model/mmd/roles/qiong(harmony)/星穹铁道—开拓者（穹）.pmx';
      // const modelFile = '../../assets/model/mmd/roles/xing(harmony)/星穹铁道—开拓者（星）.pmx';
      const vpdFiles = [
        '../../assets/model//mmd/vpds/01.vpd',
        '../../assets/model//mmd/vpds/02.vpd',
        '../../assets/model//mmd/vpds/03.vpd',
        '../../assets/model//mmd/vpds/04.vpd',
        '../../assets/model//mmd/vpds/05.vpd',
        '../../assets/model//mmd/vpds/06.vpd',
        '../../assets/model//mmd/vpds/07.vpd',
        '../../assets/model//mmd/vpds/08.vpd',
        '../../assets/model//mmd/vpds/09.vpd',
        '../../assets/model//mmd/vpds/10.vpd',
        '../../assets/model//mmd/vpds/11.vpd'
      ];
      helper = new MMDAnimationHelper();
      const loader = new MMDLoader();
      loader.load(modelFile, function (object) {
        // 模型加载完成后添加到场景，并初始化动画和物理效果的Helper对象
        mesh = object;
        mesh.position.y = - 10;
        that.scene.add(mesh);
        let vpdIndex = 0;

        function loadVpd() {

          const vpdFile = vpdFiles[vpdIndex];

          loader.loadVPD(vpdFile, false, function (vpd) {

            vpds.push(vpd);

            vpdIndex++;

            if (vpdIndex < vpdFiles.length) {

              loadVpd();

            } else {

              initGui();

            }

          }, onProgress, onError);

        }

        loadVpd();
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

        const gui = new GUI();

        const dictionary = mesh.morphTargetDictionary;
        console.log(mesh.morphTargetDictionary)

        const controls: { [key: string]: number } = {};
        const keys: string[] = [];

        const poses = gui.addFolder('Poses');
        const morphs = gui.addFolder('Morphs');

        function getBaseName(s: string) {

          return s.slice(s.lastIndexOf('/') + 1);

        }

        function initControls() {

          for (const key in dictionary) {

            controls[key] = 0.0;

          }

          controls.pose = - 1;

          for (let i = 0; i < vpdFiles.length; i++) {

            controls[getBaseName(vpdFiles[i])] = 0;

          }

        }

        function initKeys() {

          for (const key in dictionary) {

            keys.push(key);

          }

        }

        function initPoses() {

          const files: { [key: string]: number } = { default: - 1 };

          for (let i = 0; i < vpdFiles.length; i++) {

            files[getBaseName(vpdFiles[i])] = i;

          }

          poses.add(controls, 'pose', files).onChange(onChangePose);

        }

        function initMorphs() {

          for (const key in dictionary) {

            morphs.add(controls, key, 0.0, 1.0, 0.01).onChange(onChangeMorph);

          }

        }

        function onChangeMorph() {

          for (let i = 0; i < keys.length; i++) {

            const key = keys[i];
            const value = controls[key];
            if (mesh.morphTargetInfluences) {
              mesh.morphTargetInfluences[i] = value;
            }

          }

        }

        function onChangePose() {

          const index = controls.pose;

          if (index === - 1) {

            mesh.pose();

          } else {

            helper.pose(mesh, vpds[index]);

          }

        }

        initControls();
        initKeys();
        initPoses();
        initMorphs();

        onChangeMorph();
        onChangePose();

        poses.open();
        morphs.open();

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
