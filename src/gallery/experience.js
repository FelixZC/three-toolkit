/**
 * Experience类扩展自kokomi.Base，用于初始化和管理整个体验的核心组件。
 * @param {string} sel 选择器，用于指定DOM元素， 默认为"#sketch"。
 */
import * as kokomi from "kokomi.js";

import World from "./world";

import Debug from "../debug";

import resources from "./resources";

import Postprocessing from "./postprocessing";

export default class Experience extends kokomi.Base {
  constructor(sel = "#sketch") {
    super(sel);

    // 将当前实例赋值给全局变量，以便于在其他地方访问。
    window.experience = this;

    // 初始化调试工具。
    this.debug = new Debug();

    // 初始化资源管理器。
    this.am = new kokomi.AssetManager(this, resources);

    // 设置屏幕相机并添加到场景中。
    const screenCamera = new kokomi.ScreenCamera(this);
    screenCamera.addExisting();

    // 初始化后处理效果，并将其添加到场景中。
    this.postprocessing = new Postprocessing(this);
    this.postprocessing.addExisting();

    // 更新函数中调整后处理的RGB移位，基于世界组件中的滑块滚动。
    this.update(() => {
      this.postprocessing.ce.customPass.material.uniforms.uRGBShift.value =
        Math.abs(this.world.slider?.ws.scroll.delta) * 0.0004;
    });

    // 初始化世界组件。
    this.world = new World(this);

  }
}