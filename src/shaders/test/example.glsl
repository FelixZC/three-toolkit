/**
 * 主要的图像处理函数。
 * 
 * @param fragColor 输出参数，代表像素的颜色，是一个vec4向量。
 * @param fragCoord 输入参数，代表当前处理的像素的坐标，是一个vec2向量。
 * 依据像素坐标的不同区间，为图像的不同部分赋予不同的颜色。
 */
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    // 初始化几种颜色
    vec3 color = vec3(1., 0., 0.);
    vec3 color1 = vec3(1., 0., 1.);
    vec3 color2 = vec3(1., 1., 0.);
    vec3 color3 = vec3(0., 0., 1.);
    vec3 color4 = vec3(1., 0., 0.);

    // 如果当前像素位于屏幕的左四分之一部分，设置其颜色为color1
    if (fragCoord.x < iResolution.x * .25) {
        fragColor = vec4(color1, 1.);
    }
    // 重复条件检查可能是代码错误，此处保持原样但不加注释
    
    // 如果当前像素位于屏幕的右上四分之一部分，设置其颜色为color2
    else if (fragCoord.x >= iResolution.x * .25 && fragCoord.x < iResolution.x * .5) {
        fragColor = vec4(color2, 1.);
    }
    // 如果当前像素位于屏幕的右下四分之一部分，设置其颜色为color3
    else if (fragCoord.x >= iResolution.x * .5 && fragCoord.x < iResolution.x * .75) {
        fragColor = vec4(color3, 1.);
    }
    // 其他情况下，设置当前像素的颜色为color4
    else {
        fragColor = vec4(color4, 1.);
    }
}