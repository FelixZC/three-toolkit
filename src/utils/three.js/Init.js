import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';

/**
 * 一个用于创建和管理 Three.js 场景的基类。
 */
export default class ThreeDemo {
    /**
     * 构造函数，初始化类的基本属性。
     */
    constructor() {
        // 获取当前浏览器窗口的尺寸和设备像素比
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.aspectRatio = this.width / this.height;
        this.devicePixelRatio = window.devicePixelRatio;

        // 初始化对象属性
        this.scene = null;
        this.camera = null;
        this.light = null;
        this.renderer = null;

        // 检查 WebGL 是否可用
        if (!WebGL.isWebGLAvailable()) {
            const warning = WebGL.getWebGLErrorMessage();
            document.getElementById('three-canvas-container').appendChild(warning);
            throw new Error('WebGL is not available.');
        }
    }

    /**
     * 设置并配置 WebGL 渲染器。
     */
    setUpRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
        });

        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(this.devicePixelRatio);

        // 设置渲染器背景颜色为雾的颜色
        this.renderer.setClearColor(this.scene.fog.color);

        // 添加窗口 resize 事件监听器，动态调整渲染器和相机尺寸
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    /**
     * 创建并配置透视相机。
     */
    setUpCamera() {
        this.camera = new THREE.PerspectiveCamera(
            90, // 视角（垂直视角）
            this.aspectRatio, // 窗口宽高比
            0.1, // 近裁剪面距离
            100 // 远裁剪面距离
        );

        this.camera.position.set(1, 1, 4); // 设置相机初始位置
        this.camera.aspect = this.aspectRatio; // 更新相机宽高比（可能已改变）
        this.camera.updateProjectionMatrix(); // 应用新的投影矩阵

        // 将相机添加到场景中
        this.scene.add(this.camera);
    }

    /**
     * 创建并配置场景照明。
     */
    setUpLighting() {
        // 创建环境光，提供全局、柔和的光照效果
        this.light = new THREE.AmbientLight(0x404040);

        // 创建定向光，模拟来自特定方向的强烈光照
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        this.directionalLight.position.set(0, 5, 5); // 设置光源方向

        // 将灯光添加到场景中
        this.scene.add(this.light);
        this.scene.add(this.directionalLight);
    }

    /**
     * 创建并配置场景本身，包括雾效。
     */
    setUpScene() {
        this.scene = new THREE.Scene();

        // 添加雾效，模拟远处物体逐渐消失的效果
        this.scene.fog = new THREE.Fog(0x090918, 1, 600); // 雾的颜色、开始距离和结束距离
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
     * 添加平面辅助，以三维形式显示一个平面，便于查看平面的法线方向和尺寸。
     *
     * @param {THREE.Plane} plane 需要显示辅助的平面对象
     * @param {number} [size=1] 辅助线的大小
     * @param {number} [hexColor1=0xffff00] 平面法线方向的辅助线颜色（十六进制）
     * @param {number} [hexColor2=0x0000ff] 平面切线方向的辅助线颜色（十六进制）
     */
    addPlaneHelper(plane, size = 1, hexColor1 = 0xffff00, hexColor2 = 0x0000ff) {
        const planeHelper = new THREE.PlaneHelper(plane, size, hexColor1, hexColor2);
        this.scene.add(planeHelper);
    }

    /**
     * 添加点光源辅助，以小球和射线的形式展示点光源的位置和照射方向。
     *
     * @param {THREE.PointLight} light 需要显示辅助的点光源对象
     * @param {number} [sphereSize=0.75] 点光源小球的大小
     */
    addPointLightHelper(light, sphereSize = 0.75) {
        const pointLightHelper = new THREE.PointLightHelper(light, sphereSize);
        this.scene.add(pointLightHelper);
    }

    /**
     * 添加聚光灯辅助，以圆锥体和射线的形式展示聚光灯的位置、照射方向和角度。
     *
     * @param {THREE.SpotLight} light 需要显示辅助的聚光灯对象
     * @param {number} [sphereSize=0.5] 聚光灯小球的大小
     */
    addSpotLightHelper(light, sphereSize = 0.5) {
        const spotLightHelper = new THREE.SpotLightHelper(light, sphereSize);
        this.scene.add(spotLightHelper);
    }

    /**
     * 添加方向光辅助，以长方体和射线的形式展示方向光的方向。
     *
     * @param {THREE.DirectionalLight} light 需要显示辅助的方向光对象
     * @param {number} [size=1] 方向光长方体的大小
     */
    addDirectionalLightHelper(light, size = 1) {
        const directionalLightHelper = new THREE.DirectionalLightHelper(light, size);
        this.scene.add(directionalLightHelper);
    }

    /**
     * 添加相机辅助，以线框形式展示相机的视椎体和视野范围。
     *
     * @param {THREE.Camera} camera 需要显示辅助的相机对象
     */
    addCameraHelper(camera) {
        const cameraHelper = new THREE.CameraHelper(camera);
        this.scene.add(cameraHelper);
    }

    /**
     * 启动渲染循环，不断更新并呈现场景。
     */
    animate() {
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * 初始化整个场景，包括设置渲染器、相机、灯光、场景本身，以及添加辅助工具。
     */
    init() {
        if (!WebGL.isWebGLAvailable()) {
            return;
        }

        this.setUpScene();
        this.setUpCamera();
        this.setUpLighting();
        this.setUpRenderer();

        // 选择性添加所需的辅助工具
        this.addAxesHelper();
        this.addGridHelper(200, 20);
        this.addCameraHelper(this.camera);

        // 将渲染器的 DOM 元素附加到网页上
        document.body.appendChild(this.renderer.domElement);

        // 启动渲染循环
        this.animate();
    }
}