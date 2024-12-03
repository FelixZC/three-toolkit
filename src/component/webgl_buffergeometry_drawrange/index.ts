import * as THREE from 'three';
import * as kokomi from 'kokomi.js';
import Stats from 'stats.js';
import { GUI } from 'lil-gui';
import { OrbitControls } from 'three-stdlib';

interface ParticlesDataItem {
  velocity: THREE.Vector3;
  numConnections: number;
}
class Sketch extends kokomi.Base {
  create() {
    const that = this;
    // 声明未初始化的变量，用于后续的3D场景构建和粒子系统管理
    let group: THREE.Group;
    let stats: Stats;
    const particlesData: ParticlesDataItem[] = [];
    let positions: Float32Array, colors: Float32Array;
    let particles: THREE.BufferGeometry;
    let pointCloud: THREE.Points;
    let particlePositions: Float32Array;
    let linesMesh: THREE.LineSegments;

    // 定义变量以控制粒子系统的大小和显示效果
    const maxParticleCount = 1000;
    let particleCount = 500;
    const r = 800;
    const rHalf = r / 2;

    // 设置效果控制器，用于GUI中调节粒子系统参数
    const effectController = {
      showDots: true,
      showLines: true,
      minDistance: 150,
      limitConnections: false,
      maxConnections: 20,
      particleCount: 500
    };

    // 初始化GUI，以便用户可以动态调整粒子效果参数
    function initGUI() {

      const gui = new GUI();

      // 添加‘showDots’控件到GUI，当值改变时更新点云的可见性
      gui.add(effectController, 'showDots').onChange(function (value: boolean) {
        pointCloud.visible = value;
      });

      // 添加‘showLines’控件到GUI，当值改变时更新线条网格的可见性
      gui.add(effectController, 'showLines').onChange(function (value: boolean) {
        linesMesh.visible = value;
      });

      // 添加‘minDistance’控件到GUI，允许用户设置最小距离
      gui.add(effectController, 'minDistance', 10, 300);

      // 添加‘limitConnections’控件到GUI
      gui.add(effectController, 'limitConnections');

      // 添加‘maxConnections’控件到GUI，允许用户设置最大连接数
      gui.add(effectController, 'maxConnections', 0, 30, 1);

      // 添加‘particleCount’控件到GUI，当值改变时更新粒子数量和绘制范围
      gui.add(effectController, 'particleCount', 0, maxParticleCount, 1).onChange(function (value: number) {
        particleCount = value;
        particles.setDrawRange(0, particleCount);
      });

    }

    function init() {

      initGUI();

      that.camera.near = 1;
      that.camera.far = 4000;
      that.camera.position.z = 1750;
      that.camera.updateProjectionMatrix()
      const controls = new OrbitControls(that.camera, that.container);
      controls.minDistance = 1000;
      controls.maxDistance = 3000;

      // 创建一个组，并将其添加到场景中
      group = new THREE.Group();
      that.scene.add(group);

      // 创建一个盒子辅助器，并设置其材质属性
      const helper = new THREE.BoxHelper(new THREE.Mesh(new THREE.BoxGeometry(r, r, r)));
      helper.material.color.setHex(0x474747);
      helper.material.blending = THREE.AdditiveBlending;
      helper.material.transparent = true;
      group.add(helper);

      // 计算最大粒子数的平方
      const segments = maxParticleCount * maxParticleCount;

      // 初始化粒子的位置和颜色数组
      positions = new Float32Array(segments * 3);
      colors = new Float32Array(segments * 3);

      // 创建粒子材质
      const pMaterial = new THREE.PointsMaterial({
        color: 0xFFFFFF,
        size: 3,
        blending: THREE.AdditiveBlending,
        transparent: true,
        sizeAttenuation: false
      });

      // 创建粒子几何体，并初始化粒子位置
      particles = new THREE.BufferGeometry();
      particlePositions = new Float32Array(maxParticleCount * 3);

      // 遍历每个粒子，随机初始化其位置和数据
      for (let i = 0; i < maxParticleCount; i++) {

        const x = Math.random() * r - r / 2;
        const y = Math.random() * r - r / 2;
        const z = Math.random() * r - r / 2;

        particlePositions[i * 3] = x;
        particlePositions[i * 3 + 1] = y;
        particlePositions[i * 3 + 2] = z;

        // 将粒子数据添加到几何体中
        particlesData.push({
          velocity: new THREE.Vector3(- 1 + Math.random() * 2, - 1 + Math.random() * 2, - 1 + Math.random() * 2),
          numConnections: 0
        });

      }

      // 设置粒子几何体的绘制范围和位置属性
      particles.setDrawRange(0, particleCount);
      particles.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3).setUsage(THREE.DynamicDrawUsage));

      // 创建粒子系统，并将其添加到组中
      pointCloud = new THREE.Points(particles, pMaterial);
      group.add(pointCloud);

      // 创建线条几何体，并设置其位置和颜色属性
      const geometry = new THREE.BufferGeometry();

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3).setUsage(THREE.DynamicDrawUsage));

      // 计算几何体的包围球
      geometry.computeBoundingSphere();

      // 设置几何体的绘制范围
      geometry.setDrawRange(0, 0);

      // 创建线条材质
      const material = new THREE.LineBasicMaterial({
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true
      });

      // 创建线条网格，并将其添加到组中
      linesMesh = new THREE.LineSegments(geometry, material);
      group.add(linesMesh);

      // 添加统计插件到容器中
      stats = new Stats();
      that.container.appendChild(stats.dom);

      // 窗口大小调整事件监听
      window.addEventListener('resize', onWindowResize);
    }
    // 初始化函数
    function onWindowResize() {

      // 更新相机的宽高比和渲染器的大小
      // that.camera.aspect = window.innerWidth / window.innerHeight;
      that.camera.updateProjectionMatrix();
      that.renderer.setSize(window.innerWidth, window.innerHeight);

    }

    this.update(() => {

      // 重置粒子连接数
      let vertexpos = 0;
      let colorpos = 0;
      let numConnected = 0;
      for (let i = 0; i < particleCount; i++)
        particlesData[i].numConnections = 0;

      // 遍历每个粒子，更新其位置和连接数
      for (let i = 0; i < particleCount; i++) {

        // 获取粒子数据
        const particleData = particlesData[i];

        // 更新粒子位置
        particlePositions[i * 3] += particleData.velocity.x;
        particlePositions[i * 3 + 1] += particleData.velocity.y;
        particlePositions[i * 3 + 2] += particleData.velocity.z;

        // 粒子反弹逻辑
        if (particlePositions[i * 3 + 1] < - rHalf || particlePositions[i * 3 + 1] > rHalf)
          particleData.velocity.y = - particleData.velocity.y;

        if (particlePositions[i * 3] < - rHalf || particlePositions[i * 3] > rHalf)
          particleData.velocity.x = - particleData.velocity.x;

        if (particlePositions[i * 3 + 2] < - rHalf || particlePositions[i * 3 + 2] > rHalf)
          particleData.velocity.z = - particleData.velocity.z;

        // 检查粒子连接数限制
        if (effectController.limitConnections && particleData.numConnections >= effectController.maxConnections)
          continue;

        // 碰撞检测
        for (let j = i + 1; j < particleCount; j++) {

          const particleDataB = particlesData[j];
          if (effectController.limitConnections && particleDataB.numConnections >= effectController.maxConnections)
            continue;

          // 计算距离
          const dx = particlePositions[i * 3] - particlePositions[j * 3];
          const dy = particlePositions[i * 3 + 1] - particlePositions[j * 3 + 1];
          const dz = particlePositions[i * 3 + 2] - particlePositions[j * 3 + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          // 如果距离小于最小距离，则连接粒子
          if (dist < effectController.minDistance) {

            particleData.numConnections++;
            particleDataB.numConnections++;

            const alpha = 1.0 - dist / effectController.minDistance;

            positions[vertexpos++] = particlePositions[i * 3];
            positions[vertexpos++] = particlePositions[i * 3 + 1];
            positions[vertexpos++] = particlePositions[i * 3 + 2];

            positions[vertexpos++] = particlePositions[j * 3];
            positions[vertexpos++] = particlePositions[j * 3 + 1];
            positions[vertexpos++] = particlePositions[j * 3 + 2];

            colors[colorpos++] = alpha;
            colors[colorpos++] = alpha;
            colors[colorpos++] = alpha;

            colors[colorpos++] = alpha;
            colors[colorpos++] = alpha;
            colors[colorpos++] = alpha;

            numConnected++;

          }

        }

      }

      // 更新线条网格的绘制范围和属性
      linesMesh.geometry.setDrawRange(0, numConnected * 2);
      linesMesh.geometry.attributes.position.needsUpdate = true;
      linesMesh.geometry.attributes.color.needsUpdate = true;

      pointCloud.geometry.attributes.position.needsUpdate = true;


      // 更新统计插件
      stats.update();
      // 更新时间
      const time = Date.now() * 0.001;

      // 更新组的旋转
      group.rotation.y = time * 0.1;

    })

    init()

  }
}
// 创建Sketch实例并初始化
const sketch = new Sketch("#sketch");
sketch.create();
