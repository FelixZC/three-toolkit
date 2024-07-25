
import * as kokomi from "kokomi.js";
import * as THREE from 'three';
import Stats from 'stats.js';
import { Octree } from 'three/examples/jsm/math/Octree'
import { OctreeHelper } from 'three/examples/jsm/helpers/OctreeHelper';
import { GUI } from 'lil-gui';
import { Capsule, GLTF } from "three-stdlib";
import resources from "./resources";
export default class Sketch extends kokomi.Base {
  am: kokomi.AssetManager
  async create() {
    const that = this
    this.am = new kokomi.AssetManager(this, resources);
    that.scene.background = new THREE.Color(0x88ccee);
    that.scene.fog = new THREE.Fog(0x88ccee, 0, 50);
    that.camera.near = 0.1;
    that.camera.far = 1000;
    that.camera.rotation.order = 'YXZ';
    // 添加环境光和方向光，用于场景中的照明
    const fillLight1 = new THREE.HemisphereLight(0x8dc1de, 0x00668d, 1.5);
    fillLight1.position.set(2, 1, 1);
    that.scene.add(fillLight1);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
    directionalLight.position.set(- 5, 25, - 1);
    directionalLight.castShadow = true;
    // 配置方向光的阴影效果
    directionalLight.shadow.camera.near = 0.01;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.left = - 30;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = - 30;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.radius = 4;
    directionalLight.shadow.bias = - 0.00006;
    that.scene.add(directionalLight);
    // 开启阴影效果
    that.renderer.shadowMap.enabled = true;
    that.renderer.shadowMap.type = THREE.VSMShadowMap;
    that.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // 初始化性能统计器
    const stats = new Stats();
    stats.dom.style.position = 'absolute';
    stats.dom.style.top = '0px';
    that.container.appendChild(stats.dom);
    // 定义物理模拟的参数
    const GRAVITY = 30;
    const NUM_SPHERES = 100;
    const SPHERE_RADIUS = 0.2;
    const STEPS_PER_FRAME = 5;
    // 创建球体几何体和材质
    const sphereGeometry = new THREE.IcosahedronGeometry(SPHERE_RADIUS, 5);
    const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0xdede8d });
    interface SphereData {
      mesh: THREE.Mesh<THREE.BufferGeometry, THREE.Material>;
      collider: THREE.Sphere;
      velocity: THREE.Vector3;
    }
    const spheres: SphereData[] = [];
    let sphereIdx: number = 0;
    // 创建并初始化多个球体，用于物理模拟
    for (let i = 0; i < NUM_SPHERES; i++) {
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.castShadow = true;
      sphere.receiveShadow = true;
      that.scene.add(sphere);
      spheres.push({
        mesh: sphere,
        collider: new THREE.Sphere(new THREE.Vector3(0, -100, 0), SPHERE_RADIUS),
        velocity: new THREE.Vector3()
      });
    }
    // 初始化用于空间分区的八叉树
    const worldOctree = new Octree();
    // 定义玩家碰撞胶囊，中心位于(0, 0.35, 0)，方向为(0, 1, 0)，半径为0.35
    const playerCollider = new Capsule(new THREE.Vector3(0, 0.35, 0), new THREE.Vector3(0, 1, 0), 0.35);
    // 定义玩家的速度和方向向量
    const playerVelocity = new THREE.Vector3();
    const playerDirection = new THREE.Vector3();
    // 标记玩家是否在地面上，以及最后一次鼠标动作的时间
    let playerOnFloor = false;
    let mouseTime = 0;
    // 记录玩家按下的键的状态
    const keyStates: { [key: string]: boolean } = {};
    // 创建临时向量以供计算使用
    const vector1 = new THREE.Vector3();
    const vector2 = new THREE.Vector3();
    const vector3 = new THREE.Vector3();
    // 处理按键按下事件，记录按下的键
    document.addEventListener('keydown', (event) => {
      keyStates[event.code] = true;
    });
    // 处理按键释放事件，记录释放的键
    document.addEventListener('keyup', (event) => {
      keyStates[event.code] = false;
    });
    // 当鼠标点击时开始锁定指针，以控制相机
    that.container.addEventListener('mousedown', () => {
      document.body.requestPointerLock();
      mouseTime = performance.now();
    });
    // 当鼠标释放时解除指针锁定
    document.addEventListener('mouseup', () => {
      if (document.pointerLockElement !== null) throwBall();
    });
    // 当指针被锁定时，根据鼠标移动更新相机旋转
    document.body.addEventListener('mousemove', (event) => {
      if (document.pointerLockElement === document.body) {
        that.camera.rotation.y -= event.movementX / 500;
        that.camera.rotation.x -= event.movementY / 500;
      }
    });
    // 当窗口大小改变时，调整渲染器尺寸并更新相机的宽高比
    window.addEventListener('resize', onWindowResize);
    function onWindowResize() {
      // that.camera.aspect = window.innerWidth / window.innerHeight;
      that.camera.updateProjectionMatrix();
      that.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    // 投掷球体的函数
    // 根据玩家的方向计算球体的方向，并向球体的速度添加冲量
    function throwBall() {
      const sphere = spheres[sphereIdx];
      // 获取相机的世界方向作为玩家的方向
      that.camera.getWorldDirection(playerDirection);
      // 设置球体碰撞器的中心点为玩家胶囊的终点加上一个方向向量乘以半径
      sphere.collider.center.copy(playerCollider.end).addScaledVector(playerDirection, playerCollider.radius * 1.5);
      // 根据鼠标按钮按下的时间和玩家的前进速度计算冲量，并将其应用到球体的速度上
      // 按钮按得越久，或玩家向前移动时，球投得更有力
      const impulse = 15 + 30 * (1 - Math.exp((mouseTime - performance.now()) * 0.001));
      sphere.velocity.copy(playerDirection).multiplyScalar(impulse);
      sphere.velocity.addScaledVector(playerVelocity, 2);
      // 更新要投掷的球体索引
      sphereIdx = (sphereIdx + 1) % spheres.length;
    }
    /**
     * 检测玩家角色与游戏世界中的碰撞。
     * 使用世界八叉树和玩家碰撞体来检测碰撞，并根据碰撞结果调整玩家的状态和位置。
     * 这个函数主要处理玩家是否站在地面上以及如何响应碰撞来调整玩家的运动状态。
     */
    function playerCollisions() {
      // 使用世界八叉树和玩家碰撞体进行胶囊碰撞检测。
      const result = worldOctree.capsuleIntersect(playerCollider);
      // 默认设置玩家不在地面上。
      playerOnFloor = false;
      // 如果检测到碰撞，则处理碰撞结果。
      if (result) {
        // 判断玩家是否站在地面上，基于碰撞法线的y轴分量。
        playerOnFloor = result.normal.y > 0;
        // 如果玩家不在地面上，根据碰撞法线和玩家速度的点积，反向抵消部分速度。
        if (!playerOnFloor) {
          playerVelocity.addScaledVector(result.normal, - result.normal.dot(playerVelocity));
        }
        // 根据碰撞深度，沿着碰撞法线移动玩家碰撞体，以解决穿透问题。
        playerCollider.translate(result.normal.multiplyScalar(result.depth));
      }
    }
    /**
     * 根据传递的时间差更新玩家状态。
     * 应用力阻尼和重力，更新玩家的位置，并处理碰撞。
     * @param {Number} deltaTime - 自上次更新以来的时间间隔。
     */
    function updatePlayer(deltaTime: number) {
      // 计算阻尼因子，随时间降低玩家的速度。
      let damping = Math.exp(- 4 * deltaTime) - 1;
      if (!playerOnFloor) {
        // 在空中时应用重力影响。
        playerVelocity.y -= GRAVITY * deltaTime;
        // 小气阻。
        damping *= 0.1;
      }
      // 应用阻尼到玩家速度上。
      playerVelocity.addScaledVector(playerVelocity, damping);
      // 计算位置变化量。
      const positionChange = playerVelocity.clone().multiplyScalar(deltaTime);
      playerCollider.translate(positionChange);
      // 处理玩家碰撞。
      playerCollisions();
      // 更新摄像机位置跟随玩家。
      that.camera.position.copy(playerCollider.end);
    }
    /**
     * 处理玩家与球体之间的碰撞。
     * @param {Object} sphere - 与玩家发生碰撞的球体对象。
     */
    function playerSphereCollision(sphere: SphereData) {
      // 计算玩家中心点。
      const centerPoint = vector1.addVectors(playerCollider.start, playerCollider.end).multiplyScalar(0.5);
      // 获取球体中心。
      const sphereCenter = sphere.collider.center;
      // 计算两球半径之和的平方。
      const radiusSum = playerCollider.radius + sphere.collider.radius;
      const radiusSquared = radiusSum * radiusSum;
      // 近似：玩家由3个球体组成。
      for (const point of [playerCollider.start, playerCollider.end, centerPoint]) {
        // 计算点到球体中心的距离平方。
        const distanceSquared = point.distanceToSquared(sphereCenter);
        if (distanceSquared < radiusSquared) {
          // 计算碰撞法线并标准化。
          const normal = vector1.subVectors(point, sphereCenter).normalize();
          // 投影玩家速度和球体速度到法线上。
          const v1 = vector2.copy(normal).multiplyScalar(normal.dot(playerVelocity));
          const v2 = vector3.copy(normal).multiplyScalar(normal.dot(sphere.velocity));
          // 更新玩家和球体速度。
          playerVelocity.add(v2).sub(v1);
          sphere.velocity.add(v1).sub(v2);
          // 计算需要移动的距离。
          const moveDistance = (radiusSum - Math.sqrt(distanceSquared)) / 2;
          sphereCenter.addScaledVector(normal, - moveDistance);
        }
      }
    }
    /**
     * 检查所有球体间的碰撞，并处理碰撞后的反弹效果。
     * 此函数通过遍历所有球体对，计算它们之间的距离和碰撞程度，然后调整它们的速度和位置。
     */
    function spheresCollisions() {
      // 遍历所有球体，检查每对球体是否发生碰撞
      for (let i = 0, length = spheres.length; i < length; i++) {
        const s1 = spheres[i];
        // 从当前球体向后遍历其他球体，避免重复检查
        for (let j = i + 1; j < length; j++) {
          const s2 = spheres[j];
          // 计算两球心之间的距离平方
          const d2 = s1.collider.center.distanceToSquared(s2.collider.center);
          // 计算两球半径之和的平方
          const r = s1.collider.radius + s2.collider.radius;
          const r2 = r * r;
          // 如果两球心距离小于两球半径之和，即发生碰撞
          if (d2 < r2) {
            // 计算碰撞法线方向
            const normal = vector1.subVectors(s1.collider.center, s2.collider.center).normalize();
            // 计算两球在碰撞法线方向上的速度分量
            const v1 = vector2.copy(normal).multiplyScalar(normal.dot(s1.velocity));
            const v2 = vector3.copy(normal).multiplyScalar(normal.dot(s2.velocity));
            // 根据弹性碰撞公式调整两球速度
            s1.velocity.add(v2).sub(v1);
            s2.velocity.add(v1).sub(v2);
            // 计算两球心在碰撞法线方向上的位移
            const d = (r - Math.sqrt(d2)) / 2;
            // 调整两球心位置，完成碰撞处理
            s1.collider.center.addScaledVector(normal, d);
            s2.collider.center.addScaledVector(normal, -d);
          }
        }
      }
    }
    /**
     * 更新所有球体的状态，包括位置、速度等。
     * 此函数处理球体与世界、球体与球体之间的交互，如重力、碰撞反弹等。
     * @param {number} deltaTime - 本次更新与上次更新之间的时间间隔。
     */
    function updateSpheres(deltaTime: number) {
      // 遍历所有球体，更新状态
      spheres.forEach(sphere => {
        // 根据速度更新球体位置
        sphere.collider.center.addScaledVector(sphere.velocity, deltaTime);
        // 检查球体与世界Octree的碰撞
        const result = worldOctree.sphereIntersect(sphere.collider);
        if (result) {
          // 如果球体与世界碰撞，调整速度和位置
          sphere.velocity.addScaledVector(result.normal, -result.normal.dot(sphere.velocity) * 1.5);
          sphere.collider.center.add(result.normal.multiplyScalar(result.depth));
        } else {
          // 如果没有碰撞，应用重力
          sphere.velocity.y -= GRAVITY * deltaTime;
        }
        // 应用速度阻尼，减少球体速度
        const damping = Math.exp(-1.5 * deltaTime) - 1;
        sphere.velocity.addScaledVector(sphere.velocity, damping);
        // 处理玩家球体碰撞
        playerSphereCollision(sphere);
      });
      // 处理球体间碰撞
      spheresCollisions();
      // 更新球体mesh的位置，使其与物理状态同步
      for (const sphere of spheres) {
        sphere.mesh.position.copy(sphere.collider.center);
      }
    }
    /**
     * 计算并返回玩家视角前向向量。
     * 此函数用于确定玩家的移动方向。
     * @returns {Vector3} 玩家视角前向向量。
     */
    function getForwardVector() {
      // 获取相机指向的世界方向
      that.camera.getWorldDirection(playerDirection);
      // 去除y分量，限制玩家只能在水平面上移动
      playerDirection.y = 0;
      // 重新归一化，保持向量长度为1
      playerDirection.normalize();
      return playerDirection;
    }
    /**
     * 计算并返回玩家视角侧向向量。
     * 此函数用于确定玩家的侧向移动方向。
     * @returns {Vector3} 玩家视角侧向向量。
     */
    function getSideVector() {
      // 获取相机指向的世界方向
      that.camera.getWorldDirection(playerDirection);
      // 去除y分量，限制玩家只能在水平面上移动
      playerDirection.y = 0;
      // 重新归一化，保持向量长度为1
      playerDirection.normalize();
      // 计算与相机上向量的叉积，得到玩家的侧向向量
      playerDirection.cross(that.camera.up);
      return playerDirection;
    }
    /**
     * 处理玩家的控制输入，更新玩家的速度。
     * 此函数根据玩家的键盘输入调整玩家球体的速度。
     * @param {number} deltaTime - 本次更新与上次更新之间的时间间隔。
     */
    function controls(deltaTime: number) {
      // 定义速度增量，玩家在地面时速度更快
      const speedDelta = deltaTime * (playerOnFloor ? 25 : 8);
      // 根据W键输入，加速或减速玩家球体
      if (keyStates['KeyW']) {
        playerVelocity.add(getForwardVector().multiplyScalar(speedDelta));
      }
      if (keyStates['KeyS']) {
        playerVelocity.add(getForwardVector().multiplyScalar(-speedDelta));
      }
      // 根据A键和D键输入，让玩家球体侧滑
      if (keyStates['KeyA']) {
        playerVelocity.add(getSideVector().multiplyScalar(-speedDelta));
      }
      if (keyStates['KeyD']) {
        playerVelocity.add(getSideVector().multiplyScalar(speedDelta));
      }
      // 如果玩家在地面，允许跳跃
      if (playerOnFloor) {
        if (keyStates['Space']) {
          playerVelocity.y = 15;
        }
      }
    }
    // 创建GLTF加载器并设置模型路径
    this.am.on("ready", () => {
      const gltf = this.am.items['collision-world'] as GLTF;
      // 将加载的模型添加到场景中
      that.scene.add(gltf.scene);
      // 从模型节点构建八叉树
      worldOctree.fromGraphNode(gltf.scene);
      // 遍历模型的所有子节点
      gltf.scene.traverse(child => {
        // 如果子节点是网格对象
        if (child instanceof THREE.Mesh) {
          // 设置网格对象可投射阴影和接收阴影
          child.castShadow = true;
          child.receiveShadow = true;
          // 如果网格对象有材质贴图
          if (child.material.map) {
            // 设置贴图各向异性级别
            child.material.map.anisotropy = 4;
          }
        }
      });
      // 创建一个八叉树辅助对象
      const helper = new OctreeHelper(worldOctree);
      // 设置辅助对象不可见
      helper.visible = true;
      // 添加辅助对象到场景
      that.scene.add(helper);
      // 初始化GUI界面
      const gui = new GUI({ width: 200 });
      // 在GUI上添加调试开关
      gui.add({ debug: false }, 'debug')
        // 当调试开关状态改变时，更新辅助对象的可见性
        .onChange(function (value: boolean) {
          helper.visible = value;
        });
    });
    /**
     * 检查玩家是否超出边界，如果超出则将玩家传送到安全位置。
     */
    function teleportPlayerIfOob() {
      // 如果玩家位置Y坐标小于等于-25
      if (that.camera.position.y <= - 25) {
        // 重置玩家碰撞检测起始点
        playerCollider.start.set(0, 0.35, 0);
        // 重置玩家碰撞检测结束点
        playerCollider.end.set(0, 1, 0);
        // 重置玩家碰撞半径
        playerCollider.radius = 0.35;
        // 复制碰撞检测结束点到相机位置
        that.camera.position.copy(playerCollider.end);
        // 重置相机旋转角度
        that.camera.rotation.set(0, 0, 0);
      }
    }
    this.update(() => {
      // 计算帧时间差，限制最大值并除以每帧步数
      const deltaTime = Math.min(0.05, that.clock.deltaTime) / STEPS_PER_FRAME;
      // 使用多个子步骤来检测碰撞，减少物体穿透的风险
      for (let i = 0; i < STEPS_PER_FRAME; i++) {
        // 更新控制输入
        controls(deltaTime);
        // 更新玩家状态
        updatePlayer(deltaTime);
        // 更新球体状态
        updateSpheres(deltaTime);
        // 如果玩家超出边界，则进行传送
        teleportPlayerIfOob();
      }
      // 更新性能统计信息
      stats.update();
    })
  }
}
// 创建Sketch实例并初始化
const sketch = new Sketch("#sketch");
sketch.create();
