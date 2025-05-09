import * as THREE from 'three';
import * as kokomi from 'kokomi.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass';
import { EffectComposer, RenderPass, BloomPass } from 'three-stdlib'
class CustomMesh extends THREE.Mesh {
  dx: number;
  dy: number;
}
class CustomMaterial extends THREE.MeshLambertMaterial {
  hue: number;
  saturation: number;
}
class Sketch extends kokomi.Base {
  /**
   * 创建一个三维场景，包括网格、材质和动画等。
   * 该函数主要负责初始化场景、添加物体和处理鼠标移动事件。
   */
  create() {
    // 声明一个自定义网格变量
    let mesh: CustomMesh;
    // 声明一个自定义材质变量
    let material: CustomMaterial;
    // 保存当前上下文的引用
    const that = this;
    // 声明一个效果合成器变量，用于后期处理
    let composer: EffectComposer;
    // 鼠标在窗口的X坐标
    let mouseX = 0;
    // 鼠标在窗口的Y坐标
    let mouseY = 0;
    // 窗口中心的X坐标
    let windowHalfX = window.innerWidth / 2;
    // 窗口中心的Y坐标
    let windowHalfY = window.innerHeight / 2;
    // 保存立方体的数量
    let cube_count: number;
    // 保存所有网格和材质的数组
    const meshes: CustomMesh[] = [],
      materials: CustomMaterial[] = [];
    // 定义网格的行数和列数
    const xgrid = 20,
      ygrid = 10;

    /**
     * 初始化函数，负责设置相机、灯光、纹理和事件监听器等。
     */
    function init() {
      // 移除页面中的某个元素
      const overlay = document.getElementById('overlay');
      overlay!.remove();
      // 设置相机的参数
      that.camera.near = 1;
      that.camera.far = 1000;
      that.camera.position.z = 500;
      that.camera.updateProjectionMatrix();
      // 添加一个方向光到场景中
      const light = new THREE.DirectionalLight(0xffffff, 3);
      light.position.set(0.5, 1, 1).normalize();
      that.scene.add(light);
      // 获取并设置背景视频
      let video = document.getElementById('video') as HTMLVideoElement;
      video.play();
      video.addEventListener('play', function () {
        this.currentTime = 3;
      });
      // 创建视频纹理
      let texture = new THREE.VideoTexture(video);
      texture.colorSpace = THREE.SRGBColorSpace;
      // 循环变量
      let i, j, ox, oy, geometry;
      // 计算每个网格的UV单位大小
      const ux = 1 / xgrid;
      const uy = 1 / ygrid;
      // 计算每个网格的尺寸
      const xsize = 480 / xgrid;
      const ysize = 204 / ygrid;
      // 设置立方体的参数
      const parameters = { color: 0xffffff, map: texture };
      // 初始化立方体数量
      cube_count = 0;
      // 循环创建立方体网格和材质
      for (i = 0; i < xgrid; i++) {
        for (j = 0; j < ygrid; j++) {
          ox = i;
          oy = j;
          geometry = new THREE.BoxGeometry(xsize, ysize, xsize);
          change_uvs(geometry, ux, uy, ox, oy);
          materials[cube_count] = new CustomMaterial(parameters);
          material = materials[cube_count];
          material.hue = i / xgrid;
          material.saturation = 1 - j / ygrid;
          material.color.setHSL(material.hue, material.saturation, 0.5);
          mesh = new CustomMesh(geometry, material);
          mesh.position.x = (i - xgrid / 2) * xsize;
          mesh.position.y = (j - ygrid / 2) * ysize;
          mesh.position.z = 0;
          mesh.scale.x = mesh.scale.y = mesh.scale.z = 1;
          that.scene.add(mesh);
          mesh.dx = 0.001 * (0.5 - Math.random());
          mesh.dy = 0.001 * (0.5 - Math.random());
          meshes[cube_count] = mesh;
          cube_count += 1;
        }
      }
      // 设置渲染器的自动清除为false
      that.renderer.autoClear = false;
      // 监听鼠标移动事件
      document.addEventListener('mousemove', onDocumentMouseMove);
      // 设置后期处理的各个通道
      const renderPass = new RenderPass(that.scene, that.camera);
      const bloomPass = new BloomPass(1.3);
      const outputPass = new OutputPass();
      composer = new EffectComposer(that.renderer);
      composer.addPass(renderPass);
      composer.addPass(bloomPass);
      composer.addPass(outputPass);
      // 监听窗口的大小改变事件
      window.addEventListener('resize', onWindowResize);
    }

    /**
     * 窗口大小调整时的处理函数，主要负责更新相机和渲染器的尺寸。
     */
    function onWindowResize() {
      windowHalfX = window.innerWidth / 2;
      windowHalfY = window.innerHeight / 2;
      that.camera.updateProjectionMatrix();
      that.renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * 修改网格的UV坐标，用于正确映射纹理。
     * @param geometry 网格的几何体
     * @param unitx 每个网格单元的宽度
     * @param unity 每个网格单元的高度
     * @param offsetx X方向的偏移量
     * @param offsety Y方向的偏移量
     */
    function change_uvs(geometry: THREE.BoxGeometry, unitx: number, unity: number, offsetx: number, offsety: number) {
      const uvs = geometry.attributes.uv.array;
      for (let i = 0; i < uvs.length; i += 2) {
        uvs[i] = (uvs[i] + offsetx) * unitx;
        uvs[i + 1] = (uvs[i + 1] + offsety) * unity;
      }
    }

    /**
     * 鼠标在文档上移动时的处理函数，主要负责更新鼠标的位置。
     * @param event 鼠标事件对象
     */
    function onDocumentMouseMove(event: MouseEvent) {
      mouseX = (event.clientX - windowHalfX);
      mouseY = (event.clientY - windowHalfY) * 0.3;
    }

    /**
     * 动画循环函数，不断请求下一帧并调用渲染函数。
     */
    function animate() {
      requestAnimationFrame(animate);
      render();
    }
    let h, counter = 1;


    /**
     * 渲染函数，主要负责更新场景中物体的位置和属性，并进行实际的渲染。
     */
    function render() {
      const time = Date.now() * 0.00005;
      that.camera.position.x += (mouseX - that.camera.position.x) * 0.05;
      that.camera.position.y += (- mouseY - that.camera.position.y) * 0.05;
      that.camera.lookAt(that.scene.position);
      for (let i = 0; i < cube_count; i++) {
        let material = materials[i];
        h = (360 * (material.hue + time) % 360) / 360;
        material.color.setHSL(h, material.saturation, 0.5);
      }
      if (counter % 1000 > 200) {
        for (let i = 0; i < cube_count; i++) {
          mesh = meshes[i];
          mesh.rotation.x += 10 * mesh.dx;
          mesh.rotation.y += 10 * mesh.dy;
          mesh.position.x -= 150 * mesh.dx;
          mesh.position.y += 150 * mesh.dy;
          mesh.position.z += 300 * mesh.dx;
        }
      }
      if (counter % 1000 === 0) {
        for (let i = 0; i < cube_count; i++) {
          mesh = meshes[i];
          mesh.dx *= -1;
          mesh.dy *= -1;
        }
      }
      counter++;
      that.renderer.clear();
      composer.render();
    }

    // 初始化场景
    init();
    // 开始动画循环
    animate();
  }
}
const startButton = document.getElementById('startButton');
startButton!.addEventListener('click', function () {
  // 创建Sketch实例并初始化
  const sketch = new Sketch("#sketch");
  sketch.create();
});
