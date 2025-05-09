import * as THREE from 'three';
import * as kokomi from 'kokomi.js';
import Stats from 'stats.js';
import { GUI } from 'lil-gui';
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass';
import { OrbitControls, RoomEnvironment, RenderPass, EffectComposer } from 'three-stdlib'
import { LittlestTokyo } from './models'
import resources from './resources';
export default class Sketch extends kokomi.Base {
  am: kokomi.AssetManager
  create() {
    const that = this
    let littlestTokyo: LittlestTokyo;
    const AssetManagerConfig: kokomi.AssetManagerConfig = {
      useDracoLoader: true,
      useMeshoptDecoder: false,
      dracoDecoderPath: '../../assets/libs/draco/',
      ktx2TranscoderPath: "https://unpkg.com/three/examples/jsm/libs/basis/",
    }
    this.am = new kokomi.AssetManager(this, resources, AssetManagerConfig);
    let composer: EffectComposer, controls: OrbitControls, stats: Stats;
    function init() {
      stats = new Stats();
      that.container.appendChild(stats.dom);

      const pmremGenerator = new THREE.PMREMGenerator(that.renderer);

      that.scene.background = new THREE.Color(0xbfe3dd);
      that.scene.environment = pmremGenerator.fromScene(RoomEnvironment(), 0.04).texture;

      // that.camera.fov = 40;
      that.camera.near = 1;

      that.camera.far = 100;
      that.camera.updateProjectionMatrix()
      that.camera.position.set(5, 2, 8);

      controls = new OrbitControls(that.camera, that.renderer.domElement);
      controls.target.set(0, 0.5, 0);
      controls.update();
      controls.enablePan = false;
      controls.enableDamping = true;

      const width = window.innerWidth;
      const height = window.innerHeight;

      composer = new EffectComposer(that.renderer);

      // 创建渲染通道，用于基本的场景渲染
      const renderPass = new RenderPass(that.scene, that.camera);
      composer.addPass(renderPass);

      // 创建GTAO通道，用于模拟环境遮挡效果，提升场景的阴影表现
      const gtaoPass = new GTAOPass(that.scene, that.camera, width, height);
      gtaoPass.output = GTAOPass.OUTPUT.Denoise;
      composer.addPass(gtaoPass);

      // 创建输出通道，用于最终的画面输出
      const outputPass = new OutputPass();
      composer.addPass(outputPass);

      that.am.on("ready", () => {
        littlestTokyo = new LittlestTokyo(that);
        littlestTokyo.addExisting();
        littlestTokyo.playAction("Take 001");
        const box = new THREE.Box3().setFromObject(that.scene);
        gtaoPass.setSceneClipBox(box);
      });

      // 创建GUI实例
      const gui = new GUI();

      // 在GUI中添加GTAO输出模式选项，并设置不同输出模式的值
      gui.add(gtaoPass, 'output', {
        'Default': GTAOPass.OUTPUT.Default,
        'Diffuse': GTAOPass.OUTPUT.Diffuse,
        'AO Only': GTAOPass.OUTPUT.AO,
        'AO Only + Denoise': GTAOPass.OUTPUT.Denoise,
        'Depth': GTAOPass.OUTPUT.Depth,
        'Normal': GTAOPass.OUTPUT.Normal
      }).onChange(function (value: number) {
        // 当输出模式改变时，更新GTAO传递的输出模式
        gtaoPass.output = value;
      });

      // 定义AO参数配置
      const aoParameters = {
        radius: 0.25,
        distanceExponent: 1.,
        thickness: 1.,
        scale: 1.,
        samples: 16,
        distanceFallOff: 1.,
        screenSpaceRadius: false,
      };
      // 定义PD参数配置
      const pdParameters = {
        lumaPhi: 10.,
        depthPhi: 2.,
        normalPhi: 3.,
        radius: 4.,
        radiusExponent: 1.,
        rings: 2.,
        samples: 16,
      };
      // 更新GTAO材质参数
      gtaoPass.updateGtaoMaterial(aoParameters);
      // 更新PD材质参数
      gtaoPass.updatePdMaterial(pdParameters);

      // 在GUI中添加混合强度调节，范围从0到1，步长为0.01
      gui.add(gtaoPass, 'blendIntensity').min(0).max(1).step(0.01);

      // 以下是在GUI中添加AO参数的调节项，每个参数变化都会触发GTAO材质参数的更新
      gui.add(aoParameters, 'radius').min(0.01).max(1).step(0.01).onChange(() => gtaoPass.updateGtaoMaterial(aoParameters));
      gui.add(aoParameters, 'distanceExponent').min(1).max(4).step(0.01).onChange(() => gtaoPass.updateGtaoMaterial(aoParameters));
      gui.add(aoParameters, 'thickness').min(0.01).max(10).step(0.01).onChange(() => gtaoPass.updateGtaoMaterial(aoParameters));
      gui.add(aoParameters, 'distanceFallOff').min(0).max(1).step(0.01).onChange(() => gtaoPass.updateGtaoMaterial(aoParameters));
      gui.add(aoParameters, 'scale').min(0.01).max(2.0).step(0.01).onChange(() => gtaoPass.updateGtaoMaterial(aoParameters));
      gui.add(aoParameters, 'samples').min(2).max(32).step(1).onChange(() => gtaoPass.updateGtaoMaterial(aoParameters));
      gui.add(aoParameters, 'screenSpaceRadius').onChange(() => gtaoPass.updateGtaoMaterial(aoParameters));

      // 以下是在GUI中添加PD参数的调节项，每个参数变化都会触发PD材质参数的更新
      gui.add(pdParameters, 'lumaPhi').min(0).max(20).step(0.01).onChange(() => gtaoPass.updatePdMaterial(pdParameters));
      gui.add(pdParameters, 'depthPhi').min(0.01).max(20).step(0.01).onChange(() => gtaoPass.updatePdMaterial(pdParameters));
      gui.add(pdParameters, 'normalPhi').min(0.01).max(20).step(0.01).onChange(() => gtaoPass.updatePdMaterial(pdParameters));
      gui.add(pdParameters, 'radius').min(0).max(32).step(1).onChange(() => gtaoPass.updatePdMaterial(pdParameters));
      gui.add(pdParameters, 'radiusExponent').min(0.1).max(4.).step(0.1).onChange(() => gtaoPass.updatePdMaterial(pdParameters));
      gui.add(pdParameters, 'rings').min(1).max(16).step(0.125).onChange(() => gtaoPass.updatePdMaterial(pdParameters));
      gui.add(pdParameters, 'samples').min(2).max(32).step(1).onChange(() => gtaoPass.updatePdMaterial(pdParameters));
      window.addEventListener('resize', onWindowResize);

    }

    function onWindowResize() {

      const width = window.innerWidth;
      const height = window.innerHeight;

      that.camera.updateProjectionMatrix();

      that.renderer.setSize(width, height);
      composer.setSize(width, height);

    }

    function animate() {
      requestAnimationFrame(animate);
      if (littlestTokyo) {
        littlestTokyo.animations.update()
      }
      controls.update();
      stats.begin();
      composer.render();
      stats.end();
    }
    init();
    animate()
  }
}
// 创建Sketch实例并初始化
const sketch = new Sketch("#sketch");
sketch.create();
