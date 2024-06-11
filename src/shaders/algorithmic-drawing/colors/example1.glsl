#ifdef GL_ES
precision mediump float;
#endif

// 程序的全局变量，用于存储分辨率和时间
uniform vec2 u_resolution; // 窗口的分辨率
uniform float u_time; // 程序运行的时间

/**
 * 将RGB颜色转换为HSB颜色空间。
 * 
 * @param c 输入的RGB颜色，为一个vec3变量，其中c.r、c.g、c.b分别代表红、绿、蓝颜色通道的值。
 * @return 输出的HSB颜色，为一个vec3变量，其中c.x为色调(hue)，c.y为饱和度(saturation)，c.z为亮度(brightness)。
 */
vec3 rgb2hsb( in vec3 c ){
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz),
                 vec4(c.gb, K.xy),
                 step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r),
                 vec4(c.r, p.yzx),
                 step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)),
                d / (q.x + e),
                q.x);
}

/**
 * Function from Iñigo Quiles
 * https://www.shadertoy.com/view/MsS3Wc
 * 将HSB颜色转换为RGB颜色空间。
 * 
 * @param c 输入的HSB颜色，为一个vec3变量，其中c.x为色调(hue)，c.y为饱和度(saturation)，c.z为亮度(brightness)。
 * @return 输出的RGB颜色，为一个vec3变量，其中c.r、c.g、c.b分别代表红、绿、蓝颜色通道的值。
 */
vec3 hsb2rgb( in vec3 c ){
    vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
                             6.0)-3.0)-1.0,
                     0.0,
                     1.0 );
    rgb = rgb*rgb*(3.0-2.0*rgb);
    return c.z * mix(vec3(1.0), rgb, c.y);
}

void main(){
    // 计算当前像素在屏幕上的位置，并将其映射到HSB颜色空间的范围
    vec2 st = gl_FragCoord.xy/u_resolution;
    vec3 color = vec3(0.0);

    // 根据屏幕位置，动态改变颜色的色调和亮度
    color = hsb2rgb(vec3(st.x,1.0,st.y));

    // 将最终颜色设置为像素颜色
    gl_FragColor = vec4(color,1.0);
} 