#iChannel0"../../assets/images/wallpaper/1626350753637.jpg"

/**
 * 主图像函数。
 * 应用一个滤镜效果到输入纹理上。
 *
 * @param fragColor 输出颜色向量。
 * @param fragCoord 片元坐标。
 */
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    // 计算UV坐标，通常需要归一化到[0, 1]范围内
    vec2 uv = fragCoord / iResolution.xy;
    
    // 从纹理中获取颜色
    vec3 col = texture(iChannel0, uv).rgb;
    
    // 定义滤镜颜色（这是一个蓝色调的滤镜）
    vec3 tintColor = vec3(0.220, 0.380, 0.651);
    
    // 将原始颜色与滤镜颜色相乘以应用滤镜效果
    col *= tintColor;
    
    // 将结果赋值给输出颜色
    fragColor = vec4(col, 1.0); // 确保alpha值被设置，默认为全不透明
}