import * as THREE from 'three';
import Stats from 'stats.js';
import * as kokomi from 'kokomi.js';
import { OrbitControls, OutlineEffect, FontLoader, TextGeometry, Font } from 'three-stdlib'
class Sketch extends kokomi.Base {
  create() {
    const that = this
    // 定义用于DOM元素和性能统计的变量
    let stats: Stats;
    // 定义相机、场景、渲染器和效果变量
    let effect: OutlineEffect;
    // 定义粒子光源变量
    let particleLight: THREE.Mesh;
    // 创建字体加载器实例
    const loader = new FontLoader();
    // 加载字体，加载完成后执行init和animate函数
    loader.load('../../assets/fonts/gentilis_regular.typeface.json', function (font) {
      init(font);
      animate();
    });
    // 初始化函数，用于设置场景、相机、渲染器等
    function init(font: Font) {
      that.camera.near = 1;
      that.camera.far = 2000;
      that.camera.position.set(0.0, 400, 400 * 3.5);
      that.camera.updateProjectionMatrix();
      that.scene.background = new THREE.Color(0x444488);
      // 材质设置开始
      const cubeWidth = 400;
      const numberOfSphersPerSide = 5;
      const sphereRadius = (cubeWidth / numberOfSphersPerSide) * 0.8 * 0.5;
      const stepSize = 1.0 / numberOfSphersPerSide;
      // 创建球体几何体
      const geometry = new THREE.SphereGeometry(sphereRadius, 32, 16);
      // 循环创建球体并设置材质
      for (let alpha = 0, alphaIndex = 0; alpha <= 1.0; alpha += stepSize, alphaIndex++) {
        const colors = new Uint8Array(alphaIndex + 2);
        for (let c = 0; c <= colors.length; c++) {
          colors[c] = (c / colors.length) * 256;
        }
        // 创建渐变贴图
        const gradientMap = new THREE.DataTexture(colors, colors.length, 1, THREE.RedFormat);
        gradientMap.needsUpdate = true;
        for (let beta = 0; beta <= 1.0; beta += stepSize) {
          for (let gamma = 0; gamma <= 1.0; gamma += stepSize) {
            // 计算漫反射颜色
            const diffuseColor = new THREE.Color().setHSL(alpha, 0.5, gamma * 0.5 + 0.1).multiplyScalar(1 - beta * 0.2);
            // 创建MeshToon材质并设置颜色和渐变贴图
            const material = new THREE.MeshToonMaterial({
              color: diffuseColor,
              gradientMap: gradientMap
            });
            // 创建网格物体并设置几何体和材质
            const mesh = new THREE.Mesh(geometry, material);
            // 设置网格物体的位置
            mesh.position.x = alpha * 400 - 200;
            mesh.position.y = beta * 400 - 200;
            mesh.position.z = gamma * 400 - 200;
            // 将网格物体添加到场景中
            that.scene.add(mesh);
          }
        }
      }
      // 添加标签函数
      function addLabel(name: string, location: THREE.Vector3) {
        // 创建文本几何体
        const textGeo = new TextGeometry(name, {
          font: font,
          size: 20,
          height: 1,
          curveSegments: 1
        });
        // 创建文本材质
        const textMaterial = new THREE.MeshBasicMaterial();
        // 创建文本网格物体
        const textMesh = new THREE.Mesh(textGeo, textMaterial);
        // 设置文本网格物体的位置
        textMesh.position.copy(location);
        // 将文本网格物体添加到场景中
        that.scene.add(textMesh);
      }
      // 添加标签到场景中
      addLabel('-gradientMap', new THREE.Vector3(- 350, 0, 0));
      addLabel('+gradientMap', new THREE.Vector3(350, 0, 0));
      addLabel('-diffuse', new THREE.Vector3(0, 0, - 300));
      addLabel('+diffuse', new THREE.Vector3(0, 0, 300));
      // 创建粒子光源并添加到场景中
      particleLight = new THREE.Mesh(
        new THREE.SphereGeometry(4, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      that.scene.add(particleLight);
      // 添加环境光到场景中
      that.scene.add(new THREE.AmbientLight(0xc1c1c1, 3));
      // 创建点光源并添加到粒子光源中
      const pointLight = new THREE.PointLight(0xffffff, 2, 800, 0);
      particleLight.add(pointLight);
      // 创建轮廓效果
      effect = new OutlineEffect(that.renderer);
      // 创建性能统计对象并添加到容器中
      stats = new Stats();
      that.container.appendChild(stats.dom);
      // 创建轨道控制器
      const controls = new OrbitControls(that.camera, that.renderer.domElement);
      // 设置控制器的最小和最大距离
      controls.minDistance = 200;
      controls.maxDistance = 2000;
      // 窗口大小改变时调用onWindowResize函数
      window.addEventListener('resize', onWindowResize);
    }
    // 窗口大小改变时调整渲染器和相机的宽高比
    function onWindowResize() {
      // that.camera.aspect = window.innerWidth / window.innerHeight;
      that.camera.updateProjectionMatrix();
      that.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    // 动画循环函数，不断调用自身实现持续渲染
    function animate() {
      requestAnimationFrame(animate);
      stats.begin();
      render();
      stats.end();
    }
    // 渲染函数，计算光源位置并调用effect渲染场景
    function render() {
      const timer = Date.now() * 0.00025;
      // 计算光源位置
      particleLight.position.x = Math.sin(timer * 7) * 300;
      particleLight.position.y = Math.cos(timer * 5) * 400;
      particleLight.position.z = Math.cos(timer * 3) * 300;
      // 使用effect渲染场景
      effect.render(that.scene, that.camera);
    }
  }
}
// 创建Sketch实例并初始化
const sketch = new Sketch("#sketch");
sketch.create();
