import GUI from "lil-gui";
import { OrbitControls } from "three-stdlib";
import Stats from "stats.js";
import * as THREE from "three";
interface ThreeDemoConfig {
  isSetUpStats?: boolean;
  isSetUpControls?: boolean;
  isAddAxesHelper?: boolean;
  isAddGridHelper?: boolean;
  isAddCameraHelper?: boolean;
  isSetUpGUI?: boolean;
}

/**
 *  ThreeDemo类用于创建和管理一个Three的3D渲染场景。
 *  @param {string} containerId - 用于包裹Three渲染循环的HTML容器元素的ID，默认为"container"。
 *  @returns {Base} 返回ThreeDemo的实例。
 */
export default class Base {
  container: HTMLElement | null;
  width: number;
  height: number;
  aspectRatio: number;
  devicePixelRatio: number;
  resolution: THREE.Vector3;
  gui: GUI; // 使用 ? 标记为可能未初始化的属性
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  config: ThreeDemoConfig;
  directionalLight: THREE.DirectionalLight;
  constructor(config: ThreeDemoConfig, containerId?: string);
  constructor(config: ThreeDemoConfig = {}, containerId: string = "container") {
    // 获取HTML容器元素，基于窗口大小初始化画布尺寸和宽高比。
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error("Container element not found.");
    }
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.aspectRatio = this.width / this.height;
    this.devicePixelRatio = window.devicePixelRatio;
    this.resolution = new THREE.Vector3(
      window.innerWidth,
      window.innerHeight,
      1,
    );
    // 初始化Three场景、相机和渲染器相关的属性。
    // 配置对象，用于控制各种设置的开启或关闭。
    this.config = {
      isSetUpStats: false,
      isSetUpControls: false,
      isAddAxesHelper: false,
      isAddGridHelper: false,
      isAddCameraHelper: false,
      isSetUpGUI: false,
      ...config,
    };
    this.init();
  }

  /**
   * 初始化 GUI 控制面板。
   */
  setUpGUI() {
    const gui = new GUI();
    this.gui = gui;
  }

  /**
   * 添加坐标轴辅助线，帮助识别场景中 XYZ 坐标的方向。
   *
   * @param {number} [size=5] 辅助线的长度
   */
  addAxesHelper(size = 5) {
    const axesHelper = new THREE.AxesHelper(size);
    this.scene.add(axesHelper);
  }

  /**
   * 添加网格辅助，帮助定位和对齐物体。
   *
   * @param {number} [size=100] 网格大小
   * @param {number} [divisions=10] 网格分割数（每边的细分数量）
   */
  addGridHelper(size = 100, divisions = 10) {
    const gridHelper = new THREE.GridHelper(size, divisions);
    this.scene.add(gridHelper);
  }

  /**
   * 添加相机辅助，以线框形式展示相机的视椎体和视野范围。
   *
   * @param {THREE.Camera} camera 需要显示辅助的相机对象
   */
  addCameraHelper(camera: THREE.Camera) {
    const cameraHelper = new THREE.CameraHelper(camera);
    this.scene.add(cameraHelper);
  }

  /**
   * 处理窗口大小改变事件，动态调整相机视角和渲染器尺寸。
   */
  handleWindowResize() {
    window.addEventListener("resize", () => {
      // 当窗口大小改变时，更新相机的宽高比并重新设置渲染器的大小
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  /**
   * 设置并初始化Three渲染器。
   */
  setUpRenderer() {
    // 创建WebGL渲染器并设置抗锯齿选项
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      logarithmicDepthBuffer: true,
    });
    // 获取场景和相机引用
    const scene = this.scene;
    const camera = this.camera;
    // 设置渲染器，并配置其输出编码、大小、像素比和清屏颜色
    this.renderer = renderer;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(this.devicePixelRatio);

    // 动态渲染循环
    function updateRender() {
      requestAnimationFrame(() => {
        renderer.render(scene, camera);
        updateRender();
      });
    }
    updateRender();
  }

  /**
   * 设置并初始化相机。
   */
  setUpCamera() {
    // 创建透视相机并设置其初始位置和参数
    this.camera = new THREE.PerspectiveCamera(90, this.aspectRatio, 0.1, 100);
    this.camera.position.set(5, 2, 8);
    this.camera.aspect = this.aspectRatio;
    // 将相机添加到场景中
    this.scene.add(this.camera);
  }

  /**
   * 设置并初始化相机控制。
   */
  async setUpControls() {
    // 创建并配置OrbitControls对象
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;

    // 动态更新控制
    function updateControls() {
      requestAnimationFrame(() => {
        controls.update();
        updateControls();
      });
    }
    updateControls();
  }

  /**
   * 设置Three场景，配置雾效。
   */
  setUpScene() {
    // 创建新的场景并设置雾效
    this.scene = new THREE.Scene();
  }

  /**
   * 设置并初始化性能统计器。
   */
  setUpStats() {
    // 创建Stats对象用于性能统计，并将其添加到页面中
    const stats = new Stats();
    this.container!.appendChild(stats.dom);

    // 动态更新统计信息
    function updateStats() {
      requestAnimationFrame(() => {
        stats.update();
        updateStats();
      });
    }
    updateStats();
  }

  /**
   * 初始化函数，用于设置3D场景的各种配置和元素。
   * @param {Object} config 配置对象，包含各种可选设置如是否设置控制、是否添加辅助轴等。
   *                        具体结构取决于应用需求。
   * @returns {undefined} 该函数没有返回值。
   */
  async init() {
    // 初始化场景、相机、光照和渲染器
    this.setUpScene();
    this.setUpCamera();
    this.setUpRenderer();

    // 根据配置，异步设置控制项
    if (this.config.isSetUpControls) {
      await this.setUpControls();
    }

    // 根据配置，异步添加坐标轴辅助工具
    if (this.config.isAddAxesHelper) {
      await this.addAxesHelper();
    }

    // 根据配置，添加网格辅助工具
    if (this.config.isAddGridHelper) {
      this.addGridHelper(200, 20);
    }

    // 根据配置，添加相机辅助工具
    if (this.config.isAddCameraHelper) {
      this.addCameraHelper(this.camera);
    }

    // 根据配置，设置图形用户界面
    if (this.config.isSetUpGUI) {
      this.setUpGUI();
    }

    // 根据配置，设置性能统计
    if (this.config.isSetUpStats) {
      this.setUpStats();
    }

    // 处理窗口大小调整事件，并将渲染器的DOM元素添加到容器中
    this.handleWindowResize();
    this.container!.appendChild(this.renderer.domElement);
  }
}
