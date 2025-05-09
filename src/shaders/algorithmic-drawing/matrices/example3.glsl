// Author @patriciogv ( patriciogonzalezvivo.com ) - 2015

#ifdef GL_ES
precision mediump float;
#endif

// 定义圆周率PI
#define PI 3.14159265359

// 声明全局变量：分辨率和时间
uniform vec2 u_resolution; // 窗口的分辨率
uniform float u_time;      // 程序运行时间

/*
 * 根据给定的尺寸缩放二维向量。
 * 参数:
 *   _scale - 一个包含x和y缩放因子的向量。
 * 返回值:
 *   一个2x2的矩阵，用于缩放坐标。
 */
mat2 scale(vec2 _scale){
    return mat2(_scale.x,0.0,
                0.0,_scale.y);
}

/*
 * 计算在给定点上绘制的盒子的遮罩。
 * 参数:
 *   _st - 当前屏幕坐标。
 *   _size - 盒子的尺寸。
 * 返回值:
 *   在指定位置和大小上绘制的盒子的遮罩值（0.0到1.0之间）。
 */
float box(in vec2 _st, in vec2 _size){
    _size = vec2(0.5) - _size*0.5;
    vec2 uv = smoothstep(_size,
                        _size+vec2(0.001),
                        _st);
    uv *= smoothstep(_size,
                    _size+vec2(0.001),
                    vec2(1.0)-_st);
    return uv.x*uv.y;
}

/*
 * 绘制一个十字形状。
 * 参数:
 *   _st - 当前屏幕坐标。
 *   _size - 十字的尺寸。
 * 返回值:
 *   在指定位置和大小上绘制的十字的遮罩值（0.0到1.0之间）。
 */
float cross(in vec2 _st, float _size){
    return  box(_st, vec2(_size,_size/4.)) +
            box(_st, vec2(_size/4.,_size));
}

void main(){
    vec2 st = gl_FragCoord.xy/u_resolution.xy; // 将当前像素坐标转换为0-1范围内的屏幕坐标
    vec3 color = vec3(0.0); // 初始化颜色变量

    st -= vec2(0.5); // 移动屏幕坐标的中心点到(0,0)
    st = scale( vec2(sin(u_time)+1.0) ) * st; // 根据时间对坐标进行缩放
    st += vec2(0.5); // 将中心点移回(0.5,0.5)

    // 在背景上显示坐标系
    // color = vec3(st.x,st.y,0.0);

    // 在前景中添加十字形状
    color += vec3(cross(st,0.2));

    gl_FragColor = vec4(color,1.0); // 将颜色设置为片段颜色
} 