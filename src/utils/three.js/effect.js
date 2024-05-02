import * as THREE from 'three';
import vertexShaderSource from '../../shaders/smoke/vertex-shader.glsl';
import fragmentShaderSource from '../../shaders/smoke/fragment-shader.glsl';

/**
 * TODO
 * 粒子运动逻辑：改进爆炸后粒子的运动逻辑，使其更加自然和多样化，例如考虑重力影响、风向扰动等。
 * 颜色过渡：优化颜色变化，使粒子在生命周期内有更自然的色彩过渡效果。
 * 光效与阴影：为烟花增加光源或调整材质属性，以模拟真实的光影效果。
 * 纹理细节：考虑使用纹理贴图来增加粒子的细节，使其看起来更丰富多变。
 * 音频反馈：为烟花爆炸添加音效，增强沉浸感。
 * 粒子消散：粒子消散过程可以更细腻，例如通过透明度逐渐降低而非突然消失。
 * 性能优化：确保大量粒子动画不会显著影响性能，可能需要考虑粒子池技术来复用粒子对象。
 */
class Firework {
    constructor(demo, position, config = {}) {
        this.demo = demo
        this.position = position.clone();
        this.particles = []; // 保持一个粒子数组，但初始时不会填充300个粒子
        this.isExploded = false;
        this.gravity = new THREE.Vector3(0, -config.gravityFactor || 0.1, 0);
        // 上升阶段初始化单个粒子
        const singleParticleGeometry = new THREE.BufferGeometry();
        const singlePositions = new Float32Array(3); // 仅为一个粒子的位置
        const singleColors = new Float32Array(3);
        const x = (Math.random() - 0.5) * 2;
        const y = 0; // 初始位置在y轴上可能不需要随机
        const z = (Math.random() - 0.5) * 2;
        singlePositions.set([x, y, z]);
        const r = Math.random() * 0.5 + 0.5;
        const g = Math.random() * 0.5 + 0.5;
        const b = Math.random();
        singleColors.set([r, g, b]);

        singleParticleGeometry.setAttribute('position', new THREE.BufferAttribute(singlePositions, 3));
        singleParticleGeometry.setAttribute('color', new THREE.BufferAttribute(singleColors, 3));

        this.material = new THREE.PointsMaterial({
            size: 0.1, // 物体的大小，此处设置为0.1
            vertexColors: true, // 是否启用顶点颜色，true表示启用
            blending: THREE.AdditiveBlending, // 启用混合模式，并设置为添加性混合
            transparent: true, // 物体是否透明，true表示透明
            depthWrite: false, // 是否写入深度值，false表示不写入
        });

        this.mesh = new THREE.Points(singleParticleGeometry, this.material);
        this.mesh.position.copy(this.position);
        this.demo.scene.add(this.mesh);
    }

    update(deltaTime) {
        if (!this.isExploded) {
            // 简单上升动画
            this.position.y += 10 * deltaTime; // 控制上升速度
            this.mesh.position.copy(this.position);

            // 碰撞检测，此处简化处理，实际可根据需要设定爆炸条件
            if (this.position.y > 20) {
                this.explode();
            }
        } else {
            for (let p of this.particles) {
                p.life -= deltaTime;
                const lifeRatio = Math.max(0, p.life / (p.startLife || p.life)); // 防止生命值为负
                const colorFade = new THREE.Color().fromArray(p.startColor).lerp(new THREE.Color().fromArray(p.endColor), 1 - lifeRatio); // 颜色过渡

                // 添加透明度管理
                const alpha = Math.max(0, lifeRatio); // 确保透明度在[0, 1]范围内
                colorFade.a = alpha; // 直接设置alpha属性来控制透明度
                // 更新粒子位置
                this.mesh.geometry.attributes.position.array[p.index * 3] = p.velocity.x * deltaTime + p.startPos.x;
                this.mesh.geometry.attributes.position.array[p.index * 3 + 1] = p.velocity.y * deltaTime + p.startPos.y - 0.5 * this.gravity.y * deltaTime * deltaTime; // 考虑重力加速度
                this.mesh.geometry.attributes.position.array[p.index * 3 + 2] = p.velocity.z * deltaTime + p.startPos.z;

                // 应用透明度后的颜色到粒子
                colorFade.toArray(this.mesh.geometry.attributes.color.array, p.index * 3);
                this.mesh.geometry.attributes.position.needsUpdate = true;
                this.mesh.geometry.attributes.color.needsUpdate = true;

                // 当粒子生命结束时，直接将粒子透明度设为0，然后从数组中移除
                if (p.life <= 0) {
                    colorFade.a = 0;
                    colorFade.toArray(this.mesh.geometry.attributes.color.array, p.index * 3);
                    this.particles.splice(this.particles.indexOf(p), 1);
                }
            }
            // 确保所有粒子生命周期结束且数组为空时移除mesh
            if (this.isExploded && this.particles.length === 0) {
                this.demo.scene.remove(this.mesh);
            }
        }
    }
    F

    explode(config = {}) {
        this.isExploded = true;
        const {
            spreadAngle = Math.PI / 4,
                speedFactor = 1,
                gravityFactor = 0.1
        } = config;
        this.gravity.set(0, -gravityFactor, 0);

        // 重新设置粒子几何体以容纳300个粒子
        const particleCount = 300;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        // 生成爆炸粒子数据
        for (let i = 0; i < particleCount; i++) {
            const life = Math.random() * 4 + 4; // 延长粒子的生存期
            const angle = Math.random() * spreadAngle - spreadAngle / 2;
            // 让粒子从当前烟花位置开始扩散，增加一点随机偏移
            const startPos = [
                this.position.x + (Math.random() - 0.5) * 0.5,
                this.position.y,
                this.position.z + (Math.random() - 0.5) * 0.5
            ];
            const baseVelocity = new THREE.Vector3(
                Math.cos(angle) * (Math.random() * 2 - 1),
                Math.random() * 2 + 1, // 初始向上速度
                Math.sin(angle) * (Math.random() * 2 - 1)
            );
            const gravity = new THREE.Vector3(0, -gravityFactor, 0);
            const velocity = baseVelocity.multiplyScalar(speedFactor).add(gravity);
            const endColor = [Math.random(), Math.random(), Math.random()]; // 添加更多颜色变化
            this.particles.push({
                index: i,
                startPos,
                velocity,
                life,
                startColor: [1, 1, 1], // 初始化为白色
                endColor // 随机颜色
            });

            // 设置粒子初始位置和颜色
            const [x, y, z] = startPos;
            const [r, g, b] = this.particles[i].startColor;
            positions.set([x, y, z], i * 3);
            colors.set([r, g, b], i * 3);
        }

        // 更新几何体的attributes
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // 更新mesh的几何体并清理旧资源
        this.mesh.geometry.dispose();
        this.mesh.geometry = geometry;
        this.mesh.material.sizeAttenuation = true;
    }
}
/**
 * 向场景中添加烟花效果。
 * @param {Object} demo - 包含场景(scene)等THREE.js相关对象的示例实例，用于添加和管理烟花对象。
 */
export function addFireWork(demo) {
    let fireworks = []; // 存储所有烟花对象的数组
    // 创建并初始化一个烟花对象的函数保持不变
    function createFirework() {
        const position = new THREE.Vector3(Math.random() * 10 - 5, 0, Math.random() * 10 - 5);
        fireworks.push(new Firework(demo, position));
    }

    const clock = new THREE.Clock(); // 用于动画的时钟控制

    // 在animate函数中，考虑适时剔除远处粒子以优化性能
    function animate() {
        requestAnimationFrame(animate);
        const deltaTime = clock.getDelta();
        fireworks.forEach((fw, index) => {
            fw.update(deltaTime);
        });
    }


    // 启动动画循环
    animate();

    // 添加键盘事件监听器
    document.addEventListener('keydown', (event) => {
        // 检查是否为空格键被按下
        if (event.code === 'Space') {
            createFirework(); // 用户按下空格键时创建新的烟花
        }
    });
}

/**
 * 在给定的场景中添加指定数量的星星。
 * @param {Object} demo 包含场景(scene)等Three.js相关对象和数据的示例对象。
 * @param {number} count 要添加的星星数量。
 */
export function addStars(demo, count) {
    // 加载星星纹理
    const textureLoader = new THREE.TextureLoader();
    const starTexture = textureLoader.load('src/image/textures/star_texture.png'); // 替换为实际星星纹理的路径

    // 创建星星材质
    const starMaterial = new THREE.PointsMaterial({
        map: starTexture,
        size: 0.1, // 可根据需要调整星星的大小
        color: 0xffffff,
        transparent: true,
        blending: THREE.AdditiveBlending, // 使用加性混合让星星更亮
    });

    // 循环创建指定数量的星星并添加到场景中
    for (let i = 0; i < count; i++) {
        const geometry = new THREE.SphereGeometry(0.01, 32, 32); // 使用小球几何体作为星星的形状
        const star = new THREE.Points(geometry, starMaterial);

        // 随机定位星星
        const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(1000)); // 调整范围以适应你的场景大小
        star.position.set(x, y, z);

        demo.scene.add(star);
    }
}

/**
 * 为指定的Three.js演示demo添加烟雾效果。
 * @param {Object} demo 包含场景(scene)等Three.js演示相关对象的容器。
 */
export function addSmoke(demo) {
    // 加载烟雾纹理
    const smokeTextureLoader = new THREE.TextureLoader();
    smokeTextureLoader.load('src/image/textures/smoke_texture.png', (texture) => {
        texture.minFilter = THREE.LinearFilter;

        // 创建烟雾材质
        const smokeMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: {
                    value: 0
                },
                color: {
                    value: new THREE.Color(0x888888)
                },
                opacity: {
                    value: 0.6
                },
                texture: {
                    value: texture
                }
            },
            vertexShader: vertexShaderSource,
            fragmentShader: fragmentShaderSource,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            transparent: true
        });

        // 创建粒子几何体和粒子系统
        const numParticles = 1000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(numParticles * 3);
        const colors = new Float32Array(numParticles * 3);

        // 随机生成粒子位置和颜色
        for (let i = 0; i < numParticles; i++) {
            const x = (Math.random() - 0.5) * 200;
            const y = (Math.random() - 0.5) * 200;
            const z = (Math.random() - 0.5) * 200;
            positions.set([x, y, z], i * 3);
            colors.set([x / 100 + 0.9, y / 100 + 0.9, z / 100 + 0.9], i * 3);
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // 创建并添加烟雾粒子系统到场景
        const smokeParticles = new THREE.Points(geometry, smokeMaterial);
        demo.scene.add(smokeParticles);

        // 动画烟雾粒子
        function animate() {
            requestAnimationFrame(animate);
            smokeMaterial.uniforms.time.value += 0.01;
        }
        animate();
    });
}