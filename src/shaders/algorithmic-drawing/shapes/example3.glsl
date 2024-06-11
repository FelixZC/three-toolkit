// Author @patriciogv - Conceptual Example
// http://patriciogonzalezvivo.com

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main(){
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(0.0);

    // 定义圆心和半径，这里假设圆心在屏幕中心，半径为0.25
    vec2 center = vec2(0.5);
    float radius = .2;

    // 计算距离场，即当前像素点到圆心的距离
    float dist = distance(st, center);

    // 使用smoothstep函数平滑过渡边缘
    // 这里，edge0设为半径减去一个很小的值（平滑带的开始），
    // edge1设为半径加上相同的值（平滑带的结束）
    float smoothRadius = smoothstep(radius - 0.01, radius + 0.01, dist);

    // 根据平滑后的距离场决定颜色
    color = vec3(smoothRadius);

    gl_FragColor = vec4(color, 1.0);
}