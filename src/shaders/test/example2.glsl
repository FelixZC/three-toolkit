/**
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
    // 修正长宽比
    uv.x*=iResolution.x/iResolution.y;

    // 计算当前点到盒子的距离
    float d=sdBox(uv,vec2(.6,.3));
    // 应用平滑步进函数，用于过渡处理
    float c=smoothstep(0.,.02,d);
    // 设置像素颜色
    fragColor=vec4(vec3(c),1.);
}