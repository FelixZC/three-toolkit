/**
 * 将笛卡尔坐标转换为极坐标
 * @param uv 输入的二维笛卡尔坐标（x, y）
 * @return 返回包含角度（phi）和半径（r）的二维极坐标
 */
vec2 cart2polar(vec2 uv){
    float phi=atan(uv.y,uv.x); // 计算角度
    float r=length(uv); // 计算半径
    return vec2(phi,r);
}

/**
 * 主图像函数，负责处理图像渲染
 * @param fragColor 输出的颜色值
 * @param fragCoord 片元的坐标
 */
void mainImage(out vec4 fragColor,in vec2 fragCoord){
    vec2 uv=fragCoord/iResolution.xy; // 将片元坐标转换为归一化设备坐标
    uv=(uv-.5)*2.; // 应用镜头缩放和偏移
    uv.x*=iResolution.x/iResolution.y; // 修正长宽比
    uv=cart2polar(uv); // 将笛卡尔坐标转换为极坐标
    // 以下代码块用于调试和实验不同的颜色表现形式
    // fragColor=vec4(uv,0.,1.); // 直接使用极坐标作为颜色
    // float c=sin(uv.x*12.); // 试验正弦波颜色
    float c=sin(uv.y*20.+uv.x); // 使用复合正弦波生成颜色
    fragColor=vec4(vec3(c),1.); // 设置最终颜色
} 