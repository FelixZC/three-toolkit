
import * as THREE from 'three';
import TWEEN from 'three/examples/jsm/libs/tween.module';
import { CSS3DRenderer, CSS3DObject, TrackballControls } from 'three-stdlib'
import table from './table'
interface Targets {
  table: THREE.Object3D[]
  sphere: THREE.Object3D[]
  helix: THREE.Object3D[]
  grid: THREE.Object3D[]
}
export default class Sketch {
  /**
   * 创建一个3D场景，并初始化相机、场景、控制器和渲染器。
   * 同时，根据预定义的数据初始化物体，并为每个物体创建对应的CSS3DObject。
   * 最后，设置窗口大小调整和动画更新的处理函数。
   */
  create() {
    // 定义相机、场景、控制器和渲染器变量
    let camera: THREE.PerspectiveCamera;
    let scene: THREE.Scene;
    let controls: TrackballControls
    let renderer: CSS3DRenderer;
    // 定义物体和目标对象数组
    const objects: CSS3DObject[] = [];
    const targets: Targets = { table: [], sphere: [], helix: [], grid: [] };

    /**
     * 初始化函数，用于设置相机、场景、物体和目标的位置和属性。
     * 同时创建CSS3DObject，并将其添加到场景中。
     */
    function init() {
      // 初始化相机
      camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
      camera.position.z = 3000;
      // 初始化场景
      scene = new THREE.Scene();
      // 遍历数据创建table相关的物体
      // table
      for (let i = 0; i < table.length; i += 5) {
        // 创建元素并设置样式
        const element = document.createElement('div');
        element.className = 'element';
        element.style.backgroundColor = 'rgba(0,127,127,' + (Math.random() * 0.5 + 0.25) + ')';
        // 创建并添加数字、符号和详细信息到元素
        const number = document.createElement('div');
        number.className = 'number';
        number.textContent = String((i / 5) + 1);
        element.appendChild(number);
        const symbol = document.createElement('div');
        symbol.className = 'symbol';
        symbol.textContent = String(table[i]);
        element.appendChild(symbol);
        const details = document.createElement('div');
        details.className = 'details';
        details.innerHTML = table[i + 1] + '<br>' + table[i + 2];
        element.appendChild(details);
        // 创建CSS3DObject并将其添加到场景
        const objectCSS = new CSS3DObject(element);
        objectCSS.position.x = Math.random() * 4000 - 2000;
        objectCSS.position.y = Math.random() * 4000 - 2000;
        objectCSS.position.z = Math.random() * 4000 - 2000;
        scene.add(objectCSS);
        objects.push(objectCSS);
        // 创建并添加3D物体到对应的目标数组
        const object = new THREE.Object3D();
        object.position.x = (Number(table[i + 3]) * 140) - 1330;
        object.position.y = - (Number(table[i + 4]) * 180) + 990;
        targets.table.push(object);
      }
      // 根据物体数组创建sphere、helix和grid目标物体
      // sphere
      const vector = new THREE.Vector3();
      for (let i = 0, l = objects.length; i < l; i++) {
        const phi = Math.acos(- 1 + (2 * i) / l);
        const theta = Math.sqrt(l * Math.PI) * phi;
        const object = new THREE.Object3D();
        object.position.setFromSphericalCoords(800, phi, theta);
        vector.copy(object.position).multiplyScalar(2);
        object.lookAt(vector);
        targets.sphere.push(object);
      }
      // helix
      for (let i = 0, l = objects.length; i < l; i++) {
        const theta = i * 0.175 + Math.PI;
        const y = - (i * 8) + 450;
        const object = new THREE.Object3D();
        object.position.setFromCylindricalCoords(900, theta, y);
        vector.x = object.position.x * 2;
        vector.y = object.position.y;
        vector.z = object.position.z * 2;
        object.lookAt(vector);
        targets.helix.push(object);
      }
      // grid
      for (let i = 0; i < objects.length; i++) {
        const object = new THREE.Object3D();
        object.position.x = ((i % 5) * 400) - 800;
        object.position.y = (- (Math.floor(i / 5) % 5) * 400) + 800;
        object.position.z = (Math.floor(i / 25)) * 1000 - 2000;
        targets.grid.push(object);
      }
      // 初始化渲染器和控制器
      renderer = new CSS3DRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight);
      document.getElementById('container')!.appendChild(renderer.domElement);
      controls = new TrackballControls(camera, renderer.domElement);
      controls.minDistance = 500;
      controls.maxDistance = 6000;
      controls.addEventListener('change', render);
      // 为按钮添加点击事件监听器，实现物体布局切换
      const buttonTable = document.getElementById('table');
      buttonTable!.addEventListener('click', function () {
        transform(targets.table, 2000);
      });
      const buttonSphere = document.getElementById('sphere');
      buttonSphere!.addEventListener('click', function () {
        transform(targets.sphere, 2000);
      });
      const buttonHelix = document.getElementById('helix');
      buttonHelix!.addEventListener('click', function () {
        transform(targets.helix, 2000);
      });
      const buttonGrid = document.getElementById('grid');
      buttonGrid!.addEventListener('click', function () {
        transform(targets.grid, 2000);
      });
      // 初始布局为table
      transform(targets.table, 2000);
      // 设置窗口大小调整和动画更新的处理函数
      window.addEventListener('resize', onWindowResize);
    }

    /**
     * 将物体从当前布局平滑过渡到新的布局。
     * @param {THREE.Object3D[]} targets - 目标布局的物体数组。
     * @param {number} duration - 过渡持续时间。
     */
    function transform(targets: THREE.Object3D[], duration: number) {
      TWEEN.removeAll();
      for (let i = 0; i < objects.length; i++) {
        const object = objects[i];
        const target = targets[i];
        // 创建位置和旋转的Tween动画
        new TWEEN.Tween(object.position)
          .to({ x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration)
          .easing(TWEEN.Easing.Exponential.InOut)
          .start();
        new TWEEN.Tween(object.rotation)
          .to({ x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration)
          .easing(TWEEN.Easing.Exponential.InOut)
          .start();
      }
      // 创建整体Tween动画，用于更新和渲染
      new TWEEN.Tween(this)
        .to({}, duration * 2)
        .onUpdate(render)
        .start();
    }

    /**
     * 处理窗口大小调整事件，更新相机和渲染器的尺寸。
     */
    function onWindowResize() {
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      render();
    }

    /**
     * 渲染场景到相机。
     */
    function render() {
      renderer.render(scene, camera);
    }

    function animate() {

      requestAnimationFrame(animate);

      TWEEN.update();

      controls.update();
    }
    init()
    animate()
  }
}
// 创建Sketch实例并初始化
const sketch = new Sketch();
sketch.create();
