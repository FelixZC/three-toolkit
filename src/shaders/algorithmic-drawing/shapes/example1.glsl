// Author @patriciogv - 2015
// http://patriciogonzalezvivo.com

#ifdef GL_ES
precision mediump float;
#endif

// Uniform变量用于传入片段着色器的全局变量
uniform vec2 u_resolution;// 窗口的分辨率
uniform vec2 u_mouse;// 鼠标的当前位置
uniform float u_time;// 程序运行的时间

// main函数是GLSL程序的入口点，它负责生成最终的像素颜色
void main(){
    // 将当前像素坐标转换为0到1之间的归一化坐标
    vec2 st=gl_FragCoord.xy/u_resolution.xy;
    vec3 color=vec3(0.);// 初始化最终的颜色为黑色
    
    // 计算底部左侧区域的占比
    vec2 bl=step(vec2(.1),st);
    float pct=bl.x*bl.y;// 底部左侧区域像素的数量占比
    
    // 以下代码块被注释，是计算顶部右侧区域占比的代码
    vec2 tr=step(vec2(.1),1.-st);
    pct*=tr.x*tr.y;// 顶部右侧区域像素的数量占比
    // 将占比转换为颜色值
    // color=vec3(pct);
    // color=vec3(bl.x*bl.y*tr.x*tr.y);
    
    float edge=.1;
    float smoothPct=smoothstep(edge-.05,edge,st.x)*smoothstep(edge-.05,edge,st.y);
    color=vec3(smoothPct);

    // 设置最终的像素颜色
    gl_FragColor=vec4(color,1.);
}