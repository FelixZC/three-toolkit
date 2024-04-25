import * as THREE from 'three';
import {
    setupMouseControls
} from '../utils/three.js/MouseControls'
import ThreeDemo from '../utils/three.js/Init'

// 以下是一些辅助渲染函数，用于在ThreeDemo实例上渲染不同类型的3D对象
/**
 * 渲染一个正方体
 * @param {ThreeDemo} demo - ThreeDemo实例
 * @param {THREE.Material} [material] - 自定义材质
 * @param {THREE.Vector3} [position] - 自定义立方体位置
 */
function renderCube(demo, material, position, initialRotation = {
    x: 0,
    y: 0,
    z: 0
}) {
    // 创建立方体几何体和材质
    const geometry = new THREE.BoxGeometry(5, 5, 5);
    const cube = new THREE.Mesh(geometry, material);

    // 设置立方体位置和初始旋转角度
    cube.position.copy(position);
    cube.rotation.set(initialRotation.x, initialRotation.y, initialRotation.z);

    // 将立方体添加到场景中
    demo.scene.add(cube);
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
    const geometry = new THREE.BoxGeometry(5, 5, 5);
    const cube = new THREE.Mesh(geometry, material);
    cube.position.copy(position);

    // 添加立方体到场景
    demo.scene.add(cube);
    // setupMouseControls(cube);
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
    const geometry = new THREE.BoxGeometry(5, 5, 5);

    // 使用多材质创建立方体网格，并设置其位置
    const cube = new THREE.Mesh(geometry, materials);
    cube.position.copy(position);

    // 将立方体添加到场景中
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

// 示例用法
const demo = new ThreeDemo();
demo.init()
// renderCube(demo, new THREE.MeshBasicMaterial({
//     color: 0xffffff
// }), new THREE.Vector3(0, 0, 0));
// renderLine(demo, [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1)]);
// renderBall(demo);
// renderCubeWithSingleTexture(demo, 'src/image/textures/3.png');
await renderCubeWithMultipleTextures(demo, 'src/image/textures/', 6);