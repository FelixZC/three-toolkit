import * as THREE from 'three';
import * as kokomi from 'kokomi.js';
import Stats from 'stats.js';
import { GUI } from 'lil-gui';
type Parameter = [number[], THREE.Texture, number];

class Sketch extends kokomi.Base {
  create() {
    const that = this;
    // 初始化变量
    let stats: Stats;
    let parameters: Parameter[];
    let mouseX = 0, mouseY = 0;
    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;
    const materials: THREE.PointsMaterial[] = [];

    // 初始化和动画函数
    init();
    animate();

    // 初始化场景
    function init() {
      // that.camera.fov = 75;
      that.camera.near = 1;
      that.camera.far = 10000;
      that.camera.updateProjectionMatrix();

      that.scene.fog = new THREE.FogExp2(0x000000, 0.0008);
      // 创建几何体和顶点数组
      const geometry = new THREE.BufferGeometry();
      const vertices = [];

      // 创建纹理加载器
      const textureLoader = new THREE.TextureLoader();

      // 为加载的纹理分配SRGB颜色空间
      const assignSRGB = (texture: THREE.Texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
      };

      // 加载不同的雪花纹理
      const sprite1 = textureLoader.load('../../assets/images/textures/sprites/snowflake1.png', assignSRGB);
      const sprite2 = textureLoader.load('../../assets/images/textures/sprites/snowflake2.png', assignSRGB);
      const sprite3 = textureLoader.load('../../assets/images/textures/sprites/snowflake3.png', assignSRGB);
      const sprite4 = textureLoader.load('../../assets/images/textures/sprites/snowflake4.png', assignSRGB);
      const sprite5 = textureLoader.load('../../assets/images/textures/sprites/snowflake5.png', assignSRGB);

      // 为每个雪花生成随机位置
      for (let i = 0; i < 10000; i++) {
        const x = Math.random() * 2000 - 1000;
        const y = Math.random() * 2000 - 1000;
        const z = Math.random() * 2000 - 1000;
        vertices.push(x, y, z);
      }

      // 将顶点数据设置到几何体
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      // 定义不同类型的雪花参数
      parameters = [
        [[1.0, 0.2, 0.5], sprite2, 20],
        [[0.95, 0.1, 0.5], sprite3, 15],
        [[0.90, 0.05, 0.5], sprite1, 10],
        [[0.85, 0, 0.5], sprite5, 8],
        [[0.80, 0, 0.5], sprite4, 5]
      ];

      // 创建不同类型的雪花材质并添加到场景
      for (let i = 0; i < parameters.length; i++) {
        const color = parameters[i][0];
        const sprite = parameters[i][1];
        const size = parameters[i][2];

        materials[i] = new THREE.PointsMaterial({ size: size, map: sprite, blending: THREE.AdditiveBlending, depthTest: false, transparent: true });
        materials[i].color.setHSL(color[0], color[1], color[2], THREE.SRGBColorSpace);

        const particles = new THREE.Points(geometry, materials[i]);
        particles.rotation.x = Math.random() * 6;
        particles.rotation.y = Math.random() * 6;
        particles.rotation.z = Math.random() * 6;
        that.scene.add(particles);
      }

      // 添加性能统计工具
      stats = new Stats();
      document.body.appendChild(stats.dom);

      // 创建GUI界面
      const gui = new GUI();

      // 定义GUI控制的参数对象
      const params = {
        texture: true
      };

      // 在GUI中添加纹理开关控件
      gui.add(params, 'texture').onChange(function (value: boolean) {
        // 当纹理开关改变时，更新所有材质的纹理映射
        for (let i = 0; i < materials.length; i++) {
          materials[i].map = (value === true) ? parameters[i][1] : null;
          materials[i].needsUpdate = true;
        }
      });

      // 打开GUI界面
      gui.open();

      // 禁止页面的默认触摸操作
      document.body.style.touchAction = 'none';
      // 添加鼠标移动事件监听器
      document.body.addEventListener('pointermove', onPointerMove);

      // 添加窗口大小调整事件监听器
      window.addEventListener('resize', onWindowResize);

    }

    // 窗口大小改变时的处理函数，更新相机和渲染器的大小
    function onWindowResize() {
      windowHalfX = window.innerWidth / 2;
      windowHalfY = window.innerHeight / 2;
      // that.camera.aspect = window.innerWidth / window.innerHeight;
      that.camera.updateProjectionMatrix();
      that.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // 指针移动事件的处理函数，更新鼠标位置变量
    function onPointerMove(event: PointerEvent) {
      if (event.isPrimary === false) return;
      mouseX = event.clientX - windowHalfX;
      mouseY = event.clientY - windowHalfY;
    }

    // 动画循环函数
    function animate() {
      requestAnimationFrame(animate);
      render();
      stats.update();
    }

    // 渲染函数
    function render() {
      const time = Date.now() * 0.00005;
      that.camera.position.x += (mouseX - that.camera.position.x) * 0.05;
      that.camera.position.y += (- mouseY - that.camera.position.y) * 0.05;
      that.camera.lookAt(that.scene.position);

      // 为场景中的每个雪花粒子设置旋转
      for (let i = 0; i < that.scene.children.length; i++) {
        const object = that.scene.children[i];
        if (object instanceof THREE.Points) {
          object.rotation.y = time * (i < 4 ? i + 1 : - (i + 1));
        }
      }

      // 为每种材质设置颜色变化
      for (let i = 0; i < materials.length; i++) {
        const color = parameters[i][0];
        const h = (360 * (color[0] + time) % 360) / 360;
        materials[i].color.setHSL(h, color[1], color[2], THREE.SRGBColorSpace);
      }
    }
  }
}
// 创建Sketch实例并初始化
const sketch = new Sketch("#sketch");
sketch.create();
