// 主渲染函数
//
// 参数:
//   uSize: uniform变量，用于控制点的大小。
//   uResolution: uniform变量，表示渲染目标的分辨率。
//   uProgress: uniform变量，表示当前的进度，用于驱动动画。
//   aSize: attribute变量，用于每个点的大小调整。
//   aTimeMultiplier: attribute变量，用于时间加速或减速。
//
// 返回值: 无

uniform float uSize;
uniform vec2 uResolution;
uniform float uProgress;

attribute float aSize;
attribute float aTimeMultiplier;


#include ../includes/remap.glsl;


void main() {
  // 计算当前进度，考虑时间加速
  float progress = uProgress * aTimeMultiplier;

  // 初始化新的位置向量
  vec3 newPosition = position;

  // 处理爆炸效果，根据进度改变物体位置
  float explodingProgress = remap(progress, 0.0, 0.1, 0.0, 1.0);
  explodingProgress = clamp(explodingProgress, 0.0, 1.0);
  explodingProgress = 1.0 - pow(1.0 - explodingProgress, 3.0);
  newPosition = mix(vec3(0.0), newPosition, explodingProgress);

  // 处理下落效果，根据进度调整位置
  float fallingProgress = remap(progress, 0.1, 1.0, 0.0, 1.0);
  fallingProgress = clamp(fallingProgress, 0.0, 1.0);
  fallingProgress = 1.0 - pow(1.0 - fallingProgress, 3.0);
  newPosition.y -= fallingProgress * 0.2;

  // 处理缩放效果，根据进度调整大小
  float sizeOpeningProgress = remap(progress, 0.0, 0.125, 0.0, 1.0);
  float sizeClosingProgress = remap(progress, 0.125, 1.0, 1.0, 0.0);
  float sizeProgress = min(sizeOpeningProgress, sizeClosingProgress);
  sizeProgress = clamp(sizeProgress, 0.0, 1.0);
  
  // 处理闪烁效果，根据进度调整大小
  float twinklingProgress = remap(progress, 0.2, 0.8,  0.0, 1.0);
  twinklingProgress = clamp(twinklingProgress, 0.0, 1.0);
  float sizeTwinkling = sin(progress * 30.0) * 0.5 + 0.5;
  sizeTwinkling = 1.0 - sizeTwinkling * twinklingProgress;

  // 计算最终的模型位置，并应用到齐次坐标中
  vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  gl_Position = projectionMatrix * viewPosition;

  // 计算并设置最终的点大小
  gl_PointSize = uSize * uResolution.y * aSize * sizeProgress * sizeTwinkling;
  gl_PointSize *= 1.0 / - viewPosition.z;
  // 如果点大小小于1.0，则移除该点的渲染
  if(gl_PointSize < 1.0) {
    gl_Position = vec4(9999.9);
  }
  
}