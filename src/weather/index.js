import * as THREE from "three";
import * as kokomi from "kokomi.js";
// import fragmentShader from "../shaders/weather/winter-snow.glsl";
import fragmentShader from "../shaders/weather/medium-rain.glsl";
// 创建一个加载器
const loader = new THREE.TextureLoader();
// 加载纹理
const texture3 = loader.load('../shaders/weather/medium-rain3.png');

// 定义顶点着色器和片段着色器
// const vertexShader = `
//     void main() {
//         gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//     }
// `;
class Sketch extends kokomi.Base {
    create() {
        this.camera.position.set(0, 0, 5);
        new kokomi.OrbitControls(this);

        // const geometry = new THREE.SphereGeometry(2, 64, 64);
        const geometry = new THREE.PlaneGeometry(8, 6);
        const envmap = new THREE.CubeTextureLoader().load([
            "../assets/images/rail-star/254a41dc4cbc8b5e0afaacf2eeb38890_8919910114589865353.png",
            "../assets/images/rail-star/912bad8c0723b85a6a53f9b19323d3cd_7157411529622049660.png",
            "../assets/images/rail-star/951b5cf2295ea158a29c80911e3eb55d_6539106821760568826.png",
            "../assets/images/rail-star/69806d86868878c33ca22aa6dcc2571a_2237174096575525551.png",
            "../assets/images/rail-star/b07fac008e99cae7387af773f4d4c039_1530443783740284969.png",
            "../assets/images/rail-star/efaa1ab4d1d567a478bdabda76121719_1637318133581363152.png",
        ]);
        const material = new THREE.ShaderMaterial({
            // vertexShader,
            fragmentShader,
            uniforms: {
                iChannel3: {
                    value: texture3
                }
            },
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
            // const t = this.clock.elapsedTime;
            // mesh.rotation.y = 0.2 * t;
        });
    }
}

const sketch = new Sketch("#sketch");
sketch.create();