import * as THREE from 'three';

export interface Demo {
  renderer: THREE.Renderer;
  scene: THREE.Scene;
  camera: THREE.Camera;
}

/**
 * 设置鼠标拖动旋转立方体的事件监听器
 */
export function setupMouseControls(object3D: THREE.Object3D, sensitivity: number = 0.005) {
  let isDragging = false;
  let lastMouseX = 0;
  let lastMouseY = 0;

  const onDocumentMouseDown = (event: MouseEvent) => {
    event.preventDefault();
    isDragging = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
  };

  const onDocumentMouseMove = (event: MouseEvent) => {
    if (isDragging) {
      const mouseX = event.clientX;
      const mouseY = event.clientY;

      const deltaX = (mouseX - lastMouseX) * sensitivity;
      const deltaY = (mouseY - lastMouseY) * sensitivity;

      object3D.rotation.x += deltaY;
      object3D.rotation.y += deltaX;

      lastMouseX = mouseX;
      lastMouseY = mouseY;
    }
  };

  const onDocumentMouseUp = (event: MouseEvent) => {
    isDragging = false;
  };

  document.addEventListener('mousedown', onDocumentMouseDown);
  document.addEventListener('mousemove', onDocumentMouseMove);
  document.addEventListener('mouseup', onDocumentMouseUp);
}

/**
 * 设置three立方体自旋转的事件监听器
 */
export function setupAutoRotate(object3D: THREE.Object3D, axis: 'X' | 'Y' | 'Z' = 'Y', speed: number = 0.001) {
  let lastTime = 0;

  // 定义旋转轴向量
  let rotationAxis;
  switch (axis.toUpperCase()) {
    case 'X':
      rotationAxis = new THREE.Vector3(1, 0, 0);
      break;
    case 'Y':
      rotationAxis = new THREE.Vector3(0, 1, 0);
      break;
    case 'Z':
      rotationAxis = new THREE.Vector3(0, 0, 1);
      break;
    default:
      console.warn('Invalid axis specified. Defaulting to Y-axis.');
      rotationAxis = new THREE.Vector3(0, 1, 0);
  }

  const quaternion = new THREE.Quaternion();

  const onAnimationFrame: FrameRequestCallback = (time) => {
    const deltaTime = time - lastTime;
    // 使用四元数旋转，以避免万向节锁问题
    quaternion.setFromAxisAngle(rotationAxis, speed * deltaTime);
    object3D.quaternion.multiply(quaternion);

    lastTime = time;
    requestAnimationFrame(onAnimationFrame);
  };

  requestAnimationFrame(onAnimationFrame);
}


/**
 * 设置并启动模型的飞行动画。
 * @param {Object} demo 包含renderer，scene，camera的对象。
 * @param {THREE.Object3D} model 要飞行的3D模型。
 * @param {THREE.Object3D} [modelBody] 物理引擎中的模型体（可选）。
 */
export function setupModelFlying(demo: Demo, model: THREE.Object3D, modelBody?: THREE.Object3D) {
  // 参数有效性验证
  if (!demo || !demo.renderer || !demo.scene || !demo.camera || !model) {
    console.error('Invalid parameters passed to setupModelFlying.');
    return;
  }

  const {
    renderer,
    scene,
    camera
  } = demo;

  // 模型的初始位置
  const lastPosition = model.position.clone();
  const currentPosition = new THREE.Vector3();
  const initY = model.position.y;

  /**
   * 动画循环函数
   * @param {number} time 当前时间戳（毫秒）
   */
  const animate: FrameRequestCallback = (time) => {
    requestAnimationFrame(animate);
    const rotationSpeed = Math.PI / 2; // 每秒旋转的弧度数
    const radius = 5; // 旋转半径
    const angle = rotationSpeed * (time / 1000); // 根据时间计算旋转角度
    const x = lastPosition.x + radius * Math.cos(angle);
    const z = lastPosition.z + radius * Math.sin(angle);
    currentPosition.set(x, initY, z);

    // 使用平滑插值更新模型位置
    model.position.lerpVectors(lastPosition, currentPosition, 0.1);

    // 计算并更新模型头部朝向
    const direction = currentPosition.clone().sub(lastPosition).normalize();
    model.lookAt(direction);

    // 更新上一次的位置
    lastPosition.copy(model.position);

    // 如果存在物理体，更新其位置和旋转
    if (modelBody) {
      modelBody.position.copy(model.position);
      modelBody.quaternion.copy(model.quaternion);
    }

    // 渲染场景
    renderer.render(scene, camera);
  }

  // 启动动画
  requestAnimationFrame(animate);
}