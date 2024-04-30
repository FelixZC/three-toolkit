import * as THREE from 'three';
import {
    setupMouseControls,
    setupAutoRotate
} from '../utils/three.js/animate'
import ThreeDemo from '../utils/three.js/Init'
import {
    GLTFLoader
} from 'three/addons/loaders/GLTFLoader.js';
import {
    DRACOLoader
} from 'three/addons/loaders/DRACOLoader.js';
import Firework from '../utils/three.js/Firework'

import vertexShaderSource from '../glsl/VertexShader.glsl?raw';
import fragmentShaderSource from '../glsl//FragmentShader.glsl?raw';

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
 * 渲染一个带单贴图的立方体，并添加鼠标拖动旋转功能
 * @param {ThreeDemo} demo - ThreeDemo实例
 * @param {string} textureUrl - 单张贴图URL
 * @param {THREE.Vector3} [position=THREE.Vector3(0, 0, 0)] - 自定义立方体位置
 */
function renderCubeWithSingleTexture(demo, textureUrl, position = new THREE.Vector3(0, 0, 0)) {
    const textureLoader = new THREE.TextureLoader();
    const material = new THREE.MeshStandardMaterial({
        map: textureLoader.load(textureUrl),
        transparent: true,
        roughness: 0
    });
    const geometry = new THREE.BoxGeometry(3, 3, 3);
    const cube = new THREE.Mesh(geometry, material);
    cube.position.copy(position);

    // 添加立方体到场景
    demo.scene.add(cube);
    setupMouseControls(cube);
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
    demo.scene.add(cube);
    // setupMouseControls(cube);
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
 * 向场景中添加烟花效果。
 * @param {Object} demo - 包含场景(scene)等THREE.js相关对象的示例实例，用于添加和管理烟花对象。
 */
function addFireWork(demo) {
    let fireworks = []; // 存储所有烟花对象的数组

    /**
     * 创建并初始化一个烟花对象。
     */
    function createFirework() {
        // 随机生成烟花的初始位置
        const position = new THREE.Vector3(Math.random() * 10 - 5, 0, Math.random() * 10 - 5);
        fireworks.push(new Firework(demo, position)); // 将新创建的烟花添加到数组中
    }

    const clock = new THREE.Clock(); // 用于动画的时钟控制

    /**
     * 烟花动画循环函数。
     */
    function animate() {
        requestAnimationFrame(animate); // 下一帧动画的请求
        const deltaTime = clock.getDelta(); // 获取自上一帧以来的时间差

        // 更新所有烟花的状态，并移除已经结束的烟花
        fireworks.forEach((fw, index) => {
            fw.update(deltaTime);
            if (fw.life <= 0) {
                demo.scene.remove(fw.mesh); // 从场景中移除烟花
                fireworks.splice(index, 1); // 从数组中移除已结束的烟花对象
            }
        });

        // 随机决定是否发射新的烟花
        if (Math.random() < 0.01) { // 每100帧发射一次烟花的概率
            createFirework();
        }
    }

    animate(); // 启动动画循环
}


/**
 * 在给定的场景中添加指定数量的星星。
 * @param {Object} demo 包含场景(scene)等Three.js相关对象和数据的示例对象。
 * @param {number} count 要添加的星星数量。
 */
function addStars(demo, count) {
    // 加载星星纹理
    const textureLoader = new THREE.TextureLoader();
    const starTexture = textureLoader.load('src/image/textures/smoke_texture.png'); // 替换为实际星星纹理的路径

    // 创建星星材质
    const starMaterial = new THREE.PointsMaterial({
        map: starTexture,
        size: 0.1, // 可根据需要调整星星的大小
        color: 0xffffff,
        transparent: true,
        blending: THREE.AdditiveBlending, // 使用加性混合让星星更亮
    });

    // 循环创建指定数量的星星并添加到场景中
    for (let i = 0; i < count; i++) {
        const geometry = new THREE.SphereGeometry(0.01, 32, 32); // 使用小球几何体作为星星的形状
        const star = new THREE.Points(geometry, starMaterial);

        // 随机定位星星
        const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(1000)); // 调整范围以适应你的场景大小
        star.position.set(x, y, z);

        demo.scene.add(star);
    }
}
/**
 * 为指定的Three.js演示demo添加烟雾效果。
 * 不知道为什么就是无法引入顶点着色器和片段着色器
 * @param {Object} demo 包含场景(scene)等Three.js演示相关对象的容器。
 */
function addSmoke(demo) {
    // 加载烟雾纹理
    const smokeTextureLoader = new THREE.TextureLoader();
    smokeTextureLoader.load('src/image/textures/smoke_texture.png', (texture) => {
        texture.minFilter = THREE.LinearFilter;

        // 创建烟雾材质
        const smokeMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: {
                    value: 0
                },
                color: {
                    value: new THREE.Color(0x888888)
                },
                opacity: {
                    value: 0.6
                },
                texture: {
                    value: texture
                }
            },
            vertexShader: vertexShaderSource,
            fragmentShader: fragmentShaderSource,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            transparent: true
        });

        // 创建粒子几何体和粒子系统
        const numParticles = 1000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(numParticles * 3);
        const colors = new Float32Array(numParticles * 3);

        // 随机生成粒子位置和颜色
        for (let i = 0; i < numParticles; i++) {
            const x = (Math.random() - 0.5) * 200;
            const y = (Math.random() - 0.5) * 200;
            const z = (Math.random() - 0.5) * 200;
            positions.set([x, y, z], i * 3);
            colors.set([x / 100 + 0.9, y / 100 + 0.9, z / 100 + 0.9], i * 3);
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // 创建并添加烟雾粒子系统到场景
        const smokeParticles = new THREE.Points(geometry, smokeMaterial);
        demo.scene.add(smokeParticles);

        // 动画烟雾粒子
        function animate() {
            requestAnimationFrame(animate);
            smokeMaterial.uniforms.time.value += 0.01;
        }
        animate();
    });
}

/**
 * 创建一个物理测试环境，演示一个立方体从空中掉落至地面的过程。
 * @param {Object} demo 包含场景(scene)等Three.js相关对象和设置的参数对象。
 */
function physicsTest(demo) {
    // 创建Three.js地面几何体和材质
    const groundGeo = new THREE.BoxGeometry(10, 0.1, 10);
    const groundMat = new THREE.MeshStandardMaterial({
        color: 0x808080
    });

    // 初始化Cannon.js物理世界
    const world = new CANNON.World();
    world.gravity.set(0, -9.82, 0); // 设置重力加速度
    world.broadphase = new CANNON.NaiveBroadphase(); // 使用简单的碰撞检测

    // 定义地面材质
    const groundMaterial = new CANNON.Material("groundMaterial");
    // 创建Cannon.js地面物理体
    const groundBody = new CANNON.Body({
        mass: 0, // 静态物体，质量为0
        material: groundMaterial // 应用之前创建的地面材质
    });
    groundBody.addShape(new CANNON.Box(new CANNON.Vec3(5, 0.05, 5))); // 设置地面物理形状
    groundBody.position.set(0, -1.1, 0); // 设置位置
    world.addBody(groundBody); // 将地面物理体添加到世界中

    // 创建并添加Three.js地面网格到场景
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.receiveShadow = true; // 允许地面接收阴影
    groundMesh.position.copy(groundBody.position);
    demo.scene.add(groundMesh);

    // 创建Three.js立方体几何体和材质
    const cubeGeo = new THREE.BoxGeometry(1, 1, 1);
    const cubeMat = new THREE.MeshStandardMaterial({
        color: 0xff0000
    });

    // 创建Cannon.js立方体物理体
    const cubeBody = new CANNON.Body({
        mass: 1 // 动态物体，质量为1
    });
    cubeBody.addShape(new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5))); // 设置立方体物理形状
    cubeBody.position.set(5, 5, 5); // 示例初始高度，可根据需要调整
    world.addBody(cubeBody); // 将立方体物理体添加到世界中

    // 创建并添加Three.js立方体网格到场景
    const cubeMesh = new THREE.Mesh(cubeGeo, cubeMat);
    cubeMesh.castShadow = true; // 允许立方体投射阴影
    cubeMesh.position.copy(cubeBody.position);
    demo.scene.add(cubeMesh);

    // 创建Three.js球体几何体和材质
    const sphereRadius = 0.5;
    const sphereGeo = new THREE.SphereGeometry(sphereRadius, 32, 32);
    const sphereMat = new THREE.MeshStandardMaterial({
        color: 0x00ff00
    });

    // 创建Cannon.js材质并设置摩擦和恢复系数
    const sphereMaterial = new CANNON.Material("sphereMaterial"); // 创建材质
    const defaultContactMaterial = new CANNON.ContactMaterial( // 创建接触材质，定义不同材质间交互
        sphereMaterial, // 球体材质
        groundMaterial, // 地面材质
        {
            friction: 0.1, // 设置摩擦系数
            restitution: 0.5 // 设置恢复系数
        }
    );
    world.addContactMaterial(defaultContactMaterial); // 将接触材质添加到世界中
    // 创建Cannon.js球体物理体
    const sphereBody = new CANNON.Body({
        mass: 1, // 动态物体，合理质量值促进自然运动
        material: sphereMaterial // 应用之前创建的材质
    });
    sphereBody.addShape(new CANNON.Sphere(sphereRadius)); // 设置球体物理形状

    // 设置球体物理属性以促进滚动和真实感的交互
    sphereBody.material.friction = 0.4; // 地面与球体间的摩擦系数，影响滚动
    sphereBody.material.restitution = 0.7; // 弹性恢复系数，影响弹跳效果

    // 初始位置设置
    sphereBody.position.set(-4, 10, 2);

    // 给球体一个初始下落速度和轻微的角速度以启动滚动效果
    sphereBody.velocity.set(0, -5, 0); // 初始下落速度
    sphereBody.angularVelocity.set(0, 0.1, 1); // 角速度，促使球体落地后滚动

    // 将球体物理体添加到物理世界中
    world.addBody(sphereBody);

    // 创建并添加Three.js球体网格到场景
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    sphereMesh.castShadow = true; // 允许球体投射阴影
    sphereMesh.position.copy(sphereBody.position);
    demo.scene.add(sphereMesh);

    function animate() {
        requestAnimationFrame(animate);

        // 更新Cannon.js物理世界
        world.step(1 / 60); // 每帧模拟的时间步长

        // 同步Three.js球体网格的位置和旋转
        sphereMesh.position.copy(sphereBody.position);
        sphereMesh.quaternion.copy(sphereBody.quaternion);

        // 同步Three.js立方体网格的位置和旋转（新增这部分）
        cubeMesh.position.copy(cubeBody.position);
        cubeMesh.quaternion.copy(cubeBody.quaternion);
    }

    animate();
}

// 示例用法
const demo = new ThreeDemo();
demo.init({
    ...demo.config,
    // isSetUpInteractions: false,
    // isAddAxesHelper: false,
    // isAddGridHelper: false,
    // isAddCameraHelper: false,
    // isSetUpGUI: false
})

// renderLine(demo, [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1)]);
// renderBall(demo);
// renderCubeWithSingleTexture(demo, 'src/image/textures/1.png', new THREE.Vector3(6, 0, 0));
await renderCubeWithMultipleTextures(demo, 'src/image/textures/', 6, new THREE.Vector3(0, 6, 0));
loadGltfModel(demo)
// addFireWork(demo)
// 添加一定数量的星星
addStars(demo, 1000); // 数量根据实际情况调整
// addSmoke(demo)
physicsTest(demo)