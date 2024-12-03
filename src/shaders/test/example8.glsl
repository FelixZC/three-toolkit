#iChannel0"../../assets/images/textures/ie-tomb.jpg"

/**
 * 函数：random
 * 功能：生成基于给定二维坐标co的随机浮点数。
 * 参数：
 *    - co: 一个vec2类型的二维坐标。
 * 返回值：返回一个基于坐标co计算出的随机浮点数。
 */
highp float random(vec2 co)
{
    highp float a=12.9898;
    highp float b=78.233;
    highp float c=43758.5453;
    highp float dt=dot(co.xy,vec2(a,b)); // 计算向量co与向量(a,b)的点积
    highp float sn=mod(dt,3.14); // 将点积结果对3.14取模，得到0到3.14之间的值
    return fract(sin(sn)*c); // 返回sn的正弦值乘以c后的分数部分
}

void mainImage(out vec4 fragColor,in vec2 fragCoord){
    vec2 uv=fragCoord/iResolution.xy; // 计算当前像素相对于分辨率的归一化坐标
    // float noise=random(uv); // 注释掉的代码，是使用时间不变的随机数
    float noise=random(uv+iTime); // 使用时间变化的随机数
    vec3 col=texture(iChannel0,uv).xyz; // 从纹理iChannel0中采样颜色
    col+=(noise-.5)*.2; // 将随机噪声融合到颜色中
    fragColor=vec4(col,1.); // 设置最终像素颜色
}