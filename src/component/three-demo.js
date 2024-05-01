import * as THREE from 'three';
import {
    setupMouseControls,
    setupAutoRotate
} from '../utils/three.js/animate'
import ThreeDemo from '../utils/three.js/init'
import {
    GLTFLoader
} from 'three/addons/loaders/GLTFLoader.js';
import {
    DRACOLoader
} from 'three/addons/loaders/DRACOLoader.js';
import {
    addFireWork,
    addSmoke,
    addStars,
} from '../utils/three.js/effect'

import * as CANNON from 'cannon-es';
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
    const geometry = new THREE.BoxGeometry(3, 3, 3);

    // 使用多材质创建立方体网格，并设置其位置
    const cube = new THREE.Mesh(geometry, materials);
    cube.position.copy(position);

    // 将立方体添加到场景中
    setupAutoRotate(cube);
    // setupMouseControls(cube);
    demo.scene.add(cube);
}

/**
 * 加载GLTF模型到指定的演示实例中。
 * @param {Object} demo 演示实例，需要包含场景(scene)以及之后可能用到的动画混合器(AnimationMixer)。
 */
function loadGltfModel(demo) {
    // 模型的URL地址
    const modelUrl = 'src/model/gltf/LittlestTokyo.glb'
    // DRACO解码器的路径
    const dracoDecoderPath = 'src/libs/draco/'

    // 模型加载成功后的回调函数
    const onModelLoaded = (gltf) => {
        // 获取模型并设置其位置和缩放比例
        const model = gltf.scene;
        model.position.set(1, 1, 0);
        model.scale.set(0.01, 0.01, 0.01);
        // 将模型添加到演示场景中
        demo.scene.add(model);
        // 创建动画混合器并播放第一个动画
        const clock = new THREE.Clock();
        const mixer = new THREE.AnimationMixer(model);
        mixer.clipAction(gltf.animations[0]).play();
        /**
         * 添加模型动画
         */
        function animate() {
            requestAnimationFrame(() => {
                const delta = clock.getDelta();
                mixer.update(delta);
                animate();
            });
        }
        animate()
    }

    // 模型加载失败时的错误处理函数
    const onModelError = (e) => {
        console.error(e);
    }

    // 初始化DRACO解码器
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(dracoDecoderPath);

    // 初始化GLTF加载器并设置DRACO解码器
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    // 加载模型，成功后调用onModelLoaded，失败后调用onModelError
    loader.load(modelUrl, onModelLoaded, undefined, onModelError);
}

/**
 * 创建一个物理测试环境，演示一个立方体从空中掉落至地面的过程。
 * @param {Object} demo 包含场景(scene)等Three.js相关对象和设置的参数对象。
 */
function physicsTest(demo) {
    const scene = demo.scene;
    const camera = demo.camera;
    const renderer = demo.renderer;

    // 创建地面几何体和材质
    const groundGeo = new THREE.BoxGeometry(25, 0.1, 25);
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x808080
    });

    // 初始化Cannon.js物理世界
    const world = new CANNON.World();
    world.gravity.set(0, -9.82, 0);
    world.broadphase = new CANNON.NaiveBroadphase();

    // 定义地面物理材质
    const groundPhysMat = new CANNON.Material("GroundPhysMaterial");
    // 创建地面物理体
    const groundBody = new CANNON.Body({
        mass: 0,
        material: groundPhysMat
    });
    groundBody.addShape(new CANNON.Box(new CANNON.Vec3(12.5, 0.1, 12.5)));
    groundBody.position.set(0, -1.1, 0);
    world.addBody(groundBody);

    // 创建地面Three.js网格
    const groundMesh = new THREE.Mesh(groundGeo, groundMaterial);
    groundMesh.receiveShadow = true;
    groundMesh.position.copy(groundBody.position);
    scene.add(groundMesh);

    // 立方体材质与物理体
    const cubeGeo = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshStandardMaterial({
        color: 0xff0000
    });
    const cubeBody = new CANNON.Body({
        mass: 1
    });
    cubeBody.addShape(new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5)));
    cubeBody.position.set(5, 5, 5);
    world.addBody(cubeBody);
    const cubeMesh = new THREE.Mesh(cubeGeo, cubeMaterial);
    cubeMesh.castShadow = true;
    cubeMesh.position.copy(cubeBody.position);
    scene.add(cubeMesh);

    // 球体材质与物理体
    const sphereRadius = 0.5;
    const sphereGeo = new THREE.SphereGeometry(sphereRadius, 32, 32);
    const sphereMaterial = new THREE.MeshStandardMaterial({
        color: 0x00ff00
    });
    const spherePhysMat = new CANNON.Material("SpherePhysMaterial");
    const sphereGroundContactMat = new CANNON.ContactMaterial(
        spherePhysMat,
        groundPhysMat, {
            friction: 0.3,
            restitution: 0.3
        }
    );
    world.addContactMaterial(sphereGroundContactMat);
    const sphereBody = new CANNON.Body({
        mass: 1,
        material: spherePhysMat
    });
    sphereBody.addShape(new CANNON.Sphere(sphereRadius));
    sphereBody.position.set(-4, 10, 2);
    sphereBody.velocity.set(0, -5, 0);
    sphereBody.angularVelocity.set(0, 0.1, 1);
    world.addBody(sphereBody);
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMaterial);
    sphereMesh.castShadow = true;
    sphereMesh.position.copy(sphereBody.position);
    scene.add(sphereMesh);

    // 鼠标点击事件处理
    let ballBodies = [];
    renderer.domElement.addEventListener('mousedown', (event) => {
        if (event.button === 0) {
            const sphereShape = new CANNON.Sphere(0.5);
            const ballBody = new CANNON.Body({
                mass: 1,
                material: spherePhysMat
            });
            ballBody.addShape(sphereShape);

            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(
                new THREE.Vector2((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1),
                camera
            );
            const intersections = raycaster.intersectObject(groundMesh);
            if (intersections.length > 0) {
                ballBody.position.copy(intersections[0].point);
            } else {
                console.log("No intersection with the ground.");
                return;
            }

            world.addBody(ballBody);
            ballBodies.push(ballBody);

            const sphereGeometry = new THREE.SphereGeometry(sphereShape.radius, 32, 32);
            const ballMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
            ballMesh.position.copy(ballBody.position);
            scene.add(ballMesh);
            ballMesh.userData.cannonBody = ballBody;
        }
    });

    function animate() {
        requestAnimationFrame(animate);

        world.step(1 / 60);

        sphereMesh.position.copy(sphereBody.position);
        sphereMesh.quaternion.copy(sphereBody.quaternion);

        cubeMesh.position.copy(cubeBody.position);
        cubeMesh.quaternion.copy(cubeBody.quaternion);

        ballBodies.forEach((body, index) => {
            const mesh = scene.children.find(child => child.userData.cannonBody === body);
            if (mesh) {
                mesh.position.copy(body.position);
                mesh.quaternion.copy(body.quaternion);
            }
        });
    }

    animate();
}

// 示例用法
const demo = new ThreeDemo();
demo.init({
    ...demo.config,
    // isAddAxesHelper: false,
    // isAddGridHelper: false,
    // isAddCameraHelper: false,
    // isSetUpGUI: false,
    // isSetUpControls: false
})

// renderLine(demo, [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1)]);
// renderBall(demo);
await renderCubeWithMultipleTextures(demo, 'src/image/textures/', 6, new THREE.Vector3(0, 6, 0));
loadGltfModel(demo)
addFireWork(demo)
// 添加一定数量的星星
addStars(demo, 1000); // 数量根据实际情况调整
addSmoke(demo)
physicsTest(demo)