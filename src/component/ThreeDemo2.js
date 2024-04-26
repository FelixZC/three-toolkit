import * as THREE from 'three';
import {
	GLTFLoader
} from 'three/addons/loaders/GLTFLoader.js';
import {
	DRACOLoader
} from 'three/addons/loaders/DRACOLoader.js';

import ThreeDemo from '../utils/three.js/Init'

function loadGltfModel(demo) {
	const modelUrl = 'src/model/gltf/LittlestTokyo.glb'
	const dracoDecoderPath = 'src/libs/draco/'
	const onModelLoaded = (gltf) => {
		const model = gltf.scene;
		model.position.set(1, 1, 0);
		model.scale.set(0.01, 0.01, 0.01);
		demo.scene.add(model);
		demo.mixer = new THREE.AnimationMixer(model);
		demo.mixer.clipAction(gltf.animations[0]).play();
	}
	const onModelError = (e) => {
		console.error(e);
	}
	const dracoLoader = new DRACOLoader();
	dracoLoader.setDecoderPath(dracoDecoderPath);
	const loader = new GLTFLoader();
	loader.setDRACOLoader(dracoLoader);
	loader.load(modelUrl, onModelLoaded, undefined, onModelError);
}

const threeDemo = new ThreeDemo();
threeDemo.init()
loadGltfModel(threeDemo)