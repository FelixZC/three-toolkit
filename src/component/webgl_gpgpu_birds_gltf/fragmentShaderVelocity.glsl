// 声明uniform变量，这些变量在所有顶点间共享，用于全局计算
uniform float time;// 当前时间
uniform float testing;// 测试模式标志
uniform float delta;// 时间间隔，通常为0.016
uniform float separationDistance;// 分离距离，20单位
uniform float alignmentDistance;// 对齐距离，40单位
uniform float cohesionDistance;// 聚集距离
uniform float freedomFactor;// 自由因子，决定鸟儿的随机行为
uniform vec3 predator;// 捕食者的位置

// 分辨率常量
const float width=resolution.x;
const float height=resolution.y;

// 圆周率常量
const float PI=3.141592653589793;
const float PI_2=PI*2.;

// 区域半径及平方
float zoneRadius=40.;
float zoneRadiusSquared=1600.;

// 分离和对齐阈值
float separationThresh=.45;
float alignmentThresh=.65;

// 世界边界常量
const float UPPER_BOUNDS=BOUNDS;
const float LOWER_BOUNDS=-UPPER_BOUNDS;

// 速度限制常量
const float SPEED_LIMIT=9.;

// 随机函数，用于生成纹理坐标相关的随机数
float rand(vec2 co){
  return fract(sin(dot(co.xy,vec2(12.9898,78.233)))*43758.5453);
}

// 主函数，执行片段着色器的主要逻辑
void main(){
  // 更新zoneRadius和相关阈值
  zoneRadius=separationDistance+alignmentDistance+cohesionDistance;
  separationThresh=separationDistance/zoneRadius;
  alignmentThresh=(separationDistance+alignmentDistance)/zoneRadius;
  zoneRadiusSquared=zoneRadius*zoneRadius;

  // 计算uv坐标
  vec2 uv=gl_FragCoord.xy/resolution.xy;
  vec3 birdPosition,birdVelocity;

  // 获取当前位置和速度
  vec3 selfPosition=texture2D(texturePosition,uv).xyz;
  vec3 selfVelocity=texture2D(textureVelocity,uv).xyz;

  // 初始化距离和方向变量
  float dist;
  vec3 dir;// 方向
  float distSquared;

  // 距离平方常量
  float separationSquared=separationDistance*separationDistance;
  float cohesionSquared=cohesionDistance*cohesionDistance;

  // 用于计算的临时变量
  float f;
  float percent;

  // 初始化速度为自身速度
  vec3 velocity=selfVelocity;

  // 速度限制
  float limit=SPEED_LIMIT;

  // 计算相对于捕食者的方向和距离
  dir=predator*UPPER_BOUNDS-selfPosition;
  dir.z=0.;
  dist=length(dir);
  distSquared=dist*dist;

  // 捕食者避免半径
  float preyRadius=150.;
  float preyRadiusSq=preyRadius*preyRadius;

  // 让鸟儿远离捕食者
  if(dist<preyRadius){
    f=(distSquared/preyRadiusSq-1.)*delta*100.;
    velocity+=normalize(dir)*f;
    limit+=5.;
  }

  // 吸引鸟儿到中心
  vec3 central=vec3(0.,0.,0.);
  dir=selfPosition-central;
  dist=length(dir);

  dir.y*=2.5;
  velocity-=normalize(dir)*delta*5.;

  // 遍历所有鸟儿，计算分离、对齐和聚集行为
  for(float y=0.;y<height;y++){
    for(float x=0.;x<width;x++){
      vec2 ref=vec2(x+.5,y+.5)/resolution.xy;
      birdPosition=texture2D(texturePosition,ref).xyz;

      dir=birdPosition-selfPosition;
      dist=length(dir);

      if(dist<.0001)continue;

      distSquared=dist*dist;

      if(distSquared>zoneRadiusSquared)continue;

      percent=distSquared/zoneRadiusSquared;

      // 分离行为
      if(percent<separationThresh){
        f=(separationThresh/percent-1.)*delta;
        velocity-=normalize(dir)*f;
      }
      // 对齐行为
      else if(percent<alignmentThresh){
        float threshDelta=alignmentThresh-separationThresh;
        float adjustedPercent=(percent-separationThresh)/threshDelta;

        birdVelocity=texture2D(textureVelocity,ref).xyz;

        f=(.5-cos(adjustedPercent*PI_2)*.5+.5)*delta;
        velocity+=normalize(birdVelocity)*f;
      }
      // 聚集行为
      else{
        float threshDelta=1.-alignmentThresh;
        float adjustedPercent;
        if(threshDelta==0.)adjustedPercent=1.;
        else adjustedPercent=(percent-alignmentThresh)/threshDelta;

        f=(.5-(cos(adjustedPercent*PI_2)*-.5+.5))*delta;

        velocity+=normalize(dir)*f;
      }
    }
  }

  // 速度限制
  if(length(velocity)>limit){
    velocity=normalize(velocity)*limit;
  }

  // 设置输出颜色为速度向量
  gl_FragColor=vec4(velocity,1.);
}
