
import * as THREE from "three";
import Base from './init'
/**
 * 设置场景光照。
 */
export function addAmbientLightDefault(base: Base) {
  // 添加环境光和方向光到场景中
  const light = new THREE.AmbientLight(0xffffff, 2);
  base.scene.add(light);
  return light;
}

export function addDirectionalLightDefault(base: Base) {
  // 创建并配置方向光
  const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
  directionalLight.position.set(1, 1, 1).normalize();
  base.scene.add(directionalLight);
  if (base.gui) {
    // 创建光照颜色控制器
    const lightColorController = base.gui
      .addColor(directionalLight, "color")
      .name("Directional Light Color");
    lightColorController.onChange((value: THREE.Color) => {
      directionalLight.color.set(value);
    });
    // 创建光照强度控制器
    const lightIntensityController = base.gui
      .add(directionalLight, "intensity", 0, 5)
      .step(0.1)
      .name("Directional Light Intensity");
    lightIntensityController.onChange((value: number) => {
      directionalLight.intensity = value;
    });
  }
  return directionalLight;
}
