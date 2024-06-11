/**
 * World类扩展自kokomi.Component，用于创建和管理世界对象。
 * @param {Object} base - 作为组件基础的对象，提供事件监听和管理等功能。
 */
import * as kokomi from "kokomi.js"; // 引入kokomi.js库

import TestObject from "./test-object"; // 引入TestObject类

export default class World extends kokomi.Component {
  constructor(base) {
    super(base); // 调用父类的构造函数

    // 当基础对象准备就绪时，执行以下逻辑
    this.base.am.on("ready", () => {
      // 添加类名以显示加载完成
      document.querySelector(".loader-screen")?.classList.add("hollow");
      // 实例化TestObject并与其交互
      this.testObject = new TestObject(this.base);
      this.testObject.addExisting(); // 呼叫TestObject的方法以处理现有项
    });
  }
}