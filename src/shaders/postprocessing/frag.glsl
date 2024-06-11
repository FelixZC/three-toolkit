#include "/node_modules/lygia/generative/random.glsl"

//全局变量：时间，分辨率，鼠标位置，纹理，RGB偏移量，透明度，UV坐标
uniform float iTime; //当前时间
uniform vec2 iResolution; //视口分辨率
uniform vec2 iMouse; //鼠标位置

uniform sampler2D tDiffuse; //输入的纹理
uniform float uRGBShift; //RGB颜色偏移量
uniform float uOpacity; //纹理的透明度
varying vec2 vUv; //片元的UV坐标

/**
 * 添加噪声颗粒效果到颜色中。
 * @param uv 片元的UV坐标
 * @param col 原始颜色
 * @return 添加了噪声颗粒效果的颜色
 */
vec3 grain(vec2 uv, vec3 col) {
    float noise = random(uv + iTime); //基于UV和时间的随机噪声
    col += (noise - .5) * .1; //将噪声融入颜色
    return col;
}

/**
 * 对纹理进行RGB偏移处理。
 * @param tex 输入的纹理
 * @param uv 片元的UV坐标
 * @param amount RGB偏移量的大小
 * @return 经过RGB偏移处理后的颜色
 */
vec4 RGBShift(sampler2D tex, vec2 uv, float amount) {
    vec2 rUv = uv; vec2 gUv = uv; vec2 bUv = uv; //初始化RGB的UV坐标
    float noise = random(uv + iTime) * .5 + .5; //基于UV和时间的随机噪声，用于计算偏移角度
    vec2 offset = amount * vec2(cos(noise), sin(noise)); //计算偏移量
    rUv += offset; //应用偏移量到R通道的UV
    gUv += offset * .5; //应用偏移量到G通道的UV，量为R的一半
    bUv += offset * .25; //应用偏移量到B通道的UV，量为R的四分之一
    vec4 rTex = texture(tex, rUv); //采样R通道颜色
    vec4 gTex = texture(tex, gUv); //采样G通道颜色
    vec4 bTex = texture(tex, bUv); //采样B通道颜色
    vec4 col = vec4(rTex.r, gTex.g, bTex.b, gTex.a); //组合RGB颜色和G通道的透明度
    return col;
}

void main() {
    vec2 uv = vUv; //获取当前片元的UV坐标
    vec4 tex = RGBShift(tDiffuse, uv, uRGBShift); //对纹理进行RGB偏移处理
    vec3 col = tex.xyz; //获取处理后的颜色
    col = grain(uv, col); //添加噪声颗粒效果到颜色中
    gl_FragColor = vec4(col, 1.); //将最终颜色设置为片元颜色
}