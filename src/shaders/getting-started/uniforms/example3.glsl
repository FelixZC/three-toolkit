#ifdef GL_ES
precision mediump float;
#endif

// 定义两个uniform变量，分别表示渲染目标的分辨率和当前时间
uniform vec2 u_resolution;
uniform float u_time;

// 定义两种颜色，用于后续混合
vec3 colorA = vec3(0.149,0.141,0.912);
vec3 colorB = vec3(1.000,0.833,0.224);

void main() {
    // 初始化最终颜色为黑色
    vec3 color = vec3(0.0);

    // 使用时间u_time的正弦值的绝对值作为混合比例
    float pct = abs(sin(u_time));

    // 根据pct混合两种颜色
    color = mix(colorA, colorB, pct);

    // 将混合后的颜色设置为片段的最终颜色
    gl_FragColor = vec4(color,1.0);
}