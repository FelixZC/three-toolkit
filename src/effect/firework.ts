import gsap from "gsap";
import fireworkVertexShader from "@/shaders/fireworks/vertex.glsl";
import fireworkFragmentShader from "@/shaders/fireworks/fragment.glsl";
import * as THREE from "three";
import Base from "@src/utils/three/init";

export interface FireworkConfig {
  spreadAngle: number;
  speedFactor: number;
  gravityFactor: number;
  explodeY: number;
}

export interface FireworkParticle {
  isExploded: boolean;
  mesh: THREE.Points;
  position: THREE.Vector3;
}

/**
 * 烟花爆炸效果引用了大佬的效果(reference):https://github.com/jamestw13/fireworks-shaders-threejs
 * TODO:
 * 粒子运动逻辑：改进爆炸后粒子的运动逻辑，使其更加自然和多样化，例如考虑重力影响、风向扰动等。
 * 颜色过渡：优化颜色变化，使粒子在生命周期内有更自然的色彩过渡效果。
 * 光效与阴影：为烟花增加光源或调整材质属性，以模拟真实的光影效果。
 * 纹理细节：考虑使用纹理贴图来增加粒子的细节，使其看起来更丰富多变。
 * 音频反馈：为烟花爆炸添加音效，增强沉浸感。
 * 粒子消散：粒子消散过程可以更细腻，例如通过透明度逐渐降低而非突然消失。
 * 性能优化：确保大量粒子动画不会显著影响性能，可能需要考虑粒子池技术来复用粒子对象。
 */
export default class Firework {
  base: Base;
  config: FireworkConfig;
  fireworks: FireworkParticle[];
  gravity: THREE.Vector3;
  textures: THREE.Texture[];
  clock: THREE.Clock;
  deltaTime: number;
  constructor(base: Base, config?: FireworkConfig);
  /**
   * 构造函数：初始化烟花模拟器
   * @param {Object} base - 用于烟花效果演示的对象
   * @param {Object} config - 可选配置对象，用于重写默认配置
   */
  constructor(
    base: Base,
    config: FireworkConfig = {
      spreadAngle: Math.PI / 4,
      // 烟花扩散角度
      speedFactor: 1,
      // 烟花速度因子
      gravityFactor: 0.1,
      // 重力影响因子
      explodeY: 10, // 烟花爆炸的Y轴偏移
    },
  ) {
    this.base = base;
    // 设置默认配置，并允许通过config参数进行覆盖
    this.config = config;
    this.fireworks = []; // 用于存储所有烟花对象的数组
    this.gravity = new THREE.Vector3(0, -this.config.gravityFactor || 0.1, 0); // 定义重力向量
    this.textures = []; // 存储烟花粒子纹理
    this.loadTextures(); // 加载烟花粒子纹理
    this.clock = new THREE.Clock(); // 初始化计时器，用于控制动画帧率
    this.animate(); // 启动动画
  }

  /**
   * 动画循环函数，不断更新烟花状态并渲染
   */
  animate() {
    requestAnimationFrame(() => {
      this.deltaTime = this.clock.getDelta(); // 获取自上一帧以来的时间差
      this.animate(); // 递归调用自身以维持动画循环
      this.fireworks.forEach((fw) => {
        this.update(fw); // 更新每个烟花的状态
      });
    });
  }

  /**
   * 加载纹理图片
   */
  loadTextures() {
    const textureLoader = new THREE.TextureLoader(); // 创建纹理加载器
    // 加载并存储烟花粒子的纹理图片
    this.textures = [
      textureLoader.load("/src/assets/images/textures/particles/1.png"),
      textureLoader.load("/src/assets/images/textures/particles/2.png"),
      textureLoader.load("/src/assets/images/textures/particles/3.png"),
      textureLoader.load("/src/assets/images/textures/particles/4.png"),
      textureLoader.load("/src/assets/images/textures/particles/5.png"),
      textureLoader.load("/src/assets/images/textures/particles/6.png"),
      textureLoader.load("/src/assets/images/textures/particles/7.png"),
      textureLoader.load("/src/assets/images/textures/particles/8.png"),
    ];
  }
  /**
   * 初始化并发射一个单个粒子作为上升阶段的一部分。
   * @param {THREE.Vector3} position - 粒子的初始位置。
   */
  launch(position: THREE.Vector3): void {
    // 创建一个包含粒子基本属性的对象
    const firework: FireworkParticle = {
      isExploded: false,
      mesh: null as unknown as THREE.Points,
      // 初始时mesh为null，稍后创建
      position: new THREE.Vector3(), // 初始位置将被设置
    };

    // 设置粒子的初始位置
    firework.position.copy(position);

    // 初始化单个粒子的位置和颜色
    const singlePositions = new Float32Array(3);
    const singleColors = new Float32Array(3);
    // 为粒子随机生成x, z位置，保持y轴位置初始为0
    const x = (Math.random() - 0.5) * 2;
    const y = 0; // 根据配置调整，如果需要从特定高度发射
    const z = (Math.random() - 0.5) * 2;
    singlePositions.set([x, y, z]); // 使用配置中的explodeY作为初始y位置

    // 随机生成粒子的颜色
    const r = Math.random() * 0.5 + 0.5;
    const g = Math.random() * 0.5 + 0.5;
    const b = Math.random();
    singleColors.set([r, g, b]);
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
    // 使用粒子的位置和颜色创建几何体和材质
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(singlePositions, 3),
    );
    geometry.setAttribute("color", new THREE.BufferAttribute(singleColors, 3));

    // 创建粒子网格并设置其位置，然后将其添加到场景中
    firework.mesh = new THREE.Points(geometry, material);
    firework.mesh.position.copy(firework.position);
    this.base.scene.add(firework.mesh);

    // 将该粒子添加到粒子列表中以进行后续管理
    this.fireworks.push(firework);
  }
  /**
   * 更新指定的烟火对象的状态。
   * @param {Object} firework - 一个表示烟火的物体对象，具有位置、网格和是否爆炸的属性。
   * 该方法会根据烟火当前的状态（是否爆炸）来更新其位置，并在达到一定高度时触发爆炸。
   */
  update(firework: FireworkParticle) {
    if (!firework.isExploded) {
      // 简单的上升动画逻辑
      firework.position.y += 10 * this.deltaTime; // 根据delta时间（自上次更新以来的时间）控制烟火上升的速度
      firework.mesh.position.copy(firework.position); // 将烟火的网格位置更新为其逻辑位置
      // 执行碰撞检测，此处的逻辑为简化处理。实际应用中，可能需要更复杂的逻辑来决定烟火何时爆炸。
      if (firework.position.y > this.config.explodeY) {
        this.explode(firework); // 当烟火到达预设的爆炸高度时，触发爆炸效果
      }
    }
  }

  /**
   * 销毁烟火对象
   * @param {Object} firework 烟火对象，包含烟火的网格和几何体等属性
   */
  destroy(firework: FireworkParticle) {
    this.base.scene.remove(firework.mesh); // 从场景中移除烟火的网格
    firework.mesh.geometry.dispose(); // 释放几何体资源
  }

  /**
   * 爆炸效果处理
   * @param {Object} firework 烟火对象，将对此对象进行爆炸效果的处理
   */
  explode(firework: FireworkParticle) {
    this.destroy(firework); // 首先销毁原有的烟火对象，准备生成新的粒子效果
    firework.isExploded = true; // 标记该烟火对象为已爆炸

    // 随机生成粒子的基本属性
    const count = Math.round(400 + Math.random() * 1000); // 粒子数量随机
    const size = 0.1 + Math.random() * 0.1; // 粒子大小随机
    const texture =
      this.textures[Math.floor(Math.random() * this.textures.length)]; // 随机选择粒子纹理
    const radius = 0.5 + Math.random(); // 粒子初始分布半径随机
    const color = new THREE.Color();
    color.setHSL(Math.random(), 1, 0.7); // 随机设置粒子颜色

    // 初始化粒子位置、大小和时间乘数的数组
    const positionsArray = new Float32Array(count * 3);
    const sizesArray = new Float32Array(count);
    const timeMultipliersArray = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // 随机生成球面坐标，用于确定粒子的初始位置
      const spherical = new THREE.Spherical(
        radius * (0.75 + Math.random() * 0.25),
        Math.random() * Math.PI,
        Math.random() * Math.PI * 2,
      );
      // 从球面坐标转换为三维空间中的位置
      const position = new THREE.Vector3().setFromSpherical(spherical);

      // 填充粒子位置数组
      positionsArray[i3 + 0] = position.x;
      positionsArray[i3 + 1] = position.y;
      positionsArray[i3 + 2] = position.z;

      // 随机设置粒子的初始大小
      sizesArray[i] = Math.random();

      // 随机设置粒子的时间乘数，用于控制粒子的生命周期
      timeMultipliersArray[i] = 1 + Math.random();
    }

    // 使用粒子的位置、大小等数据创建缓冲几何体
    const newGeometry = new THREE.BufferGeometry();
    // ...（几何体的进一步设置，代码未给出）

    // 设置几何体的位置属性
    newGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positionsArray, 3),
    );
    // 设置几何体的大小属性
    newGeometry.setAttribute(
      "aSize",
      new THREE.Float32BufferAttribute(sizesArray, 1),
    );
    // 设置几何体的时间乘数属性
    newGeometry.setAttribute(
      "aTimeMultiplier",
      new THREE.Float32BufferAttribute(timeMultipliersArray, 1),
    );

    // 创建烟花效果的材质
    texture.flipY = false;
    const newMaterial = new THREE.ShaderMaterial({
      vertexShader: fireworkVertexShader,
      // 顶点着色器
      fragmentShader: fireworkFragmentShader,
      // 片段着色器
      uniforms: {
        uSize: new THREE.Uniform(size),
        // 粒子大小的统一变量
        uResolution: new THREE.Uniform(new THREE.Vector3(
          window.innerWidth,
          window.innerHeight,
          1,
        )),
        // 分辨率的统一变量
        uTexture: new THREE.Uniform(texture),
        // 纹理的统一变量
        uColor: new THREE.Uniform(color),
        // 颜色的统一变量
        uProgress: new THREE.Uniform(0), // 动画进度的统一变量
      },
      transparent: true,
      // 确保粒子效果是透明的
      depthWrite: false,
      // 禁止写入深度
      blending: THREE.AdditiveBlending, // 使用加法混合增强亮度和效果
    });
    const newMesh = new THREE.Points(newGeometry, newMaterial);
    newMesh.position.copy(firework.position); // 复制位置
    firework.mesh = newMesh;
    this.base.scene.add(firework.mesh); // 添加到场景

    // 使用gsap库进行材质动画处理，动画完成后自动销毁烟火对象
    gsap.to(
      (firework.mesh.material as THREE.ShaderMaterial).uniforms.uProgress,
      {
        value: 1,
        // 动画进度从0到1
        duration: 6,
        // 动画持续6秒
        ease: "linear",
        // 线性缓动
        onComplete: () => {
          // 动画完成后的操作
          this.destroy(firework); // 销毁烟火对象
        },
      },
    );
  }
}
