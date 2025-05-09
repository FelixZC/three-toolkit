// 此片段着色器程序用于计算像素的最终颜色。
// 它接受来自外部的纹理和一个颜色参数，将它们组合起来并应用色调映射和颜色空间转换。

// 程序全局变量声明部分：
// uColor: 一个三维向量，用于指定颜色。这是个统一变量，可以在程序运行时从外部改变。
// uTexture: 一个2D纹理采样器，用于读取纹理颜色。这也是个统一变量，其值可以在程序运行时改变。

uniform vec3 uColor;
uniform sampler2D uTexture;

void main(){
  // 从纹理采样器中读取当前像素的Alpha值
  float textureAlpha = texture(uTexture, gl_PointCoord).r;
  
  // 将指定的颜色与从纹理读取的Alpha值组合，形成最终的颜色向量。
  gl_FragColor = vec4(uColor, textureAlpha);
  // 应用色调映射以调整图像的亮度和对比度，以适应显示设备的特性。
  #include <tonemapping_fragment>
  // 应用颜色空间转换，例如从线性颜色空间转换到非线性颜色空间，以匹配人类视觉系统的预期。
  #include <colorspace_fragment>
}