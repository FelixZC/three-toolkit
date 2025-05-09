import * as THREE from 'three';
import * as kokomi from 'kokomi.js';
import Stats from 'stats.js';
import { GUI } from 'lil-gui';
import { GLTFLoader, GPUComputationRenderer, Variable } from 'three-stdlib';
import textureVelocity from './fragmentShaderVelocity.glsl';
import texturePosition from './fragmentShaderPosition.glsl';

// 定义EffectController类型，用于控制某种效果或行为
type EffectController = {
  separation: number; // 分离力的强度，影响个体间保持距离的程度
  alignment: number; // 对齐力的强度，影响个体在群体中方向的一致性
  cohesion: number; // 凝聚力的强度，影响个体聚集在一起的程度
  freedom: number; // 自由度，可能影响个体偏离群体行为的程度
  size: number; // 群体的大小，可能指群体中个体的数量
  count: number; // 模型资源的数量
};

class Sketch extends kokomi.Base {
  create() {
    const that = this
    // 定义画布宽度
    const WIDTH = 64;
    // 计算鸟的数量
    const BIRDS = WIDTH * WIDTH;

    // 创建鸟的几何体
    const BirdGeometry = new THREE.BufferGeometry();
    // 定义变量用于存储动画纹理、动画持续时间、鸟的网格、着色器材质和每个鸟的索引数
    let textureAnimation: THREE.DataTexture, durationAnimation: number, birdMesh: THREE.Mesh, materialShader: THREE.WebGLProgramParametersWithUniforms, indicesPerBird: number;

    // 函数：计算不小于给定数字的下一个2的幂
    function nextPowerOf2(n: number) {
      return Math.pow(2, Math.ceil(Math.log(n) / Math.log(2)));
    }

    //添加线性插值函数
    const lerp = function (value1: number, value2: number, amount: number) {
      amount = Math.max(Math.min(amount, 1), 0);
      return value1 + (value2 - value1) * amount;
    };

    // 定义鸟的模型和颜色数组
    const gltfs = ['../../assets/model/gltf/Parrot.glb', '../../assets/model/gltf/Flamingo.glb'];
    const colors = [0xccFFFF, 0xffdeff];
    const sizes = [0.2, 0.1];
    // 随机选择一个模型进行加载
    const selectModel = Math.floor(Math.random() * gltfs.length);
    new GLTFLoader().load(gltfs[selectModel], function (gltf) {
      const animations = gltf.animations;
      durationAnimation = Math.round(animations[0].duration * 60);
      const birdGeo = (gltf.scene.children[0] as THREE.Mesh).geometry;
      const morphAttributes = birdGeo.morphAttributes.position;
      const tHeight = nextPowerOf2(durationAnimation);
      const tWidth = nextPowerOf2(birdGeo.getAttribute('position').count);
      indicesPerBird = birdGeo.index!.count;
      const tData = new Float32Array(4 * tWidth * tHeight);

      // 填充纹理数据
      for (let i = 0; i < tWidth; i++) {
        for (let j = 0; j < tHeight; j++) {
          const offset = j * tWidth * 4;
          const curMorph = Math.floor(j / durationAnimation * morphAttributes.length);
          const nextMorph = (Math.floor(j / durationAnimation * morphAttributes.length) + 1) % morphAttributes.length;
          const lerpAmount = j / durationAnimation * morphAttributes.length % 1;

          if (j < durationAnimation) {
            let d0, d1;
            d0 = morphAttributes[curMorph].array[i * 3];
            d1 = morphAttributes[nextMorph].array[i * 3];
            if (d0 !== undefined && d1 !== undefined) tData[offset + i * 4] = lerp(d0, d1, lerpAmount);

            d0 = morphAttributes[curMorph].array[i * 3 + 1];
            d1 = morphAttributes[nextMorph].array[i * 3 + 1];
            if (d0 !== undefined && d1 !== undefined) tData[offset + i * 4 + 1] = lerp(d0, d1, lerpAmount);

            d0 = morphAttributes[curMorph].array[i * 3 + 2];
            d1 = morphAttributes[nextMorph].array[i * 3 + 2];
            if (d0 !== undefined && d1 !== undefined) tData[offset + i * 4 + 2] = lerp(d0, d1, lerpAmount);

            tData[offset + i * 4 + 3] = 1;
          }
        }
      }

      // 创建动画纹理
      textureAnimation = new THREE.DataTexture(tData, tWidth, tHeight, THREE.RGBAFormat, THREE.FloatType);
      textureAnimation.needsUpdate = true;

      // 准备顶点数据、颜色数据、参考数据和种子数据
      const vertices: number[] = [],
        color: number[] = [],
        reference: number[] = [],
        seeds: number[] = [],
        indices: number[] = [];
      // 计算所有鸟类模型的顶点总数，并遍历每个顶点
      const totalVertices = birdGeo.getAttribute('position').count * 3 * BIRDS;
      for (let i = 0; i < totalVertices; i++) {
        // 计算当前顶点在鸟类模型中的索引
        const bIndex = i % (birdGeo.getAttribute('position').count * 3);
        // 将当前顶点的位置和颜色信息添加到对应的数组中
        vertices.push(birdGeo.getAttribute('position').array[bIndex]);
        color.push(birdGeo.getAttribute('color').array[bIndex]);
      }

      // 为每个鸟类模型的顶点生成随机数和纹理坐标
      let r = Math.random();
      for (let i = 0; i < birdGeo.getAttribute('position').count * BIRDS; i++) {
        // 计算当前顶点在鸟类模型中的索引
        const bIndex = i % (birdGeo.getAttribute('position').count);
        // 计算当前鸟类模型的索引
        const bird = Math.floor(i / birdGeo.getAttribute('position').count);
        // 每当处理新的鸟类模型时，生成新的随机数
        if (bIndex == 0) r = Math.random();
        // 计算当前鸟类模型在纹理坐标中的位置，并将结果添加到reference数组中
        const j = ~~bird;
        const x = (j % WIDTH) / WIDTH;
        const y = ~~(j / WIDTH) / WIDTH;
        reference.push(x, y, bIndex / tWidth, durationAnimation / tHeight);
        // 为每个鸟类模型生成随机种子，并添加到seeds数组中
        seeds.push(bird, r, Math.random(), Math.random());
      }

      // 为所有鸟类模型的每个顶点生成索引，并添加到indices数组中
      for (let i = 0; i < birdGeo.index!.array.length * BIRDS; i++) {
        // 计算当前顶点的偏移量
        const offset = Math.floor(i / birdGeo.index!.array.length) * (birdGeo.getAttribute('position').count);
        // 将计算后的顶点索引添加到indices数组中
        indices.push(birdGeo.index!.array[i % birdGeo.index!.array.length] + offset);
      }

      // 设置几何体的属性
      BirdGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
      BirdGeometry.setAttribute('birdColor', new THREE.BufferAttribute(new Float32Array(color), 3));
      BirdGeometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(color), 3));
      BirdGeometry.setAttribute('reference', new THREE.BufferAttribute(new Float32Array(reference), 4));
      BirdGeometry.setAttribute('seeds', new THREE.BufferAttribute(new Float32Array(seeds), 4));

      BirdGeometry.setIndex(indices);

      // 初始化和动画函数
      init();
      animate();
    });
    // 声明各种变量和对象，用于后续的Three.js渲染流程
    let stats: Stats;
    let mouseX = 0, mouseY = 0;

    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;

    const BOUNDS = 800, BOUNDS_HALF = BOUNDS / 2;

    let last = performance.now();

    let gpuCompute: GPUComputationRenderer;
    let velocityVariable: Variable;
    let positionVariable: Variable;
    let positionUniforms: THREE.ShaderMaterial['uniforms'];
    let velocityUniforms: THREE.ShaderMaterial['uniforms'];;

    // 初始化场景
    function init() {
      // that.camera.fov = 75;
      that.camera.near = 1;
      that.camera.far = 3000;
      that.camera.updateProjectionMatrix();
      that.camera.position.z = 350;

      // 创建场景，并设置背景颜色和雾效
      that.scene.background = new THREE.Color(colors[selectModel]);
      that.scene.fog = new THREE.Fog(colors[selectModel], 100, 1000);

      // 添加各种光源到场景中
      const hemiLight = new THREE.HemisphereLight(colors[selectModel], 0xffffff, 4.5);
      hemiLight.color.setHSL(0.6, 1, 0.6, THREE.SRGBColorSpace);
      hemiLight.groundColor.setHSL(0.095, 1, 0.75, THREE.SRGBColorSpace);
      hemiLight.position.set(0, 50, 0);
      that.scene.add(hemiLight);

      const dirLight = new THREE.DirectionalLight(0x00CED1, 2.0);
      dirLight.color.setHSL(0.1, 1, 0.95, THREE.SRGBColorSpace);
      dirLight.position.set(- 1, 1.75, 1);
      dirLight.position.multiplyScalar(30);
      that.scene.add(dirLight);

      // 初始化计算渲染器的相关设置
      initComputeRenderer();

      // 添加性能统计工具到容器中
      stats = new Stats();
      that.container.appendChild(stats.dom);

      // 禁止默认的触摸操作，并监听鼠标移动事件
      that.container.style.touchAction = 'none';
      that.container.addEventListener('pointermove', onPointerMove);

      // 监听窗口大小调整事件
      window.addEventListener('resize', onWindowResize);

      // 创建并配置GUI工具
      const gui = new GUI();


      // 定义并初始化效果控制器，用于动态调整场景中的各种效果参数
      const effectController: EffectController = {
        separation: 20.0,
        alignment: 20.0,
        cohesion: 20.0,
        freedom: 0.75,
        size: sizes[selectModel],
        count: Math.floor(BIRDS / 4)
      };

      // 创建一个函数，用于在更改GUI参数时更新场景
      const valuesChanger = function () {
        velocityUniforms['separationDistance'].value = effectController.separation;
        velocityUniforms['alignmentDistance'].value = effectController.alignment;
        velocityUniforms['cohesionDistance'].value = effectController.cohesion;
        velocityUniforms['freedomFactor'].value = effectController.freedom;
        if (materialShader) materialShader.uniforms['size'].value = effectController.size;
        BirdGeometry.setDrawRange(0, indicesPerBird * effectController.count);
      };

      // 初始化场景参数
      valuesChanger();

      // 为每个参数添加到GUI中，以便用户可以动态调整，并在更改时调用valuesChanger函数更新场景
      gui.add(effectController, 'separation', 0.0, 100.0, 1.0).onChange(valuesChanger);
      gui.add(effectController, 'alignment', 0.0, 100, 0.001).onChange(valuesChanger);
      gui.add(effectController, 'cohesion', 0.0, 100, 0.025).onChange(valuesChanger);
      gui.add(effectController, 'size', 0, 1, 0.01).onChange(valuesChanger);
      gui.add(effectController, 'count', 0, BIRDS, 1).onChange(valuesChanger);
      gui.close();

      // 初始化鸟类对象
      initBirds(effectController);

    }
    function initComputeRenderer() {

      gpuCompute = new GPUComputationRenderer(WIDTH, WIDTH, that.renderer);

      const dtPosition = gpuCompute.createTexture();
      const dtVelocity = gpuCompute.createTexture();
      fillPositionTexture(dtPosition);
      fillVelocityTexture(dtVelocity);

      velocityVariable = gpuCompute.addVariable('textureVelocity', textureVelocity, dtVelocity);
      positionVariable = gpuCompute.addVariable('texturePosition', texturePosition, dtPosition);

      gpuCompute.setVariableDependencies(velocityVariable, [positionVariable, velocityVariable]);
      gpuCompute.setVariableDependencies(positionVariable, [positionVariable, velocityVariable]);

      positionUniforms = positionVariable.material.uniforms;
      velocityUniforms = velocityVariable.material.uniforms;

      // 初始化位置和速度的uniform变量
      positionUniforms = positionVariable.material.uniforms;
      velocityUniforms = velocityVariable.material.uniforms;

      // 设置位置和速度的相关参数
      positionUniforms['time'] = { value: 0.0 };
      positionUniforms['delta'] = { value: 0.0 };
      velocityUniforms['time'] = { value: 1.0 };
      velocityUniforms['delta'] = { value: 0.0 };
      velocityUniforms['testing'] = { value: 1.0 };
      velocityUniforms['separationDistance'] = { value: 1.0 };
      velocityUniforms['alignmentDistance'] = { value: 1.0 };
      velocityUniforms['cohesionDistance'] = { value: 1.0 };
      velocityUniforms['freedomFactor'] = { value: 1.0 };
      velocityUniforms['predator'] = { value: new THREE.Vector3() };
      velocityVariable.material.defines.BOUNDS = BOUNDS.toFixed(2);

      // 设置纹理的包裹模式
      velocityVariable.wrapS = THREE.RepeatWrapping;
      velocityVariable.wrapT = THREE.RepeatWrapping;
      positionVariable.wrapS = THREE.RepeatWrapping;
      positionVariable.wrapT = THREE.RepeatWrapping;

      // 初始化GPU计算并检查错误
      const error = gpuCompute.init();

      if (error !== null) {
        console.error(error);
      }
    }

    // 初始化鸟类函数
    function initBirds(effectController: EffectController) {
      const geometry = BirdGeometry;

      // 创建鸟类材质
      const m = new THREE.MeshStandardMaterial({
        vertexColors: true,
        flatShading: true,
        roughness: 1,
        metalness: 0
      });

      // 在材质编译前修改着色器
      m.onBeforeCompile = (shader) => {
        // 添加uniform变量
        shader.uniforms.texturePosition = { value: null };
        shader.uniforms.textureVelocity = { value: null };
        shader.uniforms.textureAnimation = { value: textureAnimation };
        shader.uniforms.time = { value: 1.0 };
        shader.uniforms.size = { value: effectController.size };
        shader.uniforms.delta = { value: 0.0 };

        // 修改顶点着色器
        let token = '#define STANDARD';
        let insert = /* glsl */`
            attribute vec4 reference;
            attribute vec4 seeds;
            attribute vec3 birdColor;
            uniform sampler2D texturePosition;
            uniform sampler2D textureVelocity;
            uniform sampler2D textureAnimation;
            uniform float size;
            uniform float time;
        `;
        shader.vertexShader = shader.vertexShader.replace(token, token + insert);

        token = '#include <begin_vertex>';
        insert = /* glsl */`
            vec4 tmpPos = texture2D( texturePosition, reference.xy );
            vec3 pos = tmpPos.xyz;
            vec3 velocity = normalize(texture2D( textureVelocity, reference.xy ).xyz);
            vec3 aniPos = texture2D( textureAnimation, vec2( reference.z, mod( time + ( seeds.x ) * ( ( 0.0004 + seeds.y / 10000.0) + normalize( velocity ) / 20000.0 ), reference.w ) ) ).xyz;
            vec3 newPosition = position;
            newPosition = mat3( modelMatrix ) * ( newPosition + aniPos );
            newPosition *= size + seeds.y * size * 0.2;
            velocity.z *= -1.;
            float xz = length( velocity.xz );
            float xyz = 1.;
            float x = sqrt( 1. - velocity.y * velocity.y );
            float cosry = velocity.x / xz;
            float sinry = velocity.z / xz;
            float cosrz = x / xyz;
            float sinrz = velocity.y / xyz;
            mat3 maty =  mat3( cosry, 0, -sinry, 0    , 1, 0     , sinry, 0, cosry );
            mat3 matz =  mat3( cosrz , sinrz, 0, -sinrz, cosrz, 0, 0     , 0    , 1 );
            newPosition =  maty * matz * newPosition;
            newPosition += pos;
            vec3 transformed = vec3( newPosition );
        `;
        shader.vertexShader = shader.vertexShader.replace(token, insert);

        materialShader = shader;
      };

      // 创建并添加鸟的网格到场景中
      birdMesh = new THREE.Mesh(geometry, m);
      birdMesh.rotation.y = Math.PI / 2;
      birdMesh.castShadow = true;
      birdMesh.receiveShadow = true;
      that.scene.add(birdMesh);
    }

    // 填充位置纹理数据
    function fillPositionTexture(texture: THREE.DataTexture) {
      const theArray = texture.image.data;

      for (let k = 0, kl = theArray.length; k < kl; k += 4) {
        const x = Math.random() * BOUNDS - BOUNDS_HALF;
        const y = Math.random() * BOUNDS - BOUNDS_HALF;
        const z = Math.random() * BOUNDS - BOUNDS_HALF;

        theArray[k + 0] = x;
        theArray[k + 1] = y;
        theArray[k + 2] = z;
        theArray[k + 3] = 1;
      }
    }

    // 填充速度纹理数据
    function fillVelocityTexture(texture: THREE.DataTexture) {
      const theArray = texture.image.data;

      for (let k = 0, kl = theArray.length; k < kl; k += 4) {
        const x = Math.random() - 0.5;
        const y = Math.random() - 0.5;
        const z = Math.random() - 0.5;

        theArray[k + 0] = x * 10;
        theArray[k + 1] = y * 10;
        theArray[k + 2] = z * 10;
        theArray[k + 3] = 1;
      }
    }

    // 窗口尺寸调整函数
    function onWindowResize() {
      windowHalfX = window.innerWidth / 2;
      windowHalfY = window.innerHeight / 2;
      // that.camera.aspect = window.innerWidth / window.innerHeight;
      that.camera.updateProjectionMatrix();
      that.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // 鼠标移动事件处理函数
    function onPointerMove(event: PointerEvent) {
      if (event.isPrimary === false) return;

      mouseX = event.clientX - windowHalfX;
      mouseY = event.clientY - windowHalfY;
    }

    // 动画函数
    function animate() {
      requestAnimationFrame(animate);

      render();
      stats.update();
    }

    // 渲染函数
    function render() {
      const now = performance.now();
      let delta = (now - last) / 1000;

      if (delta > 1) delta = 1; // 限制delta的最大值
      last = now;

      // 更新uniform变量的时间和delta值
      positionUniforms['time'].value = now;
      positionUniforms['delta'].value = delta;
      velocityUniforms['time'].value = now;
      velocityUniforms['delta'].value = delta;
      if (materialShader) materialShader.uniforms['time'].value = now / 1000;
      if (materialShader) materialShader.uniforms['delta'].value = delta;

      // 更新捕食者的位置
      velocityUniforms['predator'].value.set(0.5 * mouseX / windowHalfX, - 0.5 * mouseY / windowHalfY, 0);

      mouseX = 10000;
      mouseY = 10000;

      // 执行GPU计算
      gpuCompute.compute();

      // 更新材质的纹理uniform变量
      if (materialShader) materialShader.uniforms['texturePosition'].value = gpuCompute.getCurrentRenderTarget(positionVariable).texture;
      if (materialShader) materialShader.uniforms['textureVelocity'].value = gpuCompute.getCurrentRenderTarget(velocityVariable).texture;

    }

  }
}
// 创建Sketch实例并初始化
const sketch = new Sketch("#sketch");
sketch.create();
