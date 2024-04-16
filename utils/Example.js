import * as THREE from 'three';
import {
    ThreeDemo
} from './Demo'
import WebGL from 'three/addons/capabilities/WebGL.js';

function checkIsWebGLAvailable() {
    if (WbGL.isWebGLAvailable()) {
        return true;
    } else {
        const warning = WebGL.getWebGLErrorMessage();
        document.getElementById('container').appendChild(warning);
        return false
    }
}

/**
 * 渲染一个正方体示例
 */
export function RenderCube() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({
        color: 0x00ff00
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 5;

    function animate() {
        requestAnimationFrame(animate);

        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;

        renderer.render(scene, camera);
    }
    if (checkIsWebGLAvailable) {
        animate()
    }
}

/**
 * 渲染线条示例
 */
export function RenderLine() {
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
    camera.position.set(0, 0, 100);
    camera.lookAt(0, 0, 0);

    const scene = new THREE.Scene();

    //create a blue LineBasicMaterial
    const material = new THREE.LineBasicMaterial({
        color: 0x0000ff
    });
    const points = [];
    points.push(new THREE.Vector3(-10, 0, 0));
    points.push(new THREE.Vector3(0, 10, 0));
    points.push(new THREE.Vector3(10, 0, 0));

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    scene.add(line);
    if (checkIsWebGLAvailable) {
        renderer.render(scene, camera);
    }
}


/**
 * 渲染一个球
 */
export function RenderBall() {
    const instance = new ThreeDemo()
    // 场景中添加球
    const geometry = new THREE.BoxGeometry(2, 2, 2)
    const geometry_material = new THREE.MeshStandardMaterial({
        color: 0xaafabb
    })
    instance.init()
    instance.scene.add(new THREE.Mesh(geometry, geometry_material))
}


/**
 * 渲染带贴图的立方体
 */
export function RenderCubeWithTextures() {
    // 场景中添加立方体
    const textureLoader = new THREE.TextureLoader();
    const geometry_material = new THREE.MeshStandardMaterial({
        map: textureLoader.load('public/textures/1.jpg'),
        aoMap: textureLoader.load('public/textures/2.jpg'),
        alphaMap: textureLoader.load('public/textures/1.png'),
        normalMap: textureLoader.load('public/textures/2.png'),
        transparent: true,
        roughness: 0,
    })
    const instance = new ThreeDemo()
    const geometry = new THREE.BoxGeometry(2, 2, 2)
    const model = new THREE.Mesh(geometry, geometry_material)
    instance.init()
    instance.scene.add(model)
}