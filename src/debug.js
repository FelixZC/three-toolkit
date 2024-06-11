/**
 * Debug类用于创建和管理lil-gui界面，仅当URL的hash为"#debug"时激活。
 */
import * as dat from "lil-gui";

export default class Debug {
  /**
   * Debug类的构造函数。
   * 无参数。
   * 无返回值。
   */
  constructor() {
    // 检查URL的hash，如果为"#debug"，则激活debug模式
    this.active = window.location.hash === "#debug";

    // 如果处于激活状态，创建并初始化dat.GUI界面
    if (this.active) {
      this.ui = new dat.GUI();
    }
  }
}