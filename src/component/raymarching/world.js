/**
 * World类继承自kokomi.Component，用于初始化全局的Raymarching场景。
 * @param {Object} base - 传入基础配置对象，提供场景初始化所需的基本配置。
 */
import * as kokomi from "kokomi.js"; // 导入kokomi.js库

import RaymarchingScene from "./raymarching-scene"; // 导入RaymarchingScene场景类

export default class World extends kokomi.Component {
  constructor(base) {
    super(base); // 调用父类的constructor

    // 当基础配置对象的am模块触发"ready"事件时，初始化Raymarching场景并添加现有元素
    this.base.am.on("ready", () => {
      this.rs = new RaymarchingScene(this.base); // 创建Raymarching场景实例
      this.rs.addExisting(); // 添加现有元素到场景中
      // 添加class到loader屏幕，用于显示加载完成
      document.querySelector(".loader-screen")?.classList.add("hollow");
    });
  }
}