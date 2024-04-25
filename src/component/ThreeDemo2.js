	// 导入所需的Three.js库及其相关模块
	import * as THREE from 'three'; // 导入核心库

	import Stats from 'three/addons/libs/stats.module.js'; // 导入性能统计模块（用于显示帧率等信息）

	import {
	    OrbitControls
	} from 'three/addons/controls/OrbitControls.js'; // 导入轨道控制器模块，用于交互式查看场景
	import {
	    RoomEnvironment
	} from 'three/addons/environments/RoomEnvironment.js'; // 导入室内环境模块，为场景添加逼真的环境光照

	import {
	    GLTFLoader
	} from 'three/addons/loaders/GLTFLoader.js'; // 导入GLTF加载器，用于加载glTF格式的3D模型
	import {
	    DRACOLoader
	} from 'three/addons/loaders/DRACOLoader.js'; // 导入DRACO解码器加载器，用于高效压缩和解压网格数据
    
	// 变量声明
	let mixer; // 动画混合器，用于处理模型动画

	// 初始化时钟对象，用于计算渲染间隔时间
	const clock = new THREE.Clock();

	// 获取页面中用于显示3D内容的HTML元素
	const container = document.getElementById('container');

	// 创建性能统计实例，并将其DOM元素添加到页面
	const stats = new Stats();
	container.appendChild(stats.dom);

	// 创建WebGL渲染器，设置抗锯齿、像素比等属性，并调整其大小以适应窗口
	const renderer = new THREE.WebGLRenderer({
	    antialias: true
	});
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	container.appendChild(renderer.domElement);

	// 创建PMREMGenerator对象，用于生成预计算的环境贴图（提高环境光照质量）
	const pmremGenerator = new THREE.PMREMGenerator(renderer);

	// 创建场景对象，设置背景色和环境光照
	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0xbfe3dd); // 背景色
	scene.environment = pmremGenerator.fromScene(new RoomEnvironment(renderer), 0.04).texture; // 环境光照

	// 创建透视相机，设置视野角度、视口比例、近裁剪面和远裁剪面
	const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 100);
	camera.position.set(5, 2, 8); // 设置相机位置

	// 创建并配置OrbitControls，用于交互式控制相机视角
	const controls = new OrbitControls(camera, renderer.domElement);
	controls.target.set(0, 0.5, 0); // 设置相机目标点
	controls.update(); // 更新控制器状态
	controls.enablePan = false; // 禁用平移操作
	controls.enableDamping = true; // 开启阻尼效果，使相机移动更平滑

	// 创建DRACOLoader，设置DRACO解码器路径
	const dracoLoader = new DRACOLoader();
	dracoLoader.setDecoderPath('src/libs/draco/');

	// 创建GLTFLoader，关联DRACOLoader用于加载带DRACO压缩的模型
	const loader = new GLTFLoader();
	loader.setDRACOLoader(dracoLoader);

	// 加载glTF模型文件，并在加载成功后进行处理
	loader.load('src/model/gltf/LittlestTokyo.glb', function (gltf) {
	    const model = gltf.scene;
	    model.position.set(1, 1, 0); // 设置模型位置
	    model.scale.set(0.01, 0.01, 0.01); // 缩放模型至合适大小
	    scene.add(model); // 将模型添加到场景

	    // 创建动画混合器，播放模型的首个动画
	    mixer = new THREE.AnimationMixer(model);
	    mixer.clipAction(gltf.animations[0]).play();

	    // 启动渲染循环
	    animate();
	}, undefined, function (e) {
	    console.error(e); // 若加载失败，打印错误信息
	});

	// 监听窗口尺寸变化事件，更新相机和渲染器尺寸
	window.onresize = function () {
	    camera.aspect = window.innerWidth / window.innerHeight; // 更新相机视口比例
	    camera.updateProjectionMatrix(); // 更新投影矩阵

	    renderer.setSize(window.innerWidth, window.innerHeight); // 调整渲染器大小
	};

	// 渲染循环函数
	function animate() {
	    requestAnimationFrame(animate); // 请求下一次渲染

	    // 计算当前帧与上一帧的时间差（delta），用于动画更新
	    const delta = clock.getDelta();

	    // 更新动画混合器，应用动画变化
	    mixer.update(delta);

	    // 更新OrbitControls，处理用户交互
	    controls.update();

	    // 更新性能统计信息
	    stats.update();

	    // 渲染场景至屏幕
	    renderer.render(scene, camera);
	}