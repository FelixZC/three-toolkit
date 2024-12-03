// 作者 @patriciogv ( patriciogonzalezvivo.com ) - 2015

#ifdef GL_ES
precision mediump float;
#endif

// 全局统一变量
uniform vec2 u_resolution; // 渲染表面的分辨率
uniform float u_time; // 运行时间

/**
 * 应用砖块铺贴效果到输入坐标。
 *
 * @param _st 输入坐标（通常为UV坐标）。
 * @param _zoom 缩放级别，影响铺贴效果。
 * @return 应用砖块铺贴后的坐标。
 */
vec2 brickTile(vec2 _st, float _zoom){
    _st *= _zoom; // 根据_zoom缩放输入坐标

    // 生成偏移量以模拟砖块对齐
    _st.x += step(1., mod(_st.y,2.0)) * 0.5;

    return fract(_st); // 返回_st的小数部分，使其保持在[0, 1)范围内
}

/**
 * 在给定区域内绘制一个矩形框。
 *
 * @param _st 输入坐标（通常为UV坐标）。
 * @param _size 矩形框的尺寸。
 * @return 一个浮点值，表示坐标是否在框内（1.0表示在框内，0.0表示在框外）。
 */
float box(vec2 _st, vec2 _size){
    _size = vec2(0.5) - _size * 0.5;
    vec2 uv = smoothstep(_size, _size + vec2(1e-4), _st);
    uv *= smoothstep(_size, _size + vec2(1e-4), vec2(1.0) - _st);
    return uv.x * uv.y;
}

void main(void){
    vec2 st = gl_FragCoord.xy / u_resolution.xy; // 获取当前像素相对于渲染表面的位置
    vec3 color = vec3(0.0);

    // 现代标准砖尺寸：215mm x 102.5mm x 65mm
    // http://www.jaharrison.me.uk/Brickwork/Sizes.html
    st /= vec2(2.15, 0.65) / 1.5; // 未启用的砖尺寸调整

    // 应用砖块铺贴效果
    st = brickTile(st, 5.0);

    color = vec3(box(st, vec2(0.9))); // 绘制矩形框并设置颜色

    // 解除注释以查看空间坐标
    // color = vec3(st, 0.0);

    gl_FragColor = vec4(color, 1.0); // 设置片段颜色
}