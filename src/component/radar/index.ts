import fragmentShader from "@/shaders/radar/fragment.glsl";
// 创建一个加载器
import * as kokomi from "kokomi.js";
import * as THREE from "three";
// 加载纹理
class Sketch extends kokomi.Base {
  create() {
    this.camera.position.set(0, 0, 5);
    new kokomi.OrbitControls(this);
    const geometry = new THREE.PlaneGeometry(16, 9);
    const material = new THREE.ShaderMaterial({
      // vertexShader,
      fragmentShader,
    });
    const mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);
    const uj = new kokomi.UniformInjector(this);
    material.uniforms = {
      ...material.uniforms,
      ...uj.shadertoyUniforms,
    };
    this.update(() => {
      uj.injectShadertoyUniforms(material.uniforms);
    });
  }
}
const sketch = new Sketch("#sketch");
sketch.create();
