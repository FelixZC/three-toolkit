
// 导入Three.js库
import * as THREE from 'three';
// 导入OrbitControls模块，用于实现轨道控制
import { OrbitControls } from 'three-stdlib'

// 定义变量，用于存储DOM容器、相机、渲染器和控制对象
let container: HTMLElement, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, controls: OrbitControls;
let sceneL: THREE.Scene, sceneR: THREE.Scene;

// 定义滑块位置变量，初始值为窗口宽度的一半
let sliderPos = window.innerWidth / 2;

// 初始化函数
init();

function init() {
  // 获取HTML中的容器元素
  container = document.querySelector('.container') as HTMLElement;

  // 创建左侧场景，并设置背景颜色
  sceneL = new THREE.Scene();
  sceneL.background = new THREE.Color(0xBCD48F);

  // 创建右侧场景，并设置背景颜色
  sceneR = new THREE.Scene();
  sceneR.background = new THREE.Color(0x8FBCD4);

  // 创建相机对象，设置视角、宽高比、近平面和远平面
  camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 6;

  // 创建轨道控制对象，用于控制相机
  controls = new OrbitControls(camera, container);

  // 创建环境光对象，设置颜色和强度，并添加到两个场景中
  const light = new THREE.HemisphereLight(0xffffff, 0x444444, 3);
  light.position.set(- 2, 2, 2);
  sceneL.add(light.clone());
  sceneR.add(light.clone());

  // 初始化网格模型
  initMeshes();
  // 初始化滑块交互
  initSlider();

  // 创建WebGL渲染器，并设置抗锯齿
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setScissorTest(true);
  renderer.setAnimationLoop(render);
  container.appendChild(renderer.domElement);

  // 监听窗口大小改变事件，以调整渲染器和相机
  window.addEventListener('resize', onWindowResize);

}

function initMeshes() {
  // 创建几何体和材质，生成左侧和右侧场景的网格模型
  const geometry = new THREE.IcosahedronGeometry(1, 3);

  const meshL = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
  sceneL.add(meshL);

  const meshR = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ wireframe: true }));
  sceneR.add(meshR);

}

function initSlider() {
  // 获取HTML中的滑块元素，并定义其交互行为
  const slider = document.querySelector('.slider') as HTMLElement;

  function onPointerDown(event: PointerEvent) {
    if (event.isPrimary === false) return;

    controls.enabled = false;

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

  }

  function onPointerUp() {
    controls.enabled = true;

    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);

  }

  function onPointerMove(event: PointerEvent) {
    if (event.isPrimary === false) return;

    sliderPos = Math.max(0, Math.min(window.innerWidth, event.pageX));

    slider.style.left = sliderPos - (slider.offsetWidth / 2) + 'px';

  }

  slider.style.touchAction = 'none'; // 禁用触摸滚动
  slider.addEventListener('pointerdown', onPointerDown);

}

function onWindowResize() {
  // 窗口大小改变时，调整相机的宽高比和渲染器的大小
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}

function render() {
  // 使用剪裁技术，先渲染左侧场景，再渲染右侧场景
  renderer.setScissor(0, 0, sliderPos, window.innerHeight);
  renderer.render(sceneL, camera);

  renderer.setScissor(sliderPos, 0, window.innerWidth, window.innerHeight);
  renderer.render(sceneR, camera);

}

