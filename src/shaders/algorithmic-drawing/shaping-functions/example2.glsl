// Author: Inigo Quiles
// Title: Expo

// 此着色器程序设计用于创建类似于指数曲线的图形效果。
// 它使用GLSL（OpenGL着色语言）定义如何根据屏幕位置、时间和鼠标位置绘制像素。

#ifdef GL_ES
precision mediump float; // 为移动设备定义浮点数精度。
#endif

#define PI 3.14159265359 // 定义圆周率用于数学运算。

uniform vec2 u_resolution; // 屏幕分辨率的统一变量。
uniform vec2 u_mouse; // 鼠标位置的统一变量。
uniform float u_time; // 自程序开始以来的经过时间，以秒为单位。

// 函数：
// float plot(vec2 st, float pct) - 在屏幕上给定百分比高度绘制平滑曲线。
//                               st 表示像素的屏幕坐标，pct 是期望的高度，以屏幕高度的百分比表示。
float plot(vec2 st, float pct){
  return  smoothstep( pct-0.02, pct, st.y) -
          smoothstep( pct, pct+0.02, st.y);
}
void main() {
    vec2 st = gl_FragCoord.xy/u_resolution; // 将像素坐标归一化到[0,1]范围。

    // float y = pow(st.x,5.0); // 根据x坐标使用指数函数计算曲线的y值（高度）。
    // float y = step(0.5,st.x);
    // float y = smoothstep(0.1,0.9,st.x);
     float y = smoothstep(0.2,0.5,st.x) - smoothstep(0.5,0.8,st.x);
    vec3 color = vec3(y); // 根据高度（y）值设置像素的初始颜色。
    
    // 根据当前像素位置的曲线百分比计算并相应地调整颜色。
    float pct = plot(st,y);
    color = (1.0-pct)*color+pct*vec3(0.0,1.0,0.0); // 根据曲线百分比混合基础颜色与绿色。

    gl_FragColor = vec4(color,1.0); // 设置像素的最终颜色。
} 