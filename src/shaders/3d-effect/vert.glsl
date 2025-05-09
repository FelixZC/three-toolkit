// 此GLSL程序包含用于扭曲和变形的函数和变量，主要用于图形的生成和渲染。

// 引入外部GLSL文件
#include "/node_modules/lygia/generative/cnoise.glsl"
#include "/node_modules/lygia/math/const.glsl"

// 定义统一变量，用于控制时间和空间扭曲等
uniform float iTime; // 时间统一变量
uniform vec3 iResolution; // 屏幕分辨率统一变量
uniform vec4 iMouse; // 鼠标位置统一变量，可能用于交互
uniform float uFrequency; // 波动频率控制

// 定义传入和传出的变量，用于片元着色器中的进一步处理
varying vec2 vUv; // 纹理坐标
varying float vNoise; // 用于存储噪声值
varying vec3 vNormal; // 法线向量

// 另一个控制变形程度的统一变量
uniform float uDistort;

varying vec3 vWorldPosition; // 物体在世界空间中的位置

// 扭曲函数，对输入的点进行噪声扰动
vec3 distort(vec3 p){
    // 使用噪声函数生成扰动偏移量
    float offset=cnoise(p/uFrequency+iTime*.5);
    // 计算基于时间和扰动偏移的扭曲角度
    float t=(p.y+offset)*PI*12.;
    // 计算噪声影响的位移量
    float noise=(sin(t)*p.x+cos(t)*p.z)*2.;
    // 应用扭曲强度控制
    noise*=uDistort;
    vNoise=noise; // 保存噪声值，供其他使用
    // 应用噪声位移
    p+=noise*normal*.01;
    return p; // 返回扭曲后的点
}

// 包含另一个GLSL文件，用于修正法线
#include "../common/fix-normal.glsl"

// 主函数，执行几何体的着色和位置计算
void main(){
    vec3 p=position; // 输入位置
    vec3 dp=distort(p); // 应用扭曲
    // 计算最终的屏幕位置
    gl_Position=projectionMatrix*modelViewMatrix*vec4(dp,1.);

    vUv=uv; // 传递纹理坐标

    // 计算并传递修正后的法线
    vec3 fNormal=fixNormal(p,dp,normal,RADIUS/SEGMENTS);
    vNormal=(modelMatrix*vec4(fNormal,0.)).xyz;
    
    // 计算并传递世界空间中的位置
    vWorldPosition=vec3(modelMatrix*vec4(dp,1));
}