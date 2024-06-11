// 该GLSL程序用于演示基于像素位置到中心距离的简单图形渲染
// 作者 @patriciogv - 2015
// 链接: http://patriciogonzalezvivo.com

#ifdef GL_ES
precision mediump float; // 在GL_ES环境中使用中等精度的float
#endif

// 程序中使用的全局变量
uniform vec2 u_resolution; // 窗口的分辨率
uniform vec2 u_mouse;     // 鼠标的当前位置
uniform float u_time;     // 程序运行的时间

// 主函数：GLSL程序的入口点
// 该函数不接受参数，但使用全局变量gl_FragCoord和u_resolution
// u_resolution是外部提供的uniform变量，代表渲染窗口的分辨率
// gl_FragCoord代表当前处理的像素在窗口中的坐标
void main(){
    // 将当前像素的位置转换为相对于窗口中心的比例值
    vec2 st = gl_FragCoord.xy/u_resolution;
    float pct = 0.0;
    
    // 计算当前像素到窗口中心的距离
    pct = distance(st,vec2(0.5));
    pct = step(0.5, st.x);

    // 计算当前像素到窗口中心的向量长度
    // vec2 toCenter = vec2(0.5)-st;
    // pct = length(toCenter);

    // 计算当前像素到窗口中心的向量的平方根
    // vec2 tC = vec2(0.5)-st;
    // pct = sqrt(tC.x*tC.x+tC.y*tC.y);

    // 将计算的距离值作为颜色输出
    vec3 color = vec3(pct);

    // 设置当前像素的颜色
    gl_FragColor = vec4(color, 1);
}