
/*
 * 计算点到盒子的距离。
 * 
 * @param p 点的坐标，类型为 vec2。
 * @param b 盒子的尺寸，类型为 vec2，其中b.x为盒子的宽度，b.y为盒子的高度。
 * @return 返回点到盒子最近边的距离。
 */
float sdBox(in vec2 p,in vec2 b)
{
    // 计算点到盒子各边的距离
    vec2 d=abs(p)-b;
    // 返回点到盒子的最近距离
    return length(max(d,0.))+min(max(d.x,d.y),0.);
}

/**
* 计算两个距离值的并集。
* @param d1 第一个距离值。
* @param d2 第二个距离值。
* @return 返回两个距离值中的较小值，代表并集的边界。
*/
float opUnion(float d1,float d2)
{
    return min(d1,d2); // 返回较小的距离值
}

/**
* 计算两个距离值的交集。
* @param d1 第一个距离值。
* @param d2 第二个距离值。
* @return 返回两个距离值中的较大值，代表交集的边界。
*/
float opIntersection(float d1,float d2)
{
    return max(d1,d2); // 返回较大的距离值
}

/**
* 计算两个距离值的差集。
* @param d1 第一个距离值。
* @param d2 第二个距离值。
* @return 返回d1的相反值与d2中的较大值，代表差集的边界。
*/
float opSubtraction(float d1,float d2)
{
    return max(-d1,d2);// 返回d2与d1的相反值中较大的值
}

/**
 * 计算点到圆的距离
 * @param p 点的坐标（vec2）
 * @param r 圆的半径（float）
 * @return 点到圆边界的距离（float）
 */
float sdCircle(vec2 p,float r)
{
    // 计算点到圆心的距离并减去半径，得到点到圆边界的距离
    return length(p)-r;
}

/**
 * 平滑合并操作
 * @param d1 第一个距离值（float）
 * @param d2 第二个距离值（float）
 * @param k 平滑参数，控制过渡区域的宽度（float）
 * @return 平滑合并后的距离值（float）
 */
float opSmoothUnion(float d1,float d2,float k){
    float h=clamp(.5+.5*(d2-d1)/k,0.,1.);
    return mix(d2,d1,h)-k*h*(1.-h);
}

/**
 * 平滑减去操作
 * @param d1 第一个距离值（float）
 * @param d2 第二个距离值（float）
 * @param k 平滑参数，控制过渡区域的宽度（float）
 * @return 平滑减去后的距离值（float）
 */
float opSmoothSubtraction(float d1,float d2,float k){
    float h=clamp(.5-.5*(d2+d1)/k,0.,1.);
    return mix(d2,-d1,h)+k*h*(1.-h);
}

/**
 * 平滑交集操作
 * @param d1 第一个距离值（float）
 * @param d2 第二个距离值（float）
 * @param k 平滑参数，控制过渡区域的宽度（float）
 * @return 平滑交集后的距离值（float）
 */
float opSmoothIntersection(float d1,float d2,float k){
    float h=clamp(.5-.5*(d2-d1)/k,0.,1.);
    return mix(d2,d1,h)+k*h*(1.-h);
}

/**
 * 主图像函数
 * @param fragColor 出口颜色（vec4）
 * @param fragCoord 片元坐标（vec2）
 */
void mainImage(out vec4 fragColor,in vec2 fragCoord){
    vec2 uv=fragCoord/iResolution.xy;
    uv=(uv-.5)*2.;
    uv.x*=iResolution.x/iResolution.y;

    float d1=sdCircle(uv,.5);
    float d2=sdBox(uv,vec2(.6,.3));

    float d=d1;
    // d=opUnion(d1,d2);
    // d=opSubtraction(d1,d2);
    d=opSubtraction(d2,d1);
    float c=smoothstep(0.,.02,d);
    fragColor=vec4(vec3(c),1.);
}  