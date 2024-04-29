import * as THREE from 'three';
import GUI from 'lil-gui';
import WebGL from 'three/addons/capabilities/WebGL.js';
import {
    OrbitControls
} from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import {
    RoomEnvironment
} from 'three/addons/environments/RoomEnvironment.js';

/**
 * 一个用于创建和管理 Three.js 场景的基类。
 */
export default class ThreeDemo {
    constructor(containerId = "container") {
        this.container = document.getElementById(containerId);
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.aspectRatio = this.width / this.height;
        this.devicePixelRatio = window.devicePixelRatio;
        this.scene = null;
        this.camera = null;
        this.light = null;
        this.renderer = null;
        this.stats = new Stats();
        this.controls = null;
        this.config = {
            isSetUpControls: true,
            isAddAxesHelper: true,
            isAddGridHelper: true,
            isAddCameraHelper: true,
            isSetUpGUI: true,
        };

        if (!WebGL.isWebGLAvailable()) {
            const warning = WebGL.getWebGLErrorMessage();
            this.container.appendChild(warning);
            throw new Error("WebGL is not available.");
        }
    }

    /**
     * 初始化 GUI 控制面板。
     */
    setUpGUI() {
        this.gui = new GUI();

        // 创建光照颜色控制器
        const lightColorController = this.gui.addColor(this.directionalLight, 'color').name('Directional Light Color');
        lightColorController.onChange((value) => {
            this.directionalLight.color.set(value);
        });

        // 创建光照强度控制器
        const lightIntensityController = this.gui.add(this.directionalLight, 'intensity', 0, 5).step(0.1).name('Directional Light Intensity');
        lightIntensityController.onChange((value) => {
            this.directionalLight.intensity = value;
        });

        // 创建雾效颜色控制器
        const fogColorController = this.gui.addColor(this.scene.fog, 'color').name('Fog Color');
        fogColorController.onChange((value) => {
            this.scene.fog.color.set(value);
        });

        // 创建雾效范围控制器
        const fogRangeController = this.gui.add(this.scene.fog, 'near', 0, 0.5).step(0.1).name('Fog Near');
        fogRangeController.onChange((value) => {
            this.scene.fog.near = value;
        });

        const fogFarController = this.gui.add(this.scene.fog, 'far', 0, 1000).step(1).name('Fog Far');
        fogFarController.onChange((value) => {
            this.scene.fog.far = value;
        });
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

    handleWindowResize() {
        window.addEventListener("resize", () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    setUpRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(this.devicePixelRatio);
        this.renderer.setClearColor(this.scene.fog.color);
    }

    setUpStats() {
        this.container.appendChild(this.stats.dom);
    }

    setUpCamera() {
        this.camera = new THREE.PerspectiveCamera(90, this.aspectRatio, 0.1, 100);
        this.camera.position.set(5, 2, 8);
        this.camera.aspect = this.aspectRatio;
        this.camera.updateProjectionMatrix();
        this.scene.add(this.camera);
    }

    setUpLighting() {
        this.light = new THREE.AmbientLight(4210752);
        this.directionalLight = new THREE.DirectionalLight(16777215, 0.6);
        this.directionalLight.position.set(0, 5, 5);
        this.scene.add(this.light);
        this.scene.add(this.directionalLight);
    }

    async setUpControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = true;
    }

    async setUpEnvironment() {
        const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
        this.scene.environment = pmremGenerator.fromScene(
            new RoomEnvironment(this.renderer),
            0.04
        ).texture;
    }

    setUpScene() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(592152, 1, 600);
        // this.scene.background = new THREE.Color(12575709);
    }

    animate() {
        requestAnimationFrame(() => {
            this.controls.update();
            this.stats.update();
            this.renderer.render(this.scene, this.camera);
            this.animate();
        });
    }

    async init(config) {
        if (config) {
            this.config = config;
        }

        if (!WebGL.isWebGLAvailable()) {
            return;
        }

        this.setUpScene();
        this.setUpCamera();
        this.setUpLighting();
        this.setUpRenderer();

        if (this.config.isSetUpControls) {
            await this.setUpControls();
        }

        if (this.config.isAddAxesHelper) {
            await this.addAxesHelper();
        }

        if (this.config.isAddGridHelper) {
            this.addGridHelper(200, 20);
        }

        if (this.config.isAddCameraHelper) {
            this.addCameraHelper(this.camera);
        }

        if (this.config.isSetUpGUI) {
            this.setUpGUI();
        }

        this.handleWindowResize();
        this.setUpStats();
        this.setUpEnvironment();
        this.animate();
        this.container.appendChild(this.renderer.domElement);
    }
}