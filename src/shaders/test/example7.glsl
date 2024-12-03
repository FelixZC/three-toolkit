
// 定义全局纹理通道
#iChannel0"../../assets/images/rail-star/trailblazer-female.png"
#iChannel1"../../assets/images/rail-star/trailblazer-male.png"

//
// GLSL textureless classic 3D noise "cnoise",
// with an RSL-style periodic variant "pnoise".
// Author:  Stefan Gustavson (stefan.gustavson@liu.se)
// Version: 2011-10-11
//
// Many thanks to Ian McEwan of Ashima Arts for the
// ideas for permutation and gradient selection.
//
// Copyright (c) 2011 Stefan Gustavson. All rights reserved.
// Distributed under the MIT license. See LICENSE file.
// https://github.com/ashima/webgl-noise
//

vec3 mod289(vec3 x)
{
    return x-floor(x*(1./289.))*289.;
}

vec4 mod289(vec4 x)
{
    return x-floor(x*(1./289.))*289.;
}

vec4 permute(vec4 x)
{
    return mod289(((x*34.)+1.)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
    return 1.79284291400159-.85373472095314*r;
}

vec3 fade(vec3 t){
    return t*t*t*(t*(t*6.-15.)+10.);
}

// Classic Perlin noise
float cnoise(vec3 P)
{
    vec3 Pi0=floor(P);// Integer part for indexing
    vec3 Pi1=Pi0+vec3(1.);// Integer part + 1
    Pi0=mod289(Pi0);
    Pi1=mod289(Pi1);
    vec3 Pf0=fract(P);// Fractional part for interpolation
    vec3 Pf1=Pf0-vec3(1.);// Fractional part - 1.0
    vec4 ix=vec4(Pi0.x,Pi1.x,Pi0.x,Pi1.x);
    vec4 iy=vec4(Pi0.yy,Pi1.yy);
    vec4 iz0=Pi0.zzzz;
    vec4 iz1=Pi1.zzzz;
    
    vec4 ixy=permute(permute(ix)+iy);
    vec4 ixy0=permute(ixy+iz0);
    vec4 ixy1=permute(ixy+iz1);
    
    vec4 gx0=ixy0*(1./7.);
    vec4 gy0=fract(floor(gx0)*(1./7.))-.5;
    gx0=fract(gx0);
    vec4 gz0=vec4(.5)-abs(gx0)-abs(gy0);
    vec4 sz0=step(gz0,vec4(0.));
    gx0-=sz0*(step(0.,gx0)-.5);
    gy0-=sz0*(step(0.,gy0)-.5);
    
    vec4 gx1=ixy1*(1./7.);
    vec4 gy1=fract(floor(gx1)*(1./7.))-.5;
    gx1=fract(gx1);
    vec4 gz1=vec4(.5)-abs(gx1)-abs(gy1);
    vec4 sz1=step(gz1,vec4(0.));
    gx1-=sz1*(step(0.,gx1)-.5);
    gy1-=sz1*(step(0.,gy1)-.5);
    
    vec3 g000=vec3(gx0.x,gy0.x,gz0.x);
    vec3 g100=vec3(gx0.y,gy0.y,gz0.y);
    vec3 g010=vec3(gx0.z,gy0.z,gz0.z);
    vec3 g110=vec3(gx0.w,gy0.w,gz0.w);
    vec3 g001=vec3(gx1.x,gy1.x,gz1.x);
    vec3 g101=vec3(gx1.y,gy1.y,gz1.y);
    vec3 g011=vec3(gx1.z,gy1.z,gz1.z);
    vec3 g111=vec3(gx1.w,gy1.w,gz1.w);
    
    vec4 norm0=taylorInvSqrt(vec4(dot(g000,g000),dot(g010,g010),dot(g100,g100),dot(g110,g110)));
    g000*=norm0.x;
    g010*=norm0.y;
    g100*=norm0.z;
    g110*=norm0.w;
    vec4 norm1=taylorInvSqrt(vec4(dot(g001,g001),dot(g011,g011),dot(g101,g101),dot(g111,g111)));
    g001*=norm1.x;
    g011*=norm1.y;
    g101*=norm1.z;
    g111*=norm1.w;
    
    float n000=dot(g000,Pf0);
    float n100=dot(g100,vec3(Pf1.x,Pf0.yz));
    float n010=dot(g010,vec3(Pf0.x,Pf1.y,Pf0.z));
    float n110=dot(g110,vec3(Pf1.xy,Pf0.z));
    float n001=dot(g001,vec3(Pf0.xy,Pf1.z));
    float n101=dot(g101,vec3(Pf1.x,Pf0.y,Pf1.z));
    float n011=dot(g011,vec3(Pf0.x,Pf1.yz));
    float n111=dot(g111,Pf1);
    
    vec3 fade_xyz=fade(Pf0);
    vec4 n_z=mix(vec4(n000,n100,n010,n110),vec4(n001,n101,n011,n111),fade_xyz.z);
    vec2 n_yz=mix(n_z.xy,n_z.zw,fade_xyz.y);
    float n_xyz=mix(n_yz.x,n_yz.y,fade_xyz.x);
    return 2.2*n_xyz;
}

/* ========================================================
   引用代码分割线
======================================================== */

/**
* 计算给定点到圆的最近距离
* @param p 点的坐标（vec2）
* @param r 圆的半径（float）
* @return 点到圆的最近距离（float）
*/
float sdCircle(vec2 p,float r)
{
    return length(p)-r;
}

/**
* 对给定点进行扭曲变形
* @param p 待变形的点的坐标（vec2）
* @return 变形后的点的坐标（vec2）
*/
vec2 distort(vec2 p){
    p.x+=sin(p.y*10.+iTime)/50.; // 根据时间对点进行扭曲
    return p;
}

/**
* 从纹理iChannel0中获取颜色
* @param uv 纹理坐标（vec2）
* @return 从纹理中采样的颜色（vec4）
*/
vec4 getFromColor(vec2 uv){
    return texture(iChannel0,uv);
}

/**
* 从纹理iChannel1中获取颜色
* @param uv 纹理坐标（vec2）
* @return 从纹理中采样的颜色（vec4）
*/
vec4 getToColor(vec2 uv){
    return texture(iChannel1,uv);
}

/**
* 过渡效果函数，混合“from”到“to”的颜色
* @param uv 纹理坐标（vec2），代表在纹理上的位置
* @return 混合后的颜色（vec4），这个颜色是根据过渡进度和屏幕位置计算得到的
*/
vec4 transition(vec2 uv){
    // 计算过渡的进度，基于鼠标在屏幕上的位置（x轴）和屏幕的宽度
    float progress=iMouse.x/iResolution.x; 
    // 计算屏幕的宽高比
    float ratio=iResolution.x/iResolution.y; 
    
    // 准备调整纹理坐标p，首先将其中心化
    vec2 p=uv;
    p-=.5;
    // 根据屏幕的宽高比调整p的x坐标，以适应不同比例的屏幕
    p.x*=ratio; 
    
    // 使用噪声函数为过渡添加一些随机性
    float noise=cnoise(vec3(p*10.,0.));
    // 计算最终的过渡位置，加入噪声影响
    float pr=progress+noise*.1;
    
    // 计算当前点到过渡圆圈的距离，并使用平滑步骤来柔和过渡
    float d=sdCircle(p,pr*sqrt(2.4));
    float c=smoothstep(-.1,-.05,d);
    
    // 根据距离混合“from”和“to”的颜色，越靠近圆圈中心，“to”颜色的权重越大
    return mix(getFromColor(uv),getToColor(uv),1.-c);
}

/**
* 过渡效果函数
*
* 该函数用于根据给定的屏幕坐标（uv）产生一个过渡效果的颜色。这个效果
* 会根据鼠标在屏幕上的位置以及屏幕的分辨率来改变。它通过混合“to”颜色到
* “from”颜色来实现过渡效果。
*
* @param uv 输入的二维坐标，代表屏幕上的一个点（通常为归一化坐标）。
* @return 返回一个vec4颜色值，代表在给定点上的过渡颜色。
*/
// vec4 transition(vec2 uv){
    //     // 计算过渡的进度，基于鼠标在屏幕上的X坐标与屏幕宽度的比值。
    //     float progress=iMouse.x/iResolution.x;
    //     // 计算屏幕宽度与高度的比例。
    //     float ratio=iResolution.x/iResolution.y;
    
    //     // 从纹理iChannel1中获取位移向量，并应用到uv坐标上。
    //     vec2 dispVec=texture(iChannel1,uv).xy;
    //     // 定义位移的强度。
    //     float strength=.6;
    //     // 计算过渡的起始和结束点的uv坐标。
    //     vec2 uv1=vec2(uv.x-dispVec.x*progress*strength,uv.y);
    //     vec2 uv2=vec2(uv.x+dispVec.x*(1.-progress)*strength,uv.y);
    
    //     // 根据进度，混合起始和结束点的颜色，并返回结果。
    //     return mix(getFromColor(uv1),getToColor(uv2),progress);
// }

/**
* 主要的图像处理函数。
*
* @param fragColor 输出颜色，一个vec4变量，代表最终的像素颜色。
* @param fragCoord 输入的像素坐标，一个vec2变量，表示当前处理的像素在图像中的坐标。
*/
// void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    //     // 将像素坐标转换为归一化纹理坐标
    //     vec2 uv = fragCoord / iResolution.xy;
    //     // 对归一化纹理坐标进行失真处理
    //     uv = distort(uv);
    //     // 从纹理通道0中采样颜色
    //     vec3 tex = texture(iChannel0, uv).xyz;
    //     // 设置最终的颜色为采样的颜色
    //     fragColor = vec4(tex, 1.);
// }

/**
* 主渲染函数
* @param fragColor 输出的颜色（vec4）
* @param fragCoord 片元坐标（vec2）
*/
void mainImage(out vec4 fragColor,in vec2 fragCoord){
    vec2 uv=fragCoord/iResolution.xy;
    vec4 col=transition(uv);// 应用过渡效果
    fragColor=col;// 设置最终颜色
}
