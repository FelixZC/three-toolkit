export function getRandomColor() {
    // 生成6位随机的16进制颜色代码
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += Math.floor(Math.random() * 16).toString(16);
    }
    return color;
}