import { FontLoader, TextGeometry, TextGeometryParameters } from "three-stdlib";
import * as THREE from "three";
interface customTextGeometryParameters
  extends Omit<TextGeometryParameters, "font"> {
  bevelSegments: number;
}
export function addText3D(
  base: {
    scene: THREE.Scene;
  },
  text: string = "hello world",
  position: THREE.Vector3 = new THREE.Vector3(0, 10, 0),
  textMaterialOptions: THREE.MeshPhongMaterialParameters = {
    color: 0xffffff,
  },
  textGeometryOption: customTextGeometryParameters = {
    size: 1,
    height: 0.1,
    bevelEnabled: true,
    // 启用斜面以获得更平滑的边缘
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelOffset: 0,
    bevelSegments: 5,
  },
  fontUrl: string = "https://unpkg.com/three@0.77.0/examples/fonts/helvetiker_regular.typeface.json",
): Promise<THREE.Mesh> {
  return new Promise((resolve, reject) => {
    // 创建字体加载器
    const fontLoader = new FontLoader();
    fontLoader.load(
      fontUrl,
      (font) => {
        // 创建3D文本几何体
        const parameters: TextGeometryParameters = {
          font: font,
          ...textGeometryOption,
        };
        const textGeometry = new TextGeometry(text, parameters);
        // textGeometry.userData.text = text
        // textGeometry.userData.parameters = parameters
        // 创建材质并应用到文本上
        const textMaterial = new THREE.MeshPhongMaterial(textMaterialOptions);
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        base.scene.add(textMesh);
        position.x = position.x - text.length / 2;
        textMesh.position.copy(position);
        resolve(textMesh);
      },
      undefined,
      (err) => {
        reject(err);
      },
    );
  });
}
