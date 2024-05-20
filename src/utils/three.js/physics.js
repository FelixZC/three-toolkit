import * as CANNON from 'cannon-es';
import * as THREE from 'three';

/**
 * 直接初始化并配置一个默认的Cannon.js物理世界，包含一个地面。
 * @returns {CANNON.World} 创建的物理世界实例，已含默认地面。
 */
export function createDefaultPhysicsWorld() {
    // 创建Cannon物理世界，使用默认重力向量
    const cannonWorld = new CANNON.World();
    cannonWorld.gravity.set(0, -9.82, 0);
    cannonWorld.broadphase = new CANNON.NaiveBroadphase();
    cannonWorld.solver.iterations = 10; // 可调整以改变模拟精确度
    cannonWorld.allowSleep = true;
    return cannonWorld;
}

export function createGround({
    size = 25,
    color = 0x808080,
    materialName = "GroundPhysMaterial",
    yOffset = 0
} = {}) {
    // 创建地面几何体
    const groundGeo = new THREE.BoxGeometry(size, 0.1, size);

    // 创建地面材质
    const groundMaterial = new THREE.MeshStandardMaterial({
        color
    });

    // 创建地面物理材质
    const groundPhysMat = new CANNON.Material(materialName);

    // 创建地面物理体
    const groundBody = new CANNON.Body({
        mass: 0,
        material: groundPhysMat
    });
    groundBody.addShape(new CANNON.Box(new CANNON.Vec3(size / 2, 0.1 / 2, size / 2)));
    groundBody.position.set(0, yOffset, 0);

    // 创建地面的Three.js网格
    const groundMesh = new THREE.Mesh(groundGeo, groundMaterial);
    groundMesh.receiveShadow = true;
    groundMesh.position.copy(groundBody.position);

    return {
        groundBody,
        groundMesh,
        groundPhysMat
    };
}

export function createCube({
    size = 1,
    position = new THREE.Vector3(5, 5, 5),
    mass = 1,
    color = 0xff0000,
    materialName = "CutePhysMaterial"
} = {}) {
    // 创建立方体几何体
    const cubeGeo = new THREE.BoxGeometry(size, size, size);

    // 创建立方体材质
    const cubeMaterial = new THREE.MeshStandardMaterial({
        color
    });

    // 创建物理材质
    const cubePhysMat = new CANNON.Material(materialName);

    // 创建立方体物理体
    const cubeBody = new CANNON.Body({
        mass,
        material: cubePhysMat
    });
    cubeBody.addShape(new CANNON.Box(new CANNON.Vec3(size / 2, size / 2, size / 2)));
    cubeBody.position.copy(position);

    // 创建立方体的Three.js网格
    const cubeMesh = new THREE.Mesh(cubeGeo, cubeMaterial);
    cubeMesh.castShadow = true;
    cubeMesh.position.copy(cubeBody.position);

    function animate() {
        requestAnimationFrame(() => {
            // 更新立方体网格的位置和旋转，以匹配其物理体的状态
            cubeMesh.position.copy(cubeBody.position);
            cubeMesh.quaternion.copy(cubeBody.quaternion);
            animate()
        });
    }
    if (mass != 0) {
        animate()
    }
    return {
        cubeMesh,
        cubeBody,
        cubePhysMat
    };
}
export function createSphere({
    radius = 0.5,
    position = new THREE.Vector3(),
    velocity = new THREE.Vector3(),
    angularVelocity = new THREE.Vector3(),
    color = 0x00ff00,
    materialName = "SpherePhysMaterial",
    mass = 1
} = {}) {
    // 创建球体几何体
    const sphereGeo = new THREE.SphereGeometry(radius, 32, 32);

    // 创建球体材质
    const sphereMaterial = new THREE.MeshStandardMaterial({
        color
    });

    // 创建球体物理材质
    const spherePhysMat = new CANNON.Material(materialName);

    // 创建球体物理体
    const sphereBody = new CANNON.Body({
        mass,
        material: spherePhysMat
    });
    sphereBody.addShape(new CANNON.Sphere(radius));
    sphereBody.position.copy(position);
    sphereBody.velocity.copy(velocity);
    sphereBody.angularVelocity.copy(angularVelocity);

    // 创建球体的Three.js网格
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMaterial);
    sphereMesh.castShadow = true;
    sphereMesh.position.copy(sphereBody.position);

    function animate() {
        requestAnimationFrame(() => {
            // 更新球体网格的位置和旋转，以匹配其物理体的状态
            sphereMesh.position.copy(sphereBody.position);
            sphereMesh.quaternion.copy(sphereBody.quaternion);
            animate()
        });
    }
    if (mass != 0) {
        animate()
    }
    return {
        sphereBody,
        sphereMesh,
        spherePhysMat
    };
}

// 创建平面材质
/**
 * 配置两种材质之间的接触属性。
 * 
 * @param {CANNON.World} world - Cannon.js物理世界的实例。
 * @param {CANNON.Material} materialA - 第一种物理材质。
 * @param {CANNON.Material} materialB - 第二种物理材质。
 * @param {Object} [options] - 配置选项，包含摩擦、恢复系数等。
 * @param {number} [options.friction=0.3] - 接触摩擦系数，默认为0.3。
 * @param {number} [options.restitution=0.3] - 接触恢复系数（弹性），默认为0.3。
 */
export function configureContactMaterials(world, materialA, materialB, options = {}) {
    const {
        friction = 0.3,
            restitution = 0.3,
    } = options;

    const contactMaterial = new CANNON.ContactMaterial(materialA, materialB, {
        friction,
        restitution,
        ...options
    });

    world.addContactMaterial(contactMaterial);
}