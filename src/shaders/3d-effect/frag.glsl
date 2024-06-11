#include "/node_modules/lygia/color/palette.glsl"
#include "/node_modules/lygia/lighting/fresnel.glsl"
#include "/node_modules/lygia/color/space.glsl"

uniform float iTime;
uniform vec3 iResolution;
uniform vec4 iMouse;

varying vec2 vUv;

varying float vNoise;
varying vec3 vNormal;
varying vec3 vWorldPosition;

uniform vec3 uThemeColor;
uniform vec3 uLightColor;
uniform float uFresnelIntensity;
uniform float uLightIntensity;
uniform vec3 uLight2Color;
uniform float uLight2Intensity;
// 主渲染函数
// 
// 参数:
//   iTime: 流逝时间，用于动画效果。
//   iResolution: 屏幕分辨率，可用于基于分辨率的缩放或比例计算。
//   iMouse: 鼠标位置，可用于交互式效果。
//   vUv: 纹理坐标，用于纹理映射。
//   vNoise: 噪声值，可用于纹理或颜色变化。
//   vNormal: 物体表面法线，用于光照计算。
//   vWorldPosition: 物体在世界空间的位置，用于光照计算。
//   uThemeColor: 主题颜色，用于物体的基本颜色。
//   uLightColor: 主光源颜色。
//   uFresnelIntensity: 面反射（Fresnel）效果的强度。
//   uLightIntensity: 主光源强度。
//   uLight2Color: 第二光源颜色。
//   uLight2Intensity: 第二光源强度。
// 
// 返回值:
//   gl_FragColor: 输出的颜色，最终呈现在像素上的颜色。
void main(){
    vec2 uv=vUv;

    vec3 normal=normalize(vNormal); // 正常化表面法线，用于光照计算。

    vec3 col=vec3(1.); // 初始化颜色为白色。

    // 使用cos调色板，注释掉的代码示例。
    // col=palette(vNoise,vec3(.5),vec3(.5),vec3(1.),vec3(0.,.10,.20));

    // 设置基本颜色为主题颜色。
    col=uThemeColor;

    // 计算Fresnel效果，并应用到颜色上。
    vec3 viewDir=normalize(cameraPosition-vWorldPosition);
    vec3 fres=fresnel(vec3(0.),normal,viewDir);
    col+=fres*uFresnelIntensity;

    // 计算漫反射光照，并混合到颜色中。
    // vec3 lightColor=vec3(1.,0.,0.); // 示例光源颜色，已注释
    vec3 lightPos=vec3(10.,5.,10.); // 主光源位置
    float diff=max(dot(normal,normalize(lightPos-vWorldPosition)),0.);
    // col+=lightColor*diff; // 示例漫反射计算，已注释
    col=mix(col,uLightColor,diff*fres*uLightIntensity); // 混合漫反射光颜色

    // 计算第二光源的漫反射光照，并混合到颜色中。
    vec3 light2Pos=vec3(-10.,-5.,10.); // 第二光源位置
    float diff2=max(dot(normal,normalize(light2Pos-vWorldPosition)),0.);
    col=mix(col,uLight2Color,diff2*fres*uLight2Intensity); // 混合第二光源颜色

    // 应用gamma修正，改善颜色视觉效果。
    col=linear2gamma(col);

    //调试用：将颜色设置为噪声值，注释掉的代码示例。
    // col=vec3(vNoise);

    gl_FragColor=vec4(col,1.); // 将计算出的颜色设置为最终输出颜色。
}