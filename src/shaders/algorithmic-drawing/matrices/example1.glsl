// 作者 @patriciogv (patriciogonzalezvivo.com) - 2015

#ifdef GL_ES
precision mediump float;
#endif

// uniform变量声明：分辨率和时间
uniform vec2 u_resolution; // 窗口的分辨率
uniform float u_time;      // 程序运行时间

/**
 * 绘制一个矩形框
 * @param _st 输入的二维坐标（屏幕坐标）
 * @param _size 矩形的尺寸
 * @return 在指定位置和尺寸上绘制的矩形的遮罩（0.0到1.0之间）
 */
float box(in vec2 _st, in vec2 _size){
    _size = vec2(0.5) - _size*0.5; // 计算矩形的内切正方形的边长
    vec2 uv = smoothstep(_size,
                        _size+vec2(0.001),
                        _st); // 使用平滑步长计算边缘
    uv *= smoothstep(_size,
                    _size+vec2(0.001),
                    vec2(1.0)-_st); // 计算另一个方向上的平滑步长并相乘
    return uv.x*uv.y; // 返回两个方向上的遮罩乘积
}

/**
 * 绘制一个加号形状
 * @param _st 输入的二维坐标（屏幕坐标）
 * @param _size 形状的尺寸
 * @return 在指定位置和尺寸上绘制的加号形状的遮罩（0.0到1.0之间）
 */
float cross(in vec2 _st, float _size){
    return  box(_st, vec2(_size,_size/4.)) + // 横向矩形
            box(_st, vec2(_size/4.,_size)); // 纵向矩形
}

void main(){
    vec2 st = gl_FragCoord.xy/u_resolution.xy; // 将像素坐标转换为0到1之间的屏幕坐标
    vec3 color = vec3(0.0); // 初始化颜色为黑色

    // 使用时间变量来移动加号形状
    vec2 translate = vec2(cos(u_time),sin(u_time)); // 基于时间的旋转移动
    st += translate*0.35; // 应用移动

    // 下面的注释代码块用于显示屏幕坐标的调试
    color = vec3(st.x,st.y,0.0);

    // 在前景中添加加号形状
    color += vec3(cross(st,0.25)); // 调用cross函数，并将结果颜色与当前颜色相加

    gl_FragColor = vec4(color,1.0); // 将最终颜色设置为像素颜色
}