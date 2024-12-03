#include "../common/glsl-noise/perlin/3d.glsl"
varying vec2 vUv;
uniform float iTime;
uniform vec3 iResolution;
uniform vec4 iMouse;
uniform float uPixelRatio;
// 定义一个用于扭曲坐标的函数
// 参数 p: 输入的原始坐标
// 返回值: 经过扭曲处理后的坐标
vec3 distort(vec3 p){
    // 定义波动速度
    float speed=.1;
    // 使用cnoise函数生成噪声
    float noise=cnoise(p)*.5;
    // 根据时间、速度和噪声来扭曲x坐标
    p.x+=cos(iTime*speed+p.x*noise*100.)*.2;
    // 根据时间、速度和噪声来扭曲y坐标
    p.y+=sin(iTime*speed+p.x*noise*100.)*.2;
    // 根据时间、速度和噪声来扭曲z坐标
    p.z+=cos(iTime*speed+p.x*noise*100.)*.2;
    return p;
}

// 主函数
void main(){
    // 传递UV坐标
    vUv=uv;
    // 计算模型位置
    vec4 modelPosition=modelMatrix*vec4(position,1.);
    // 计算视图位置
    vec4 viewPosition=viewMatrix*modelPosition;
    // 计算投影位置
    vec4 projectedPosition=projectionMatrix*viewPosition;
    // 初始化原始位置
    vec3 p=position;
    // 应用扭曲函数
    p=distort(p);
    // 设置最终的片元位置
    gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
    // 设置点的大小，考虑像素比率
    gl_PointSize=50.*uPixelRatio;
    // 根据视图和模型矩阵计算模型视图位置，用于调整点的大小
    vec4 mvPosition=modelViewMatrix*vec4(p,1.);
    // 根据距离调整点的大小
    gl_PointSize*=(1./-mvPosition.z);
}