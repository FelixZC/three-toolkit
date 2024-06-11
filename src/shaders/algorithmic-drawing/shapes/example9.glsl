#ifdef GL_ES
precision mediump float;
#endif

// 定义圆周率PI和两倍圆周率TWO_PI
#define PI 3.14159265359
#define TWO_PI 6.28318530718

// 声明统一变量，用于传入屏幕分辨率、鼠标位置和时间
uniform vec2 u_resolution; // 屏幕分辨率
uniform vec2 u_mouse; // 鼠标位置
uniform float u_time; // 时间

// 引用自http://thndl.com/square-shaped-shaders.html

// 主函数，绘制图形
void main(){
  // 将像素坐标转换为0到1之间的比例
  vec2 st = gl_FragCoord.xy/u_resolution.xy;
  // 调整x轴比例，以适应不同宽高比
  st.x *= u_resolution.x/u_resolution.y;
  vec3 color = vec3(0.0); // 初始化颜色变量
  float d = 0.0; // 初始化距离变量

  // 将坐标空间重新映射到-1到1之间
  st = st *2.-1.;

  // 定义形状的边数
  int N = 4; // 此处示例为三角形，可以通过修改N的值来创建不同边数的形状

  // 计算当前像素的角度和半径
  float a = atan(st.x,st.y)+PI; // 计算角度
  float r = TWO_PI/float(N); // 计算每边的弧度

  // 调整距离的形状函数
  d = cos(floor(.5+a/r)*r-a)*length(st);

  // 使用平滑步进函数来决定颜色，基于距离d
//   color = vec3(1.0-smoothstep(.4,.41,d));
  // 以下代码行用于调试，可以直接显示距离d的颜色表现
  color = vec3(d);

  // 设置片段颜色
  gl_FragColor = vec4(color,1.0);
}