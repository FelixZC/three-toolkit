import * as THREE from 'three';
import * as kokomi from 'kokomi.js';
import Stats from 'stats.js';
import { FirstPersonControls, GLTFLoader, FontLoader, TextGeometry, ShadowMapViewer } from 'three-stdlib'
interface CustomMaterial extends THREE.Material {
  color: THREE.Color
}
interface CustomMesh extends THREE.Object3D {
  speed: number
  material: CustomMaterial
}
class Sketch extends kokomi.Base {
  create() {
    const that = this
    // 定义阴影贴图的宽度和高度
    const SHADOW_MAP_WIDTH = 2048, SHADOW_MAP_HEIGHT = 1024;

    // 初始化屏幕宽度和高度
    let SCREEN_WIDTH = window.innerWidth;
    let SCREEN_HEIGHT = window.innerHeight;

    // 定义地面的初始高度
    const FLOOR = - 250;

    // 声明相机、控制器、场景和渲染器变量
    let controls: FirstPersonControls;

    // 声明用于显示统计数据的变量
    let stats: Stats;

    // 定义近平面和远平面的距离
    const NEAR = 10, FAR = 3000;

    // 声明动画混合器变量
    let mixer: THREE.AnimationMixer;

    // 声明一个数组用于存储形态变化数据
    const morphs: CustomMesh[] = [];

    // 声明光源变量
    let light: THREE.DirectionalLight;

    // 声明用于查看光源阴影贴图的变量
    let lightShadowMapViewer: ShadowMapViewer;

    // 创建一个THREE.Clock实例用于计算时间

    // 定义一个变量用于控制HUD（抬头显示）的显示与隐藏
    let showHUD = false;
    // 初始化函数，设置场景、相机、灯光、渲染器等
    function init() {
      // 创建透视相机，并设置相机的属性
      // that.camera.fov = 23;
      that.camera.near = NEAR;
      that.camera.far = FAR;
      that.camera.updateProjectionMatrix()
      that.camera.position.set(700, 50, 1900);

      // 创建场景，并设置背景颜色和雾效
      that.scene.background = new THREE.Color(0x59472b);
      that.scene.fog = new THREE.Fog(0x59472b, 1000, FAR);

      // 添加环境光和方向光到场景，并设置灯光的属性
      const ambient = new THREE.AmbientLight(0xffffff);
      that.scene.add(ambient);

      // 创建一个平行光对象，颜色为白色，强度为3
      light = new THREE.DirectionalLight(0xffffff, 3);
      // 设置光源位置，使其在场景中具有方向性
      light.position.set(0, 1500, 1000);
      // 启用光源的阴影投射功能
      light.castShadow = true;
      // 配置光源的阴影投射范围和方向
      light.shadow.camera.top = 2000;
      light.shadow.camera.bottom = - 2000;
      light.shadow.camera.left = - 2000;
      light.shadow.camera.right = 2000;
      // 设置光源阴影的近平面和远平面距离，以调整阴影的清晰度和范围
      light.shadow.camera.near = 1200;
      light.shadow.camera.far = 2500;
      // 设置光源阴影的偏移量，用于避免阴影贴图产生的 acne 效应
      light.shadow.bias = 0.0001;

      // 设置光源阴影贴图的尺寸，更高的分辨率可以提供更精细的阴影效果
      light.shadow.mapSize.width = SHADOW_MAP_WIDTH;
      light.shadow.mapSize.height = SHADOW_MAP_HEIGHT;

      that.scene.add(light);

      // 创建HUD界面和场景内容
      createHUD();
      createScene();

      that.renderer.autoClear = false;

      // 启用和设置阴影映射
      that.renderer.shadowMap.enabled = true;
      that.renderer.shadowMap.type = THREE.PCFShadowMap;

      // 创建第一人称控制器，并设置其属性
      controls = new FirstPersonControls(that.camera, that.renderer.domElement);

      controls.lookSpeed = 0.0125;
      controls.movementSpeed = 2000;
      controls.lookVertical = true;

      controls.lookAt(that.scene.position);

      // 创建性能统计对象
      stats = new Stats();
      //container.appendChild( stats.dom );

      // 监听窗口的尺寸变化和键盘事件
      window.addEventListener('resize', onWindowResize);
      window.addEventListener('keydown', onKeyDown);

    }

    function onWindowResize() {

      SCREEN_WIDTH = window.innerWidth;
      SCREEN_HEIGHT = window.innerHeight;

      // that.camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
      that.camera.updateProjectionMatrix();
      that.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
      controls.handleResize();

    }

    function onKeyDown(event: KeyboardEvent) {

      switch (event.keyCode) {

        case 84:	/*t*/
          showHUD = !showHUD;
          break;

      }

    }

    /**
     * 创建HUD（平视显示器）界面
     * 本函数主要负责初始化一个用于查看光源阴影贴图的视图
     */
    function createHUD() {

      // 实例化一个ShadowMapViewer对象，用于查看光源的阴影贴图
      lightShadowMapViewer = new ShadowMapViewer(light);

      // 设置lightShadowMapViewer在屏幕上的位置
      lightShadowMapViewer.position.x = 10;
      // 将y坐标设置为屏幕高度减去阴影贴图高度的1/4再减去10，以确定其在屏幕上的垂直位置
      lightShadowMapViewer.position.y = SCREEN_HEIGHT - (SHADOW_MAP_HEIGHT / 4) - 10;

      // 将宽度设置为阴影贴图宽度的1/4
      lightShadowMapViewer.size.width = SHADOW_MAP_WIDTH / 4;
      // 将高度设置为阴影贴图高度的1/4
      lightShadowMapViewer.size.height = SHADOW_MAP_HEIGHT / 4;

      // 更新lightShadowMapViewer的状态，以确保上述设置生效
      lightShadowMapViewer.update();

    }

    function createScene() {

      // GROUND

      const geometry = new THREE.PlaneGeometry(100, 100);

      // 创建一个带Phong材质的网格，用于地面的外观，参数为颜色等属性
      const planeMaterial = new THREE.MeshPhongMaterial({ color: 0xffdd99 });

      const ground = new THREE.Mesh(geometry, planeMaterial);

      // 设置地面的位置，使其处于场景中的地板高度
      ground.position.set(0, FLOOR, 0);

      // 旋转地面，使其平面与场景的地板平行
      ground.rotation.x = - Math.PI / 2;

      // 设置地面的缩放，使其看起来更宽广
      ground.scale.set(100, 100, 100);

      // 禁止地面投射阴影，因为它应该是场景中其他物体的阴影接收器
      ground.castShadow = false;

      // 允许地面接收阴影，这样它就可以显示其他物体投射的阴影了
      ground.receiveShadow = true;

      that.scene.add(ground);

      // TEXT
      // 创建一个FontLoader对象用于加载字体文件
      const loader = new FontLoader();
      // 加载字体文件，完成后执行回调函数
      loader.load('../../assets/fonts/helvetiker_bold.typeface.json', function (font) {
        // 创建文本几何体对象，用于渲染文本
        const textGeo = new TextGeometry('HELLO WORLD', {
          font: font,
          size: 200,
          // depth: 50,
          curveSegments: 12,
          bevelThickness: 2,
          bevelSize: 5,
          bevelEnabled: true
        });
        // 计算文本的边界框
        textGeo.computeBoundingBox();
        // 计算文本的中心偏移量
        const centerOffset = - 0.5 * (textGeo.boundingBox!.max.x - textGeo.boundingBox!.min.x);
        // 创建文本材质对象
        const textMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000, specular: 0xffffff });
        // 创建文本网格对象
        const mesh = new THREE.Mesh(textGeo, textMaterial);
        // 设置文本的位置
        mesh.position.x = centerOffset;
        mesh.position.y = FLOOR + 67;
        // 启用阴影投射和接收
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        // 将文本网格对象添加到场景中
        that.scene.add(mesh);
      });

      // CUBES
      const cubes1 = new THREE.Mesh(new THREE.BoxGeometry(1500, 220, 150), planeMaterial);

      // 设置cubes1的位置，使其看起来像是地面上的一个固定装饰物
      cubes1.position.y = FLOOR - 50;
      cubes1.position.z = 20;

      // 启用立方体的阴影投射和接收，增强场景真实感
      cubes1.castShadow = true;
      cubes1.receiveShadow = true;

      that.scene.add(cubes1);

      // 创建第二个立方体，可能用于与场景中其他元素互动或提供视觉支持
      const cubes2 = new THREE.Mesh(new THREE.BoxGeometry(1600, 170, 250), planeMaterial);

      // 设置cubes2的位置，与cubes1相同，但可能有不同的用途或视觉效果
      cubes2.position.y = FLOOR - 50;
      cubes2.position.z = 20;

      // 启用立方体的阴影投射和接收，以确保与场景其他部分的光影效果一致
      cubes2.castShadow = true;
      cubes2.receiveShadow = true;

      that.scene.add(cubes2);

      // MORPHS

      mixer = new THREE.AnimationMixer(that.scene);

      /**
       * 向场景中添加一个变形动画
       *
       * @param {Object3D} mesh - 需要变形的网格模型
       * @param {AnimationClip} clip - 动画剪辑
       * @param {number} speed - 动画播放速度
       * @param {number} duration - 动画持续时间
       * @param {number} x - 网格模型的x轴位置
       * @param {number} y - 网格模型的y轴位置
       * @param {number} z - 网格模型的z轴位置
       * @param {boolean} fudgeColor - 是否随机调整网格模型的颜色
       */
      function addMorph(mesh: CustomMesh, clip: THREE.AnimationClip, speed: number, duration: number, x: number, y: number, z: number, fudgeColor?: boolean) {

        // 克隆网格模型和其材质，以避免修改原始对象
        mesh = mesh.clone();
        mesh.material = mesh.material.clone();

        // 如果允许随机调整颜色，则对材质的颜色进行随机调整
        if (fudgeColor) {

          mesh.material.color.offsetHSL(0, Math.random() * 0.5 - 0.25, Math.random() * 0.5 - 0.25);

        }

        // 设置动画播放速度
        mesh.speed = speed;

        // 配置动画剪辑的动作，并设置动画的持续时间，随机起始时间和播放状态
        mixer.clipAction(clip, mesh).
          setDuration(duration).
          startAt(- duration * Math.random()).
          play();

        // 设置网格模型的位置和旋转角度
        mesh.position.set(x, y, z);
        mesh.rotation.y = Math.PI / 2;

        // 启用网格模型的阴影投射和接收
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // 将网格模型添加到场景中
        that.scene.add(mesh);

        // 将网格模型添加到变形集合中，以便后续处理
        morphs.push(mesh);

      }
      const gltfloader = new GLTFLoader();

      gltfloader.load('../../assets/model/gltf/Horse.glb', function (gltf) {

        const mesh = gltf.scene.children[0] as CustomMesh;

        const clip = gltf.animations[0];

        addMorph(mesh, clip, 550, 1, 100 - Math.random() * 1000, FLOOR, 300, true);
        addMorph(mesh, clip, 550, 1, 100 - Math.random() * 1000, FLOOR, 450, true);
        addMorph(mesh, clip, 550, 1, 100 - Math.random() * 1000, FLOOR, 600, true);

        addMorph(mesh, clip, 550, 1, 100 - Math.random() * 1000, FLOOR, - 300, true);
        addMorph(mesh, clip, 550, 1, 100 - Math.random() * 1000, FLOOR, - 450, true);
        addMorph(mesh, clip, 550, 1, 100 - Math.random() * 1000, FLOOR, - 600, true);

      });

      gltfloader.load('../../assets/model/gltf/Flamingo.glb', function (gltf) {

        const mesh = gltf.scene.children[0] as CustomMesh;
        const clip = gltf.animations[0];

        addMorph(mesh, clip, 500, 1, 500 - Math.random() * 500, FLOOR + 350, 40);

      });

      gltfloader.load('../../assets/model/gltf/Stork.glb', function (gltf) {

        const mesh = gltf.scene.children[0] as CustomMesh;
        const clip = gltf.animations[0];

        addMorph(mesh, clip, 350, 1, 500 - Math.random() * 500, FLOOR + 350, 340);

      });

      gltfloader.load('../../assets/model/gltf/Parrot.glb', function (gltf) {

        const mesh = gltf.scene.children[0] as CustomMesh;
        const clip = gltf.animations[0];

        addMorph(mesh, clip, 450, 0.5, 500 - Math.random() * 500, FLOOR + 300, 700);

      });

    }

    this.update(() => {

      mixer.update(this.clock.deltaTime);

      for (let i = 0; i < morphs.length; i++) {

        const morph = morphs[i];

        morph.position.x += morph.speed * this.clock.deltaTime;

        if (morph.position.x > 2000) {

          morph.position.x = - 1000 - Math.random() * 500;

        }

      }

      controls.update(this.clock.deltaTime);

      if (showHUD) {

        lightShadowMapViewer.render(that.renderer);

      }
      stats.update();

    })
    init();
  }
}
// 创建Sketch实例并初始化
const sketch = new Sketch("#sketch");
sketch.create();
