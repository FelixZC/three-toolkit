/**
* 函数opRound: 计算距离减去给定半径后的结果
* @param d 输入的距离值
* @param r 输入的半径值
* @return 返回距离减去半径后的结果
*/
float opRound(in float d,in float r)
{
    return d-r; // 计算并返回d减去r的结果
}

/**
* 函数opOnion: 计算绝对值距离减去给定半径后的结果
* @param d 输入的距离值
* @param r 输入的半径值
* @return 返回绝对值距离减去半径后的结果
*/
float opOnion(in float d,in float r)
{
    return abs(d)-r; // 计算并返回d的绝对值减去r的结果
}

// 定义一个计算等边三角形距离的函数
// p: 输入的二维向量，表示点的位置
// r: 输入的浮点数，表示等边三角形的半径
// 返回值: 返回从点p到等边三角形边界的最短距离
float sdEquilateralTriangle(in vec2 p,in float r)
{
    const float k=sqrt(3.);// 等边三角形的边长与高的比例系数
    p.x=abs(p.x)-r;// 调整点p的x坐标，以考虑三角形的平移
    p.y=p.y+r/k;// 调整点p的y坐标，以考虑三角形的平移
    
    // 通过变换将点p映射到与等边三角形最近的象限
    if(p.x+k*p.y>0.)p=vec2(p.x-k*p.y,-k*p.x-p.y)/2.;
    
    // 进一步调整点p的x坐标，以确保它在正确的区间内
    p.x-=clamp(p.x,-2.*r,0.);
    
    // 计算并返回点p到等边三角形边界的最短距离
    return-length(p)*sign(p.y);
}

// 主函数，用于生成图像
void mainImage(out vec4 fragColor,in vec2 fragCoord){
    vec2 uv=fragCoord/iResolution.xy;// 将像素坐标转换为归一化坐标
    
    // 应用周期性平移
    uv=fract(uv*vec2(2.,2.));
    
    // 调整坐标系，使中心对准屏幕中心，并拉伸以适应屏幕宽高比
    uv=(uv-.5)*2.;
    uv.x*=iResolution.x/iResolution.y;
    uv.y=abs(uv.y);
    // 计算当前像素到等边三角形的距离
    float d=sdEquilateralTriangle(uv,.5);
    d=opOnion(d,.1);
    // d=opRound(d,.1);
    // 应用平滑步长来确定像素是否在三角形内
    float c=smoothstep(0.,.02,d);
    // 设置像素颜色，颜色强度由距离决定
    fragColor=vec4(vec3(c),1.);
}