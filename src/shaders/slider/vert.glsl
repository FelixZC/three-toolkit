#include "/node_modules/lygia/math/const.glsl"

// 引入全局变量：时间、分辨率、鼠标位置、各种动态参数
uniform float iTime;
uniform vec3 iResolution;
uniform vec4 iMouse;
uniform float uVelocity;
uniform float uDistortX;
uniform float uDistortZ;
uniform float uProgress; // 过渡进度
uniform vec2 uMeshSize; // 网格大小
uniform vec2 uMeshPosition; // 网格位置

// 纹理坐标变量，用于顶点着色器和片元着色器之间的通信
varying vec2 vUv;

// 计算给定UV坐标周围的“ stagger”值
float getStagger(vec2 uv){
    float left=uv.x;
    float bottom=uv.y;
    float right=1.-uv.x;
    float top=1.-uv.y;
    return top*right;
}

// 过渡函数，用于平滑地调整物体位置和形状
vec3 transition(vec3 p){
    float pr=uProgress; // 过渡进度的局部变量
    float stagger=getStagger(uv); // 获取UV坐标的“ stagger”值
    pr=smoothstep(stagger*.8,1.,pr); // 使用平滑步进来调整过渡的柔和度
    vec2 targetScale=iResolution.xy/uMeshSize.xy; // 目标缩放比例
    vec2 scale=mix(vec2(1.),targetScale,pr); // 混合当前和目标缩放比例
    p.xy*=scale; // 根据缩放比例调整位置
    p.xy+=-uMeshPosition*pr; // 根据过渡进度调整网格位置
    p.z+=pr; // 根据过渡进度调整深度
    return p;
}

// 歪曲函数，用于对物体进行非线性的空间变形
vec3 distort(vec3 p){
    p.x+=sin(uv.y*PI)*uVelocity*uDistortX; // 在x轴上应用扭曲
    p.z+=cos((p.x/iResolution.y)*PI)*abs(uVelocity)*uDistortZ; // 在z轴上应用扭曲
    return p;
}

// 主函数，用于处理顶点着色逻辑
void main(){
    vec3 p=position; // 默认位置
    p=transition(p); // 应用过渡效果
    vec4 mvPosition=modelViewMatrix*vec4(p,1.); // 计算模型视图矩阵乘以位置向量
    mvPosition.xyz=distort(mvPosition.xyz); // 对结果应用空间歪曲
    gl_Position=projectionMatrix*mvPosition; // 计算最终的屏幕位置
    
    vUv=uv; // 传递纹理坐标
}