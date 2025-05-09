// Author @patriciogv - Conceptual Example
// http://patriciogonzalezvivo.com

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

// 将RGB转换为HSV的辅助函数
vec3 rgb2hsv(vec3 c){
    vec4 K = vec4(0.0, -1.0/3.0, 2.0/3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y)/(6.0*d + e)), d / (q.x + e), q.x);
}

// 将HSV转换回RGB的辅助函数
vec3 hsv2rgb(vec3 c){
    vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main(){
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(0.0);

    // 定义圆心和半径
    vec2 center = vec2(0.5);
    float radius = 0.25;

    // 计算距离场
    float dist = distance(st, center);

    // 使用smoothstep函数平滑过渡边缘
    float smoothRadius = smoothstep(radius - 0.01, radius + 0.01, dist);

    // 添加基于时间变化的HSV色彩
    float hue = fract(u_time / 5.0); // 时间因子，控制颜色循环
    vec3 hsvColor = vec3(hue, 1.0, 1.0); // HSV颜色向量，饱和度和亮度固定为最大
    vec3 rgbColor = hsv2rgb(hsvColor); // 转换为RGB颜色

    // 应用颜色到圆上
    color = mix(vec3(0.0), rgbColor, smoothRadius);

    gl_FragColor = vec4(color, 1.0);
}