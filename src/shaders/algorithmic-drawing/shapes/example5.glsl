// Author @patriciogv - Conceptual Example
// http://patriciogonzalezvivo.com

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

// 将HSV转换为RGB的辅助函数
vec3 hsv2rgb(vec3 c){
    vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main(){
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec3 circleColor = vec3(0.0); // 初始化背景颜色
    vec3 bgColor = vec3(1); // 背景设置为白色

    // 基于时间变化的背景HSV色彩
    float timeFactor = fract(u_time / 5.0); // 控制颜色循环
    vec3 bgHsvColor = vec3(timeFactor, 1.0, 1.0); // 背景的HSV颜色，饱和度和亮度固定为最大
    circleColor = hsv2rgb(bgHsvColor); // 转换为RGB背景颜色

    // 定义圆心和半径
    vec2 center = vec2(0.5);
    float radius = 0.25;

    // 计算距离场
    float dist = distance(st, center);

    // 使用smoothstep函数平滑过渡边缘
    float smoothRadius = smoothstep(radius - 0.01, radius + 0.01, dist);

    // 混合背景颜色和圆的颜色
    vec3 finalColor = mix(circleColor, bgColor, smoothRadius);

    gl_FragColor = vec4(finalColor, 1.0);
}