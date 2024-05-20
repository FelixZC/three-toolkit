export function getRandomColor() {
    // 生成6位随机的16进制颜色代码
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += Math.floor(Math.random() * 16).toString(16);
    }
    return color;
}

export function getFileNameFromLocalUrl(localUrl) {
    // 从路径中提取文件名
    var fileName = localUrl.split('/').pop(); // 使用pop方法直接取出最后一部分作为文件名
    // 返回文件名
    return fileName;
}