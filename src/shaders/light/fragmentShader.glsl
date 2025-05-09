//   iTime: 浮点型，统一变量，表示当前时间
//   iResolution: 三维向量，统一变量，表示视口分辨率
//   iMouse: 四维向量，统一变量，表示鼠标位置（当前未使用）
//   vUv: 二维向量，变化变量，表示片段的UV坐标
//   vNormal: 三维向量，变化变量，表示片段的法向量
//   vWorldPosition: 三维向量，变化变量，表示片段的世界空间位置
uniform float iTime;
uniform vec3 iResolution;
uniform vec4 iMouse;
uniform samplerCube iChannel0;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;

// 计算 fresnel 光学效应的函数
float fresnel(float bias,float scale,float power,vec3 I,vec3 N)
{
    return bias+scale*pow(1.-dot(I,N),power);
}

/**
* 计算光照模型的颜色
*
* 该片段着色器函数计算了一个像素点的颜色，包括环境光、漫反射光、镜面反射光和图像基于光线的反射（IBL）的贡献。
* 使用了GLSL语言进行光线的计算和颜色的混合。
*
* @param vUv 纹理坐标，用于获取纹理颜色（在此函数中未使用）
* @return gl_FragColor 输出的颜色，为一个vec4类型，包含RGB颜色和透明度
*/
void main(){
    vec2 uv=vUv;

    vec3 normal=normalize(vNormal); // 正常化法向量

    vec3 col=vec3(0.); // 初始化最终颜色
    vec3 objectColor=vec3(1.); // 物体颜色
    vec3 lightColor=vec3(.875,.286,.333); // 光源颜色

    // 计算环境光贡献
    float ambIntensity=.2; // 环境光强度
    vec3 ambient=lightColor*ambIntensity; 
    col+=ambient*objectColor;

    // 计算漫反射光贡献
    vec3 lightPos=vec3(10.,10.,10.); // 光源位置
    vec3 lightDir=normalize(lightPos-vWorldPosition); // 光线方向
    float diff=dot(normal,lightDir); // 漫反射因子
    diff=max(diff,0.); // 保证非负
    vec3 diffuse=lightColor*diff; // 漫反射光颜色
    col+=diffuse*objectColor;

    // 计算镜面反射光贡献
    vec3 reflectDir=reflect(-lightDir,normal); // 镜面反射方向
    vec3 viewDir=normalize(cameraPosition-vWorldPosition); // 观察方向
    vec3 halfVec=normalize(lightDir+viewDir);
    float spec=dot(normal,halfVec); // 镜面反射因子
    spec=max(spec,0.); // 保证非负
    float shininess=32.; // 镜面粗糙度
    spec=pow(spec,shininess); // 镜面反射强度
    vec3 specular=lightColor*spec; // 镜面反射光颜色
    col+=specular*objectColor;

    // 计算基于图像的光线反射（IBL）的贡献
    float iblIntensity=.2; // IBL强度
    vec3 iblCoord=normalize(reflect(-viewDir,normal)); // 反射向量用于查询环境贴图
    vec3 ibl=texture(iChannel0,iblCoord).xyz; // 从环境贴图中获取颜色
    vec3 iblLight=ibl*iblIntensity; // 应用强度
    col+=iblLight*objectColor;

    // 计算 fresnel 光学效应的贡献
    vec3 fresColor=vec3(1.); // fresnel颜色
    float fresIntensity=.6; // fresnel强度
    float fres=fresnel(0.,1.,5.,viewDir,normal); // 计算fresnel因子
    vec3 fresLight=fres*fresColor*fresIntensity; // fresnel光颜色
    col+=fresLight*objectColor;

    gl_FragColor=vec4(col,1.); // 输出最终颜色
} 