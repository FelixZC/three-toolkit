/**
 * 将给定的值从一个原始范围映射到一个新的目标范围。
 * 
 * @param value 需要被映射的原始值。
 * @param originMin 原始范围的最小值。
 * @param originMax 原始范围的最大值。
 * @param destinationMin 目标范围的最小值。
 * @param destinationMax 目标范围的最大值。
 * @return 映射到目标范围后的新值。
 */
float remap(float value, float originMin, float originMax, float destinationMin, float destinationMax) {
  // 计算并返回映射后的值
  return destinationMin + (value - originMin) * (destinationMax - destinationMin)  / (originMax - originMin);
}