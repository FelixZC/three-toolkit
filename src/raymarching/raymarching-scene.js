/**
 * RaymarchingScene类，继承自kokomi.Component，用于创建和管理一个光线步进场景。
 */
import * as kokomi from "kokomi.js"; // 引入kokomi库

import raymarchingSceneFragmentShader from "../shaders/raymarching-scene/frag.glsl"; // 引入光线步进场景的片段着色器

export default class RaymarchingScene extends kokomi.Component {
  /**
   * 构造函数，初始化RaymarchingScene实例。
   * @param {Object} base - 作为组件基底的对象。
   */
  constructor(base) {
    super(base); // 调用父类的构造函数

    // 创建一个屏幕四边形对象，用于渲染光线步进场景
    this.quad = new kokomi.ScreenQuad(this.base, {
      fragmentShader: raymarchingSceneFragmentShader, // 使用光线步进场景的片段着色器
      shadertoyMode: true, // 启用shadertoy模式
    });
  }

  /**
   * 添加已存在的资源到场景中。
   */
  addExisting() {
    this.quad.addExisting(); // 调用quad对象的addExisting方法
  }
}