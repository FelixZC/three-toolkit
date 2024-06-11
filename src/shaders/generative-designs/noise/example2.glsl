// GLSL 片段着色器代码 (Fragment Shader)
precision mediump float;

uniform vec2 u_resolution; // 窗口的分辨率

// 噪声函数，用于添加细微的噪点效果
float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

// 平滑过渡函数
float smoothTransition(float edge0, float edge1, float x) {
    // 计算x在edge0和edge1之间的平滑因子
    float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
    return t * t * (3.0 - 2.0 * t); // 这里使用了一个三次方缓入缓出的曲线
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy; // 规范化当前像素坐标

    // 定义更多的颜色以实现丰富的过渡效果
    vec4 color1 = vec4(0.1, 0.05, 0.5, 1.0); // 深蓝
    vec4 color2 = vec4(0.6, 0.1, 0.3, 1.0); // 深紫红，作为蓝红之间的过渡
    vec4 color3 = vec4(0.8, 0.1, 0.1, 1.0); // 深红
    vec4 color4 = vec4(0.4, 0.0, 0.7, 1.0); // 中紫，作为紫色黑色之间的过渡
    vec4 color5 = vec4(0.0, 0.0, 0.0, 1.0); // 黑色

    // 使用平滑过渡函数来混合颜色，创建柔和边缘
    float transitionWidth = 0.05; // 边缘过渡宽度，可以根据需要调整
    if (st.x < 0.5) {
        if (st.y < 0.5) {
            // 上半部分混合深蓝到深紫红
            float transitionY = smoothTransition(0.25, 0.25 + transitionWidth, st.y);
            gl_FragColor = mix(color1, color2, transitionY);
        } else {
            // 下半部分混合深紫红到深红
            float transitionY = smoothTransition(0.75 - transitionWidth, 0.75, st.y);
            gl_FragColor = mix(color2, color3, transitionY);
        }
    } else {
        if (st.y < 0.5) {
            // 右上部分混合深红到中紫
            float transitionY = smoothTransition(0.25, 0.25 + transitionWidth, st.y);
            gl_FragColor = mix(color3, color4, transitionY);
        } else {
            // 右下部分混合中紫到黑色
            float transitionY = smoothTransition(0.75 - transitionWidth, 0.75, st.y);
            gl_FragColor = mix(color4, color5, transitionY);
        }
    }

    // 添加噪点效果
    gl_FragColor.rgb += vec3(rand(st) / 10.0); // 控制噪点强度
}