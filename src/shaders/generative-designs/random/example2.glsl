// Author @patriciogv - 2015
// Title: Mosaic

#ifdef GL_ES
precision mediump float;
#endif

// uniform变量声明：分辨率、鼠标位置、时间
uniform vec2 u_resolution; // 窗口的分辨率
uniform vec2 u_mouse;     // 鼠标当前位置
uniform float u_time;     // 程序运行时间

/**
 * 生成基于二维坐标st的随机数。
 * 
 * @param st 二维坐标点
 * @return 返回基于坐标st的随机浮点数
 */
float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

void main() {
    // 将当前像素位置转换为相对于画布尺寸的比例坐标
    vec2 st = gl_FragCoord.xy/u_resolution.xy;

    // 缩放坐标系统
    st *= 10.0;
    vec2 ipos = floor(st);  // 获取整数部分坐标
    vec2 fpos = fract(st);  // 获取小数部分坐标

    // 基于整数坐标生成一个随机颜色
    vec3 color = vec3(random( ipos ));

    // 下方代码用于调试，展示划分的网格
    // color = vec3(fpos,0.0);

    // 设置最终颜色
    gl_FragColor = vec4(color,1.0);
}