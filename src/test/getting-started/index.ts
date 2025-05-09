import fragmentShaderSource from "@/shaders/getting-started/uniforms/example3.glsl";
import * as THREE from "three";
// 初始化场景、相机、渲染器
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const uniforms = {
  u_resolution: {
    value: new THREE.Vector2(window.innerWidth, window.innerHeight),
  },
  u_time: {
    value: 0.0,
  },
  u_mouse: {
    value: new THREE.Vector2(0, 0),
  },
};

// 创建自定义着色器材质
const customMaterial = new THREE.ShaderMaterial({
  // vertexShader:vertexShaderSource, //使用默认顶点着色器
  fragmentShader: fragmentShaderSource,
  uniforms: uniforms,
});

// 创建一个简单的几何体并应用着色器材质
const geometry = new THREE.BoxGeometry(1, 1, 1);
const cube = new THREE.Mesh(geometry, customMaterial);
scene.add(cube);

// 设置相机位置
camera.position.z = 5;
const clock = new THREE.Clock();
animate();
// 渲染循环
function animate() {
  requestAnimationFrame(animate);
  uniforms.u_time.value = clock.getElapsedTime();
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();
