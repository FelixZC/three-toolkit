#ifdef GL_ES
precision mediump float;
#endif

// 定义圆周率
#define PI 3.14159265359

// 声明统一变量：分辨率、鼠标位置、时间
uniform vec2 u_resolution; // 窗口分辨率

// 定义两种颜色用于混合
vec3 colorA = vec3(0.149,0.141,0.912);
vec3 colorB = vec3(1.000,0.833,0.224);

/**
 * 在给定的点上绘制曲线
 * @param st 二维坐标点
 * @param pct 曲线的百分比位置
 * @return 在该点上曲线的深度
 */
float plot (vec2 st, float pct){
  return  smoothstep( pct-0.01, pct, st.y) - 
          smoothstep( pct, pct+0.01, st.y);
}

void main() {
    // 视口坐标到[0,1]范围的转换
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    vec3 color = vec3(0.0); // 初始化颜色为黑色

    vec3 pct = vec3(st.x); // 使用x坐标作为颜色混合的百分比

    // 下面的注释代码示例了不同的颜色过渡效果
    pct.r = smoothstep(0.0,1.0, st.x);
    pct.g = sin(st.x*PI);
    pct.b = pow(st.x,0.5);

    // 根据pct混合两种颜色
    color = mix(colorA, colorB, pct);

    // 为每个颜色通道绘制过渡线
    color = mix(color,vec3(1.0,0.0,0.0),plot(st,pct.r)); // 红色通道
    color = mix(color,vec3(0.0,1.0,0.0),plot(st,pct.g)); // 绿色通道
    color = mix(color,vec3(0.0,0.0,1.0),plot(st,pct.b)); // 蓝色通道

    // 输出最终颜色
    gl_FragColor = vec4(color,1.0);
}