#ifdef GL_ES
precision mediump float; // 在GL_ES环境中使用中等精度的float类型
#endif

// uniform变量u_time，代表全局统一变量，其值在程序运行过程中可以被改变
uniform float u_time;

// main函数是着色器程序的入口点
void main() {
    // 设置片元颜色为红色（基于时间的正弦函数的绝对值）
    // 这里的颜色只有红色分量，其他分量被设置为0，alpha分量为1
    gl_FragColor = vec4(abs(sin(u_time)),0.0,0.0,1.0);
}