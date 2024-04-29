precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute float size;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform float time; // 用于动画效果，由JavaScript传递

varying vec2 vUv;

void main() {
    vUv = uv;
    
    // 可以根据时间或其它因素调整粒子大小或位置，实现动态效果
    vec3 newPosition = position + vec3(sin(time + position.x) * 0.1, 0.0, 0.0);
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    gl_PointSize = size * 10.0; // 设置粒子大小
}