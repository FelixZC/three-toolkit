#ifdef GL_ES
precision mediump float;
#endif

#define TWO_PI 6.28318530718  // 定义两个π的值，用于角度到弧度的转换

uniform vec2 u_resolution;  // 网格的分辨率
uniform float u_time;  // 时间统一变量，可用于动画效果

// 由Iñigo Quiles提供的函数
// https://www.shadertoy.com/view/MsS3Wc
// 将HSB颜色模式转换为RGB颜色模式
vec3 hsb2rgb( in vec3 c ){
    vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
                             6.0)-3.0)-1.0,
                     0.0,
                     1.0 );
    rgb = rgb*rgb*(3.0-2.0*rgb);
    return c.z * mix( vec3(1.0), rgb, c.y);
}

void main(){
    vec2 st = gl_FragCoord.xy/u_resolution;  // 将像素坐标转换为0到1之间的归一化坐标
    vec3 color = vec3(0.0);

    // 使用极坐标代替笛卡尔坐标
    vec2 toCenter = vec2(0.5)-st;  // 计算当前像素到中心点(0.5, 0.5)的向量
    float angle = atan(toCenter.y,toCenter.x);  // 计算角度，用于映射到色相
    float radius = length(toCenter)*2.0;  // 计算半径，用于映射到饱和度

    // 将角度(-π到π)映射到色相(0到1)，将饱和度映射到半径
    color = hsb2rgb(vec3((angle/TWO_PI)+0.5,radius,1.0));

    gl_FragColor = vec4(color,1.0);  // 将计算出的RGB颜色设置为片段颜色
}