// 生成随机数的着色器函数示例
// 作者 @patriciogv - 2015
// http://patriciogonzalezvivo.com

#ifdef GL_ES
precision mediump float; // 在GL_ES环境中使用中等精度的float
#endif

// 程序统一变量：分辨率、鼠标位置、时间
uniform vec2 u_resolution; // 窗口的分辨率
uniform vec2 u_mouse; // 鼠标当前的位置
uniform float u_time; // 程序运行的时间

/**
 * 根据给定的二维坐标生成一个随机数。
 * @param st 二维坐标，通常为像素坐标。
 * @return 返回一个在0到1之间的浮点数随机值。
 */
float random (vec2 st) {
    // 使用噪声函数生成随机数
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

void main() {
    // 计算当前像素相对于画布的坐标
    vec2 st = gl_FragCoord.xy/u_resolution.xy;

    // 生成一个基于当前像素位置的随机数
    float rnd = random( st );

    // 设置当前像素的颜色为随机数
    gl_FragColor = vec4(vec3(rnd),1.0);
}