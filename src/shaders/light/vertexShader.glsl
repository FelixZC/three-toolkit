
uniform float iTime;
uniform vec3 iResolution;
uniform vec4 iMouse;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;

// 主渲染函数
// 参数：
// - iTime: 浮点型，统一变量，表示当前时间
// - iResolution: 三维向量，统一变量，表示渲染分辨率
// - iMouse: 四维向量，统一变量，表示鼠标位置信息
// - vUv: 二维向量，变化变量，表示UV纹理坐标
// - vNormal: 三维向量，变化变量，表示表面法线方向
// - vWorldPosition: 三维向量，变化变量，表示物体在世界空间中的位置
void main(){
    vec3 p = position; // 获取顶点位置
    // 计算并设置最终的屏幕坐标
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
    
    vUv = uv; // 设置UV坐标
    // 计算并设置表面法线方向，首先变换到模型空间
    vNormal = (modelMatrix * vec4(normal, 0.)).xyz;
    // 计算并设置顶点在世界空间中的位置
    vWorldPosition = vec3(modelMatrix * vec4(p, 1));
}