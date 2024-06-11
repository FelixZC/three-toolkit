// 作者: @patriciogv
// 标题: CellularNoise - 细胞噪声

#ifdef GL_ES
precision mediump float;
#endif

// 程序中使用的全局变量
uniform vec2 u_resolution; // 视口分辨率
uniform vec2 u_mouse;     // 鼠标位置
uniform float u_time;     // 时间

// 为给定的二维向量p生成一个随机二维向量
vec2 random2( vec2 p ) {
    return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
}

void main() {
    // 将像素坐标转换为纹理坐标，并考虑分辨率的长宽比
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    st.x *= u_resolution.x/u_resolution.y;
    vec3 color = vec3(.0); // 初始化颜色向量

    // 缩放纹理坐标
    st *= 3.;

    // 对空间进行平铺
    vec2 i_st = floor(st); // 整数部分
    vec2 f_st = fract(st); // 小数部分

    float m_dist = 1.;  // 记录找到的最小距离

    // 遍历临近的九个格子
    for (int y= -1; y <= 1; y++) {
        for (int x= -1; x <= 1; x++) {
            // 当前网格位置的邻居
            vec2 neighbor = vec2(float(x),float(y));

            // 根据当前网格位置和邻居位置生成一个随机点
            vec2 point = random2(i_st + neighbor);

            // 动画该点
            point = 0.5 + 0.5*sin(u_time + 6.2831*point);

            // 计算当前像素到该点的距离
            vec2 diff = neighbor + point - f_st;
            float dist = length(diff);

            // 更新最小距离
            m_dist = min(m_dist, dist);
        }
    }

    // 绘制最小距离（距离场）
    color += m_dist;

    // 绘制细胞中心
    color += 1.-step(.02, m_dist);

    // 绘制网格线
    color.r += step(.98, f_st.x) + step(.98, f_st.y);

    // 注释掉的代码：展示等值线
    // color -= step(.7,abs(sin(27.0*m_dist)))*.5;

    gl_FragColor = vec4(color,1.0); // 将颜色设置为片段颜色
} 