// 作者 @patriciogv - 2015 - patriciogonzalezvivo.com

#ifdef GL_ES
precision mediump float;
#endif

// 声明全局变量，用于传入外部的屏幕分辨率、鼠标位置和时间
uniform vec2 u_resolution; // 屏幕分辨率
uniform vec2 u_mouse;     // 鼠标位置
uniform float u_time;     // 时间

/**
 * 对给定的二维坐标进行偏移处理
 * @param st 二维坐标
 * @return 偏移后的二维坐标
 */
vec2 skew (vec2 st) {
    vec2 r = vec2(0.0);
    r.x = 1.1547*st.x;
    r.y = st.y+0.5*r.x;
    return r;
}

/**
 * 基于简单ctic网格生成一个三维点
 * @param st 二维坐标
 * @return 生成的三维点
 */
vec3 simplexGrid (vec2 st) {
    vec3 xyz = vec3(0.0);

    vec2 p = fract(skew(st));
    if (p.x > p.y) {
        xyz.xy = 1.0-vec2(p.x,p.y-p.x);
        xyz.z = p.y;
    } else {
        xyz.yz = 1.0-vec2(p.x-p.y,p.y);
        xyz.x = p.x;
    }

    return fract(xyz);
}

void main() {
    // 计算当前像素相对于屏幕分辨率的比例坐标
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    vec3 color = vec3(0.0);

    // 缩放坐标空间以观察网格
    st *= 10.;

    // 显示二维网格
    color.rg = fract(st);

    // 使用偏移函数展示偏移后的二维网格
    // color.rg = fract(skew(st));

    // 将网格细分成等边三角形
    // color = simplexGrid(st);

    // 设置最终颜色并输出
    gl_FragColor = vec4(color,1.0);
}