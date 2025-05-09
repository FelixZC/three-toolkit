#iChannel0"../../assets/images/wallpaper/1626438085277.jpg"

// 生成一个基于二维坐标co的随机数
// 返回值：随机浮点数
highp float random(vec2 co)
{
    highp float a=12.9898;
    highp float b=78.233;
    highp float c=43758.5453;
    highp float dt=dot(co.xy,vec2(a,b));
    highp float sn=mod(dt,3.14);
    return fract(sin(sn)*c);
}

/**
* 主图像函数。
* 应用一个滤镜效果到输入纹理上。
*
* @param fragColor 输出颜色向量。
* @param fragCoord 片元坐标。
*/
void mainImage(out vec4 fragColor,in vec2 fragCoord){
    vec2 uv=fragCoord/iResolution.xy; // 将片元坐标转换为纹理坐标
    vec2 rUv=uv;
    vec2 gUv=uv;
    vec2 bUv=uv;

    // 生成噪声，并应用到红和蓝通道的纹理坐标上
    float noise=random(uv)*.5+.5;
    vec2 offset=.0025*vec2(cos(noise),sin(noise)); // 噪声偏移量

    rUv+=offset; // 红通道应用噪声偏移
    bUv-=offset; // 蓝通道反向应用噪声偏移
    vec4 rTex=texture(iChannel0,rUv); // 获取红通道纹理颜色
    vec4 gTex=texture(iChannel0,gUv); // 获取绿通道纹理颜色
    vec4 bTex=texture(iChannel0,bUv); // 获取蓝通道纹理颜色
    vec4 col=vec4(rTex.r,gTex.g,bTex.b,gTex.a); // 混合颜色
    fragColor=col; // 设置最终颜色
}