import * as THREE from 'three';
/**
 * 设置鼠标拖动旋转立方体的事件监听器
 */
export function setupMouseControls(object3D, sensitivity = 0.005, minPitch = -Math.PI / 2 + 0.1, maxPitch = Math.PI / 2 - 0.1) {
  let isDragging = false;
  let lastMouseX = 0;
  let lastMouseY = 0;
  let quaternion = new THREE.Quaternion().copy(object3D.quaternion); // 保存原始四元数用于旋转计算
  let targetQuaternion = new THREE.Quaternion(); // 目标四元数，用于平滑旋转

  const onMouseDown = (event) => {
    event.preventDefault();
    isDragging = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
  };

  const onMouseMove = (event) => {
    if (isDragging) {
      const mouseX = event.clientX;
      const mouseY = event.clientY;

      const deltaX = (mouseX - lastMouseX) * sensitivity;
      const deltaY = (mouseY - lastMouseY) * sensitivity;

      // 更新旋转角度
      let pitch = object3D.rotation.x + deltaY;
      let yaw = object3D.rotation.y + deltaX;

      // 限制俯仰角
      pitch = Math.max(Math.min(pitch, maxPitch), minPitch);

      // 更新四元数旋转
      quaternion.setFromEuler(new THREE.Euler(pitch, yaw, 0, 'XYZ')); // 根据欧拉角更新四元数
      targetQuaternion.slerp(quaternion, 0.1); // 平滑过渡到新四元数

      object3D.quaternion.copy(targetQuaternion); // 应用新的四元数到物体

      lastMouseX = mouseX;
      lastMouseY = mouseY;
    }
  };

  const onMouseUp = () => {
    isDragging = false;
  };

  document.addEventListener('mousedown', onMouseDown);
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);

  // 可选：定期归一化四元数，保持旋转数据的准确性
  setInterval(() => {
    object3D.quaternion.normalize();
  }, 1000);
}

/**
 * 设置three立方体自旋转的事件监听器
 */
export function setupAutoRotate(object3D, axis = 'Y', speed = 0.001) {
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

  const onAnimationFrame = (time) => {
    const deltaTime = time - lastTime;
    // 使用四元数旋转，以避免万向节锁问题
    quaternion.setFromAxisAngle(rotationAxis, speed * deltaTime);
    object3D.quaternion.multiply(quaternion);

    lastTime = time;
    requestAnimationFrame(onAnimationFrame);
  };

  requestAnimationFrame(onAnimationFrame);
}