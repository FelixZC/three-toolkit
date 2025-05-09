import { DRACOLoader, GLTF, GLTFLoader } from "three-stdlib";

/**
 * 加载指定URL的图像资源
 *
 * @param {string} imageUrl - 图像文件URL
 * @returns {Promise<HTMLImageElement>} - 返回加载完成的图像元素
 */
import * as THREE from "three";
export function loadImage(imageUrl: string): Promise<HTMLImageElement> {
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
export async function loadTexturesFromAtlas(
  atlasPrefix: string,
  tilesNum: number,
) {
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

// 定义 GLTFLoader 加载完成后的回调函数类型
type OnModelLoadedCallback = (gltf: GLTF) => void;

// 定义 GLTFLoader 加载失败时的回调函数类型
type OnModelErrorCallback = (error: ErrorEvent) => void;

// 定义 loadGltfModelFunc 函数的类型
type LoadGltfModelFunc = (
  modelUrl: string,
  initialPosition?: THREE.Vector3,
  initialScale?: THREE.Vector3,
) => Promise<THREE.Group<THREE.Object3DEventMap>>;

// 定义 useGltfLoader 函数的类型，它返回一个 loadGltfModelFunc 函数
type UseGltfLoaderFunc = () => LoadGltfModelFunc;

// 实现 useGltfLoader 函数
export const useGltfLoader: UseGltfLoaderFunc = () => {
  // 初始化DRACO解码器和GLTF加载器
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("../../assets/libs/draco/"); // 设置DRACO解码器的路径
  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dracoLoader); // 将DRACO解码器设置给GLTF加载器

  // 实现 loadGltfModelFunc 函数
  const loadGltfModelFunc: LoadGltfModelFunc = (
    modelUrl,
    initialPosition = new THREE.Vector3(0, 1, 0),
    initialScale = new THREE.Vector3(0.01, 0.01, 0.01),
  ) => {
    return new Promise<THREE.Group<THREE.Object3DEventMap>>(
      (resolve, reject) => {
        // 模型加载成功时的处理函数
        const onModelLoaded: OnModelLoadedCallback = (gltf) => {
          const model = gltf.scene;
          model.position.copy(initialPosition); // 设置模型的初始位置
          model.scale.copy(initialScale); // 设置模型的初始缩放

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
          resolve(model); // 模型加载成功，解决 Promise
        };

        // 模型加载失败时的处理函数
        const onModelError: OnModelErrorCallback = (error) => {
          reject(error); // 模型加载失败，拒绝 Promise
        };

        // 启动模型加载
        gltfLoader.load(modelUrl, onModelLoaded, undefined, onModelError);
      },
    );
  };
  return loadGltfModelFunc; // 返回加载 GLTF 模型的函数
};
