// 引入TestObject类
import Experience from "./experience";
/**
 * World类扩展自kokomi.Component，用于创建和管理世界对象。
 * @param {Object} base - 作为组件基础的对象，提供事件监听和管理等功能。
 */
import * as kokomi from "kokomi.js"; // 引入kokomi库
import TestObject from "./test-object";
export default class World extends kokomi.Component {
  declare base: Experience;
  testObject: TestObject | null;
  constructor(base: Experience) {
    super(base);
    this.testObject = null;
    this.base.am.on("ready", () => {
      document.querySelector(".loader-screen")?.classList.add("hollow");
      this.testObject = new TestObject(this.base);
      this.testObject.addExisting();
    });
  }
}
