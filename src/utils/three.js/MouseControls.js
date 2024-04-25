/**
 * 设置鼠标拖动旋转立方体的事件监听器
 */
export function setupMouseControls(object3D, sensitivity = 0.005) {
    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;
  
    const onDocumentMouseDown = (event) => {
      event.preventDefault();
      isDragging = true;
      lastMouseX = event.clientX;
      lastMouseY = event.clientY;
    };
  
    const onDocumentMouseMove = (event) => {
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
  
    const onDocumentMouseUp = () => {
      isDragging = false;
    };
  
    document.addEventListener('mousedown', onDocumentMouseDown);
    document.addEventListener('mousemove', onDocumentMouseMove);
    document.addEventListener('mouseup', onDocumentMouseUp);
  }
  