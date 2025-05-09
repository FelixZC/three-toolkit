#iChannel0"../../assets/images/rail-star/b1533de93c0ac43e2139bd93ec47419c_5547524982557108866.png"

// 定义主图像渲染函数
// fragColor: 输出的像素颜色，是一个vec4类型
// fragCoord: 像素坐标，输入参数，是一个vec2类型
// iResolution: 外部定义的分辨率变量，用于计算像素比例，非输入参数，这里假定为全局变量
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    // 计算当前像素相对于画布的UV坐标
    vec2 uv = fragCoord / iResolution.xy;
    
    // 下面的代码块是用于对UV坐标进行像素化处理的
    vec2 size = vec2(50., 50.); // 定义像素块的大小
    uv.x = floor(uv.x * size.x) / size.x; // 对U坐标进行像素化
    uv.y = floor(uv.y * size.y) / size.y; // 对V坐标进行像素化
    
    // 从纹理采样器iChannel0中采样得到像素颜色
    vec3 tex = texture(iChannel0, uv).xyz;
    vec3 col = vec3(1.); // 初始化一个颜色向量（全白色）
    
    // 计算当前像素点相对于中心点的距离
    vec2 p = uv - .5; // 中心点为.5,.5
    float d = length(p); // 距离计算
    // 使用smoothstep函数平滑的过渡d值，用于给纹理颜色混合一个软边
    float c = smoothstep(.8, .4, d);
    
    // 根据距离d的平滑值c，调整纹理颜色的强度
    tex *= c;
    
    // 将最终颜色封装到vec4中，并设置透明度为1
    fragColor = vec4(tex, 1.);
}