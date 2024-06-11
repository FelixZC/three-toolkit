import * as kokomi from "kokomi.js";
import Slider from "./slider";
import gsap from "gsap";
/**
 * World类继承自kokomi.Component，用于创建和管理一个交互式的滑块系统。
 * @param {Object} base - 作为组件基础的对象，提供事件管理、交互管理等能力。
 */
export default class World extends kokomi.Component {
  constructor(base) {
    super(base);

    // 当系统准备就绪时，初始化滑块组件并添加已有项，然后设置初始状态。
    this.base.am.on("ready", async () => {
      this.slider = new Slider(this.base); // 初始化滑块
      await this.slider.addExisting(); // 添加已存在的项到滑块

      this.currentActiveMesh = null; // 当前激活的Mesh对象，用于管理交互状态

      // 遍历滑块中的每个项目，添加交互事件
      this.slider.ig.iterate((maku) => {
        this.base.interactionManager.add(maku.mesh); // 添加到交互管理器
        maku.mesh.addEventListener("click", () => {
          console.log(maku); // 打印当前点击的项目

          // 如果滚动距离大于5，则不进行交互
          if (Math.abs(this.slider.ws.scroll.delta) > 5) {
            return;
          }

          // 筛选出除当前项目外的所有项目，进行交互处理
          const otherMakus = this.slider.ig.makuGroup.makus.filter(
            (item) => item !== maku
          );

          // 如果当前没有激活的Mesh，则进行激活处理
          if (!this.currentActiveMesh) {
            this.slider.ws.disable(); // 禁用滑动
            this.slider.dd.disable(); // 禁用拖拽

            // 对除当前项目外的所有项目进行透明度动画
            otherMakus.forEach((item) => {
              gsap.to(item.mesh.material.uniforms.uOpacity, {
                value: 0,
                ease: "power2.out",
              });
            });

            // 对当前项目进行进度动画，达到一定进度后标记为当前激活项目
            const that = this;
            gsap.to(maku.mesh.material.uniforms.uProgress, {
              value: 1,
              duration: 1,
              ease: "power2.out",
              delay: 0.5,
              onUpdate() {
                if (this.progress() >= 0.5) {
                  that.currentActiveMesh = maku.mesh;
                }
              },
            });
          }
        });
      });

      // 当点击容器时，如果存在当前激活的项目，则进行反向动画，恢复到初始状态
      this.base.container.addEventListener("click", () => {
        if (this.currentActiveMesh) {
          const that = this;
          gsap.to(this.currentActiveMesh.material.uniforms.uProgress, {
            value: 0,
            duration: 1,
            ease: "power2.inOut",
            onUpdate() {
              // 当动画进度达到一定点时，恢复滑动和拖拽功能，重置当前激活项目
              if (this.progress() >= 0.5) {
                that.slider.ws.enable();
                that.slider.dd.enable();

                that.currentActiveMesh = null;
              }
            },
          });
          // 对所有项目进行透明度恢复动画
          this.slider.ig.iterate((item) => {
            gsap.to(item.mesh.material.uniforms.uOpacity, {
              value: 1,
              delay: 0.5,
              ease: "power2.out",
            });
          });
        }
      });

      // 当系统准备就绪时，隐藏加载屏幕
      document.querySelector(".loader-screen")?.classList.add("hollow");
    });
  }
}
