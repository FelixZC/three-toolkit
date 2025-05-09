// 作者 @patriciogv - 2015
// http://patriciogonzalezvivo.com

#ifdef GL_ES
precision mediump float;
#endif

// 声明着色器中使用的全局变量
uniform vec2 u_resolution; // 窗口的分辨率
uniform vec2 u_mouse;      // 鼠标的当前位置
uniform float u_time;      // 着色器运行的时间

// 生成一个在[0,1)范围内的随机浮点数
// 参数：
//   _st: 一个二维向量，用于生成随机数的种子
// 返回值：
//   一个在[0,1)范围内的随机浮点数
float random (in vec2 _st) {
    return fract(sin(dot(_st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

// 生成二维噪声
// 参数：
//   _st: 一个二维向量，代表当前坐标点
// 返回值：
//   在当前坐标点生成的噪声值
float noise (in vec2 _st) {
    vec2 i = floor(_st);
    vec2 f = fract(_st);

    // 获取四个角落的噪声值
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // 使用二次贝塞尔曲线插值计算噪声
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

#define NUM_OCTAVES 8
// 基于分形 Brownian 运动生成噪声
// 参数：
//   _st: 一个二维向量，代表当前坐标点
// 返回值：
//   在当前坐标点生成的分形噪声值
float fbm ( in vec2 _st) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    // 使用旋转矩阵减少轴向偏差
    mat2 rot = mat2(cos(0.5), sin(0.5),
                    -sin(0.5), cos(0.50));
    for (int i = 0; i < NUM_OCTAVES; ++i) {
        v += a * noise(_st);
        _st = rot * _st * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

// 着色器主函数
void main() {
    // 根据屏幕坐标计算纹理坐标，并进行缩放
    vec2 st = gl_FragCoord.xy/u_resolution.xy*3.;

    // 生成两个向量q和r，用于混合颜色
    vec2 q = vec2(0.);
    q.x = fbm( st + 0.00*u_time);
    q.y = fbm( st + vec2(1.0));

    vec2 r = vec2(0.);
    r.x = fbm( st + 1.0*q + vec2(1.7,9.2)+ 0.15*u_time );
    r.y = fbm( st + 1.0*q + vec2(8.3,2.8)+ 0.126*u_time);

    // 使用fbm生成的值来混合颜色
    float f = fbm(st+r);

    // 根据f的值混合三种颜色
    vec3 color = mix(vec3(0.101961,0.619608,0.666667),
                vec3(0.666667,0.666667,0.498039),
                clamp((f*f)*4.0,0.0,1.0));

    // 根据向量q的长度混合颜色
    color = mix(color,
                vec3(0,0,0.164706),
                clamp(length(q),0.0,1.0));

    // 根据向量r的x分量长度混合颜色
    color = mix(color,
                vec3(0.666667,1,1),
                clamp(length(r.x),0.0,1.0));

    // 设置像素颜色
    gl_FragColor = vec4((f*f*f+.6*f*f+.5*f)*color,1.);
}