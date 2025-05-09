import * as CANNON from "cannon-es";
import * as THREE from "three";
// 定义 Cannon 物理材质的接口
interface CannonMaterialOptions {
  // 这里可以添加物理材质的属性，例如摩擦力等
  friction?: number;
  restitution?: number;
}

/**
 * 直接初始化并配置一个默认的Cannon物理世界。
 * @returns {CANNON.World} 创建的物理世界实例，已含默认地面。
 */
export function createDefaultPhysicsWorld(): CANNON.World {
  const cannonWorld = new CANNON.World();
  cannonWorld.gravity.set(0, -9.82, 0);
  cannonWorld.broadphase = new CANNON.NaiveBroadphase();
  cannonWorld.allowSleep = true;
  return cannonWorld;
}
export function addPhysicsForMesh(
  mesh: THREE.Mesh | THREE.Group<THREE.Object3DEventMap>,
  materialOptions?: CannonMaterialOptions,
  mass: number = 1,
) {
  const meshBodyMaterial = new CANNON.Material(materialOptions);
  const meshBody = new CANNON.Body({
    mass: mass,
    material: meshBodyMaterial,
  });
  meshBody.position.copy(mesh.position as unknown as CANNON.Vec3);
  meshBody.quaternion.copy(mesh.quaternion as unknown as CANNON.Quaternion);
  meshBody.updateMassProperties();

  /**
   * 动画函数，用于每帧更新立方体的网格位置和旋转，以匹配物理体的状态。
   */
  function animate() {
    requestAnimationFrame(() => {
      mesh.position.copy(meshBody.position); // 更新位置
      mesh.quaternion.copy(meshBody.quaternion); // 更新旋转
      animate();
    });
  }
  if (mass != 0) {
    animate(); // 如果质量不为0，则开始动画
  }
  return {
    meshBody,
    meshBodyMaterial,
  };
}

// 定义 createGround 函数的参数接口
interface CreateGroundOptions {
  size?: number;
  depth?: number;
  meshMaterialOptions?: THREE.MeshPhysicalMaterialParameters;
  physicsMaterialOptions?: CannonMaterialOptions;
}

/**
 * 创建一个地面对象，包括地面的物理模拟和渲染。
 *
 * @param {Object} options 配置项对象，可包含以下属性：
 *   - size: 地面的尺寸，默认为25。
 *   - color: 地面的颜色，默认为0x808080（灰色）。
 *   - yOffset: 地面在Y轴上的偏移，默认为0。
 *   - meshMaterialOptions: 用于创建地面网格材质的选项对象，默认为空对象。
 *   - physicsMaterialOptions: 用于创建地面物理材质的选项对象，默认为空。
 * @returns {Object} 包含以下属性的对象：
 *   - groundBody: CANNON中的地面物理体对象。
 *   - groundMesh: THREE中的地面渲染网格对象。
 *   - groundPhysMat: 地面的物理材质对象。
 */
export function createGround({
  size = 25,
  depth = 0.01,
  meshMaterialOptions = {
    color: 0x808080,
  },
  physicsMaterialOptions,
}: CreateGroundOptions = {}): {
  groundBody: CANNON.Body;
  groundMesh: THREE.Mesh;
  groundPhysMat: CANNON.Material;
} {
  // 创建一个立方体几何体作为地面的基础形状
  const groundGeo = new THREE.BoxGeometry(size, depth, size);

  // 使用提供的颜色和额外的材质选项创建地面的渲染材质
  const groundMaterial = new THREE.MeshPhysicalMaterial({
    ...meshMaterialOptions,
  });

  // 创建地面的Three网格对象，并设置其接收阴影的属性
  const groundMesh = new THREE.Mesh(groundGeo, groundMaterial);
  groundMesh.receiveShadow = true;
  groundMesh.position.set(0, 0, 0);
  const { meshBody: groundBody, meshBodyMaterial: groundPhysMat } =
    addPhysicsForMesh(groundMesh, physicsMaterialOptions, 0);
  const shape = new CANNON.Box(new CANNON.Vec3(size / 2, depth / 2, size / 2));
  groundBody.addShape(shape);
  return {
    groundMesh,
    groundBody,
    groundPhysMat,
  };
}

// 定义 createCube 函数的参数接口
interface CreateCubeOptions {
  size?: number;
  position?: THREE.Vector3;
  mass?: number;
  meshMaterialOptions?: THREE.MeshPhysicalMaterialParameters;
  physicsMaterialOptions?: CannonMaterialOptions;
}

/**
 * 创建一个带有物理模拟的立方体。
 *
 * @param {Object} options 配置对象，包含立方体的各种属性。
 * @param {number} options.size 立方体的尺寸，默认为1。
 * @param {THREE.Vector3} options.position 立方体的初始位置，默认为(5, 5, 5)。
 * @param {number} options.mass 立方体的质量，默认为1。
 * @param {number|string} options.color 立方体的颜色，默认为红色（0xff0000）。
 * @param {Object} options.meshMaterialOptions 立方体网格材质的额外选项，默认为空对象。
 * @param {Object} options.physicsMaterialOptions 立方体物理材质的额外选项，默认为空。
 * @returns {Object} 返回一个包含立方体网格（cubeMesh）、立方体物理体（cubeBody）和立方体物理材质（cubePhysMat）的对象。
 */
export function createCube({
  size = 1,
  position = new THREE.Vector3(5, 5, 5),
  mass = 1,
  meshMaterialOptions = {
    color: 0xff0000,
  },
  physicsMaterialOptions,
}: CreateCubeOptions = {}): {
  cubeMesh: THREE.Mesh;
  cubeBody: CANNON.Body;
  cubePhysMat: CANNON.Material;
} {
  // 创建立方体几何体
  const cubeGeo = new THREE.BoxGeometry(size, size, size);

  // 创建立方体材质
  const cubeMaterial = new THREE.MeshPhysicalMaterial({
    ...meshMaterialOptions,
  });

  // 创建立方体的Three网格
  const cubeMesh = new THREE.Mesh(cubeGeo, cubeMaterial);
  cubeMesh.castShadow = true; // 立方体投射阴影
  cubeMesh.position.copy(position); // 初始位置设置
  const { meshBody: cubeBody, meshBodyMaterial: cubePhysMat } =
    addPhysicsForMesh(cubeMesh, physicsMaterialOptions, mass);
  const shape = new CANNON.Box(new CANNON.Vec3(size / 2, size / 2, size / 2));
  cubeBody.addShape(shape);
  return {
    cubeMesh,
    cubeBody,
    cubePhysMat,
  };
}

// 定义 createSphere 函数的参数接口
interface CreateSphereOptions {
  radius?: number;
  position?: THREE.Vector3;
  velocity?: THREE.Vector3;
  angularVelocity?: THREE.Vector3;
  mass?: number;
  meshMaterialOptions?: THREE.MeshPhysicalMaterialParameters;
  physicsMaterialOptions?: CannonMaterialOptions;
}

/**
 * 创建一个带有物理模拟的球体。
 *
 * @param {Object} 参数对象，包含球体的各种属性。
 * @param {number} radius 球体的半径，默认为0.5。
 * @param {THREE.Vector3} position 球体的初始位置，默认为新的THREE.Vector3()。
 * @param {THREE.Vector3} velocity 球体的初始速度，默认为新的THREE.Vector3()。
 * @param {THREE.Vector3} angularVelocity 球体的初始角速度，默认为新的THREE.Vector3()。
 * @param {number} color 球体的颜色，默认为绿色（0x00ff00）。
 * @param {number} mass 球体的质量，默认为1。
 * @param {Object} meshMaterialOptions 球体网格材质的选项，默认为空对象。
 * @param {Object} physicsMaterialOptions 球体物理材质的选项，默认为空。
 * @returns {Object} 返回一个包含球体物理体、网格和物理材质的对象。
 */
export function createSphere({
  radius = 0.5,
  position = new THREE.Vector3(),
  velocity = new THREE.Vector3(),
  angularVelocity = new THREE.Vector3(),
  mass = 1,
  meshMaterialOptions = {
    color: "0x00ff00",
  },
  physicsMaterialOptions,
}: CreateSphereOptions): {
  sphereMesh: THREE.Mesh;
  sphereBody: CANNON.Body;
  spherePhysMat: CANNON.Material;
} {
  // 创建球体几何体
  const sphereGeo = new THREE.SphereGeometry(radius, 32, 32);

  // 创建球体材质
  const sphereMaterial = new THREE.MeshPhysicalMaterial({
    ...meshMaterialOptions,
  });
  const sphereMesh = new THREE.Mesh(sphereGeo, sphereMaterial);
  sphereMesh.castShadow = true; // 球体投射阴影
  sphereMesh.position.copy(position); // 初始位置设置

  const { meshBody: sphereBody, meshBodyMaterial: spherePhysMat } =
    addPhysicsForMesh(sphereMesh, physicsMaterialOptions, mass);
  const shape = new CANNON.Sphere(radius);
  sphereBody.addShape(shape);
  sphereBody.velocity.copy(velocity as unknown as CANNON.Vec3);
  sphereBody.angularVelocity.copy(angularVelocity as unknown as CANNON.Vec3);

  /**
   * 动画函数，用于每帧更新球体的网格位置和旋转，以匹配其物理体的状态。
   */
  function animate() {
    requestAnimationFrame(() => {
      sphereMesh.position.copy(sphereBody.position);
      sphereMesh.quaternion.copy(sphereBody.quaternion);
      animate();
    });
  }
  if (mass != 0) {
    animate(); // 如果球体有质量，则开始动画更新
  }
  return {
    sphereBody,
    sphereMesh,
    spherePhysMat,
  };
}

// 定义 configureContactMaterials 函数的参数接口
interface ConfigureContactMaterialsOptions {
  friction?: number;
  restitution?: number;
  contactEquationStiffness?: number;
  contactEquationRelaxation?: number;
  frictionStiffness?: number;
  frictionRelaxation?: number;
  // 可以根据 CANNON 的 ContactMaterial 选项添加更多属性
}

/**
 * 配置两种材质之间的接触属性。
 *
 * @param {CANNON.World} world - Cannon物理世界的实例。
 * @param {CANNON.Material} materialA - 第一种物理材质。
 * @param {CANNON.Material} materialB - 第二种物理材质。
 * @param {Object} [options] - 配置选项，包含摩擦、恢复系数等。
 * @param {number} [options.friction=0.3] - 接触摩擦系数，默认为0.3。
 * @param {number} [options.restitution=0.3] - 接触恢复系数（弹性），默认为0.3。
 */
export function configureContactMaterials(
  world: CANNON.World,
  materialA: CANNON.Material,
  materialB: CANNON.Material,
  options: ConfigureContactMaterialsOptions = {},
): void {
  const { friction = 0.3, restitution = 0.3 } = options;
  const contactMaterial = new CANNON.ContactMaterial(materialA, materialB, {
    friction,
    restitution,
    ...options,
  });
  world.addContactMaterial(contactMaterial);
}

/**
 * 为给定的模型创建物理属性和物理体，使其能够在物理模拟中运行。
 * @param {Object} model - 用于物理模拟的三维模型。
 * @param {Object} materialOptions - 物理材质的选项。
 * @param {number} [mass=1] - 物理体的质量，默认为1。
 * @returns {Object} 包含模型、物理体和物理材质的对象。
 */
export function addPhysicsForModel(
  model: THREE.Group<THREE.Object3DEventMap>,
  materialOptions?: CannonMaterialOptions,
  mass: number = 1,
): {
  model: THREE.Group<THREE.Object3DEventMap>;
  gltfBody: CANNON.Body;
  gltfBodyMaterial: CANNON.Material;
} {
  // 计算模型的包围盒并创建相应的物理形状
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const halfExtents = new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2);
  const { meshBody: gltfBody, meshBodyMaterial: gltfBodyMaterial } =
    addPhysicsForMesh(model, materialOptions, mass);
  gltfBody.addShape(new CANNON.Box(halfExtents));
  gltfBody.addEventListener("collide", () => { });
  return {
    model,
    gltfBody,
    gltfBodyMaterial,
  };
}

export function addPhysicsForFont(
  mesh: THREE.Mesh,
  materialOptions?: CannonMaterialOptions,
  mass: number = 1,
): {
  mesh: THREE.Mesh;
  meshBody: CANNON.Body;
  meshBodyMaterial: CANNON.Material;
} {
  // 计算模型的包围盒并创建相应的物理形状
  const box = new THREE.Box3().setFromObject(mesh);
  const size = box.getSize(new THREE.Vector3());
  const fullExtents = new CANNON.Vec3(size.x, size.y, size.z);
  const { meshBody, meshBodyMaterial: meshBodyMaterial } = addPhysicsForMesh(
    mesh,
    materialOptions,
    mass,
  );
  meshBody.addShape(new CANNON.Box(fullExtents));
  return {
    mesh,
    meshBody,
    meshBodyMaterial,
  };
}
