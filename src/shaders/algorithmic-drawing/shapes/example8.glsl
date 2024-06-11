// 该GLSL程序用于演示基于时间、鼠标位置和屏幕分辨率的简单图形渲染。
// 作者: @patriciogv - 2015
// 网站: http://patriciogonzalezvivo.com

#ifdef GL_ES
precision mediump float; // 在GL_ES环境中使用中等精度的float
#endif

// 程序中使用的全局变量
uniform vec2 u_resolution; // 屏幕的分辨率
uniform vec2 u_mouse;     // 鼠标的当前位置
uniform float u_time;     // 程序运行的时间

// 主函数：渲染程序的入口点
void main(){
    // 将像素坐标转换为0到1之间的归一化坐标
    vec2 st=gl_FragCoord.xy/u_resolution.xy;
    vec3 color=vec3(0.); // 初始化输出颜色为黑色
    
    // 计算当前像素相对于屏幕中心的位置
    vec2 pos=vec2(.5)-st;
    
    // 计算距离并转换为角度
    float r=length(pos)*2.;
    float a=atan(pos.y,pos.x);
    
    // 使用角度计算一个周期性变化的值
    float f=cos(a*3.0);
    
    // 以下注释掉的代码块是用于调试和探索不同视觉效果的示例代码
    
    // 根据距离和周期性变化的值，计算颜色的强度
    color=vec3(1.-smoothstep(f,f+.02,r));
    
    // 设置最终的像素颜色并输出
    gl_FragColor=vec4(color,1.);
} 