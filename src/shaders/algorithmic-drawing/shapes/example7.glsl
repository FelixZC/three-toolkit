#ifdef GL_ES
precision mediump float;
#endif

// 定义全局变量，用于接收外部输入
uniform vec2 u_resolution; // 窗口的分辨率
uniform vec2 u_mouse;     // 鼠标的当前位置
uniform float u_time;     // 程序运行的时间

// 主函数，GLSL程序的入口点
void main(){
    // 将像素坐标转换为0到1之间的归一化坐标
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    // 调整归一化坐标以适应屏幕宽高比
    st.x *= u_resolution.x/u_resolution.y;
    vec3 color = vec3(0.0); // 初始化颜色变量
    float d = 0.0; // 初始化距离变量

    // 将坐标空间重新映射到-1.0到1.0之间
    st = st *2.-1.;

    // 创建距离场
    d = length( abs(st)-.3 );
    // 下面的行是距离场创建的其他可选方法
    // d = length( min(abs(st)-.3,0.) );
    // d = length( max(abs(st)-.3,0.) );

    // 可视化距离场
    gl_FragColor = vec4(vec3(fract(d*10.0)),1.0);

    // 下面是使用距离场进行绘制的一些示例代码
    // gl_FragColor = vec4(vec3( step(.3,d) ),1.0);
    // gl_FragColor = vec4(vec3( step(.3,d) * step(d,.4)),1.0);
    // gl_FragColor = vec4(vec3( smoothstep(.3,.4,d)* smoothstep(.6,.5,d)) ,1.0);
}