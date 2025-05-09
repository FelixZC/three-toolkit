// Author @patriciogv ( patriciogonzalezvivo.com ) - 2015

#ifdef GL_ES
precision mediump float;
#endif

// 定义圆周率
#define PI 3.14159265358979323846

// 声明统一变量：分辨率和时间
uniform vec2 u_resolution; // 窗口分辨率
uniform float u_time;      // 系统时间

/**
 * 2D向量旋转函数
 * @param _st 二维向量，待旋转的点
 * @param _angle 旋转角度（弧度制）
 * @return 旋转后的二维向量
 */
vec2 rotate2D (vec2 _st, float _angle) {
    _st -= 0.5; // 将点移至原点附近
    _st =  mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle)) * _st; // 应用旋转矩阵
    _st += 0.5; // 将点移回原位置
    return _st;
}

/**
 * 平铺函数，通过缩放并取余操作实现向量的平铺
 * @param _st 二维向量，待平铺的点
 * @param _zoom 缩放因子
 * @return 平铺后的二维向量
 */
vec2 tile (vec2 _st, float _zoom) {
    _st *= _zoom; // 缩放点的位置
    return fract(_st); // 取余操作，实现平铺
}

/**
 * 旋转平铺模式函数，根据索引旋转每个单元格
 * @param _st 二维向量，代表当前像素的位置
 * @return 旋转平铺后的二维向量
 */
vec2 rotateTilePattern(vec2 _st){

    // 扩大坐标系的规模
    _st *= 2.0;

    // 为每个单元格分配一个索引号
    float index = 0.0;
    index += step(1., mod(_st.x,2.0)); // 根据x坐标奇偶性分配索引
    index += step(1., mod(_st.y,2.0))*2.0; // 根据y坐标奇偶性调整索引

    //      |
    //  2   |   3
    //      |
    //--------------
    //      |
    //  0   |   1
    //      |

    // Make each cell between 0.0 - 1.0
    _st = fract(_st);

    // 根据索引号对单元格进行旋转
    if(index == 1.0){
        // 第1个单元格旋转90度
        _st = rotate2D(_st,PI*0.5);
    } else if(index == 2.0){
        // 第2个单元格旋转-90度
        _st = rotate2D(_st,PI*-0.5);
    } else if(index == 3.0){
        // 第3个单元格旋转180度
        _st = rotate2D(_st,PI);
    }

    return _st;
}

// 主函数
void main (void) {
    vec2 st = gl_FragCoord.xy/u_resolution.xy; // 规范化当前像素位置

    // 应用平铺和旋转效果
    st = tile(st,3.0);
    st = rotateTilePattern(st);

    // 可以组合更多的变换来创建更复杂的效果
    // 以下代码行是几个示例，可以根据需要启用或禁用
    // st = tile(st,2.0);
    st = rotate2D(st,-PI*u_time*0.25);
    // st = rotateTilePattern(st*2.);
    // st = rotate2D(st,PI*u_time*0.25);

    gl_FragColor = vec4(vec3(step(st.x,st.y)),1.0);
} 