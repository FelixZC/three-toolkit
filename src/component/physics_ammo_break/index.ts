import * as THREE from 'three';
import Stats from 'stats.js';
import { OrbitControls, ConvexObjectBreaker, ConvexGeometry } from "three-stdlib";
//@ts-ignore
import Ammo from 'ammo.js'
import * as kokomi from "kokomi.js";
export default class Sketch extends kokomi.Base {
  create() {
    const that = this
    window.Ammo = Ammo;
    // Graphics variables
    let stats: Stats;
    let textureLoader: THREE.TextureLoader;
    const mouseCoords = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    const ballMaterial = new THREE.MeshPhongMaterial({ color: 0x202020 });
    // Physics variables
    const gravityConstant = 7.8;
    let collisionConfiguration;
    let dispatcher: Ammo.btCollisionDispatcher;
    let broadphase;
    let solver;
    let physicsWorld: Ammo.btDiscreteDynamicsWorld;
    const margin = 0.05;
    const convexBreaker = new ConvexObjectBreaker();
    // Rigid bodies include all movable objects
    const rigidBodies: THREE.Mesh[] = [];
    const pos = new THREE.Vector3();
    const quat = new THREE.Quaternion();
    let transformAux1: Ammo.btTransform;
    let tempBtVec3_1: Ammo.btVector3;
    const objectsToRemove: THREE.Mesh[] | null[] = [];
    for (let i = 0; i < 500; i++) {
      objectsToRemove[i] = null;
    }
    let numObjectsToRemove = 0;
    const impactPoint = new THREE.Vector3();
    const impactNormal = new THREE.Vector3();
    function initGraphics() {
      // that.camera.fov = 60;
      that.camera.near = 0.2;
      that.camera.far = 2000;
      that.scene.background = new THREE.Color(0xbfd1e5);
      that.camera.position.set(- 14, 8, 16);
      // that.renderer.antialias = true;
      that.camera.updateProjectionMatrix();
      that.renderer.shadowMap.enabled = true;
      let controls = new OrbitControls(that.camera, that.renderer.domElement);
      controls.target.set(0, 2, 0);
      controls.update();
      textureLoader = new THREE.TextureLoader();
      const ambientLight = new THREE.AmbientLight(0xbbbbbb);
      that.scene.add(ambientLight);
      const light = new THREE.DirectionalLight(0xffffff, 3);
      light.position.set(- 10, 18, 5);
      light.castShadow = true;
      const d = 14;
      light.shadow.camera.left = - d;
      light.shadow.camera.right = d;
      light.shadow.camera.top = d;
      light.shadow.camera.bottom = - d;
      light.shadow.camera.near = 2;
      light.shadow.camera.far = 50;
      light.shadow.mapSize.x = 1024;
      light.shadow.mapSize.y = 1024;
      that.scene.add(light);
      stats = new Stats();
      stats.dom.style.position = 'absolute';
      stats.dom.style.top = '0px';
      that.container.appendChild(stats.dom);
      window.addEventListener('resize', onWindowResize);
    }
    /**
     * 初始化物理模拟环境。
     * 此函数设置物理模拟所需的关键组件，包括碰撞配置、调度器、广相算法、求解器和物理世界。
     * 同时，它还设定了物理世界的重力，并准备了一些在物理模拟中常用的辅助对象。
     * 初始化这些对象对于物理模拟的正确运行至关重要。每个组件在模拟过程中扮演特定的角色。
     * - `collisionConfiguration` 用于定义碰撞检测的行为。
     * - `dispatcher` 负责分发碰撞事件。
     * - `broadphase` 用于在大规模场景中检测潜在的碰撞。
     * - `solver` 用于解决由广相和窄相检测到的碰撞。
     * - `physicsWorld` 集成了这些组件来管理整个物理模拟。
     * - `gravity` 是一个基本设置，影响物理世界中所有物体的行为。
     * - `transformAux1` 和 `tempBtVec3_1` 是用于物理模拟中的变换和向量运算的辅助对象。
     */
    function initPhysics() {
      // 初始化默认的碰撞配置
      collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
      // 初始化碰撞调度器
      dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
      // 初始化广相算法进行碰撞检测
      broadphase = new Ammo.btDbvtBroadphase();
      // 初始化用于解决碰撞的求解器
      solver = new Ammo.btSequentialImpulseConstraintSolver();
      // 初始化物理世界，整合所有组件进行物理模拟
      physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration);
      // 设置物理世界的重力
      physicsWorld.setGravity(new Ammo.btVector3(0, - gravityConstant, 0));
      // 初始化辅助变换对象，用于物理模拟中的物体变换
      transformAux1 = new Ammo.btTransform();
      // 初始化临时向量对象，用于物理模拟中的向量运算
      tempBtVec3_1 = new Ammo.btVector3(0, 0, 0);
    }
    /**
     * 创建一个具有物理特性的三维物体。
     * 该函数通过给定的质量、尺寸、位置和旋转角度来创建一个具有刚体物理特性的三维物体。
     * 它使用THREE.js库来构建和配置三维物体的几何形状、材质，以及物理属性。
     *
     * @param mass 物体的质量，用于物理模拟。
     * @param halfExtents 物体半尺寸，定义物体的几何形状。
     * @param pos 物体的初始位置。
     * @param quat 物体的初始旋转四元数。
     * @param material 物体的材质。
     */
    function createObject(mass: number, halfExtents: THREE.Vector3, pos: THREE.Vector3, quat: THREE.Quaternion, material: THREE.Material) {
      // 创建一个带有几何形状和材质的三维物体（网格）。
      const object = new THREE.Mesh(new THREE.BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2), material);

      // 设置物体的初始位置。
      object.position.copy(pos);

      // 设置物体的初始旋转。
      object.quaternion.copy(quat);

      // 为物体设置物理特性，准备将其分解为碎片。
      convexBreaker.prepareBreakableObject(object, mass, new THREE.Vector3(), new THREE.Vector3(), true);

      // 根据物体创建碎片。
      createDebrisFromBreakableObject(object);
    }
    /**
     * 创建场景中的物体对象，包括地面、塔楼、桥梁、石头和山。
     * 这个函数通过设置不同的参数，如位置、旋转、质量和材质，来创建各种物体。
     * 对于某些物体，如地面和山，还应用了纹理以增加真实感。
     * 物体的创建涉及到物理引擎的设置，以确保它们在模拟环境中表现正确。
     */
    function createObjects() {
      // 设置地面的位置和旋转，创建带有物理特性的长方体对象，并启用接收阴影
      // Ground
      pos.set(0, - 0.5, 0);
      quat.set(0, 0, 0, 1);
      const ground = createParalellepipedWithPhysics(40, 1, 40, 0, pos, quat, new THREE.MeshPhongMaterial({ color: 0xFFFFFF }));
      ground.receiveShadow = true;

      // 加载地面纹理，并应用到地面材质上
      textureLoader.load('../../assets/images/textures/grid.png', function (texture) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(40, 40);
        const material = ground.material as THREE.MeshPhongMaterial;
        material.map = texture;
        material.needsUpdate = true;
      });

      // 创建两座塔楼，分别位于左侧和右侧
      const towerMass = 1000;
      const towerHalfExtents = new THREE.Vector3(2, 5, 2);
      pos.set(- 8, 5, 0);
      quat.set(0, 0, 0, 1);
      createObject(towerMass, towerHalfExtents, pos, quat, createMaterial(0xB03014));

      // Tower 2
      pos.set(8, 5, 0);
      quat.set(0, 0, 0, 1);
      createObject(towerMass, towerHalfExtents, pos, quat, createMaterial(0xB03214));

      // 创建桥梁，设置其质量和位置
      //Bridge
      const bridgeMass = 100;
      const bridgeHalfExtents = new THREE.Vector3(7, 0.2, 1.5);
      pos.set(0, 10.2, 0);
      quat.set(0, 0, 0, 1);
      createObject(bridgeMass, bridgeHalfExtents, pos, quat, createMaterial(0xB3B865));

      // 创建一系列石头
      // Stones
      const stoneMass = 120;
      const stoneHalfExtents = new THREE.Vector3(1, 2, 0.15);
      const numStones = 8;
      quat.set(0, 0, 0, 1);
      for (let i = 0; i < numStones; i++) {
        pos.set(0, 2, 15 * (0.5 - i / (numStones + 1)));
        createObject(stoneMass, stoneHalfExtents, pos, quat, createMaterial(0xB0B0B0));
      }

      // 创建山，设置其质量和位置，以及山的形状
      // Mountain
      const mountainMass = 860;
      const mountainHalfExtents = new THREE.Vector3(4, 5, 4);
      pos.set(5, mountainHalfExtents.y * 0.5, - 7);
      quat.set(0, 0, 0, 1);
      const mountainPoints = [];
      mountainPoints.push(new THREE.Vector3(mountainHalfExtents.x, - mountainHalfExtents.y, mountainHalfExtents.z));
      mountainPoints.push(new THREE.Vector3(- mountainHalfExtents.x, - mountainHalfExtents.y, mountainHalfExtents.z));
      mountainPoints.push(new THREE.Vector3(mountainHalfExtents.x, - mountainHalfExtents.y, - mountainHalfExtents.z));
      mountainPoints.push(new THREE.Vector3(- mountainHalfExtents.x, - mountainHalfExtents.y, - mountainHalfExtents.z));
      mountainPoints.push(new THREE.Vector3(0, mountainHalfExtents.y, 0));
      const mountain = new THREE.Mesh(new ConvexGeometry(mountainPoints), createMaterial(0xB03814));
      mountain.position.copy(pos);
      mountain.quaternion.copy(quat);
      convexBreaker.prepareBreakableObject(mountain, mountainMass, new THREE.Vector3(), new THREE.Vector3(), true);
      createDebrisFromBreakableObject(mountain);
    }
    /**
     * 创建一个具有物理特性的平行六面体三维物体。
     * 该函数通过Three.js库创建一个Mesh对象，并为其赋予物理特性，使其能够在物理引擎中运行。
     * 主要用于模拟物理环境中的刚体对象，如箱子等。
     * @param sx 平行六面体的宽度。
     * @param sy 平行六面体的高度。
     * @param sz 平行六面体的深度。
     * @param mass 平行六面体的质量，用于确定其在物理引擎中的重力和运动特性。
     * @param pos 平行六面体的初始位置，使用Three.js的Vector3对象表示。
     * @param quat 平行六面体的初始旋转，使用Three.js的Quaternion对象表示。
     * @param material 平行六面体的材质，用于渲染其表面。
     * @returns 返回一个具有物理特性的Three.js Mesh对象。
     */
    function createParalellepipedWithPhysics(sx: number, sy: number, sz: number, mass: number, pos: THREE.Vector3, quat: THREE.Quaternion, material: THREE.Material) {
      // 创建一个Three.js的Mesh对象，用于表示平行六面体的外观。
      const object = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz, 1, 1, 1), material);

      // 创建一个物理形状对象，用于在物理引擎中表示平行六面体的形状。
      const shape = new Ammo.btBoxShape(new Ammo.btVector3(sx * 0.5, sy * 0.5, sz * 0.5));

      // 设置形状的边缘 margin，用于调整物理碰撞的精确度。
      shape.setMargin(margin);

      // 为Mesh对象添加物理特性，使其能够在物理引擎中运动和碰撞。
      createRigidBody(object, shape, mass, pos, quat);

      // 返回具有物理特性的Mesh对象。
      return object;
    }
    /**
     * 创建从可破坏对象产生的残骸。
     * 该函数用于为游戏或模拟中可破坏的对象创建物理残骸。它通过调整Three.js的Mesh对象的属性，
     * 并利用Ammo.js（一个物理引擎库）创建物理形状和刚体，来模拟物体破坏后的散落效果。
     *
     * @param object 一个Three.js的Mesh对象，表示可破坏的对象。它将被用于生成残骸的物理形状和属性。
     */
    function createDebrisFromBreakableObject(object: THREE.Mesh) {
      // 启用对象的阴影投射和接收阴影，以增强视觉真实感。
      object.castShadow = true;
      object.receiveShadow = true;

      // 根据对象的几何形状创建一个凸包物理形状，用于模拟残骸的物理特性。
      const shape = createConvexHullPhysicsShape(object.geometry.attributes.position.array);

      // 设置物理形状的边缘余量，以调整碰撞检测的精度。
      shape.setMargin(margin);

      // 创建一个刚体，它将用于模拟残骸在物理世界中的行为。刚体的参数包括质量、速度和角速度等。
      const body = createRigidBody(object, shape, object.userData.mass, null, null, object.userData.velocity, object.userData.angularVelocity);

      // 创建一个Ammo.js的btVector3对象，用于存储与Three.js对象相关的用户数据。
      const btVecUserData = new Ammo.btVector3(0, 0, 0);

      // 将Three.js对象与Ammo.js的btVector3对象关联起来，以便在物理引擎中访问和操作Three.js对象。
      //@ts-ignore
      btVecUserData.threeObject = object;

      // 将用户数据指针设置到刚体上，以便在物理模拟过程中访问和修改对象的属性。
      // body.setUserPointer(btVecUserData);
      //@ts-ignore
      body.btVecUserData = btVecUserData
    }
    function removeDebris(object: THREE.Mesh) {
      that.scene.remove(object);
      physicsWorld.removeRigidBody(object.userData.physicsBody);
    }
    /**
     * 创建一个凸包物理形状。
     * 凸包物理形状用于模拟具有复杂形状的物体的物理行为，通过将三维点集转换为凸包形状，可以为这些物体提供更真实的物理模拟。
     * 此函数使用THREE.js的TypedArray作为输入，该数组包含定义凸包形状的点的坐标。
     * @param coords THREE.js的TypedArray，包含一系列三维点的坐标，每个点的坐标连续存储，即x，y，z。
     * @returns 返回一个Ammo.js的btConvexHullShape对象，该对象表示创建的凸包物理形状。
     */
    function createConvexHullPhysicsShape(coords: THREE.TypedArray) {
      // 创建一个凸包形状对象。
      const shape = new Ammo.btConvexHullShape();

      // 遍历坐标数组，每次处理3个值作为一个三维点。
      for (let i = 0, il = coords.length; i < il; i += 3) {
        // 设置临时的三维向量，用于存储当前处理的点的坐标。
        tempBtVec3_1.setValue(coords[i], coords[i + 1], coords[i + 2]);

        // 判断当前点是否为最后一个点，用于告知形状对象是否结束点的添加。
        const lastOne = (i >= (il - 3));

        // 将当前点添加到凸包形状中，如果当前点是最后一个点，则标记为最后一个。
        shape.addPoint(tempBtVec3_1, lastOne);
      }

      // 返回创建好的凸包形状对象。
      return shape;
    }
    /**
     * 创建一个刚体对象。
     * 该函数用于在物理世界中创建一个刚体，它将一个THREE.Mesh对象与物理形状和质量相结合，
     * 并将其添加到物理世界中。刚体可以是有质量的（因此受到重力和其他力的影响），也可以是静态的。
     *
     * @param object THREE.Mesh对象，刚体的可视化表示。
     * @param physicsShape Ammo.btSphereShape对象，刚体的物理形状。
     * @param mass 刚体的质量，用于计算物理行为。
     * @param pos 刚体的初始位置，如果为null，则使用对象当前的位置。
     * @param quat 刚体的初始旋转，如果为null，则使用对象当前的旋转。
     * @param vel 刚体的初始线性速度，可选参数。
     * @param angVel 刚体的初始角速度，可选参数。
     * @returns 返回创建的刚体对象。
     */
    function createRigidBody(object: THREE.Mesh, physicsShape: Ammo.btSphereShape, mass: number, pos: THREE.Vector3 | null, quat: THREE.Quaternion | null, vel?: THREE.Vector3, angVel?: THREE.Vector3) {
      // 如果提供了初始位置，则将其复制到对象位置，否则使用对象当前位置。
      if (pos) {
        object.position.copy(pos);
      } else {
        pos = object.position;
      }

      // 如果提供了初始旋转，则将其复制到对象旋转，否则使用对象当前旋转。
      if (quat) {
        object.quaternion.copy(quat);
      } else {
        quat = object.quaternion;
      }

      // 创建并初始化一个btTransform对象，用于定义刚体的初始位置和旋转。
      const transform = new Ammo.btTransform();
      transform.setIdentity();
      transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
      transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));

      // 创建一个btDefaultMotionState对象，用于管理刚体的运动状态。
      const motionState = new Ammo.btDefaultMotionState(transform);

      // 计算刚体的局部惯性。
      const localInertia = new Ammo.btVector3(0, 0, 0);
      physicsShape.calculateLocalInertia(mass, localInertia);

      // 创建刚体的构造信息，包括质量、运动状态、物理形状和局部惯性。
      const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, physicsShape, localInertia);

      // 根据构造信息创建刚体对象。
      const body = new Ammo.btRigidBody(rbInfo);

      // 设置刚体的摩擦系数。
      body.setFriction(0.5);

      // 如果提供了初始线性速度，则设置刚体的线性速度。
      if (vel) {
        body.setLinearVelocity(new Ammo.btVector3(vel.x, vel.y, vel.z));
      }

      // 如果提供了初始角速度，则设置刚体的角速度。
      if (angVel) {
        body.setAngularVelocity(new Ammo.btVector3(angVel.x, angVel.y, angVel.z));
      }

      // 将刚体的用户数据设置为包含刚体对象和碰撞状态。
      object.userData.physicsBody = body;
      object.userData.collided = false;

      // 将对象添加到场景中。
      that.scene.add(object);

      // 如果刚体的质量大于0，则将其添加到动态物体列表中，并设置激活状态。
      if (mass > 0) {
        rigidBodies.push(object);
        // Disable deactivation
        body.setActivationState(4);
      }

      // 将刚体添加到物理世界中。
      physicsWorld.addRigidBody(body);

      // 返回创建的刚体对象。
      return body;
    }
    function createRandomColor() {
      return Math.floor(Math.random() * (1 << 24));
    }
    function createMaterial(color: THREE.ColorRepresentation) {
      color = color || createRandomColor();
      return new THREE.MeshPhongMaterial({ color: color });
    }
    /**
     * 初始化窗口的输入监听器。
     * 此函数设置鼠标点击事件，包括根据鼠标位置计算三维空间中的坐标，
     * 并基于该位置创建和发射一个三维球体网格。
     * 当鼠标被点击时，它会计算射线的方向和位置，然后为球体创建物理实体并赋予其初始速度。
     */
    function initInput() {
      // 为窗口添加鼠标按下事件监听器
      window.addEventListener('pointerdown', function (event) {
        // 将屏幕上的鼠标位置转换为归一化设备坐标系统下的位置
        mouseCoords.set(
          (event.clientX / window.innerWidth) * 2 - 1,
          - (event.clientY / window.innerHeight) * 2 + 1
        );
        // 根据相机设置射线投射点
        raycaster.setFromCamera(mouseCoords, that.camera);

        // 创建一个球体并发射它
        const ballMass = 35; // 球体的质量
        const ballRadius = 0.4; // 球体的半径
        const ball = new THREE.Mesh(new THREE.SphereGeometry(ballRadius, 14, 10), ballMaterial); // 创建球体网格
        ball.castShadow = true; // 启用阴影投射
        ball.receiveShadow = true; // 接受阴影

        // 创建球体形状
        const ballShape = new Ammo.btSphereShape(ballRadius);
        ballShape.setMargin(margin); // 设置形状的边缘

        // 计算球体在世界中的位置
        pos.copy(raycaster.ray.direction);
        pos.add(raycaster.ray.origin);

        // 设置球体的旋转
        quat.set(0, 0, 0, 1);

        // 创建刚体
        const ballBody = createRigidBody(ball, ballShape, ballMass, pos, quat);

        // 计算球体的初始速度方向和大小
        pos.copy(raycaster.ray.direction);
        pos.multiplyScalar(24); // 设置球体的发射速度

        // 设置球体的线性速度
        ballBody.setLinearVelocity(new Ammo.btVector3(pos.x, pos.y, pos.z));
      });
    }
    function onWindowResize() {
      // that.camera.aspect = window.innerWidth / window.innerHeight;
      that.camera.updateProjectionMatrix();
      that.renderer.setSize(window.innerWidth, window.innerHeight);
    }


    /**
     * 更新物理模拟状态，基于给定的时间增量。
     * 此函数包括以下步骤：
     * 1. 进行物理世界的时间步进。
     * 2. 更新所有刚体对象的位置和旋转。
     * 3. 处理碰撞检测，并在碰撞力超过阈值时模拟可破坏物体的破碎。
     * @param deltaTime - 物理世界更新的时间增量。
     */
    function updatePhysics(deltaTime: number) {
      // 执行物理世界的模拟时间步进
      physicsWorld.stepSimulation(deltaTime, 10);

      // 更新所有刚体的位置和旋转
      for (let i = 0, il = rigidBodies.length; i < il; i++) {
        const objThree = rigidBodies[i];
        const objPhys = objThree.userData.physicsBody;
        const ms = objPhys.getMotionState();

        if (ms) {
          // 获取刚体的世界变换矩阵
          ms.getWorldTransform(transformAux1);
          // 从变换矩阵中获取位置和旋转信息
          const p = transformAux1.getOrigin();
          const q = transformAux1.getRotation();
          // 设置Three.js对象的位置和旋转
          objThree.position.set(p.x(), p.y(), p.z());
          objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
          // 清除碰撞标志
          objThree.userData.collided = false;
        }
      }

      // 处理所有接触点，检测碰撞并可能触发破碎效果
      for (let i = 0, il = dispatcher.getNumManifolds(); i < il; i++) {
        const contactManifold = dispatcher.getManifoldByIndexInternal(i);
        const rb0 = (Ammo as any).castObject(contactManifold.getBody0(), Ammo.btRigidBody);
        const rb1 = (Ammo as any).castObject(contactManifold.getBody1(), Ammo.btRigidBody);
        // const threeObject0 = (Ammo as any).castObject(rb0.getUserPointer(), Ammo.btVector3).threeObject;
        // const threeObject1 = (Ammo as any).castObject(rb1.getUserPointer(), Ammo.btVector3).threeObject;
        const threeObject0 = (Ammo as any).castObject({ ...rb0, ...rb0.btVecUserData }, Ammo.btVector3).threeObject;
        const threeObject1 = (Ammo as any).castObject({ ...rb1, ...rb1.btVecUserData }, Ammo.btVector3).threeObject;
        if (!threeObject0 && !threeObject1) {
          // 如果两个物体都没有对应的Three.js对象，跳过本次循环
          continue;
        }

        // 获取用户数据，包括是否可破碎和碰撞标志
        const userData0 = threeObject0 ? threeObject0.userData : null;
        const userData1 = threeObject1 ? threeObject1.userData : null;
        const breakable0 = userData0 ? userData0.breakable : false;
        const breakable1 = userData1 ? userData1.breakable : false;
        const collided0 = userData0 ? userData0.collided : false;
        const collided1 = userData1 ? userData1.collided : false;

        if ((!breakable0 && !breakable1) || (collided0 && collided1)) {
          // 如果两个物体都不可破碎或都已经发生过碰撞，跳过本次循环
          continue;
        }

        let contact = false;
        let maxImpulse = 0;
        // 检查接触点，寻找最大的碰撞力
        for (let j = 0, jl = contactManifold.getNumContacts(); j < jl; j++) {
          const contactPoint = contactManifold.getContactPoint(j);
          if (contactPoint.getDistance() < 0) {
            // 如果接触点的距离小于零，表示有碰撞
            contact = true;
            // ammo.js更新后getAppliedImpulse方法丢失，无法继续计算
            continue
            const impulse = contactPoint.getAppliedImpulse();
            if (impulse > maxImpulse) {
              // 记录最大的碰撞力和碰撞点的信息
              maxImpulse = impulse;
              const pos = contactPoint.get_m_positionWorldOnB();
              const normal = contactPoint.get_m_normalWorldOnB();
              impactPoint.set(pos.x(), pos.y(), pos.z());
              impactNormal.set(normal.x(), normal.y(), normal.z());
            }
            // 只需找到第一个有效的接触点即可
            break;
          }
        }

        // 如果没有有效的接触点，跳过本次循环
        if (!contact) continue;

        // 碎片化阈值
        const fractureImpulse = 250;

        // 处理可破碎物体的破碎逻辑
        if (breakable0 && !collided0 && maxImpulse > fractureImpulse) {
          // 对物体0进行碎片化处理
          const debris: THREE.Mesh[] = convexBreaker.subdivideByImpact(threeObject0, impactPoint, impactNormal, 1, 2) as THREE.Mesh[];
          const numObjects = debris.length;

          for (let j = 0; j < numObjects; j++) {
            // 设置碎片的速度和角速度
            const vel = rb0.getLinearVelocity();
            const angVel = rb0.getAngularVelocity();
            const fragment = debris[j];
            fragment.userData.velocity.set(vel.x(), vel.y(), vel.z());
            fragment.userData.angularVelocity.set(angVel.x(), angVel.y(), angVel.z());
            // 创建碎片对象
            createDebrisFromBreakableObject(fragment);
          }

          // 标记原物体为待移除
          objectsToRemove[numObjectsToRemove++] = threeObject0;
          userData0.collided = true;
        }

        if (breakable1 && !collided1 && maxImpulse > fractureImpulse) {
          // 对物体1进行碎片化处理
          const debris: THREE.Mesh[] = convexBreaker.subdivideByImpact(threeObject1, impactPoint, impactNormal, 1, 2) as THREE.Mesh[];
          const numObjects = debris.length;

          for (let j = 0; j < numObjects; j++) {
            // 设置碎片的速度和角速度
            const vel = rb1.getLinearVelocity();
            const angVel = rb1.getAngularVelocity();
            const fragment = debris[j];
            fragment.userData.velocity.set(vel.x(), vel.y(), vel.z());
            fragment.userData.angularVelocity.set(angVel.x(), angVel.y(), angVel.z());
            // 创建碎片对象
            createDebrisFromBreakableObject(fragment);
          }

          // 标记原物体为待移除
          objectsToRemove[numObjectsToRemove++] = threeObject1;
          userData1.collided = true;
        }
      }

      // 移除标记为待移除的物体
      for (let i = 0; i < numObjectsToRemove; i++) {
        removeDebris(objectsToRemove[i] as THREE.Mesh);
      }

      // 重置待移除物体的数量
      numObjectsToRemove = 0;
    }
    // - Functions -
    function init() {
      initGraphics();
      initPhysics();
      createObjects();
      initInput();
    }
    function animate() {
      requestAnimationFrame(animate);
      updatePhysics(that.clock.deltaTime);
      stats.update();
    }

    init();
    animate();
  }
}
// 创建Sketch实例并初始化
const sketch = new Sketch("#sketch");
sketch.create();
