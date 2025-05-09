import * as THREE from 'three';
import * as kokomi from 'kokomi.js';
import Stats from 'stats.js';


class Sketch extends kokomi.Base {
  create() {
    const that = this
    // 容器和统计对象变量声明
    let stats: Stats;

    let mesh: THREE.Mesh;


    // 初始化函数，设置场景、相机、渲染器等
    function init() {
      // that.camera.fov = 27;
      that.camera.near = 1;
      that.camera.far = 4096;
      that.camera.updateProjectionMatrix()
      that.camera.position.z = 2048;

      // 创建场景，设置背景色和雾效
      that.scene.background = new THREE.Color(0x050505);
      that.scene.fog = new THREE.Fog(0x050505, 2000, 3500);

      // 添加环境光
      that.scene.add(new THREE.AmbientLight(0xcccccc));

      // 创建并添加方向光
      const light1 = new THREE.DirectionalLight(0xffffff, 1.5);
      light1.position.set(1, 1, 1);
      that.scene.add(light1);

      const light2 = new THREE.DirectionalLight(0xffffff, 4.5);
      light2.position.set(0, - 1, 0);
      that.scene.add(light2);

      // 几何体参数设置
      const triangles = 160000;

      const geometry = new THREE.BufferGeometry();

      /**
      * 循环生成指定数量 (triangles) 的三角形。
      * 为每个三角形生成一个中心点 (x, y, z)，这些坐标是在 [-n/2, n/2] 区间内的随机数。
      * 生成三个顶点 A, B, C，每个顶点相对于中心点 (x, y, z) 在 [-d/2, d/2] 区间内随机偏移。
      * 将这三个顶点的位置数据添加到 positions 数组中。
      * 使用 THREE.Vector3 对象 pA, pB, pC 来存储顶点位置。
      * 计算向量 CB 和 AB，分别表示从顶点 B 到 C 和从 B 到 A 的方向。
      * 计算向量 CB 和 AB 的叉积得到三角形的法线向量，并将其存储在 CB 中。
      * 将法线向量归一化。
      * 将归一化的法线向量添加到 normals 数组三次（对应每个顶点）。
      * 根据中心点 (x, y, z) 的位置计算颜色值，范围在 [0, 1] 内。
      * 使用 THREE.Color 对象 color 来存储颜色值。
      * 为每个顶点生成一个随机的透明度值 alpha。
      * 将颜色值及透明度添加到 colors 数组三次（对应每个顶点）。
      */
      const positions = [];
      const normals = [];
      const colors = [];

      const color = new THREE.Color();

      const n = 800, n2 = n / 2;
      const d = 12, d2 = d / 2;

      const pA = new THREE.Vector3();
      const pB = new THREE.Vector3();
      const pC = new THREE.Vector3();

      const cb = new THREE.Vector3();
      const ab = new THREE.Vector3();

      // 生成并设置顶点、法线和颜色数据
      for (let i = 0; i < triangles; i++) {
        // 生成随机位置
        const x = Math.random() * n - n2;
        const y = Math.random() * n - n2;
        const z = Math.random() * n - n2;

        // 生成三角形顶点
        const ax = x + Math.random() * d - d2;
        const ay = y + Math.random() * d - d2;
        const az = z + Math.random() * d - d2;

        const bx = x + Math.random() * d - d2;
        const by = y + Math.random() * d - d2;
        const bz = z + Math.random() * d - d2;

        const cx = x + Math.random() * d - d2;
        const cy = y + Math.random() * d - d2;
        const cz = z + Math.random() * d - d2;

        // 存储顶点位置
        positions.push(ax, ay, az);
        positions.push(bx, by, bz);
        positions.push(cx, cy, cz);

        // 计算并存储三角形法线
        pA.set(ax, ay, az);
        pB.set(bx, by, bz);
        pC.set(cx, cy, cz);

        // 计算向量cb和向量ab的差值，结果存储在cb中
        cb.subVectors(pC, pB);

        // 计算向量ab和向量ab的差值，结果存储在ab中
        ab.subVectors(pA, pB);

        // 计算向量cb和向量ab的叉积，结果存储在cb中,这里计算叉积的目的是为了得到一个与原向量ab和cb都垂直的向量
        cb.cross(ab);

        cb.normalize();

        const nx = cb.x;
        const ny = cb.y;
        const nz = cb.z;

        normals.push(nx, ny, nz);

        // 生成并存储颜色
        const vx = (x / n) + 0.5;
        const vy = (y / n) + 0.5;
        const vz = (z / n) + 0.5;

        color.setRGB(vx, vy, vz);

        const alpha = Math.random();

        colors.push(color.r, color.g, color.b, alpha);
        colors.push(color.r, color.g, color.b, alpha);
        colors.push(color.r, color.g, color.b, alpha);

      }

      function disposeArray() {

        this.array = null;

      }

      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3).onUpload(disposeArray));
      geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3).onUpload(disposeArray));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 4).onUpload(disposeArray));

      geometry.computeBoundingSphere();

      // 创建材质
      const material = new THREE.MeshPhongMaterial({
        color: 0xd5d5d5, specular: 0xffffff, shininess: 250,
        side: THREE.DoubleSide, vertexColors: true, transparent: true
      });

      // 创建并添加网格对象到场景
      mesh = new THREE.Mesh(geometry, material);
      that.scene.add(mesh);

      // 创建并添加统计对象到容器
      stats = new Stats();

      // 窗口大小调整事件监听
      window.addEventListener('resize', onWindowResize);

    }

    // 窗口大小调整时的处理函数
    function onWindowResize() {
      // 更新相机宽高比和渲染器大小
      // that.camera.aspect = window.innerWidth / window.innerHeight;
      that.camera.updateProjectionMatrix();
      that.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    this.update(() => {
      stats.update();
      // 更新当前时间
      const time = Date.now() * 0.001;
      // 设置网格对象旋转
      mesh.rotation.x = time * 0.25;
      mesh.rotation.y = time * 0.5;
    })

    // 初始化函数
    init();
  }
}
// 创建Sketch实例并初始化
const sketch = new Sketch("#sketch");
sketch.create();
