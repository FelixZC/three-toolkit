/**
 * 将RGB颜色值转换为HSV颜色值
 * @param {number} r - 红色通道的值，范围为0-255
 * @param {number} g - 绿色通道的值，范围为0-255
 * @param {number} b - 蓝色通道的值，范围为0-255
 * @returns {Array} - 返回HSV颜色值的数组，范围分别为[0,360]、[0,100]、[0,100]
 */
export function rgbToHsv(r: number, g: number, b: number) {
  // 标准化RGB值到0-1范围
  r /= 255;
  g /= 255;
  b /= 255;

  // 寻找RGB中的最大值和最小值，以及确定明度v
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let [h, s, v] = [max, max, max];

  // 计算色调和饱和度
  const delta = max - min;
  s = max === 0 ? 0 : delta / max;

  // 根据最大值和最小值计算色调h
  if (max === min) {
    h = 0; // 无色
  } else {
    switch (max) {
      case r:
        h = (g - b) / delta + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / delta + 2;
        break;
      case b:
        h = (r - g) / delta + 4;
        break;
    }
    h /= 6;
  }

  // 返回HSV颜色值
  return [h * 360, s * 100, v * 100];
}

/**
 * 将HSV颜色值转换为RGB颜色值
 * @param {number} h - 色调值，范围为0-360
 * @param {number} s - 饱和度值，范围为0-100
 * @param {number} v - 明度值，范围为0-100
 * @returns {Array} - 返回RGB颜色值的数组，范围分别为0-255
 */
export function hsvToRgb(h: number, s: number, v: number) {
  // 调整色调、饱和度和明度到合适的范围
  h /= 60; // 色调转换到[0,6]区间
  s /= 100; // 饱和度转换到[0,1]
  v /= 100; // 明度转换到[0,1]

  // 计算RGB值
  let i = Math.floor(h);

  let f = h - i;
  let p = v * (1 - s);
  let q = v * (1 - s * f);
  let t = v * (1 - s * (1 - f));

  // 根据色调值i和剩余部分f，计算RGB颜色
  switch (i % 6) {
    case 0:
      return [v, t, p];
    case 1:
      return [q, v, p];
    case 2:
      return [p, v, t];
    case 3:
      return [p, q, v];
    case 4:
      return [t, p, v];
    default:
      return [v, p, q];
  }
}
