//from https://www.shadertoy.com/view/3sBfzV#
uniform vec3      iResolution;           // viewport resolution (in pixels)
uniform float     iTime;                 // shader playback time (in seconds)

#define n 10.

// 定义一个基于输入p生成随机数的宏
#define rand(p) fract(sin(sin(p) * mat2(12.9898, 78.233, 78.233, 12.9898)) * 143758.5453)

// 定义一个计算点p到圆心的距离，并根据宽度w和半径r计算平滑步长的宏
#define Circle(w, p, r) smoothstep( w, 0., abs(length(p) - r ) )

// 主渲染函数，输出颜色值到gl_FragColor
void main()
{
    vec2 R = iResolution.xy;  // 获取屏幕分辨率
    vec2 uv = (gl_FragCoord.xy - 0.75 * R) / R.y;  // 将屏幕坐标转换为归一化设备坐标
    float t = iTime;  // 获取当前时间
    vec3 col = vec3(0.);  // 初始化颜色值为黑色
    vec2 p = uv;  // 将uv坐标赋值给p，用于后续计算
    vec2 p1 = vec2(sin(t), cos(t));  // 根据当前时间计算一个旋转的向量p1
    vec2 PtoP0P1 = p - dot(p1, p) * p1;  // 计算p到原点的向量在p1方向上的投影
    float d = length(PtoP0P1);  // 计算p到p1的垂直距离
    if (dot(p, p1) < 0.) {  // 如果p在p1的反方向上
        d = length(p);  // 则距离为p到原点的距离
    }
    vec2 cl = vec2(0.5, 0.);  // 定义颜色的基本值
    col = .006 / d * cl.yxy;  // 根据距离调整颜色值，使其随距离增加而减弱
    float r = length(p1);  // 计算p1的长度，即半径
    float i = round(n * length(p) / r);  // 计算当前点在圆周上的索引
    float w = 2. * r / R.y;  // 计算圆环的宽度
    float circle = Circle(w, p, r * i / n);  // 根据索引计算当前点在圆周上的平滑步长值

    col += circle * cl.yxy;  // 将圆周上的颜色值累加到总颜色值上

    // vec2 delay = vec2(1., 20.) * (1. + p1);  // 计算延迟效果的参数
    // if (delay.x > 0.99) {  // 如果延迟效果满足条件
    //     float echoR = mix(r, 0., delay.y);  // 计算回声效果的半径
    //     float circle = Circle(w, p, echoR);  // 根据回声半径计算圆周上的平滑步长值
    //     col += circle * cl.yxy;  // 将回声效果的颜色值累加到总颜色值上
    // } else {  // 否则
    //     vec2 enemy = vec2(-0.2 + 0.5 * cos(0.01 * floor(t)));  // 计算一个随时间变化的敌对点位置
    //     col += .005 / length(p - enemy) * cl.xyy;  // 根据敌对点位置调整颜色值
    // }

    float dTargets = length(rand(p - 1e-6 * log(t + 100.)));  // 计算当前点到随机目标点的距离
    col += .02 / dTargets * cl.yxy;  // 根据距离调整颜色值，使其随距离增加而减弱

    gl_FragColor = vec4(col, 1);  // 将最终颜色值输出到gl_FragColor
}