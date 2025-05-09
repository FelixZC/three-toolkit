#iChannel0"../../assets/images/wallpaper/1626178455372.jpg"
#iChannel1"../../assets/images/wallpaper/1626273086948.jpg"
//
// Description : Array and textureless GLSL 2D/3D/4D simplex
//               noise functions.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : ijm
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
     return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v)
  {
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //   x0 = x0 - 0.0 + 0.0 * C.xxx;
  //   x1 = x0 - i1  + 1.0 * C.xxx;
  //   x2 = x0 - i2  + 2.0 * C.xxx;
  //   x3 = x0 - 1.0 + 3.0 * C.xxx;
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

// Permutations
  i = mod289(i);
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients: 7x7 points over a square, mapped onto an octahedron.
// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
  }

#pragma glslify: export(snoise)

/* ========================================================
   引用代码分割线
======================================================== */

/**
* 从指定的纹理通道获取颜色。
* @param uv UV坐标。
* @return 返回在指定UV坐标处的颜色。
*/
vec4 getFromColor(vec2 uv){
    return texture(iChannel0,uv);
}

/**
* 从另一个指定的纹理通道获取颜色。
* @param uv UV坐标。
* @return 返回在指定UV坐标处的颜色。
*/
vec4 getToColor(vec2 uv){
    return texture(iChannel1,uv);
}

/**
* 将一个值从一个范围映射到另一个范围。
* @param a 输入范围的最小值。
* @param b 输入范围的最大值。
* @param c 输出范围的最小值。
* @param d 输出范围的最大值。
* @param t 需要映射的当前值。
* @return 返回映射后的值。
*/
float remap(float a,float b,float c,float d,float t)
{
    return clamp((t-a)/(b-a),0.,1.)*(d-c)+c;
}

/**
* 生成分形噪声。
* @param p 输入位置。
* @return 返回在指定位置的分形噪声值。
*/
float fbm(vec3 p){
    
    // 初始化变量: 总值、当前振幅、当前频率、 lacunarity（空隙度）、persistance（持久度）、缩放比例、octaves（振荡次数）
    float value=0.;
    float amplitude=1.;
    float frequency=1.;
    float lacunarity=2.;
    float persistance=.5;
    float scale=1.;
    int octaves=8;
    
    // 对每个octave迭代，累加噪声值
    for(int i=0;i<octaves;i++){
        // 获取当前频率和缩放比例下的噪声值
        float noiseVal=snoise(p*frequency*scale);
        
        // 累加噪声值到总值，同时更新振幅、频率
        value+=amplitude*noiseVal;
        frequency*=lacunarity;
        amplitude*=persistance;
    }
    
    return value;
}

/**
* 溶解效果函数。
* @param uv UV坐标。
* @return 返回溶解后的颜色。
*/
vec4 dissolve(vec2 uv){
    // 进度条设置，基于鼠标位置和分辨率
    float progress=iMouse.x/iResolution.x;
    float ratio=iResolution.x/iResolution.y; // 分辨率比例
    
    vec4 col=getFromColor(uv); // 起始颜色
    vec4 col1=getToColor(uv); // 目标颜色
    
    vec2 p=uv;
    p-=.5; // 中心化UV
    p.x*=ratio; // 适应屏幕宽高比
    float noise=fbm(vec3(p,0.)); // 应用分形噪声
    
    // 将噪声值映射到[0,1]范围
    noise=remap(-1.,1.,0.,1.,noise);
    
    float edgeWidth=.1; // 边缘宽度
    vec3 edgeColor=vec3(.835,.694,.051); // 边缘颜色
    // 应用边缘混合
    float edge=1.-smoothstep(0.,edgeWidth,noise-progress);
    col.rgb=mix(col.rgb,edgeColor,edge*step(.0001,progress));
    // 混合起始颜色和目标颜色
    float pr=smoothstep(progress-.01,progress,noise);
    col.rgb=mix(col.rgb,col1.rgb,1.-pr);
    return col; // 返回混合后的颜色
}

/**
* 主图像函数。
* @param fragColor 输出颜色。
* @param fragCoord 片元坐标。
*/
void mainImage(out vec4 fragColor,in vec2 fragCoord){
    vec2 uv=fragCoord/iResolution.xy;// 计算UV坐标
    
    vec4 col=dissolve(uv);// 调用溶解函数
    
    fragColor=col;// 设置最终颜色
}