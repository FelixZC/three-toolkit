// Author @patriciogv - 2015

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

// 定义了一个圆形函数，输入一个点和半径，返回该点是否在指定半径的圆内的判断结果。
// _st: 点的二维坐标 (x,y)
// _radius: 圆的半径
float circle(in vec2 _st, in float _radius){
    vec2 l = _st-vec2(0.5); // 将点相对于中心点(0.5, 0.5)进行偏移
    return 1.-smoothstep(_radius-(_radius*0.01), // 使用平滑步长来判断点是否在圆附近
                         _radius+(_radius*0.01), // 创建一个边界宽度
                         dot(l,l)*4.0); // 计算点到中心的距离并规范化
}

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution; // 将像素坐标转换为 0-1 空间中的坐标
    vec3 color = vec3(0.0);

    // 对坐标进行缩放和周期性平移，用于创建多个周期的图形
    st *= 3.0;      // 缩放坐标空间
    st = fract(st); // 对坐标进行取余操作，保证坐标在 0-1 范围内

    // 通过上述操作，我们得到了一个在 0-1 范围内，但经过缩放和平移的坐标系统

    // 设置颜色，这里简单地将坐标作为颜色
    color = vec3(st,0.0);
    // 使用 circle 函数来根据点到圆心的距离设置颜色，注释掉的代码块
    // color = vec3(circle(st,0.5));

    // 输出颜色到帧缓冲
    gl_FragColor = vec4(color,1.0);
} 