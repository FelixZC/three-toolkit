import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';

export default class ThreeDemo {
    constructor() {
        // 获取当前浏览器窗口的宽度（以像素为单位）
        this.width = window.innerWidth;

        // 获取当前浏览器窗口的高度（以像素为单位）
        this.height = window.innerHeight;

        // 计算窗口的纵横比（宽度除以高度）
        this.aspectRatio = this.width / this.height;

        // 获取设备像素比（即物理像素与CSS像素的比例）
        this.devicePixelRatio = window.devicePixelRatio;

        // 定义对象的其他属性，并初始化为null，表示尚未创建或未关联任何实例
        this.scene = null; // Three.js场景对象，将在createScene()方法中创建
        this.camera = null; // Three.js相机对象，将在createScene()方法中创建
        this.light = null; // Three.js光照对象，将在createLight()方法中创建
        this.renderer = null; // Three.js渲染器对象，将在createRenderer()方法中创建
        this.onRenderFcts = []; // 存储每一帧渲染时需要执行的函数
        // 检查 WebGL 是否可用
        if (!WebGL.isWebGLAvailable()) {
            const warning = WebGL.getWebGLErrorMessage();
            document.getElementById('three-canvas-container').appendChild(warning);
            throw new Error('WebGL is not available.');
        }
    }

    /**
     * 初始化ThreeDemo组件
     */
    init() {
        this.createScene(); // 创建场景
        this.createRenderer(); // 创建渲染器
        this.createLight(); // 创建光照
        document.body.appendChild(this.renderer.domElement); // 添加渲染器到DOM
        let lastTime = performance.now();

        const render = (time) => {
            const delta = time - lastTime;
            lastTime = time;

            this.renderer.render(this.scene, this.camera); // 渲染场景

            // 执行渲染循环中的所有更新函数
            this.onRenderFcts.forEach(fn => fn(delta, time));

            requestAnimationFrame(render); // 请求下一帧动画
        };

        const start = performance.now();
        render(start);
        this.axesHelper(); // 添加辅助坐标系
    }


    /**
     * 创建3D场景
     */
    createScene() {
        // 创建舞台
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x090918, 1, 600); // 添加雾效

        // 创建透视相机（模拟人视角）
        this.camera = new THREE.PerspectiveCamera(
            90, // 视角
            this.aspectRatio, // 纵横比
            0.1, // 近平面距离
            100 // 远平面距离
        );

        // 设置相机位置
        this.camera.position.set(1, 1, 4); // 设置为(x, y, z) = (1, 1, 4)

        // 更新相机宽高比和投影矩阵
        this.camera.aspect = this.aspectRatio;
        this.camera.updateProjectionMatrix();

        // 将相机添加到场景中
        this.scene.add(this.camera);
    }

    /**
     * 创建WebGL渲染器
     */
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true // 启用抗锯齿
        });

        this.renderer.outputEncoding = THREE.sRGBEncoding; // 设置输出颜色编码
        this.renderer.setSize(this.width, this.height); // 设置渲染器尺寸
        this.renderer.setPixelRatio(window.devicePixelRatio); // 设置设备像素比
        this.renderer.setClearColor(this.scene.fog.color); // 设置背景色为场景雾效颜色

        // 监听窗口尺寸变化，更新相机和渲染器尺寸
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    /**
     * 添加辅助坐标系到场景
     */
    axesHelper() {
        const axesHelper = new THREE.AxesHelper(5); // 创建辅助坐标系，长度为5单位
        this.scene.add(axesHelper); // 将辅助坐标系添加到场景中
    }

    /**
     * 创建光照
     */
    createLight() {
        // 添加环境光（均匀照亮整个场景）
        this.light = new THREE.AmbientLight(0x404040); // 软白色光源

        // 添加平行光（沿特定方向发射的光）
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        this.directionalLight.position.set(0, 5, 5); // 设置平行光位置

        // 将光照添加到场景中
        this.scene.add(this.light);
        this.scene.add(this.directionalLight);
    }
}


/**
 * 渲染一个正方体
 * @param {ThreeDemo} demo - ThreeDemo实例
 * @param {THREE.Material} [material] - 自定义材质
 * @param {THREE.Vector3} [position] - 自定义立方体位置
 */
function renderCube(demo, material, position, initialRotation = { x: 0, y: 0, z: 0 }, rotationSpeed = { x: 0, y: 0, z: 0 }) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const cube = new THREE.Mesh(geometry, material);
    cube.position.copy(position);
    cube.rotation.set(initialRotation.x, initialRotation.y, initialRotation.z);
    demo.scene.add(cube);

    // 为立方体添加一个定时更新旋转的方法
    function updateRotation(time) {
        const delta = time - (cube.userData.lastUpdateTime || time);
        cube.userData.lastUpdateTime = time;

        cube.rotation.x += rotationSpeed.x * delta;
        cube.rotation.y += rotationSpeed.y * delta;
        cube.rotation.z += rotationSpeed.z * delta;

        cube.rotation.x %= Math.PI * 2;
        cube.rotation.y %= Math.PI * 2;
        cube.rotation.z %= Math.PI * 2;
    }

    // 在渲染循环中调用更新方法
    demo.onRenderFcts.push(function(delta, now) {
        updateRotation(now);
    });
}

/**
 * 渲染一条线
 * @param {ThreeDemo} demo - ThreeDemo实例
 * @param {THREE.Vector3[]} points - 线段顶点数组
 * @param {THREE.LineBasicMaterial} [material] - 自定义线段材质
 */
function renderLine(demo, points, material = new THREE.LineBasicMaterial({
    color: 0x0000ff
})) {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    demo.scene.add(line);
}

/**
 * 渲染一个球体
 * @param {ThreeDemo} demo - ThreeDemo实例
 * @param {THREE.Material} [material] - 自定义材质
 * @param {THREE.Vector3} [position] - 自定义球体位置
 * @param {number} [radius=1] - 球体半径
 */
function renderBall(demo, material = new THREE.MeshStandardMaterial({
    color: 0xaafabb
}), position = new THREE.Vector3(0, 0, 0), radius = 1) {
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const ball = new THREE.Mesh(geometry, material);
    ball.position.copy(position);
    demo.scene.add(ball);
}

/**
 * 渲染一个带单贴图的立方体
 * @param {ThreeDemo} demo - ThreeDemo实例
 * @param {string} textureUrl - 单张贴图URL
 * @param {THREE.Vector3} [position] - 自定义立方体位置
 */
function renderCubeWithSingleTexture(demo, textureUrl, position = new THREE.Vector3(0, 0, 0)) {
    const textureLoader = new THREE.TextureLoader();
    const material = new THREE.MeshStandardMaterial({
        map: textureLoader.load(textureUrl),
        transparent: true,
        roughness: 0
    });
    const geometry = new THREE.BoxGeometry(1, 2, 2);
    const cube = new THREE.Mesh(geometry, material);
    cube.position.copy(position);
    demo.scene.add(cube);
}

/**
 * 渲染一个带多贴图的立方体
 *
 * @param {ThreeDemo} demo - ThreeDemo实例
 * @param {string} atlasImgUrl - 多张贴图的前缀URL，格式如 'path/to/atlas-'
 * @param {number} tilesNum - 贴图数量
 * @param {THREE.Vector3} [position=THREE.Vector3(0, 0, 0)] - 自定义立方体位置
 */
async function renderCubeWithMultipleTextures(demo, atlasImgUrl, tilesNum, position = new THREE.Vector3(0, 0, 0)) {
    const textures = await loadTexturesFromAtlas(atlasImgUrl, tilesNum);

    // 创建一个材质数组，每个材质对应一个从纹理图集加载的贴图
    const materials = textures.map(texture => new THREE.MeshBasicMaterial({
        map: texture
    }));

    // 创建立方体几何体
    const geometry = new THREE.BoxGeometry(2, 2, 2);

    // 使用多材质创建立方体网格，并设置其位置
    const cube = new THREE.Mesh(geometry, materials);
    cube.position.copy(position);

    // 将立方体添加到场景中
    demo.scene.add(cube);
}

/**
 * 从纹理图集加载指定数量的贴图
 *
 * @param {string} atlasPrefix - 图集文件名前缀，格式如 'path/to/atlas-'
 * @param {number} tilesNum - 贴图数量
 * @returns {Promise<THREE.Texture[]>} - 返回一个包含所有加载完成的纹理的数组
 */
async function loadTexturesFromAtlas(atlasPrefix, tilesNum) {
    const textures = [];

    // 遍历所需贴图数量，依次加载每个贴图
    for (let i = 1; i <= tilesNum; i++) {
        const url = `${atlasPrefix}${i}.png`;
        const image = await loadImage(url);

        // 创建一个新的纹理对象，并将加载的图像赋值给它
        const texture = new THREE.Texture(image);
        texture.needsUpdate = true;

        textures.push(texture);
    }

    return textures;
}

/**
 * 加载指定URL的图像资源
 *
 * @param {string} imageUrl - 图像文件URL
 * @returns {Promise<HTMLImageElement>} - 返回加载完成的图像元素
 */
function loadImage(imageUrl) {
    return new Promise((resolve, reject) => {
        new THREE.ImageLoader().load(imageUrl, resolve, undefined, reject);
    });
}

// 示例用法
const demo = new ThreeDemo();
demo.init();

renderCube(demo, new THREE.MeshBasicMaterial({ color: 0x00ff00 }), new THREE.Vector3(0, 0, 0), { x: 0, y: Math.PI / 4, z: 0 }, { x: 0.01, y: 0.01, z: 0 });
// renderLine(demo, [new THREE.Vector3(-10, 0, 0), new THREE.Vector3(0, 10, 0), new THREE.Vector3(10, 0, 0)]);
// renderBall(demo);
// renderCubeWithSingleTexture(demo, 'public/textures/1.png');
// await renderCubeWithMultipleTextures(demo, 'public/textures/', 6);