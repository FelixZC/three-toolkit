**GLSL**（OpenGL Shading Language）是一种用于编写着色器程序的语言，它允许开发者直接控制图形硬件的渲染过程。GLSL提供了一系列内置函数，用于简化数学和几何计算，以及纹理采样等常见任务。以下是一些主要的GLSL内置函数分类及其描述：

### 几何函数
- `radians(angle)`：将角度转换为弧度。
- `degrees(radian)`：将弧度转换为角度。
- `sin(angle)`：计算给定角度的正弦值。
- `cos(angle)`：计算给定角度的余弦值。
- `tan(angle)`：计算给定角度的正切值。
- `asin(value)`：计算反正弦值，返回范围在 [-π/2, π/2] 的弧度值。
- `acos(value)`：计算反余弦值，返回范围在 [0, π] 的弧度值。
- `atan(y, x)`：计算反正切值，返回范围在 [-π, π] 的弧度值。
- `atan(y_over_x)`：计算反正切值，返回范围在 [-π/2, π/2] 的弧度值。

### 基本数学函数函数和变量操作
- `abs(value)`：返回value的绝对值。
- `sign(value)`：返回value的符号（-1, 0, 1）。
- `floor(value)`：向下取整到最接近的整数。
- `ceil(value)`：向上取整到最接近的整数。
- `fract(value)`：返回value的小数部分。
- `trunc(x)`: 返回x的整数部分。
- `round(x)`: 四舍五入到最接近的整数。
- `mod(x, y)`: 返回x除以y的余数。
- `min(x, y)`: 返回x和y中的较小值。
- `max(x, y)`: 返回x和y中的较大值。
- `clamp(x, minVal, maxVal)`: 将x限制在[minVal, maxVal]之间。
- `pow(base, exponent)`：计算基数的指数次幂。
- `exp(value)`：计算自然对数底数e的value次幂。
- `log(value)`：计算value的自然对数值。
- `exp2(value)`：计算2的value次幂。
- `log2(value)`：计算value的以2为底的对数值。
- `sqrt(value)`：计算value的平方根。
- `inversesqrt(value)`：计算value平方根的倒数。
-
### 向量和矩阵函数
- `dot(v1, v2)`：计算两个向量的点积。
- `cross(v1, v2)`：计算两个向量的叉积，仅适用于vec3类型。
- `length(vector)`：计算向量的长度。
- `distance(p1, p2)`：计算两点之间的距离。
- `normalize(vector)`：归一化向量，使其长度为1。
- `faceforward(N, I, Nref)`：如果Nref·I小于零，则返回N，否则返回-N。
- `reflect(I, N)`：计算入射向量I关于法线N的反射向量。
- `refract(I, N, eta)`：计算入射向量I通过法线N折射后的向量，eta是折射率。

### 条件和混合函数
- `mix(x, y, a)`：线性插值函数，返回x和y之间基于权重a的插值。
- `step(edge, x)`：阶跃函数，如果x小于edge则返回0，否则返回1。
- `smoothstep(edge0, edge1, x)`：平滑阶跃函数，返回x在edge0和edge1之间的平滑过渡值。

### 衍生函数
- `texture(sampler, coord)`：从纹理采样器中采样颜色。
- `dFdx(expression)`：计算表达式在水平方向上的偏导数。
- `dFdy(expression)`：计算表达式在垂直方向上的偏导数。

### 其他函数
- `discard`: 丢弃当前像素/顶点。
- `any(bvec)`: 如果向量中有任何元素为true，则返回true。
- `all(bvec)`: 如果向量中所有元素都为true，则返回true。
- `bool(x)`: 转换为布尔值，非零视为true。
- `int(x)`: 转换为整数。
- `uint(x)`: 转换为无符号整数。
- `float(x)`: 转换为浮点数。
- `vecN(vecM)`: 转换向量类型。
- `matN(vecM)`: 创建矩阵。
- `matN(row0, row1, ..., rowN)`: 创建矩阵，行向量作为参数。
- `transpose(mat)`: 矩阵转置。
- `outerProduct(vecA, vecB)`: 外积，产生一个矩阵。
- `matrixCompMult(matA, matB)`: 矩阵元素乘积。
- `inverse(mat)`: 矩阵逆。
- `determinant(mat)`: 矩阵行列式。

#### 纹理和图像函数
- `texture(sampler, coord)`: 从纹理采样。
- `textureProj(sampler, coord)`: 从纹理采样，考虑投影坐标。
- `textureLod(sampler, coord, lod)`: 从纹理采样，指定细节级别。
- `textureOffset(sampler, coord, offset)`: 从纹理采样，指定偏移量。
- `textureGrad(sampler, coord, dPdx, dPdy)`: 从纹理采样，指定梯度。
- `imageLoad(image, coord)`: 从图像单元加载像素。
- `imageStore(image, coord, color)`: 将颜色存储到图像单元的像素。

请注意，不同的GLSL版本和实现可能会有不同的内置函数集合，上述列表基于GLSL 1.20标准，但许多现代GPU支持更高版本的GLSL，提供了更多的功能和优化。例如，GLSL 4.50增加了更多高级函数，如双精度浮点运算和矩阵函数等。在编写着色器时，应参考特定GLSL版本的官方文档以确保正确性和兼容性。
