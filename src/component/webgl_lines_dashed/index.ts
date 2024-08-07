// 导入THREE.js库
import * as THREE from 'three';
// 导入用于性能统计的Stats库
import Stats from 'stats.js';
// 导入用于生成几何数据的GeometryUtils库
import { GeometryUtils } from 'three-stdlib';
import * as kokomi from 'kokomi.js';
class Sketch extends kokomi.Base {
  create() {
    // 用于存储场景中的对象
    const objects: THREE.Line[] = [];
    const that = this
    let stats: Stats;
    // 初始化函数
    function init() {
      // 创建透视相机并设置位置
      // that.camera.fov = 60;
      // that.camera.aspect = 1;
      that.camera.near = 1;
      that.camera.far = 200
      that.camera.position.z = 150;

      // 创建场景并设置背景和雾效
      that.scene.background = new THREE.Color(0x111111);
      that.scene.fog = new THREE.Fog(0x111111, 150, 200);

      // 定义曲线的细分和递归深度
      const subdivisions = 6;
      const recursion = 1;

      // 生成希爾伯特曲线点
      const points = GeometryUtils.hilbert3D(new THREE.Vector3(0, 0, 0), 25.0, recursion, 0, 1, 2, 3, 4, 5, 6, 7);
      // 创建Catmull-Rom样条曲线
      const spline = new THREE.CatmullRomCurve3(points);

      // 生成细分后的曲线点，并创建缓冲几何体
      const samples = spline.getPoints(points.length * subdivisions);
      const geometrySpline = new THREE.BufferGeometry().setFromPoints(samples);

      // 创建线条对象并添加到场景中
      const line = new THREE.Line(geometrySpline, new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: 1, gapSize: 0.5 }));
      line.computeLineDistances();
      objects.push(line);
      that.scene.add(line);

      // 创建盒形线条对象并添加到场景中
      const geometryBox = box(50, 50, 50);
      const lineSegments = new THREE.LineSegments(geometryBox, new THREE.LineDashedMaterial({ color: 0xffaa00, dashSize: 3, gapSize: 1 }));
      lineSegments.computeLineDistances();
      objects.push(lineSegments);
      that.scene.add(lineSegments);

      // 初始化WebGL渲染器并添加到文档中
      document.body.appendChild(that.renderer.domElement);

      // 初始化性能统计对象并添加到文档中
      stats = new Stats();
      document.body.appendChild(stats.dom);

      // 监听窗口大小改变事件以调整画布大小
      window.addEventListener('resize', onWindowResize);
      that.camera.updateProjectionMatrix();
    }

    // 创建盒形线条几何体的函数
    function box(width: number, height: number, depth: number) {
      // 计算盒形的一半尺寸
      width = width * 0.5,
        height = height * 0.5,
        depth = depth * 0.5;

      // 创建缓冲几何体并定义顶点位置
      const geometry = new THREE.BufferGeometry();
      const position = [];

      position.push(
        - width, - height, - depth,
        - width, height, - depth,

        - width, height, - depth,
        width, height, - depth,

        width, height, - depth,
        width, - height, - depth,

        width, - height, - depth,
        - width, - height, - depth,

        - width, - height, depth,
        - width, height, depth,

        - width, height, depth,
        width, height, depth,

        width, height, depth,
        width, - height, depth,

        width, - height, depth,
        - width, - height, depth,

        - width, - height, - depth,
        - width, - height, depth,

        - width, height, - depth,
        - width, height, depth,

        width, height, - depth,
        width, height, depth,

        width, - height, - depth,
        width, - height, depth
      );

      // 将顶点数据设置到几何体中
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(position, 3));
      return geometry;
    }

    // 窗口大小改变时的回调函数
    function onWindowResize() {
      // 调整相机的宽高比并更新投影矩阵
      // that.camera.aspect = window.innerWidth / window.innerHeight;
      that.camera.updateProjectionMatrix();
      // 调整渲染器的大小
      that.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    this.update(() => {
      stats.update();
      const time = Date.now() * 0.001;
      that.scene.traverse(function (object) {
        if (object instanceof THREE.Line) {
          object.rotation.x = 0.25 * time;
          object.rotation.y = 0.25 * time;
        }
      });
    })
    // 初始化场景和启动动画循环
    init();
  }
}

// 创建Sketch实例并初始化
const sketch = new Sketch("#sketch");
sketch.create();
