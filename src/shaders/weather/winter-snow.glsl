// From https://www.shadertoy.com/view/MscXD7

// Uniform变量声明，用于外部控制的全局变量
uniform float iTime; // 时间统一变量，用于动画控制
uniform vec3 iResolution; // 屏幕分辨率统一变量，用于正常化坐标
uniform vec4 iMouse; // 鼠标位置统一变量，当前未使用

// 定义宏变量控制雪片的数量和层数
#define _NUMSHEETS 10. // 层数
#define _NUMFLAKES 40. // 每层雪片数量

vec2 uv; // 存储当前像素的归一化坐标

// GLSL经典随机函数
float rnd(float x)
{   
    // 使用噪声函数生成随机数
    return fract(sin(dot(vec2(x+47.49,38.2467/(x+2.3)),vec2(12.9898,78.233)))*(43758.5453));
}

// 画单个雪片的函数
// 参数center: 雪片的中心位置
// 参数radius: 雪片的半径
// 返回值: 雪片在当前像素的遮挡量
float drawFlake(vec2 center,float radius)
{
    // 使用平滑步长函数绘制雪片
    return 1.-sqrt(smoothstep(0.,radius,length(uv-center)));
}

void main()
{
    // 计算当前像素的归一化坐标
    uv=gl_FragCoord.xy/iResolution.x;
    // 初始化颜色
    vec3 col=vec3(.63,.85,.95);
    // 层循环，用于绘制多层雪片
    for(float i=1.;i<=_NUMSHEETS;i++){
        // 雪片循环
        for(float j=1.;j<=_NUMFLAKES;j++){
            // 控制每层的雪片数量减少
            if(j>_NUMFLAKES/i)break;
            
            // 计算雪片大小和速度，随着层数增加而增加
            float size=.002*i*(1.+rnd(j)/2.);
            float speed=size*.75+rnd(i)/1.5;
            
            // 计算雪片中心位置，引入随机性和时间因素
            vec2 center=vec2(0.,0.);
            center.x=-.3+rnd(j*i)*1.4+.1*cos(iTime+sin(j*i));
            center.y=fract(sin(j)-speed*iTime)/1.3;
            
            // 预留用于添加Z轴抖动的占位符
            
            // 根据层数和距离调整雪片的透明度
            col+=vec3((1.-i/_NUMSHEETS)*drawFlake(center,size));
        }
    }
    // 输出最终颜色
    gl_FragColor=vec4(col,1.);
}