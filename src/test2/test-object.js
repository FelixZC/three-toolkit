import * as kokomi from "kokomi.js";
import * as THREE from "three";

import testObjectVertexShader from "../shaders/3d-effect/vert.glsl";
import testObjectFragmentShader from "../shaders/3d-effect/frag.glsl";

/**
 * TestObject类扩展自kokomi.Component，用于创建和管理Three.js中的材质和网格。
 * 它通过使用着色器材料和统一变量来实现特殊的视觉效果。
 */
export default class TestObject extends kokomi.Component {
  /**
   * 构造函数初始化场景背景、几何体、材质和网格，并设置调试参数。
   * @param {Object} base - 基础对象，提供场景和其他组件的访问。
   */
  constructor(base) {
    super(base);

    // 初始化着色器中的统一变量参数
    const params = {
      uDistort: {
        value: 1,
      },
      uFrequency: {
        value: 1.7,
      },
      uFresnelIntensity: {
        value: 0.2,
      },
      uLightIntensity: {
        value: 0.9,
      },
      uLight2Intensity: {
        value: 0.9,
      },
    };

    // 颜色参数用于场景背景和着色器中的颜色统一变量
    const colorParams = {
      themeColor: "#070618",
      lightColor: "#4cc2e9",
      light2Color: "#9743fe",
    };

    // 设置场景背景颜色
    this.base.scene.background = new THREE.Color(colorParams.themeColor);

    // 创建球体几何体，用于后续的网格创建
    const RADIUS = 1.001;
    const SEGMENTS = 256.001;
    const geometry = new THREE.SphereGeometry(RADIUS, SEGMENTS, SEGMENTS);
    
    // 创建着色器材料，结合了顶点和片段着色器，以及定义和其他统一变量
    const material = new THREE.ShaderMaterial({
      vertexShader: testObjectVertexShader,
      fragmentShader: testObjectFragmentShader,
      defines: {
        RADIUS,
        SEGMENTS,
      },
    });
    this.material = material;
    
    // 创建网格并将其与材质关联
    const mesh = new THREE.Mesh(geometry, material);
    this.mesh = mesh;

    // 注入器用于在运行时更新着色器中的统一变量
    const uj = new kokomi.UniformInjector(this.base);
    this.uj = uj;
    
    // 更新材料的统一变量，包括颜色和之前定义的参数
    material.uniforms = {
      ...material.uniforms,
      ...uj.shadertoyUniforms,
      ...params,
      uThemeColor: {
        value: new THREE.Color(colorParams.themeColor),
      },
      uLightColor: {
        value: new THREE.Color(colorParams.lightColor),
      },
      uLight2Color: {
        value: new THREE.Color(colorParams.light2Color),
      },
    };

    // 如果调试模式激活，设置参数的GUI控制
    const debug = this.base.debug;
    if (debug.active) {
      const debugFolder = debug.ui.addFolder("testObject");
      debugFolder.add(params.uDistort, "value").min(0).max(2).step(0.01).name("distort");
      debugFolder.add(params.uFrequency, "value").min(0).max(5).step(0.01).name("frequency");
      debugFolder.addColor(colorParams, "themeColor").onChange((val) => {
        material.uniforms.uThemeColor.value = new THREE.Color(val);
        this.base.scene.background = new THREE.Color(val);
      });
      debugFolder.addColor(colorParams, "lightColor").onChange((val) => {
        material.uniforms.uLightColor.value = new THREE.Color(val);
      });
      debugFolder.add(params.uFresnelIntensity, "value").min(0).max(1).step(0.01).name("fresnelIntensity");
      debugFolder.add(params.uLightIntensity, "value").min(0).max(1).step(0.01).name("lightIntensity");
      debugFolder.addColor(colorParams, "light2Color").onChange((val) => {
        material.uniforms.uLight2Color.value = new THREE.Color(val);
      });
      debugFolder.add(params.uLight2Intensity, "value").min(0).max(1).step(0.01).name("light2Intensity");
    }
  }

  /**
   * 将网格添加到场景中。
   */
  addExisting() {
    this.container.add(this.mesh);
  }

  /**
   * 更新函数，每帧调用，用于注入着色器中的统一变量。
   */
  update() {
    this.uj.injectShadertoyUniforms(this.material.uniforms);
  }
}