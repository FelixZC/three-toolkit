
// William Turner，著名的英国浪漫主义风景画家，以其对光线和色彩的独特运用而著称，尤其是在描绘海景和落日时展现了非凡的情感深度和表现力。为了创作一个渐变来代表Turner风格的落日，我们可以尝试捕捉那种充满活力、色彩丰富且带有强烈情感氛围的色彩过渡。
// 想象一下，一个Turner式的落日天空，色彩从下至上可能是这样的：
// 深蓝至紫色（底部）：落日开始时，天空接近地平线的地方可能会有一抹深邃的蓝色，向上逐渐过渡到紫色，暗示着夜幕即将降临的宁静与深沉。
// 橙黄融合区：紧接着，是落日的核心区域，一片绚烂的橙色与黄色交融，象征着太阳最后的辉煌。这部分色彩可以非常鲜艳，仿佛阳光在云层中燃烧，散发出温暖而强烈的光芒。
// 粉红与红紫：在这片橙黄之上，天空可能会呈现出淡淡的粉色，逐渐过渡到红紫色，这种色彩的渐变体现了光线在大气中散射的美丽现象，也增添了画面的浪漫氛围。
// 金色光辉：在某些区域，特别是云层边缘或是太阳周围的天空，可能会有金色的光辉点缀，这是Turner作品中常用的元素，用来表达自然界的神圣和壮丽。
// 淡蓝至白色（顶部）：最上方，天空渐渐变为淡蓝色乃至几乎白色的区域，代表着高空中尚未被夕阳染色的纯净天空，增加了整个画面的深度和层次感。

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

// 威廉·透纳风格的色彩配置
vec3 skyColor = vec3(0.8, 0.4, 0.8); // 温暖的紫色/粉色调天空
vec3 sunColor = vec3(1.0, 0.8, 0.3); // 太阳的金黄色
vec3 seaColor = vec3(0.2, 0.5, 0.8); // 深邃的海蓝色
vec3 cloudColor = vec3(1.0, 0.9, 0.8); // 云彩的浅白色

float sunRadius = 0.08; // 太阳半径比例
float cloudCoverage = 0.5; // 云彩覆盖程度（0到1）

// 计算太阳位置
vec2 getSunPosition() {
    return vec2(0.5 + 0.1 * sin(u_time), 0.5 + 0.1 * cos(u_time));
}

// 计算云彩噪声
float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution;
    vec3 color = vec3(0.0);

    // 太阳效果
    vec2 sunPos = getSunPosition();
    float distanceToSun = length(st - sunPos);
    if (distanceToSun < sunRadius) {
        color = sunColor;
    } else {
        // 天空渐变
        color = mix(skyColor, vec3(0.2, 0.2, 0.4), distanceToSun / sunRadius);
        
        // 海洋效果
        if (st.y > 0.6) {
            color = mix(color, seaColor, smoothstep(0.6, 0.7, st.y));
        }

        // 添加云彩效果
        float cloudNoise = noise(st * 10.0 + u_time * 0.1);
        if (cloudNoise > cloudCoverage) {
            color = mix(color, cloudColor, 0.5);
        }
    }

    gl_FragColor = vec4(color, 1.0);
}