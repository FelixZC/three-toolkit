import * as THREE from "three";
import Base from "./init";
import Firework from "@src/effect/firework";
import { Sky } from "three-stdlib";
import { RoomEnvironment } from "three-stdlib";

/**
 * 向场景中添加烟花效果。
 * @param {Object} base - 包含场景(scene)等THREE相关对象的示例实例，用于添加和管理烟花对象。
 */
export function addFireWork(base: Base) {
  const fireworkController = new Firework(base);
  // 添加键盘事件监听器
  document.addEventListener("keydown", (event) => {
    // 检查是否为空格键被按下
    if (event.code === "Space") {
      const position = new THREE.Vector3(
        Math.random() * 10 - 5,
        0,
        Math.random() * 10 - 5,
      );
      fireworkController.launch(position); // 用户按下空格键时创建新的烟花
    }
  });
  return fireworkController.fireworks;
}

/**
 * 在给定的场景中添加指定数量的星星。
 * @param {Object} base 包含场景(scene)等Three相关对象和数据的示例对象。
 * @param {number} count 要添加的星星数量。
 */
export function addStars(base: Base, count: number) {
  // 加载星星纹理
  const textureLoader = new THREE.TextureLoader();
  const starTexture = textureLoader.load(
    "/src/assets/images/textures/star_texture.png",
  ); // 替换为实际星星纹理的路径

  // 创建星星材质
  const starMaterial = new THREE.PointsMaterial({
    map: starTexture,
    size: 0.1,
    // 可根据需要调整星星的大小
    color: 0xffffff,
    transparent: true,
    blending: THREE.AdditiveBlending, // 使用加性混合让星星更亮
  });
  const stars: THREE.Points<
    THREE.SphereGeometry,
    THREE.PointsMaterial,
    THREE.Object3DEventMap
  >[] = [];
  // 循环创建指定数量的星星并添加到场景中
  for (let i = 0; i < count; i++) {
    const geometry = new THREE.SphereGeometry(0.01, 32, 32); // 使用小球几何体作为星星的形状
    const star = new THREE.Points(geometry, starMaterial);

    // 随机定位星星
    const [x, y, z] = Array(3)
      .fill(Math.E)
      .map(() => THREE.MathUtils.randFloatSpread(1000)); // 调整范围以适应你的场景大小
    star.position.set(x, y, z);
    stars.push(star);
    base.scene.add(star);
  }
  return stars;
}

export function addFog(base: Base) {
  base.scene.fog = new THREE.Fog(0xffffff, 0.2, 0);
  base.renderer.setClearColor((base.scene.fog as THREE.Fog).color);
  if (base.gui) {
    // 创建雾效颜色控制器
    const fogColorController = base.gui
      .addColor(base.scene.fog!, "color")
      .name("Fog Color");
    fogColorController.onChange((value: THREE.Color) => {
      base.scene.fog!.color.set(value);
    });

    // 创建雾效范围控制器
    const fogRangeController = base.gui
      .add(base.scene.fog!, "near", 0, 0.5)
      .step(0.1)
      .name("Fog Near");
    fogRangeController.onChange((value: number) => {
      (base.scene.fog as THREE.Fog).near = value;
    });
    // 通过GUI界面控制器动态调整场景雾化效果的远距离参数。
    const fogFarController = base.gui
      .add(base.scene.fog!, "far", 0, 1000)
      .step(1)
      .name("Fog Far");

    // 当雾化远距离值发生变化时，更新场景的雾化远距离参数。
    fogFarController.onChange((value: number) => {
      (base.scene.fog as THREE.Fog).far = value;
    });
  }

}

/**
 * 设置天空盒环境。
 * 该函数初始化一个天空盒，并允许通过图形用户界面(GUI)来调节天空的外观参数，如湍流度、瑞利散射系数等。
 * 此外，还能动态更新太阳的位置，以实现不同时间的天空光照效果。
 *
 * @this {Object} 包含场景(scene)、相机(camera)、渲染器(renderer)和GUI控制器(gui)等属性的对象。
 */
export function addSkyBox(base: Base) {
  const { scene, camera, renderer } = base;
  const sky = new Sky(); // 创建天空对象
  sky.scale.setScalar(450000); // 设置天空对象的规模
  scene.add(sky); // 将天空对象添加到场景中

  // 初始化天空参数，用于渲染天空盒。参数基于物理模型，可调整天空的外观。
  const skyParameters = {
    turbidity: 10,
    // 湍流度，影响天空的总体颜色温度
    rayleigh: 3,
    // 瑞利散射系数，影响天空的蓝色强度
    mieCoefficient: 0.005,
    // 米散射系数，影响天空的红色和橙色强度
    mieDirectionalG: 0.95,
    // 米散射的定向因子，影响云彩的形状
    elevation: -2.2,
    // 观察者的海拔高度，正值表示向上看，负值表示向下看
    azimuth: 180,
    // 观察者的方位角，0为正北，90为正东，180为正南，270为正西
    exposure: renderer.toneMappingExposure, // 曝光设置，用于调整最终渲染图像的亮度
  };
  const sun = new THREE.Vector3(); // 定义太阳位置变量

  // 更新天空材质参数和太阳位置的函数
  const updateSky = () => {
    const uniforms = (sky.material as THREE.ShaderMaterial).uniforms;
    uniforms["turbidity"].value = skyParameters.turbidity;
    uniforms["rayleigh"].value = skyParameters.rayleigh;
    uniforms["mieCoefficient"].value = skyParameters.mieCoefficient;
    uniforms["mieDirectionalG"].value = skyParameters.mieDirectionalG;

    // 计算太阳在天空中的位置
    const phi = THREE.MathUtils.degToRad(90 - skyParameters.elevation);
    const theta = THREE.MathUtils.degToRad(skyParameters.azimuth);
    sun.setFromSphericalCoords(1, phi, theta);
    uniforms["sunPosition"].value.copy(sun);

    // 更新渲染器的曝光设置
    renderer.toneMappingExposure = skyParameters.exposure;
    renderer.render(scene, camera); // 渲染场景
  };
  if (base.gui) {
    // 使用GUI来控制天空参数，包括湍流度、瑞利散射系数等，并在参数改变时更新天空渲染
    base.gui
      .add(skyParameters, "turbidity")
      .min(0)
      .max(20)
      .step(0.1)
      .onChange(updateSky);
    base.gui
      .add(skyParameters, "rayleigh")
      .min(0)
      .max(4)
      .step(0.001)
      .onChange(updateSky);
    base.gui
      .add(skyParameters, "mieCoefficient")
      .min(0)
      .max(0.1)
      .step(0.001)
      .onChange(updateSky);
    base.gui
      .add(skyParameters, "mieDirectionalG")
      .min(0)
      .max(1)
      .step(0.001)
      .onChange(updateSky);
    base.gui
      .add(skyParameters, "elevation")
      .min(-3)
      .max(2)
      .step(0.01)
      .onChange(updateSky);
    base.gui
      .add(skyParameters, "azimuth")
      .min(-180)
      .max(180)
      .step(0.1)
      .onChange(updateSky);
    base.gui
      .add(skyParameters, "exposure")
      .min(0)
      .max(1)
      .step(0.00001)
      .onChange(updateSky);

  }
  // 初始调用，用于设置初始天空状态
  updateSky();
}

/**
 * 设置场景的环境贴图。
 */
export function addRoomEnvironmentDefault(base: Base) {
  const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
  base.scene.environment = pmremGenerator.fromScene(
    RoomEnvironment(),
    0.04,
  ).texture;
}
