// 生成基于GPU的简单噪声纹理的GLSL着色器程序
// 适用于生成各种自然纹理，如云、岩石、水面等

#ifdef GL_ES
precision mediump float;
#endif

// 程序中使用的全局变量
uniform vec2 u_resolution; // 窗口的分辨率
uniform vec2 u_mouse;     // 鼠标位置
uniform float u_time;     // 时间

// 生成在[0,1]范围内的随机数
// @param st 二维坐标
float random (in vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

// 生成基于Perlin噪声的连续噪声
// @param st 二维坐标
float noise (in vec2 st) {
    vec2 i = floor(st);            // 取整
    vec2 f = fract(st);            // 小数部分

    // 获取四个临近点的随机值
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f); // 使用二次贝塞尔曲线插值

    // 混合四个点的噪声值
    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

#define OCTAVES 6
// 生成分形噪声
// @param st 二维坐标
// @param OCTAVES 声波的层数（分级）
float fbm (in vec2 st) {
    float value = 0.0; // 初始噪声值
    float amplitude = .5; // 初始振幅
    float frequency = 0.; // 初始频率

    // 遍历各声波层级进行混合
    for (int i = 0; i < OCTAVES; i++) {
        value += amplitude * noise(st);
        st *= 2.; // 增加频率
        amplitude *= .5; // 减小振幅
    }
    return value;
}

// 程序主入口
void main() {
    // 计算当前像素相对于画布的坐标
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    st.x *= u_resolution.x/u_resolution.y; // 纠正长宽比

    // 生成基于fbm的噪声颜色
    vec3 color = vec3(0.0);
    color += fbm(st*3.0); // 调整噪声细节

    // 将颜色写入当前像素
    gl_FragColor = vec4(color,1.0);
}