
// 作者 @patriciogv - 2015
// http://patriciogonzalezvivo.com

// YUV到RGB转换的GLSL着色器
// 该着色器将YUV值转换为RGB以显示
#ifdef GL_ES
precision mediump float;
#endif

// 可从CPU侧动态更改的统一变量，用于分辨率和时间。
uniform vec2 u_resolution; // 屏幕分辨率（像素）
uniform float u_time;      // 已经过的时间（秒）

// 用于将YUV转换为RGB色彩空间的矩阵。
mat3 yuv2rgb = mat3(1.0, 0.0, 1.13983,
                    1.0, -0.39465, -0.58060,
                    1.0, 2.03211, 0.0);

// 用于将RGB转换为YUV色彩空间的矩阵。
mat3 rgb2yuv = mat3(0.2126, 0.7152, 0.0722,
                    -0.09991, -0.33609, 0.43600,
                    0.615, -0.5586, -0.05639);

// 主要的着色器函数，计算并输出像素颜色
void main(){
    vec2 st = gl_FragCoord.xy / u_resolution; // 获取当前像素的坐标，归一化到0.0到1.0之间
    vec3 color = vec3(0.0); // 初始化输出颜色为黑色

    // 将st坐标映射到-1.0到1.0的范围，用于YUV值计算
    st -= 0.5; // 将st归一化坐标转换为-0.5到0.5
    st *= 2.0; // 将st转换为-1.0到1.0

    // 使用YUV到RGB矩阵进行转换
    // 将st的x和y作为向量的第二和第三分量
    color = yuv2rgb * vec3(0.5, st.x, st.y);

    // 输出带有alpha值1.0的RGB颜色
    gl_FragColor = vec4(color, 1.0);
}