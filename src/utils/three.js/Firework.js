import * as THREE from 'three';
export default class Firework {
    constructor(demo, position) {
        this.position = position.clone();
        this.particles = [];
        this.isExploded = false;

        // 爆炸粒子参数
        const particleCount = 300;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            const x = (Math.random() - 0.5) * 2;
            const y = Math.random() * 2;
            const z = (Math.random() - 0.5) * 2;
            positions.set([x, y, z], i * 3);

            const r = Math.random() * 0.5 + 0.5;
            const g = Math.random() * 0.5 + 0.5;
            const b = Math.random();
            colors.set([r, g, b], i * 3);
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        this.material = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            transparent: true,
        });

        this.mesh = new THREE.Points(geometry, this.material);
        this.mesh.position.copy(this.position);
        demo.scene.add(this.mesh);
    }

    update(deltaTime) {
        if (!this.isExploded) {
            // 简单上升动画
            this.position.y += 0.9 * deltaTime; // 控制上升速度
            this.mesh.position.copy(this.position);

            // 碰撞检测，此处简化处理，实际可根据需要设定爆炸条件
            if (this.position.y > 100) {
                this.explode();
            }
        } else {
            // 爆炸后的粒子动画，这里简化处理
            this.material.sizeAttenuation = true; // 粒子大小随距离衰减
            for (let p of this.particles) {
                p.life -= deltaTime;
                if (p.life <= 0) {
                    this.mesh.geometry.attributes.position.array[p.index * 3] = p.velocity.x * p.life + p.startPos.x;
                    this.mesh.geometry.attributes.position.array[p.index * 3 + 1] = p.velocity.y * p.life + p.startPos.y;
                    this.mesh.geometry.attributes.position.array[p.index * 3 + 2] = p.velocity.z * p.life + p.startPos.z;
                    this.mesh.geometry.attributes.color.array[p.index * 3 + 2] = p.life; // 简化处理，颜色随生命减少而变化
                    this.mesh.geometry.attributes.position.needsUpdate = true;
                    this.mesh.geometry.attributes.color.needsUpdate = true;
                }
            }
        }
    }

    explode() {
        this.isExploded = true;

        // 真实情况这里应生成新的粒子数据，这里简化处理直接使用现有粒子
        for (let i = 0; i < this.mesh.geometry.attributes.position.count; i++) {
            const life = Math.random() * 2; // 粒子生命期
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 3,
                (Math.random() * 2 - 1) * 3,
                (Math.random() - 0.5) * 3
            );
            this.particles.push({
                index: i,
                startPos: this.mesh.geometry.attributes.position.array.slice(i * 3, i * 3 + 3),
                velocity,
                life
            });
        }
    }
}