varying vec2 vUv;
uniform float iTime;
uniform vec3 iResolution;
uniform vec4 iMouse;
// 主函数：渲染像素颜色
// 参数：
// - vUv: 传递给片段着色器的UV坐标
// - iTime: 外部传入的当前时间
// - iResolution: 外部传入的屏幕分辨率
// - iMouse: 外部传入的鼠标位置
// 返回值：无
void main(){
    // 获取当前像素的UV坐标，并进行缩放处理
    vec2 uv=gl_PointCoord;
    uv=(uv-.5)*2.;

    // 计算UV坐标的长度，并基于该长度调整颜色浓度
    float d=length(uv);
    float c=.05/d;
    c=pow(c,2.);

    // 设置像素颜色，颜色随距离中心的远近而变化
    gl_FragColor=vec4(vec3(1.),c);
}