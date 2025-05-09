uniform float iTime;
uniform vec3 iResolution;
uniform vec4 iMouse;

uniform sampler2D uTexture;
uniform vec2 uMediaSize;
uniform float uOpacity;

varying vec2 vUv;
// GLSL 函数：cover
// 说明：调整纹理坐标，以适应不同的宽高比。
// 参数：
// - s: 目标尺寸（屏幕或画布尺寸）
// - i: 输入尺寸（纹理尺寸）
// - uv: 原始纹理坐标
// 返回值：调整后的纹理坐标
vec2 cover(vec2 s, vec2 i, vec2 uv){
    float rs = s.x / s.y; // 目标宽高比
    float ri = i.x / i.y; // 输入宽高比
    vec2 newSize = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x); // 调整后的尺寸
    vec2 offset = (rs < ri ? vec2((newSize.x - s.x) / 2., 0.): vec2(0., (newSize.y - s.y) / 2.)) / newSize; // 计算偏移量
    uv = uv * s / newSize + offset; // 应用尺寸调整和偏移
    return uv;
}

void main(){
    vec2 uv = vUv; // 原始纹理坐标
    // uv = cover(iResolution.xy, uMediaSize.xy, uv); // 此行注释掉的代码用于调整纹理坐标以适应画布尺寸
    vec4 tex = texture(uTexture, uv); // 获取纹理颜色
    vec3 color = tex.rgb; // 提取纹理的RGB颜色
    gl_FragColor = vec4(color, uOpacity); // 设置最终的像素颜色，考虑不透明度
}