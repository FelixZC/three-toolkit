import * as THREE from 'three'

export class ThreeDemo {
  constructor() {
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.aspectRatio = this.width / this.height

    // 创建场景
    this.scene = null
    // 创建相机
    this.camera = null
    // 创建灯光
    this.light = null
    // 创建模型
    this.model = null
    // 创建材质
    this.material = null
    // 创建纹理
    this.texture = null
    // 创建渲染
    this.renderer = null
  }

  init() {
    this.createScene() // 创建舞台 和 相机
    this.createRenderer() // 创建渲染
    this.createLight() //创建光照
    document.body.appendChild(this.renderer.domElement) // 渲染至页面上
    const render = () => {
      this.renderer.render(this.scene, this.camera) // 渲染场景
      requestAnimationFrame(render)
    }
    render()
    this.axesHelper()
  }

  createScene() {
    // ====== 搭建个舞台 ======
    this.scene = new THREE.Scene()
    this.scene.fog = new THREE.Fog(0x090918, 1, 600)

    // ====== 搭建相机 (模拟人视角去看景象) PerspectiveCamera = 透视相机 ======
    this.camera = new THREE.PerspectiveCamera(
      75, // 视角
      this.aspectRatio, // 纵横比
      0.1, // nearPlane 近平面
      1000 // farPlane 远平面
    )
    // 设置相机位置
    this.camera.position.set(0, 0, 2) // x, y, z
    // 更新摄像头宽高比例
    this.camera.aspect = this.aspectRatio
    // 更新摄像头的矩阵
    this.camera.updateProjectionMatrix()

    // 将相机放到舞台上
    this.scene.add(this.camera)
  }

  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    })
    this.renderer.outputEncoding = THREE.sRGBEncoding
    // 设置渲染器宽高
    this.renderer.setSize(this.width, this.height)
    this.renderer.setClearColor(this.scene.fog.color)

    // 屏幕变化 更新渲染 (相机视角变化 和 渲染器变化)
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(window.innerWidth, window.innerHeight)
    })
  }

  // 辅助坐标系
  axesHelper() {
    const axesHelper = new THREE.AxesHelper(5)
    this.scene.add(axesHelper)
  }

  createLight() {
    // 环境光会均匀的照亮场景中的所有物体
    this.light = new THREE.AmbientLight(0x404040) // soft white light
    this.scene.add(this.light)

    // 平行光是沿着特定方向发射的光
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
    this.directionalLight.position.set(0, 5, 5)

    this.scene.add(this.directionalLight)
  }
}