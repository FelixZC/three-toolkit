import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';
export default class ThreeDemo {
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

    setUpRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
        });

        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(this.devicePixelRatio);

        // 设置渲染器背景颜色为雾的颜色
        this.renderer.setClearColor(this.scene.fog.color);

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    setUpCamera() {
        this.camera = new THREE.PerspectiveCamera(
            90,
            this.aspectRatio,
            0.1,
            100
        );

        this.camera.position.set(1, 1, 4);
        this.camera.aspect = this.aspectRatio;
        this.camera.updateProjectionMatrix();

        this.scene.add(this.camera);
    }

    setUpLighting() {
        this.light = new THREE.AmbientLight(0x404040);
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        this.directionalLight.position.set(0, 5, 5);

        this.scene.add(this.light);
        this.scene.add(this.directionalLight);
    }

    setUpScene() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x090918, 1, 600);
    }


    // 添加辅助线
    addAxesHelper(size = 5) {
        const axesHelper = new THREE.AxesHelper(size);
        this.scene.add(axesHelper);
    }

    // 添加网格辅助（二维网格，帮助定位和对齐物体）
    addGridHelper(size = 100, divisions = 10) {
        const gridHelper = new THREE.GridHelper(size, divisions);
        this.scene.add(gridHelper);
    }

    // 添加平面辅助（三维形式显示一个平面，便于查看平面的法线方向和尺寸）
    addPlaneHelper(plane, size = 1, hexColor1 = 0xffff00, hexColor2 = 0x0000ff) {
        const planeHelper = new THREE.PlaneHelper(plane, size, hexColor1, hexColor2);
        this.scene.add(planeHelper);
    }

    // 添加点光源辅助（以小球和射线的形式展示点光源的位置和照射方向）
    addPointLightHelper(light, sphereSize = 0.75) {
        const pointLightHelper = new THREE.PointLightHelper(light, sphereSize);
        this.scene.add(pointLightHelper);
    }

    // 添加聚光灯辅助（以圆锥体和射线的形式展示聚光灯的位置、照射方向和角度）
    addSpotLightHelper(light, sphereSize = 0.5) {
        const spotLightHelper = new THREE.SpotLightHelper(light, sphereSize);
        this.scene.add(spotLightHelper);
    }

    // 添加方向光辅助（以长方体和射线的形式展示方向光的方向）
    addDirectionalLightHelper(light, size = 1) {
        const directionalLightHelper = new THREE.DirectionalLightHelper(light, size);
        this.scene.add(directionalLightHelper);
    }

    // 添加相机辅助（以线框形式展示相机的视椎体和视野范围）
    addCameraHelper(camera) {
        const cameraHelper = new THREE.CameraHelper(camera);
        this.scene.add(cameraHelper);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }

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

        document.body.appendChild(this.renderer.domElement);

        // 启动渲染循环
        this.animate();
    }
}