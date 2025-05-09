#ifdef GL_ES
precision mediump float; // 在支持OpenGL ES的设备上，指定中等精度的浮点数
#endif

// 各种全局uniform变量，用于在着色器程序中传递全局变化的参数
uniform vec2 u_resolution; // 窗口的分辨率
uniform vec2 u_mouse; // 鼠标的当前位置
uniform float u_time; // 程序运行的时间

// 着色器主函数
void main() {
    // 将当前像素坐标转换为0到1之间的归一化坐标
    vec2 st = gl_FragCoord.xy/u_resolution;
    // 将归一化坐标作为颜色输出
    gl_FragColor = vec4(st.x,st.y,0.0,1.0);
}