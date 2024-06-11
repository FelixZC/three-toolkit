/**
 * Postprocessing类，继承自kokomi.Component，用于实现后处理效果。
 * @param {HTMLElement} base - 组件绑定的基础HTML元素。
 */
import * as kokomi from "kokomi.js";

import postprocessingFragmentShader from "../shaders/postprocessing/frag.glsl";

export default class Postprocessing extends kokomi.Component {
    constructor(base) {
        super(base); // 调用父类的构造函数

        // 初始化自定义效果，配置片段着色器和统一变量
        this.ce = new kokomi.CustomEffect(this.base, {
            fragmentShader: postprocessingFragmentShader,
            uniforms: {
                uRGBShift: {
                    value: 0, // 初始RGB偏移量为0
                },
            },
        });
    }

    /**
     * 将现有元素添加到后处理效果中。
     */
    addExisting() {
        this.ce.addExisting(); // 调用CustomEffect的addExisting方法
    }
}