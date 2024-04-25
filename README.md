# three-practice

#### 介绍
Web 3D练习，从入门到入土

#### 流程
1. 图形学 和 数学 打好基础
2. 选择一个领域，Web (WebGL、Threejs)、3D引擎、游戏 (Unity) ...
3. 新建一个文件夹 ...

#### 功能

Three.js 提供了丰富的功能和扩展，可以根据项目需求或个人兴趣为 `ThreeDemo` 类添加许多有趣的功能。

1. **交互功能**：
   - **鼠标/触摸事件处理**：实现点击、拖动、旋转、缩放等交互操作，可以使用内置的 `OrbitControls`、`TrackballControls` 或自定义控制类。
   - **GUI 控制面板**：利用 `dat.GUI` 库创建一个用户界面，允许用户调整场景参数（如光照颜色、强度、物体位置、旋转等）。

2. **动画效果**：
   - **关键帧动画**：使用 `THREE.AnimationMixer` 和 `THREE.KeyframeTrack` 实现物体的关键帧动画。
   - **粒子系统**：添加 `THREE.Points` 或 `THREE.ParticleSystem` 来创建火焰、烟雾、雪花等特效。
   - **布料模拟**：使用 `THREE.ClothSimulation` 或第三方库（如 `THREE.MeshPhysicalMaterial`）实现衣物、旗帜等布料的动态模拟。

3. **高级光照与渲染**：
   - **环境贴图**：使用 `THREE.CubeTextureLoader` 加载环境贴图，增强场景的反射和环境光照效果。
   - **PBR（基于物理的渲染）**：使用 `THREE.MeshStandardMaterial` 或 `THREE.MeshPhysicalMaterial` 实现更真实的材质表现。
   - **后期处理**：应用 `THREE.ShaderPass`、`THREE.RenderPass` 等后期处理效果，如景深、色彩校正、模糊、噪点等。

4. **加载外部资源**：
   - **模型加载**：使用 `THREE.GLTFLoader`、`THREE.ObjectLoader` 或其他加载器加载 3D 模型（如 GLTF、OBJ、FBX 等格式）。
   - **地形生成**：结合 `THREE.HeightMapLoader` 或第三方库（如 `THREE.Terrain`）生成和显示地形。

5. **空间音效**：
   - **THREE.AudioListener** 和 **THREE.Audio**：添加 3D 空间音效，使声音随听者位置变化。

6. **物理模拟**：
   - **THREE.CannonJSPlugin** 或 **THREE.AmmoJSPlugin**：集成物理引擎（Cannon.js 或 Ammo.js），实现碰撞检测、重力、刚体动力学等物理效果。

7. **VR/AR 支持**：
   - **THREE.VRButton** 和 **THREE.WebXRManager**：添加 VR（虚拟现实）或 AR（增强现实）支持，使用户能够在沉浸式环境中体验场景。