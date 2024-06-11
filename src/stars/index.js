
 import * as THREE from "three";
 import * as kokomi from "kokomi.js";
 import vertexShader from "../shaders/stars/vertexShader.glsl";
 import fragmentShader from "../shaders/stars/fragmentShader.glsl";
 
/**
 * Sketch类继承自kokomi.Base，用于创建和管理一个Three.js的场景。
 * 该类主要功能是初始化相机、设置几何体和材质，以及管理场景中的物体。
 */
 class Sketch extends kokomi.Base {
     /**
      * create方法用于初始化场景中的物体和设置。
      */
     create() {
         // 初始化相机位置
         this.camera.position.set(0, 0, 1);
         // 添加轨道控制，以便于在浏览器中交互控制相机
         new kokomi.OrbitControls(this);

         // 创建点的几何体，总数为250个点
         const count = 250;
         let positions = Array.from({
             length: count
         }, () => [2, 2, 2].map(THREE.MathUtils.randFloatSpread));
         positions = positions.flat();
         positions = Float32Array.from(positions);
         const geometry = new THREE.BufferGeometry();
         geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

         // 设置点的材质，使用自定义的顶点和片段着色器
         const material = new THREE.ShaderMaterial({
             vertexShader,
             fragmentShader,
             transparent: true, // 材质设置为透明
             blending: THREE.AdditiveBlending, // 使用加法混合
             depthWrite: false, // 不写入深度缓冲区
         });

         // 创建并添加点粒子系统到场景中
         const points = new THREE.Points(geometry, material);
         this.scene.add(points);

         // 用于在材质中注入uniforms变量的统一管理器
         const uj = new kokomi.UniformInjector(this);
         material.uniforms = {
             ...material.uniforms,
             ...uj.shadertoyUniforms,
             uPixelRatio: {
                 value: this.renderer.getPixelRatio(),
             },
         };

         // 更新函数，每次渲染时调用，用于动态更新材质中的uniforms
         this.update(() => {
             uj.injectShadertoyUniforms(material.uniforms);
         });
     }
 }

 // 创建Sketch实例并初始化
 const sketch = new Sketch("#sketch");
 sketch.create();