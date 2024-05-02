class Firework {
    constructor(demo, position, config = {}) {
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
            size: 0.1,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false,
        });

        this.mesh = new THREE.Points(singleParticleGeometry, this.material);
        this.mesh.position.copy(this.position);
        demo.scene.add(this.mesh);
    }

    update(deltaTime) {
        if (!this.isExploded) {
            this.position.y += 5.9 * deltaTime;
            this.mesh.position.copy(this.position);

            if (this.position.y > 20) {
                this.explode();
            }
        } else {
            // 更新逻辑保持不变，但在爆炸后才执行
            // ...
        }
    }

    explode(config = {}) {
        this.isExploded = true;
        const {
            spreadAngle = Math.PI / 4, speedFactor = 3, gravityFactor = 0.1
        } = config;
        this.gravity.set(0, -gravityFactor, 0);

        // 重新设置粒子几何体以容纳300个粒子
        const particleCount = 300;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        // 重新生成300个粒子的数据
        for (let i = 0; i < particleCount; i++) {
            // 生成粒子位置和颜色的逻辑与之前相同
            // ...
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // 更新mesh的几何体和位置信息以适应新的粒子系统
        this.mesh.geometry.dispose(); // 清理旧的几何体资源
        this.mesh.geometry = geometry;
        this.mesh.material.sizeAttenuation = true;

        // 生成爆炸粒子数据，这里直接在循环内处理，不再需要预先初始化300个粒子
        for (let i = 0; i < particleCount; i++) {
            // 生成爆炸粒子逻辑与之前相同
            // ...
            this.particles.push({
                // 粒子属性初始化逻辑
                // ...
            });
        }
    }
}