import * as kokomi from "kokomi.js";
import sliderVertexShader from "../shaders/slider/vert.glsl";
import sliderFragmentShader from "../shaders/slider/frag.glsl";
/**
 * Slider类继承于kokomi.Component，用于创建一个滑动相册效果。
 * @param {HTMLElement} base - 组件的基元素。
 */
export default class Slider extends kokomi.Component {
  constructor(base) {
    super(base);

    // 初始化参数，包括着色器中使用的变量
    const params = {
      uDistortX: {
        value: 1.15,
      },
      uDistortZ: {
        value: 1.5,
      },
    };
    this.params = params;

    // 创建无限画廊实例
    this.ig = new kokomi.InfiniteGallery(this.base, {
      elList: [...document.querySelectorAll(".gallery-item")], // 目标元素列表
      direction: "horizontal", // 滑动方向
      gap: 128, // 元素之间的间距
      vertexShader: sliderVertexShader, //顶点着色器
      fragmentShader: sliderFragmentShader, // 片元着色器
      uniforms: {
        uVelocity: {
          value: 0,
        },
        uOpacity: {
          value: 1,
        },
        uProgress: {
          value: 0,
        },
        ...params,
      }, // 着色器中使用的统一变量
      materialParams: {
        transparent: true, // 材质设置为透明
      },
    });

    // 如果处于调试模式，设置调试界面
    const debug = this.base.debug;
    if (debug.active) {
      const debugFolder = debug.ui.addFolder("gallery");
      debugFolder
        .add(params.uDistortX, "value")
        .min(0)
        .max(2)
        .step(0.01)
        .name("distortX");
      debugFolder
        .add(params.uDistortZ, "value")
        .min(0)
        .max(2)
        .step(0.01)
        .name("distortZ");
    }

    // 初始化鼠标滚轮和拖拽检测
    this.ws = new kokomi.WheelScroller();
    this.ws.listenForScroll();

    this.dd = new kokomi.DragDetecter(this.base);
    this.dd.detectDrag();
    this.dd.on("drag", (delta) => {
      this.ws.scroll.target -= delta[this.ig.dimensionType] * 2;
    });
  }

  /**
   * 添加已存在的元素到相册中。
   * @returns {Promise<void>} 当图片加载完毕时解析的Promise。
   */
  async addExisting() {
    this.ig.addExisting();
    await this.ig.checkImagesLoaded();
  }

  /**
   * 更新相册状态，包括滚动同步和着色器变量更新。
   */
  update() {
    this.ws.syncScroll();
    const {
      current,
      delta
    } = this.ws.scroll;
    this.ig.sync(current);

    // 遍历每个相册元素，更新其着色器参数
    this.ig.iterate((maku) => {
      maku.mesh.material.uniforms.uVelocity.value = delta;

      maku.mesh.material.uniforms.uDistortX.value = this.params.uDistortX.value;
      maku.mesh.material.uniforms.uDistortZ.value = this.params.uDistortZ.value;
    });
  }
}