// 根据给定的点和半径，计算点到等边三角形的距离。
//
// @param p 点的坐标，类型为 vec2。
// @param r 三角形边长的一半，类型为 float。
// @return 点到等边三角形的距离，类型为 float。
float sdEquilateralTriangle(in vec2 p,in float r)
{
    const float k=sqrt(3.);// 等边三角形的黄金角度
    p.x=abs(p.x)-r;// 对点进行处理，以便于后续计算
    p.y=p.y+r/k;
    // 通过变换将点转换到与等边三角形的最近距离上
    if(p.x+k*p.y>0.)p=vec2(p.x-k*p.y,-k*p.x-p.y)/2.;
    // 进一步调整点的位置，去除位于等边三角形外部的点
    p.x-=clamp(p.x,-2.*r,0.);
    // 计算并返回点到等边三角形的距离
    return-length(p)*sign(p.y);
}

/**
 * 生成2D旋转矩阵。
 * 
 * @param angle 旋转角度（弧度制）。
 * @return 返回一个2x2的旋转矩阵。
 */
mat2 rotation2d(float angle){
    float s=sin(angle); // 计算角度的正弦值
    float c=cos(angle); // 计算角度的余弦值
    
    // 返回代表旋转的2x2矩阵
    return mat2(
        c,-s,
        s,c
    );
}

/**
 * 将2D向量按照给定角度旋转。
 * 
 * @param v 要旋转的2D向量。
 * @param angle 旋转角度（弧度制）。
 * @return 返回旋转后的2D向量。
 */
vec2 rotate(vec2 v,float angle){
    // 应用旋转矩阵到向量上
    return rotation2d(angle)*v;
}

const float PI=3.14159265359; // 定义圆周率PI
/**
* 主图像函数，负责渲染图像。
*
* @param fragColor 输出的颜色，类型为 vec4。
* @param fragCoord 片元的坐标，类型为 vec2。
*/
void mainImage(out vec4 fragColor,in vec2 fragCoord){
    // 将片元坐标转换为屏幕空间下的坐标
    vec2 uv=fragCoord/iResolution.xy;
    // 应用屏幕空间的缩放和位移
    uv=(uv-.5)*2.;
    // 修正长宽比，确保渲染在不同尺寸显示器上比例一致
    uv.x*=iResolution.x/iResolution.y;
    //旋转45°
    // uv=rotate(uv,PI/2.);
    // 持续旋转
    uv=rotate(uv,iTime);
    
    // 计算当前点到等边三角形的距离
    float d=sdEquilateralTriangle(uv,.5);
    
    // 应用平滑步进函数，用于过渡处理
    float c=smoothstep(0.,.02,d);
    // 设置像素颜色
    fragColor=vec4(vec3(c),1.);
}