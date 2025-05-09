#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution; // 窗口的分辨率
uniform vec2 u_mouse; // 鼠标的当前位置
uniform float u_time; // 程序运行的时间

/**
 * 生成一个在给定二维坐标上的随机数。
 * @param st 二维坐标点
 * @return 返回在0到1范围内的随机浮点数
 */
float random (in vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))
                 * 43758.5453123);
}

/**
 * 基于Morgan McGuire的2D噪声函数。
 * @param st 二维坐标点
 * @return 返回基于输入坐标点的噪声值
 */
float noise (in vec2 st) {
    vec2 i = floor(st); // 对输入坐标进行向下取整
    vec2 f = fract(st); // 获取输入坐标的小数部分

    // 计算四个角落的随机值
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // 使用三次Hermite曲线进行平滑插值
    vec2 u = f*f*(3.0-2.0*f);

    // 混合四个角落的值
    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy; // 规范化当前像素坐标

    // 通过放大系数来调整噪声显示的范围
    vec2 pos = vec2(st*5.0);

    // 应用噪声函数
    float n = noise(pos);

    // 设置最终的像素颜色
    gl_FragColor = vec4(vec3(n), 1.0);
}