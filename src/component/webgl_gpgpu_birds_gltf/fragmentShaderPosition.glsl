// 定义全局变量time，用于表示时间的流逝
uniform float time;
// 定义全局变量delta，表示时间的增量
uniform float delta;

// 主函数，执行片段着色器的主要逻辑
void main(){
  // 将片段的坐标归一化到[0, 1]区间
  vec2 uv=gl_FragCoord.xy/resolution.xy;
  // 从纹理中采样得到片段的位置信息
  vec4 tmpPos=texture2D(texturePosition,uv);
  // 提取位置信息的xyz分量
  vec3 position=tmpPos.xyz;
  // 从纹理中采样得到片段的速度信息
  vec3 velocity=texture2D(textureVelocity,uv).xyz;

  // 提取位置信息的w分量，表示相位
  float phase=tmpPos.w;

  // 更新相位，基于时间增量和速度计算新的相位
  phase=mod((phase+delta+length(velocity.xz)*delta*3.+max(velocity.y,0.)*delta*6.),62.83);

  // 根据速度和时间增量更新片段的位置，同时存储相位信息
  gl_FragColor=vec4(position+velocity*delta*15.,phase);
}
