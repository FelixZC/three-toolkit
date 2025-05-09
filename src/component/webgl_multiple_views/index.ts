

import * as THREE from 'three';

import Stats from 'stats.js'
let stats: Stats;

let scene: THREE.Scene, renderer: THREE.WebGLRenderer;

let mouseX = 0, mouseY = 0;

let windowWidth: number, windowHeight: number;

interface ViewConfig {
  left: number;
  bottom: number;
  width: number;
  height: number;
  background: THREE.Color;
  eye: [number, number, number];
  up: [number, number, number];
  fov: number;
  camera?: THREE.PerspectiveCamera
  updateCamera: (camera: THREE.PerspectiveCamera, scene: THREE.Scene, mouseX: number, mouseY: number) => void;
}

// 定义视图数组，用于存储不同摄像机的视图配置
const views: ViewConfig[] = [
  {
    // 视图1的配置
    left: 0, // 视图左边距
    bottom: 0, // 视图下边距
    width: 0.5, // 视图宽度
    height: 1.0, // 视图高度
    background: new THREE.Color().setRGB(0.5, 0.5, 0.7, THREE.SRGBColorSpace), // 背景颜色
    eye: [0, 300, 1800], // 摄像机位置
    up: [0, 1, 0], // 摄像机的向上方向
    fov: 30, // 摄像机的视野角度
    updateCamera: function (camera, scene, mouseX) {
      // 更新摄像机位置和方向的函数
      camera.position.x += mouseX * 0.05; // 根据鼠标X轴移动摄像机位置
      camera.position.x = Math.max(Math.min(camera.position.x, 2000), -2000); // 限制摄像机位置范围
      camera.lookAt(scene.position); // 摄像机看向场景中心
    }
  },
  {
    // 视图2的配置
    left: 0.5, // 视图左边距
    bottom: 0, // 视图下边距
    width: 0.5, // 视图宽度
    height: 0.5, // 视图高度
    background: new THREE.Color().setRGB(0.7, 0.5, 0.5, THREE.SRGBColorSpace), // 背景颜色
    eye: [0, 1800, 0], // 摄像机位置
    up: [0, 0, 1], // 摄像机的向上方向
    fov: 45, // 摄像机的视野角度
    updateCamera: function (camera, scene, mouseX) {
      // 更新摄像机位置和方向的函数
      camera.position.x -= mouseX * 0.05; // 根据鼠标X轴移动摄像机位置
      camera.position.x = Math.max(Math.min(camera.position.x, 2000), -2000); // 限制摄像机位置范围
      camera.lookAt(camera.position.clone().setY(0)); // 摄像机看向其正下方的点
    }
  },
  {
    // 视图3的配置
    left: 0.5, // 视图左边距
    bottom: 0.5, // 视图下边距
    width: 0.5, // 视图宽度
    height: 0.5, // 视图高度
    background: new THREE.Color().setRGB(0.5, 0.7, 0.7, THREE.SRGBColorSpace), // 背景颜色
    eye: [1400, 800, 1400], // 摄像机位置
    up: [0, 1, 0], // 摄像机的向上方向
    fov: 60, // 摄像机的视野角度
    updateCamera: function (camera, scene, mouseX) {
      // 更新摄像机位置和方向的函数
      camera.position.y -= mouseX * 0.05; // 根据鼠标X轴移动摄像机位置
      camera.position.y = Math.max(Math.min(camera.position.y, 1600), -1600); // 限制摄像机位置范围
      camera.lookAt(scene.position); // 摄像机看向场景中心
    }
  }
];

// 初始化场景和动画
init();
animate();

// 初始化函数，设置场景、摄像机、光源和物体
function init() {
  // 获取容器元素
  const container = document.getElementById('container') as HTMLElement;

  // 遍历视图数组，为每个视图创建摄像机
  for (let ii = 0; ii < views.length; ++ii) {
    const view = views[ii];
    // 创建透视摄像机
    const camera = new THREE.PerspectiveCamera(view.fov, window.innerWidth / window.innerHeight, 1, 10000);
    // 设置摄像机位置
    camera.position.fromArray(view.eye);
    // 设置摄像机朝向
    camera.up.fromArray(view.up);
    // 将摄像机添加到视图对象
    view.camera = camera;
  }

  // 创建场景
  scene = new THREE.Scene();

  // 创建平行光
  const light = new THREE.DirectionalLight(0xffffff, 3);
  // 设置光源位置
  light.position.set(0, 0, 1);
  // 将光源添加到场景中
  scene.add(light);

  // 创建阴影效果的画布
  const canvas = document.createElement('canvas');
  // 设置画布大小
  canvas.width = 128;
  canvas.height = 128;

  // 获取画布的2D绘图上下文
  const context = canvas.getContext('2d') as CanvasRenderingContext2D;
  // 创建径向渐变效果
  const gradient = context.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
  // 设置渐变颜色
  gradient.addColorStop(0.1, 'rgba(0,0,0,0.15)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');

  // 设置画布的渐变效果为填充样式
  context.fillStyle = gradient;
  // 绘制渐变效果到整个画布
  context.fillRect(0, 0, canvas.width, canvas.height);

  // 创建阴影的纹理
  const shadowTexture = new THREE.CanvasTexture(canvas);

  // 创建阴影的材质
  const shadowMaterial = new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true });
  // 创建阴影的几何体
  const shadowGeo = new THREE.PlaneGeometry(300, 300, 1, 1);

  // 创建阴影的网格模型，并添加到场景中
  let shadowMesh = new THREE.Mesh(shadowGeo, shadowMaterial);
  shadowMesh.position.y = - 250;
  shadowMesh.rotation.x = - Math.PI / 2;
  scene.add(shadowMesh);

  // 重复创建并放置阴影网格模型
  shadowMesh = new THREE.Mesh(shadowGeo, shadowMaterial);
  shadowMesh.position.x = - 400;
  shadowMesh.position.y = - 250;
  shadowMesh.rotation.x = - Math.PI / 2;
  scene.add(shadowMesh);

  shadowMesh = new THREE.Mesh(shadowGeo, shadowMaterial);
  shadowMesh.position.x = 400;
  shadowMesh.position.y = - 250;
  shadowMesh.rotation.x = - Math.PI / 2;
  scene.add(shadowMesh);

  // 创建球体几何体
  const radius = 200;
  const geometry1 = new THREE.IcosahedronGeometry(radius, 1);

  // 设置球体顶点颜色
  const count = geometry1.attributes.position.count;
  geometry1.setAttribute('color', new THREE.BufferAttribute(new Float32Array(count * 3), 3));

  // 克隆球体几何体
  const geometry2 = geometry1.clone();
  const geometry3 = geometry1.clone();

  // 设置球体颜色
  const color = new THREE.Color();
  const positions1 = geometry1.attributes.position;
  const positions2 = geometry2.attributes.position;
  const positions3 = geometry3.attributes.position;
  const colors1 = geometry1.attributes.color;
  const colors2 = geometry2.attributes.color;
  const colors3 = geometry3.attributes.color;

  for (let i = 0; i < count; i++) {
    // 根据球体位置设置颜色
    color.setHSL((positions1.getY(i) / radius + 1) / 2, 1.0, 0.5, THREE.SRGBColorSpace);
    colors1.setXYZ(i, color.r, color.g, color.b);

    color.setHSL(0, (positions2.getY(i) / radius + 1) / 2, 0.5, THREE.SRGBColorSpace);
    colors2.setXYZ(i, color.r, color.g, color.b);

    color.setRGB(1, 0.8 - (positions3.getY(i) / radius + 1) / 2, 0, THREE.SRGBColorSpace);
    colors3.setXYZ(i, color.r, color.g, color.b);
  }

  // 创建材质
  const material = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    flatShading: true,
    vertexColors: true,
    shininess: 0
  });

  // 创建线框材质
  const wireframeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true, transparent: true });

  // 创建网格模型，并添加线框，然后添加到场景中
  let mesh = new THREE.Mesh(geometry1, material);
  let wireframe = new THREE.Mesh(geometry1, wireframeMaterial);
  mesh.add(wireframe);
  mesh.position.x = - 400;
  mesh.rotation.x = - 1.87;
  scene.add(mesh);

  mesh = new THREE.Mesh(geometry2, material);
  wireframe = new THREE.Mesh(geometry2, wireframeMaterial);
  mesh.add(wireframe);
  mesh.position.x = 400;
  scene.add(mesh);

  mesh = new THREE.Mesh(geometry3, material);
  wireframe = new THREE.Mesh(geometry3, wireframeMaterial);
  mesh.add(wireframe);
  scene.add(mesh);

  // 创建渲染器，并设置到容器中
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  // 添加性能统计工具
  stats = new Stats();
  container.appendChild(stats.dom);

  // 添加鼠标移动事件监听
  document.addEventListener('mousemove', onDocumentMouseMove);
}

// 鼠标移动事件处理函数
function onDocumentMouseMove(event: MouseEvent) {
  // 更新鼠标位置变量
  mouseX = (event.clientX - windowWidth / 2);
  mouseY = (event.clientY - windowHeight / 2);
}

// 更新窗口大小
function updateSize() {
  // 检查并更新窗口尺寸
  if (windowWidth != window.innerWidth || windowHeight != window.innerHeight) {
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
    renderer.setSize(windowWidth, windowHeight);
  }
}

// 动画循环函数
function animate() {
  // 执行渲染和性能统计更新，并请求下一帧
  render();
  stats.update();
  requestAnimationFrame(animate);
}

// 渲染函数
function render() {
  // 更新窗口大小
  updateSize();
  // 遍历视图数组，设置并渲染每个视图
  for (let ii = 0; ii < views.length; ++ii) {
    const view = views[ii];
    const camera = view.camera as THREE.PerspectiveCamera;
    // 更新摄像机位置
    view.updateCamera(camera, scene, mouseX, mouseY);
    // 设置视图区域
    const left = Math.floor(windowWidth * view.left);
    const bottom = Math.floor(windowHeight * view.bottom);
    const width = Math.floor(windowWidth * view.width);
    const height = Math.floor(windowHeight * view.height);
    // 设置渲染视口
    renderer.setViewport(left, bottom, width, height);
    // 设置剪裁区域
    renderer.setScissor(left, bottom, width, height);
    // 启用剪裁测试
    renderer.setScissorTest(true);
    // 设置清除颜色
    renderer.setClearColor(view.background);
    // 更新摄像机投影矩阵
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    // 渲染当前视图
    renderer.render(scene, camera);
  }
}

