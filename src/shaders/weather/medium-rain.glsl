// From https://www.shadertoy.com/view/Mstczs

precision highp float;// 添加精度定义
uniform float iTime;
uniform vec3 iResolution;
uniform sampler2D iChannel3;

// #iChannel3"./medium-rain3.png"

// 定义一个saturate函数，用于将输入值限制在0到1的范围内
#define saturate(x)clamp(x,0.,1.)

// 定义一个rgb函数，用于将RGB值从整数 scale 转换为0到1之间的浮点数
#define rgb(r,g,b)(vec3(r,g,b)/255.)

// 函数 rand(float) - 生成基于单个浮点数的随机数
// 参数 x: 用于生成随机数的种子值
// 返回值: 返回范围在0到1之间的随机浮点数
float rand(float x){return fract(sin(x)*71523.5413291);}

// 函数 rand(vec2) - 生成基于二维向量的随机数
// 参数 x: 一个二维向量，用于生成随机数的种子值
// 返回值: 返回范围在0到1之间的随机浮点数
float rand(vec2 x){return rand(dot(x,vec2(13.4251,15.5128)));}
// 噪声函数，输入一个二维向量，返回一个浮点数
float noise(vec2 x)
{
	// 取整
	vec2 i=floor(x);
	// 计算分数部分
	vec2 f=x-i;
	// 使用Cosine插值近似
	f*=f*(3.-2.*f);
	// 混合两个随机值
	return mix(mix(rand(i),rand(i+vec2(1,0)),f.x),
	mix(rand(i+vec2(0,1)),rand(i+vec2(1,1)),f.x),f.y);
}

// 分形噪声函数，输入一个二维向量，返回一个浮点数
float fbm(vec2 x)
{
	float r=0.,s=1.,w=1.;
	// 迭代5次
	for(int i=0;i<5;i++)
	{
		s*=2.;// 缩放因子
		w*=.5;// 权重
		r+=w*noise(s*x);// 累加噪声
	}
	return r;
}

// 生成云纹理的函数
// 输入：uv - 坐标；scalex, scaley - x,y方向的缩放；density - 密度；sharpness - 锋利度；speed - 速度
// 返回：云的不透明度
float cloud(vec2 uv,float scalex,float scaley,float density,float sharpness,float speed)
{
	return pow(saturate(fbm(vec2(scalex,scaley)*(uv+vec2(speed,0)*iTime))-(1.-density)),1.-sharpness);
}

// 定义可用灯光数量
#define NUM_LIGHTS 12

// 灯光数组和颜色数组，用于存储灯光信息
vec4 lightArray[NUM_LIGHTS]; // 存储灯光位置和类型等信息
vec3 lightColours[NUM_LIGHTS]; // 存储灯光颜色

// 定义圆周率常量
const float kPI=3.141592654;

// 光线结构体，用于存储光线的起点和方向
struct C_Ray
{
	vec3 vOrigin; // 光线起点
	vec3 vDir; // 光线方向
};
C_Ray ray; // 全局光线变量

// 坐标变量，可能用于表示屏幕坐标或纹理坐标
vec2 coord;

// 简化版的最小值函数
float sMin(float a,float b)
{
	float k=1.5;
	float h=clamp(.5+.5*(b-a)/k,0.,1.);
	return mix(b,a,h)-k*h*(1.-h);
}

// 绕Y轴旋转向量
vec3 RotateY(const in vec3 vPos,const in float ang)
{
	float s=sin(ang);
	float c=cos(ang);
	vec3 vResult=vec3(c*vPos.x+s*vPos.z,vPos.y,-s*vPos.x+c*vPos.z);
	return vResult;
}

// 基于二维坐标生成随机数的函数
float Hash(in vec2 p)
{
	return fract(sin(dot(p,vec2(27.16898,28.90563)))*44549.5473453);
}

// 噪声函数的简化版本
float Noise(in vec2 p)
{
	vec2 f;
	f=fract(p);// 取小数部分
	p=floor(p);
	f=f*f*(3.-2.*f);// 使用余弦插值近似
	float res=mix(mix(Hash(p),
	Hash(p+vec2(1.,0.)),f.x),
	mix(Hash(p+vec2(0.,1.)),
	Hash(p+vec2(1.,1.)),f.x),f.y);
	return res;
}

// 计算包围盒边缘距离的函数
float RoundBox(vec3 p,vec3 b)
{
	return length(max(abs(p)-b,0.))-.5;
}

/**
 * 计算给定点到包围盒表面的最短距离。
 * 
 * @param vPos   给定点的三维坐标。
 * @param vDimension 包围盒的尺寸，表示为长度为三的向量，分别对应x、y、z轴的尺寸。
 * @return 返回给定点到包围盒表面的最短距离。
 */
float GetDistanceBox(const in vec3 vPos,const in vec3 vDimension)
{
    // 计算点到包围盒各个面的距离，使用绝对值和max函数确保距离非负，然后取长度。
    return length(max(abs(vPos)-vDimension,0.));
}

// MapToScene: 计算给定点到场景中各物体的最近距离。
// 参数:
//   vPos: 待计算距离的点的三维坐标。
// 返回值:
//   返回从该点到场景中任何物体的最短距离。
float MapToScene(const in vec3 vPos)
{
	float fResult=1000.;
	
	// 计算点到地面的距离
	float fFloorDist=vPos.y+3.2;
	fResult=min(fResult,fFloorDist);
	
	// 计算点到建筑物2的距离
	vec3 vBuilding2Pos=vec3(60.,0.,55.);
	const float fBuilding2Radius=100.;
	vec3 vBuilding2Offset=vBuilding2Pos-vPos;
	float fBuilding2Dist=length(vBuilding2Offset.xz)-fBuilding2Radius;
	fBuilding2Dist=max(vBuilding2Offset.z-16.,-fBuilding2Dist);// 仅计算背面距离
	fResult=min(fResult,fBuilding2Dist);
	
	// 计算点到出租车的距离
	vec3 vCabDomain=vPos;
	vCabDomain-=vec3(-1.4,-1.55,29.5);
	vCabDomain=RotateY(vCabDomain,.1);
	float fCabDist=RoundBox(vCabDomain+vec3(0.,.85,0.),vec3(.8,.54,2.5));
	fResult=min(fResult,fCabDist);
	fCabDist=RoundBox(vCabDomain,vec3(.6,1.2,1.2));
	fResult=sMin(fResult,fCabDist);
	
	// 计算点到公交车的距离
	vec3 vBusDomain=vPos;
	vBusDomain-=vec3(-15.,0.,29.5);
	vBusDomain=RotateY(vBusDomain,.35);
	float fBusDist=RoundBox(vBusDomain,vec3(.55,1.8,4.));
	
	fResult=min(fResult,fBusDist);
	
	// 计算点到公交车站的距离
	vec3 vBusShelter=vPos;
	vBusShelter-=vec3(7.5,-2.,30.);
	vBusShelter=RotateY(vBusShelter,.3);
	float fBusShelterDist=RoundBox(vBusShelter,vec3(.725,5.3,1.7));
	
	fResult=min(fResult,fBusShelterDist);
	
	return fResult;
}

// Raymarch: 执行光线步进算法，用于渲染。
// 参数:
//   ray: 入射光线的信息。
// 返回值:
//   光线行进的距离。
float Raymarch(const in C_Ray ray)
{
	float fDistance=.1;
	bool hit=false;
	for(int i=0;i<50;i++)
	{
		float fSceneDist=MapToScene(ray.vOrigin+ray.vDir*fDistance);
		if(fSceneDist<=.01||fDistance>=150.)
		{
			hit=true;
			break;
		}
		
		fDistance=fDistance+fSceneDist;
	}
	
	return fDistance;
}

// GetCameraRay: 根据相机位置、朝向和世界基准向上方向，计算出相机光线。
// 参数:
//   vPos: 相机位置。
//   vForwards: 相机朝向。
//   vWorldUp: 世界基准的向上方向。
// 输出参数:
//   ray: 计算得到的相机光线。
void GetCameraRay(const in vec3 vPos,const in vec3 vForwards,const in vec3 vWorldUp,out C_Ray ray)
{
	vec2 vUV=coord.xy;
	vec2 vViewCoord=vUV*2.-1.;
	
	vViewCoord.y*=-1.;
	
	ray.vOrigin=vPos;
	
	vec3 vRight=normalize(cross(vWorldUp,vForwards));
	vec3 vUp=cross(vRight,vForwards);
	
	ray.vDir=normalize(vRight*vViewCoord.x+vUp*vViewCoord.y+vForwards);
}

// GetCameraRayLookat: 根据相机位置和兴趣点位置，计算出相机光线。
// 参数:
//   vPos: 相机位置。
//   vInterest: 兴趣点位置。
// 输出参数:
//   ray: 计算得到的相机光线。
void GetCameraRayLookat(const in vec3 vPos,const in vec3 vInterest,out C_Ray ray)
{
	vec3 vForwards=normalize(vInterest-vPos);
	vec3 vUp=vec3(0.,1.,0.);
	
	GetCameraRay(vPos,vForwards,vUp,ray);
}

//----------------------------------------------------------------------------------------
// 生成给定浮点数x的哈希值
float hash(float x)
{
	return fract(21654.6512*sin(385.51*x));
}

// 生成给定二维向量p的哈希值
float hash(in vec2 p)
{
	return fract(sin(p.x*15.32+p.y*35.78)*43758.23);
}

// 生成给定二维向量p的哈希值，版本2
vec2 hash2(vec2 p)
{
	return vec2(hash(p*.754),hash(1.5743*p.yx+4.5891))-.5;
}

// 另一个版本的生成给定二维向量p的哈希值
vec2 hash2b(vec2 p)
{
	return vec2(hash(p*.754),hash(1.5743*p+4.5476351));
}

// 定义一个向量用于后续的噪声函数计算
vec2 add=vec2(1.,0.);

// 生成二维噪声
vec2 noise2(vec2 x)
{
	vec2 p=floor(x);// 取整
	vec2 f=fract(x);// 取小数部分
	f=f*f*(3.-2.*f);// 使用smoothstep函数平滑过渡
	
	// 使用线性插值混合四个哈希值以生成噪声
	vec2 res=mix(mix(hash2(p),hash2(p+add.xy),f.x),
	mix(hash2(p+add.yx),hash2(p+add.xx),f.x),f.y);
	return res;
}

// 生成二维分形噪声，基于噪声2函数
vec2 fbm2(vec2 x)
{
	vec2 r=vec2(0.);
	float a=1.;
	
	// 层次叠加以生成分形噪声
	for(int i=0;i<8;i++)
	{
		r+=abs(noise2(x)+.5)*a;
		x*=2.;
		a*=.5;
	}
	
	return r;
}

// 计算给定两点在指定方向上的最短距离
float dseg(vec2 ba,vec2 pa)
{
	// 将点pa投影到线段ba上，并计算投影点到pa的距离
	float h=clamp(dot(pa,ba)/dot(ba,ba),-.2,1.);
	return length(pa-ba*h);
}

// 计算给定点x到指定方向上的一段曲线的最短距离
float arc(vec2 x,vec2 p,vec2 dir)
{
	vec2 r=p;
	float d=10.;
	
	// 通过噪声生成一系列点，并测试它们到曲线的最短距离
	for(int i=0;i<5;i++)
	{
		vec2 s=noise2(r+iTime)+dir;
		d=min(d,dseg(s,x-r));
		r+=s;
	}
	return d*3.;
	
}

// 计算给定点x到雷击路径的最短距离
float thunderbolt(vec2 x,vec2 tgt)
{
	vec2 r=tgt;
	float d=1000.;
	
	float dist=length(tgt-x);// 计算初始目标距离
	
	// 通过一系列偏移生成雷击路径
	for(int i=0;i<19;i++)
	{
		if(r.y>x.y+.5)break;// 避免路径超出y轴范围
		vec2 s=(noise2(r+iTime)+vec2(0.,.7))*2.;
		dist=dseg(s,x-r);
		d=min(d,dist);// 更新最短距离
		
		r+=s;// 更新路径点
		// 在特定间隔加入弧线形状以增加雷击效果的真实感
		if(i-(i/5)*5==0){
			if(i-(i/10)*10==0)d=min(d,arc(x,r,vec2(.3,.5)));
			else d=min(d,arc(x,r,vec2(-.3,.5)));
		}
	}
	// 使用指数函数平滑距离值，并添加一定基础值以避免全黑
	return exp(-5.*d)+.2*exp(-1.*dist);
	
}

//----------------------------------------------------------------------------------------
void main()
{
	// 此函数为GLSL的主函数，负责处理每个像素的颜色渲染。
	// 使用了全局变量和一些内置函数来计算最终的像素颜色。
	
	// 初始化相机位置和视角。
	vec3 vCameraPos=vec3(0.,0.,9.8);// 相机初始位置
	float ang=iTime*.3+3.4;// 时间和角度的函数，用于动态调整相机视角
	float head=pow(abs(sin(ang*8.)),1.5)*.15;// 根据角度计算相机的高度
	vCameraPos+=vec3(cos(ang)*2.5,head,sin(ang)*8.5);// 更新相机位置
	coord=gl_FragCoord.xy/iResolution.xy;// 将像素坐标标准化
	
	// 计算相机的视锥光束。
	vec3 vCameraIntrest=vec3(-1.,head,25.);// 相机感兴趣的目标点
	GetCameraRayLookat(vCameraPos,vCameraIntrest,ray);// 获取相机到目标点的光线
	vec3 originalRayDir=ray.vDir;// 存储原始的光线方向
	
	// 初始化颜色变量和法线变量，用于累加计算最终颜色。
	vec3 normal;
	vec3 col=vec3(0.);
	
	// 处理十二层雨幕效果。
	vec2 q=gl_FragCoord.xy/iResolution.xy;// 规范化像素坐标
	float dis=1.;// 用于距离计算的变量
	col=mix(rgb(151.,176.,201.),rgb(105,117,135),coord.y);// 根据像素的y坐标混合天空颜色
	for(int i=0;i<2;i++)// 循环处理两层雨幕
	{
		// 计算雨幕的纹理坐标和透明度。
		float f=1.;
		vec2 st=f*(q*vec2(-3.5,.05)+vec2(-iTime*.1+q.y*.11,iTime*.07));// 风对雨幕的影响
		f=(texture(iChannel3,st*.5).x+texture(iChannel3,st*.5).y);// 从纹理中采样雨滴密度
		// 根据像素的y坐标和雨滴密度，调整雨的透明度。
		f=clamp(pow(abs(f)*.5,25.)*10.,0.,q.y*.4+.05);
		// 根据雨的透明度和亮度，累加计算颜色。
		vec3 bri=vec3(.15);// 雨的亮度
		col+=bri*f;
	}
	
	// 根据时间和坐标，混合云彩和天空的颜色，增加真实感。
	col=mix(col,vec3(.9),.7*cloud(coord,4.,10.,1.9,.95,.05)*cloud(coord,2.,2.,.5,.15,.025)*coord.y);
	
	// 在画面底部添加云层，增加深度感。
	float cpos2=coord.y-.2;
	float cloudPos2=exp(-10.*cpos2*cpos2);
	col=mix(col,vec3(.8),.8*cloud(coord,2.,2.5,.50,.15,.01)*cloudPos2);
	
	// 输出最终的颜色。
	gl_FragColor=vec4(col,1.);
}