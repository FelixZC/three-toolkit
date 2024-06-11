#ifdef GL_ES
precision mediump float; // 使用中等精度的浮点数，适用于OpenGL ES环境
#endif

uniform float u_time; // 时间 uniform 变量，可用于动画和动态效果

void main() {
    // 设置片段颜色为紫色（红色和蓝色分量为最大值，绿色分量为0）
	gl_FragColor = vec4(1.0,0.0,1.0,1.0);
}