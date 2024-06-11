#ifdef GL_ES
precision mediump float;
#endif

// Uniform变量声明，用于在OpenGL ES中传递动态值到着色器
uniform vec2 u_resolution; // 窗口的分辨率
uniform vec2 u_mouse; // 鼠标的当前位置
uniform float u_time; // 程序运行的时间

/**
 * 在Y轴上绘制一条线，使用值在0.0-1.0之间的函数。
 * 
 * @param st 输入的二维坐标，代表屏幕上的一个点
 * @return 返回一个0到1之间的浮点数，表示该点是否在直线上
 */
float plot(vec2 st) {    
    return smoothstep(0.02, 0.0, abs(st.y - st.x));
}

void main() {
    // 将当前像素坐标转换为相对于屏幕分辨率的比例坐标
    vec2 st = gl_FragCoord.xy/u_resolution;

    // Y轴上的位置
    float y = st.x;

    // 初始颜色设置为Y轴上的位置值
    vec3 color = vec3(y);

    // 绘制线
    float pct = plot(st); // 计算当前点是否在直线上
    // 根据是否在直线上，混合颜色
    color = (1.0-pct)*color+pct*vec3(0.0,1.0,0.0); // 如果在直线上，颜色变为绿色

    // 设置最终的颜色，并输出到帧缓冲
    gl_FragColor = vec4(color,1.0);
}