// Author @patriciogv - 2015
// http://patriciogonzalezvivo.com

#ifdef GL_ES
precision mediump float;
#endif

// uniform变量声明：
// u_resolution - 窗口的分辨率
// u_mouse - 鼠标的当前位置
// u_time - 程序运行的时间
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

/**
 * 绘制一个圆形，并返回其不透明度。
 * 
 * @param _st 屏幕坐标系中的当前像素位置
 * @param _radius 圆的半径
 * @return 不透明度，圆内为1.0，圆外为0.0
 */
float circle(in vec2 _st, in float _radius){
    // 计算当前像素到中心点的距离
    vec2 dist = _st-vec2(0.5);
    // 使用smoothstep平滑地过渡圆形边缘
	return 1.-smoothstep(_radius-(_radius*0.01),
                         _radius+(_radius*0.01),
                         dot(dist,dist)*4.0);
}

void main(){
    // 将像素坐标转换为0到1的范围
    vec2 st = gl_FragCoord.xy/u_resolution.xy;

    // 使用circle函数计算当前像素是否在圆内，并设置颜色
    vec3 color = vec3(circle(st,0.9));

    // 设置最终的像素颜色
    gl_FragColor = vec4( color, 1.0 );
}