// 作者: @patriciogv
// 标题: 4个单元的voronoi图

#ifdef GL_ES
precision mediump float;
#endif

// 程序的统一变量：分辨率、鼠标位置、时间
uniform vec2 u_resolution; // 窗口的分辨率
uniform vec2 u_mouse;     // 鼠标当前位置
uniform float u_time;     // 当前时间

void main() {
    // 将像素坐标转换为0到1的归一化坐标
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    // 修正由于窗口宽高比不同导致的坐标系统差异
    st.x *= u_resolution.x/u_resolution.y;

    vec3 color = vec3(.0); // 初始化颜色变量

    // 定义四个点的位置
    vec2 point[5];
    point[0] = vec2(0.83,0.75);
    point[1] = vec2(0.60,0.07);
    point[2] = vec2(0.28,0.64);
    point[3] =  vec2(0.31,0.26);
    // 将鼠标位置作为一个动态点
    point[4] = u_mouse/u_resolution;

    float m_dist = 1.;  // 最小距离初始化
    vec2 m_point;        // 最近点的位置

    // 遍历所有点，计算当前像素到各点的距离，找到最近的点
    for (int i = 0; i < 5; i++) {
        float dist = distance(st, point[i]);
        if ( dist < m_dist ) {
            // 更新最小距离和最近点的位置
            m_dist = dist;
            m_point = point[i];
        }
    }

    // 根据最小距离，添加距离场效果
    color += m_dist*2.;

    // 根据最近点的位置，给颜色添加一种色调
    color.rg = m_point;

    // 通过绘制等值线来增强视觉效果
    color -= abs(sin(80.0*m_dist))*0.07;

    // 绘制最近点的中心
    color += 1.-step(.02, m_dist);

    // 输出最终的颜色
    gl_FragColor = vec4(color,1.0);
}