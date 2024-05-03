import * as THREE from 'three';
import {
    setupMouseControls,
    setupAutoRotate
} from '../utils/three.js/animate'
import ThreeDemo from '../utils/three.js/init'
import {
    createDefaultPhysicsWorld,
    createGround,
    createCube,
    createSphere,
    configureContactMaterials
} from '../utils/three.js/physics'
import {
    GLTFLoader
} from 'three/addons/loaders/GLTFLoader.js';
import {
    DRACOLoader
} from 'three/addons/loaders/DRACOLoader.js';
import {
    addFireWork,
    addStars,
} from '../utils/three.js/effect'
import {
    getRandomColor
} from '../utils/common';
import * as CANNON from 'cannon-es';
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
 * 加载GLTF模型到指定的演示实例中。
 * @param {String} modelUrl gltf模型加载路径
 * TODO:
 * 碰撞检测：在模型加载成功后，为模型创建相应的Cannon.js物理体，并设置合适的形状和材质。例如，如果模型是一个角色，你可以为它的底部创建一个胶囊形状的碰撞体，以模拟脚步。
 * 物理响应：将模型的物理体添加到Cannon.js的世界中，并在animate函数里同步模型的位置和旋转，以反映物理模拟的结果。
 * 事件触发：如果模型需要响应特定物理事件（如跳跃、移动），可以通过监听物理事件或直接在动画循环中根据物理状态调整模型行为。
 */
function loadGltfModel(modelUrl) {
    return new Promise((resolve, reject) => {
        // 模型加载成功后的回调函数
        const onModelLoaded = (gltf) => {
            // 获取模型并设置其位置和缩放比例
            const model = gltf.scene;
            model.position.set(1, 1, 0);
            model.scale.set(0.01, 0.01, 0.01);
            // 将模型添加到演示场景中
            // 创建动画混合器并播放第一个动画
            const clock = new THREE.Clock();
            const mixer = new THREE.AnimationMixer(model);
            mixer.clipAction(gltf.animations[0]).play();

            // 添加物理碰撞
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());

            // 创建物理体
            const shape = new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2));
            const gltfBodyMaterial = new CANNON.Material("gltfMaterial");
            const gltfBody = new CANNON.Body({
                mass: 1,
                material: gltfBodyMaterial
            }); // 质量设为0，表示静态物体，或者根据需要设定质量
            gltfBody.addShape(shape);
            gltfBody.position.copy(model.position);
            gltfBody.quaternion.copy(model.quaternion);
            /**
             * 添加模型动画
             */
            function animate() {
                requestAnimationFrame(() => {
                    // 确保模型的更新与物理世界同步
                    model.position.copy(gltfBody.position);
                    model.quaternion.copy(gltfBody.quaternion);
                    const delta = clock.getDelta();
                    mixer.update(delta);
                    animate();
                });
            }
            animate()
            resolve({
                model,
                gltfBody,
                gltfBodyMaterial
            })
        }

        // 模型加载失败时的错误处理函数
        const onModelError = (e) => {
            console.error(e);
            reject(e)
        }

        // 初始化DRACO解码器
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('src/libs/draco/');

        // 初始化GLTF加载器并设置DRACO解码器
        const loader = new GLTFLoader();
        loader.setDRACOLoader(dracoLoader);

        // 加载模型，成功后调用onModelLoaded，失败后调用onModelError
        loader.load(modelUrl, onModelLoaded, undefined, onModelError);
    });
}

/**
 * 物理学测试函数 - 利用Three.js和Cannon.js创建一个简单的物理模拟场景
 * @param {Object} demo - 包含场景、相机和渲染器的对象
 */
async function addPhysicsTest(demo, world) {
    const {
        scene,
        camera,
        renderer
    } = demo
    const {
        groundBody,
        groundMesh,
        groundPhysMat
    } = createGround()
    world.addBody(groundBody);
    scene.add(groundMesh);
    const {
        cubeBody,
        cubeMesh,
        cubePhysMat
    } = createCube()

    world.addBody(cubeBody);
    scene.add(cubeMesh);
    // 添加球体
    const {
        sphereMesh,
        sphereBody,
        spherePhysMat
    } = createSphere({
        radius: 0.5, // 半径增大
        position: new THREE.Vector3(0, 5, 5), // 改变初始位置
        color: 0x0000ff, // 改变颜色为红色
        materialName: "BouncySphereMaterial" // 使用不同的物理材质
    });
    world.addBody(sphereBody);
    scene.add(sphereMesh);

    const {
        model,
        gltfBody,
        gltfBodyMaterial
    } = await loadGltfModel('src/model/gltf/LittlestTokyo.glb')

    demo.scene.add(model);
    world.addBody(gltfBody);

    // 渲染一个带多贴图的浮旋立方体
    const {
        cubeBody: floatCubeBody,
        cubeMesh: floatCubeMesh,
        cubePhysMat: floatCubePhysMat
    } = createCube({
        size: 3,
        position: new THREE.Vector3(0, 6, 0),
        mass: 0
    }, )
    const textures = await loadTexturesFromAtlas('src/image/textures/', 6);
    // 创建一个材质数组，每个材质对应一个从纹理图集加载的贴图
    floatCubeMesh.material = textures.map(texture => new THREE.MeshBasicMaterial({
        map: texture
    }));
    setupAutoRotate(floatCubeMesh);
    demo.scene.add(floatCubeMesh);
    world.addBody(floatCubeBody);

    // 鼠标点击事件处理
    let ballBodies = [];
    /**
     * 当鼠标在渲染器的dom元素上按下时的事件监听器。
     * 该函数主要负责在地面位置创建一个物理球体，并将其同时渲染为一个视觉球体。
     * 
     * @param {MouseEvent} event 鼠标事件对象，包含了鼠标按下的详细信息。
     */
    renderer.domElement.addEventListener('mousedown', (event) => {
        // 当鼠标左键按下时
        if (event.button === 0) {
            const {
                sphereBody: ballBody,
                sphereMesh: ballMesh,
                spherePhysMat: ballPhysMat
            } = createSphere({
                radius: 0.5,
                position: new THREE.Vector3(),
                color: getRandomColor()
            });

            // 使用Three.js的Raycaster来计算鼠标位置和场景中物体的交点
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(
                new THREE.Vector2((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1),
                camera
            );
            // 检测鼠标点击是否与地面相交
            const intersections = raycaster.intersectObject(groundMesh);
            if (intersections.length > 0) {
                // 如果相交，将球体位置设置为相交点位置
                ballBody.position.copy(intersections[0].point);
            } else {
                console.log("No intersection with the ground."); // 如果没有相交，打印错误信息并返回
                return;
            }
            // 将物理球体添加到物理世界
            ballBodies.push(ballBody); // 将球体添加到球体数组
            world.addBody(ballBody);
            scene.add(ballMesh); // 将网格模型添加到场景中
            ballMesh.userData.cannonBody = ballBody; // 将物理球体与网格模型关联
        }
    });
    /**
     * 该函数用于实现动画循环。
     * 它通过调用requestAnimationFrame来递归自身，以在每一帧中更新物理世界的状态，并将物理模拟的结果应用到场景中的图形网格。
     */
    function animate() {
        // 请求下一帧动画
        requestAnimationFrame(animate);
        // 更新物理世界的状态
        world.step(1 / 60); // 步进物理模拟，参数为时间步长
        // 遍历球体集合，更新每个球体网格的位置和旋转，以匹配其对应的物理体状态
        ballBodies.forEach((body, index) => {
            // 查找场景中与当前物理体对应的网格
            const mesh = scene.children.find(child => child.userData.cannonBody === body);
            if (mesh) {
                // 如果找到，更新网格的位置和旋转
                mesh.position.copy(body.position);
                mesh.quaternion.copy(body.quaternion);
            }
        });
    }

    animate();
}

// 示例用法
const demo = new ThreeDemo({
    isAddAxesHelper: false,
    // isAddGridHelper: false,
    isAddCameraHelper: false,
    // isSetUpGUI: false,
    // isSetUpControls: false

});
const world = createDefaultPhysicsWorld()
addPhysicsTest(demo, world)
addFireWork(demo)
// 添加一定数量的星星
addStars(demo, 1000); // 数量根据实际情况调整