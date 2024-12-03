// 作者: @patriciogv
// 标题: 4 cells DF

// 如果是OpenGL ES环境，则设置中等精度浮点数
#ifdef GL_ES
precision mediump float;
#endif

// 程序统一变量：分辨率、鼠标位置、时间
uniform vec2 u_resolution; // 屏幕分辨率
uniform vec2 u_mouse;      // 鼠标当前位置
uniform float u_time;      // 当前时间

// 主程序：绘制4个细胞的距离场
void main() {
    // 将像素坐标转换为屏幕空间坐标
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    // 调整x轴坐标以适应屏幕宽高比
    st.x *= u_resolution.x/u_resolution.y;

    // 初始化颜色变量
    vec3 color = vec3(.0);

    // 细胞位置数组
    vec2 point[5];
    point[0] = vec2(0.83,0.75); // 细胞1位置
    point[1] = vec2(0.60,0.07); // 细胞2位置
    point[2] = vec2(0.28,0.64); // 细胞3位置
    point[3] =  vec2(0.31,0.26); // 细胞4位置
    point[4] = u_mouse/u_resolution; // 鼠标位置作为细胞5

    float m_dist = 1.;  // 最小距离初始化

    // 遍历所有细胞位置，计算当前像素到每个细胞的最小距离
    for (int i = 0; i < 5; i++) {
        float dist = distance(st, point[i]); // 当前像素到细胞的距离

        // 保持最小距离值
        m_dist = min(m_dist, dist);
    }

    // 绘制最小距离场
    color += m_dist;

    // 注释掉的代码：用于显示等值线
    // color -= step(.7,abs(sin(50.0*m_dist)))*.3;

    // 设置颜色并输出
    gl_FragColor = vec4(color,1.0);
}