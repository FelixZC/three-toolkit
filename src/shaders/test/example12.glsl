// iChannel0引用了外部的图片资源，作为纹理使用
#iChannel0"../../assets/images/rail-star/b1533de93c0ac43e2139bd93ec47419c_5547524982557108866.png"

/**
 * 对给定的二维向量应用一个凸起效果。
 * 
 * @param p 输入的二维向量，表示待处理的点坐标。
 * @return 返回经过凸起效果处理后的二维向量。
 */
vec2 bulge(vec2 p){
    // 根据鼠标位置调整中心点
    vec2 center=iMouse.xy/iResolution.xy;
    float radius=.9; // 凸起的半径
    float strength=1.1; // 凸起的力量
    
    // 将输入点相对于中心点进行偏移
    p-=center;
    
    // 计算点到中心点的距离并调整
    float d=length(p);
    d/=radius; // 根据半径缩放距离
    float dPow=pow(d,2.); // 距离的平方
    float dRev=strength/(dPow+1.); // 根据距离调整反转距离
    
    // 根据调整后的距离反转向量p的大小
    p*=dRev;
    
    // 将p再次相对于中心点进行偏移，恢复原始坐标
    p+=center;
    
    return p;
}

/**
 * 主函数，负责处理图像渲染。
 * 
 * @param fragColor 输出颜色，代表处理后的像素颜色。
 * @param fragCoord 像素坐标，表示当前处理的像素位置。
 */
void mainImage(out vec4 fragColor,in vec2 fragCoord){
    // 计算当前像素相对于画布的UV坐标
    vec2 uv=fragCoord/iResolution.xy;
    // 应用bulge函数，对UV坐标应用凸起效果
    uv=bulge(uv);
    // 从纹理采样获取颜色
    vec3 tex=texture(iChannel0,uv).xyz;
    // 设置最终像素颜色
    fragColor=vec4(tex,1.);
}