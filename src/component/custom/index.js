import * as THREE from "three";
import * as kokomi from "kokomi.js";

class Sketch extends kokomi.Base {
    addGeometry(geometry, position) {
        // TODO 为每个几何体添加不同的材质可以让它们在场景中更加区分度高，更具观赏性。
        // 使用MeshBasicMaterial、MeshLambertMaterial、MeshPhongMaterial
        // 或更现代的MeshStandardMaterial和MeshPhysicalMaterial可以赋予物体不同的外观效果。
        const material = new THREE.MeshStandardMaterial({
            color: Math.random() * 0xFFFFFF, // 随机颜色
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        this.scene.add(mesh);
    }
    create() {
        this.camera.position.set(0, 10, 20);
        new kokomi.OrbitControls(this);
        /************************************************************************************************************* */
        // 创建一个金字塔
        const geometry = new THREE.BufferGeometry();

        // 定义顶点，注意在Three.js中y轴指向屏幕上方
        const vertices = new Float32Array([
            // 底面的四个顶点
            -1, 0, -1, // 顶点A (x, y, z) -> 左后下角
            1, 0, -1, // 顶点B (x, y, z) -> 右后下角
            -1, 0, 1, // 顶点C (x, y, z) -> 左前下角
            1, 0, 1, // 顶点D (x, y, z) -> 右前下角

            // 顶点位于底面中心上方，y轴正值表示向上
            0, 2, 0 // 顶点E (x, y, z) -> 顶部中心点
        ]);

        // 创建BufferGeometry并设置顶点位置属性
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

        // 定义面，构成一个底部正方形和四个等腰三角形侧面
        const indices = new Uint32Array([
            // 四个侧面的三角形，注意顶点顺序以适应y轴向上
            0, 1, 4, // 三角形 ABE
            1, 3, 4, // 三角形 BCE
            3, 2, 4, // 三角形 CDE
            2, 0, 4, // 三角形 DAE
            // 底部正方形，注意顶点顺序以适应y轴向上
            3, 1, 0, // 三角形 ABC
            0, 2, 3 // 三角形 ACD
        ]);

        // 设置几何体的索引
        geometry.setIndex(new THREE.BufferAttribute(indices, 1));

        // 添加到场景中
        this.addGeometry(geometry, new THREE.Vector3(-4, 4, -4));
        /************************************************************************************************************* */
        // 添加一个立方体到场景中
        this.addGeometry(new THREE.BoxGeometry(1, 1, 1), new THREE.Vector3(-4, 0, -4));
        // 创建并添加不同的几何体到场景中
        this.addGeometry(new THREE.PlaneGeometry(4, 4), new THREE.Vector3(0, -4, 0)); // 平面
        this.addGeometry(new THREE.SphereGeometry(1, 32, 32), new THREE.Vector3(-4, 0, 0)); // 球体
        this.addGeometry(new THREE.CylinderGeometry(1, 1, 3, 32), new THREE.Vector3(0, 4, 0)); // 圆柱体
        this.addGeometry(new THREE.TetrahedronGeometry(1, 0), new THREE.Vector3(0, 0, -4)); // 四面体
        this.addGeometry(new THREE.OctahedronGeometry(1, 0), new THREE.Vector3(0, 0, 4)); // 八面体
        this.addGeometry(new THREE.DodecahedronGeometry(1, 0), new THREE.Vector3(0, 0, 0)); // 十二面体
        this.addGeometry(new THREE.IcosahedronGeometry(1, 0), new THREE.Vector3(4, 4, 0)); // 二十面体
        this.addGeometry(new THREE.TorusGeometry(1, 0.3, 16, 32), new THREE.Vector3(-4, -4, 0)); // 圆环面
        this.addGeometry(new THREE.TorusKnotGeometry(1, 0.2, 32, 8), new THREE.Vector3(4, -4, 0)); // 圆环面结
        this.addGeometry(new THREE.ConeGeometry(1, 2, 32), new THREE.Vector3(4, 0, -4)); // 圆锥体
        // 创建一个圆环几何体
        const ringGeometry = new THREE.RingGeometry(0.5, 1, 32);
        this.addGeometry(ringGeometry, new THREE.Vector3(-4, 4, 4)); // 圆环

        // 创建一个旋转几何体
        const points = [new THREE.Vector2(1, 0), new THREE.Vector2(0, 1)];
        const latheGeometry = new THREE.LatheGeometry(points, 32);
        this.addGeometry(latheGeometry, new THREE.Vector3(4, 0, 4)); // 旋转几何体
        /************************************************************************************************************* */
        // 添加一个定向光
        const light = new THREE.DirectionalLight(0xffffff, 1); // 白色光，强度为1
        light.position.set(1, 2, 3); // 设置光源位置
        this.scene.add(light);

        // 添加环境光以提供全局照明
        const ambientLight = new THREE.AmbientLight(0x404040); // 柔和的灰色环境光
        this.scene.add(ambientLight);
        this.scene.background = new THREE.Color(0xffffff);
        /************************************************************************************************************* */
        this.update(() => {
            // 旋转所有几何体作为示例
            this.scene.children.forEach(object => {
                if (object instanceof THREE.Mesh) {
                    // object.rotation.x += 0.01;
                    object.rotation.y += 0.01;
                }
            });
        });
    }

}

const sketch = new Sketch("#sketch");
sketch.create();