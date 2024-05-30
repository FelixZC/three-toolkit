import * as THREE from 'three';
import {
    GLTFLoader
} from 'three/addons/loaders/GLTFLoader.js';
import {
    DRACOLoader
} from 'three/addons/loaders/DRACOLoader.js';

/**
 * 加载指定URL的图像资源
 *
 * @param {string} imageUrl - 图像文件URL
 * @returns {Promise<HTMLImageElement>} - 返回加载完成的图像元素
 */
export function loadImage(imageUrl) {
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
export async function loadTexturesFromAtlas(atlasPrefix, tilesNum) {
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
 * 使用GLTF加载器模块。
 * 这个函数主要初始化DRACO解码器和GLTF加载器，并提供一个加载GLTF模型的函数。
 * 
 * @return {Function} 返回一个加载GLTF模型的函数，这个函数接受模型URL、初始位置和初始缩放作为参数，并返回一个Promise，该Promise在模型加载成功时解析为模型对象。
 */
export function useGltfLoader() {
    // 初始化DRACO解码器和GLTF加载器
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/src/assets/libs/draco/'); // 设置DRACO解码器的路径
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader); // 将DRACO解码器设置给GLTF加载器

    /**
     * 加载GLTF模型的函数。
     * 
     * @param {string} modelUrl - 模型的URL。
     * @param {Array} initialPosition - 模型的初始位置，默认为 [0, 1, 0]。
     * @param {Array} initialScale - 模型的初始缩放，默认为 [0.01, 0.01, 0.01]。
     * @return {Promise} 返回一个Promise，该Promise在模型加载成功时解析为Three.js的场景模型对象。
     */
    function loadGltfModelFunc(modelUrl, initialPosition = [0, 1, 0], initialScale = [0.01, 0.01, 0.01]) {
        return new Promise((resolve, reject) => {
            // 模型加载成功时的处理函数
            const onModelLoaded = (gltf) => {
                const model = gltf.scene;
                model.position.set(...initialPosition); // 设置模型的初始位置
                model.scale.set(...initialScale); // 设置模型的初始缩放

                // 初始化并播放模型动画
                const clock = new THREE.Clock();
                const mixer = new THREE.AnimationMixer(model);
                if (gltf.animations.length > 0) {
                    const action = mixer.clipAction(gltf.animations[0]);
                    action.play();
                }

                // 动画循环，用于更新动画状态
                function animate() {
                    requestAnimationFrame(animate);
                    if (gltf.animations.length > 0) {
                        const delta = clock.getDelta();
                        mixer.update(delta);
                    }
                }
                animate();

                resolve(model); // 模型加载成功，解决Promise
            };

            // 模型加载失败时的处理函数
            const onModelError = (error) => {
                console.error('Error loading model:', error);
                reject(error); // 模型加载失败，拒绝Promise
            };

            // 启动模型加载
            gltfLoader.load(modelUrl, onModelLoaded, undefined, onModelError);
        });
    }
    return loadGltfModelFunc; // 返回加载GLTF模型的函数
}