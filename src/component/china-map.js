import * as THREE from "three";
import {
    Reflector
} from "three/examples/jsm/objects/Reflector";
import ThreeDemo from '../utils/three.js/init'
import {
    OrbitControls
} from "three/examples/jsm/controls/OrbitControls";
import chinaJson from "../data/china-mercator.json";
// 初始化场景和相机
const {
    scene,
    camera,
    renderer
} = new ThreeDemo({
    isSetUpStats: true, // 是否设置统计信息显示
    isSetUpControls: true, // 是否设置相机控制
    isAddAxesHelper: false, // 是否添加坐标轴辅助线
    isAddGridHelper: false, // 是否添加网格辅助线
    isAddCameraHelper: true, // 是否添加相机辅助线
    isSetUpGUI: true, // 是否设置图形用户界面
    isSetSky: false,
    isSetUpEnvironment: true, // 是否设置环境光,
});
camera.fov = 45
camera.far = 1000000000

// 处理地理数据，创建各个省份的3D模型
chinaJson.features.forEach((elem, index) => {
    const {
        coordinates
    } = elem.geometry;
    coordinates.forEach((multiPolygon) => {
        // 对每个省份创建一个3D对象
        const province = new THREE.Object3D();
        const lines = new THREE.Object3D();
        multiPolygon.forEach((polygon) => {
            const shape = new THREE.Shape();
            const points = [];
            for (let i = 0; i < polygon.length; i++) {
                let [x, y] = polygon[i];
                x = x - 11600000;
                y = y - 4000000;
                if (i === 0) {
                    shape.moveTo(x, y);
                    points.push(new THREE.Vector3(x, y, 200001));
                }
                shape.lineTo(x, y);
                points.push(new THREE.Vector3(x, y, 200001));
            }

            // 创建并添加省份的3D模型和轮廓线
            const extrudeSettings = {
                steps: 2,
                depth: 200000,
                bevelEnabled: true,
            };
            const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
            const material1 = new THREE.MeshPhongMaterial({
                color: "#02A1E2",
                transparent: true,
                opacity: 0.9,
            });
            const material2 = new THREE.MeshPhongMaterial({
                color: "#3480C4",
                transparent: true,
                opacity: 0.9,
            });
            const mesh = new THREE.Mesh(geometry, [material1, material2]);
            province.add(mesh);

            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const lineMaterial = new THREE.LineBasicMaterial({
                color: 0xffffff
            });
            const lineMesh = new THREE.Line(lineGeometry, lineMaterial);
            lines.add(lineMesh);
        });
        // 将省份模型和轮廓线添加到场景中
        scene.add(province);
        scene.add(lines);
    });
});

camera.position.set(0, -10000000, 10000000);
camera.lookAt(0, 0, 0);