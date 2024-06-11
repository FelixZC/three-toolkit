// 作者 @patriciogv (patriciogonzalezvivo.com) - 2015

#ifdef GL_ES
precision mediump float;
#endif

// 定义圆周率PI
#define PI 3.14159265359

// 声明统一变量：分辨率和时间
uniform vec2 u_resolution; // 窗口分辨率
uniform float u_time;      // 时间

/*
 * 2D旋转矩阵
 * 参数：_angle - 旋转角度
 * 返回值：一个2x2的矩阵，用于2D向量的旋转变换
 */
mat2 rotate2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle));
}

/*
 * 计算框形区域
 * 参数：_st - 坐标点（归一化后的位置）
 *       _size - 框形的尺寸
 * 返回值：如果坐标点位于框形内部，则返回1.0，否则返回0.0
 */
float box(in vec2 _st, in vec2 _size){
    _size = vec2(0.5) - _size*0.5; // 计算框形中心点位置
    vec2 uv = smoothstep(_size,
                        _size+vec2(0.001),
                        _st); // 应用平滑步长计算边界
    uv *= smoothstep(_size,
                    _size+vec2(0.001),
                    vec2(1.0)-_st); // 对右侧和底部应用平滑步长
    return uv.x*uv.y; // 返回交点乘积，确定点是否在框内
}

/*
 * 计算十字形区域
 * 参数：_st - 坐标点（归一化后的位置）
 *       _size - 十字形的尺寸
 * 返回值：如果坐标点位于十字形内部，则返回1.0，否则返回0.0
 */
float cross(in vec2 _st, float _size){
    return  box(_st, vec2(_size,_size/4.)) +
            box(_st, vec2(_size/4.,_size));
}

void main(){
    vec2 st = gl_FragCoord.xy/u_resolution.xy; // 角度坐标转换为归一化坐标
    vec3 color = vec3(0.0);

    // 从中心点移动空间到原点
    st -= vec2(0.5);
    // 对空间进行旋转
    st = rotate2d( sin(u_time)*PI ) * st;
    // 将空间移回原始位置
    st += vec2(0.5);

    // 在背景上显示空间的坐标
    // color = vec3(st.x,st.y,0.0);

    // 在前景中添加形状
    color += vec3(cross(st,0.4));

    gl_FragColor = vec4(color,1.0); // 设置片段颜色
} 