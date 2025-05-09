#define COLOR_1 vec3(.757,.765,.729)
#define COLOR_2 vec3(.553,.239,.227)
#define COLOR_3 vec3(.278,.039,.063)
#define COLOR_4 vec3(.001,.001,.001)
#define COLOR_5 vec3(.745,.596,.341)
#define COLOR_6 vec3(.302,.082,.098)

// 定义基本的渲染参数
#define RESOLUTION iResolution.xy// 分辨率
#define RAYMARCH_SAMPLES 128// 光线步进采样次数
#define RAYMARCH_MULTISAMPLE 1// 多重采样次数，用于抗锯齿
#define RAYMARCH_BACKGROUND vec3(0.)// 背景颜色
#define RAYMARCH_CAMERA_FOV 2.// 相机视场角

// 引入外部GLSL文件，用于计算屏幕比例
#include "/node_modules/lygia/space/ratio.glsl"

// 定义自定义材质函数的宏
#define RAYMARCH_MATERIAL_FNC raymarchCustomMaterial
// 自定义材质函数，定义了材质的表现。
vec3 raymarchCustomMaterial(vec3 ray,vec3 pos,vec3 nor,vec3 map);

// 引入光线追踪和Signed Distance Function相关的GLSL代码
#include "/node_modules/lygia/lighting/raymarch.glsl"
#include "/node_modules/lygia/sdf.glsl"
// 如果没有定义opRepeat，则使用opRepite操作
#ifndef opRepeat
#define opRepeat opRepite
#endif

/**
* 将世界坐标转换为“Jumpy Dumpty”空间中的坐标。
* 这个函数主要用于场景中物体位置的动态调整，创造出跳跃和抖动的效果。
*
* @param p 世界空间中的坐标
* @return 转换后的“Jumpy Dumpty”空间坐标
*/
vec3 worldPosToJumpyDumpty(vec3 p){
    // 初始位置调整，创造抖动效果
    p.x-=1.5;
    p.z-=iTime*2.;
    p.y-=abs(sin(iTime*5.))*.2;
    // 使用opRepeat函数进行周期性空间映射
    p=opRepeat(p,vec3(3.));
    return p;
}

/**
* 自定义材质函数，用于光线映射过程中决定表面如何反射光线。
*
* @param ray 光线向量，表示当前光线的方向。
* @param pos 表面位置向量，表示当前光线击中的表面位置。
* @param nor 表面法向量，表示与表面垂直的向量。
* @param map 纹理映射向量，用于决定材质的表现。
* @return 返回一个三元组，表示反射后的颜色。
*/
vec3 raymarchCustomMaterial(vec3 ray,vec3 pos,vec3 nor,vec3 map){
    vec3 posOrigin=pos;
    
    // 如果纹理映射的总和小于等于0，返回背景颜色。
    if(sum(map)<=0.){
        return RAYMARCH_BACKGROUND;
    }
    
    vec3 col=vec3(0.); // 初始化颜色向量
    
    // 应用基础颜色
    col+=map*.2;
    
    // 计算漫反射
    vec3 lightPos=vec3(10.); // 光源位置
    vec3 lightDir=normalize(lightPos-pos); // 光线方向
    float diff=max(dot(lightDir,nor),0.); // 漫反射系数
    float shadow=raymarchSoftShadow(pos,lightDir,.05,1.5); // 计算软阴影
    col+=map*diff*shadow; // 应用漫反射颜色
    
    // 计算镜面反射和高光
    vec3 reflectDir=reflect(-lightDir,nor); // 计算反射方向
    vec3 viewDir=normalize(-ray); // 观察方向
    vec3 halfVec=normalize(lightDir+viewDir); // 半向量
    float spec=pow(max(dot(nor,halfVec),0.),32.); // 高光系数
    col+=map*spec; // 应用高光颜色
    
    // 如果位置在y轴上高于2.，返回背景颜色
    if(pos.y>2.){
        return RAYMARCH_BACKGROUND;
    }
    
    // 特殊位置处理
    pos=worldPosToJumpyDumpty(pos);
    
    // 根据不同的纹理映射，应用不同的特殊效果
    if(map==COLOR_1){
        // 头部效果处理
        
        // 处理眼睛
        vec2 uv1=pos.xy; // 使用位置坐标初始化uv坐标
        uv1.x=abs(uv1.x); // 确保眼睛在X轴的正半轴
        uv1/=vec2(.75,.5); // 调整uv坐标的尺度
        uv1-=vec2(-.15,.4); // 移动眼睛的位置
        float c1=circleSDF(uv1); // 使用圆的Signed Distance Field函数计算眼睛区域
        float eye=1.-smoothstep(.15,.151,c1); // 使用平滑步长函数来柔和眼睛的边缘
        col=mix(col,COLOR_3,eye); // 将眼睛的颜色混合到最终颜色中
        
        // 处理嘴巴
        vec2 uv2=pos.xy; // 同样使用位置坐标初始化uv坐标
        uv2.x=abs(uv2.x); // 确保嘴巴在X轴的正半轴
        uv2.y-=.4; // 调整嘴巴在Y轴上的位置
        uv2.y*=-1.; // 翻转Y轴方向，使得嘴巴在屏幕下方
        float c2=lineSDF(uv2,vec2(0.),vec2(.05)); // 使用线的Signed Distance Field函数计算嘴巴区域
        float mouth=1.-smoothstep(.0125,.01251,c2); // 使用平滑步长函数来柔和嘴巴的边缘
        col=mix(col,COLOR_3,mouth); // 将嘴巴的颜色混合到最终颜色中
    }else if(map==COLOR_4){
        // 腰带处理: 为当前位置应用腰带样式的处理效果。
        vec2 uv3=pos.xy;            // 使用当前位置的xy坐标。
        uv3/=vec2(.4);             // 缩小坐标，调整腰带的尺寸。
        uv3-=vec2(-.5,-.18);       // 移动坐标，定位腰带的位置。
        uv3=fract(uv3);            // 取余操作，确保坐标在[0,1)的范围内，适用于周期性图案。
            float c3=circleSDF(uv3);   // 计算在当前坐标上的圆的Signed Distance Field（签距离场）。
            float polka=1.-smoothstep(.15,.151,c3); // 应用平滑步骤来确定像素是否属于圆点的一部分。
            col=mix(col,COLOR_5,polka); // 根据圆点的判断结果，混合颜色以添加腰带效果。
        }else if(map==COLOR_2){
            // 身体纹理处理
            // 对位置进行处理，生成身体的纹理效果
            vec2 uv4=pos.xy;
            uv4/=vec2(.4); // 缩小并平移坐标
            uv4-=vec2(-.5,.05);
            uv4.y/=.6; // 修改y轴缩放
            uv4.y*=-1.; // 翻转y轴
            float c4=triSDF(uv4); // 应用三角形 Signed Distance Field (SDF) 函数
            float tri=1.-smoothstep(1.8,1.81,c4); // 使用 smoothstep 函数平滑过渡
            col=mix(col,COLOR_6,tri); // 将纹理颜色与原颜色混合
            
            // 身体条纹处理
            // 处理位置，生成身体上的条纹效果
            vec2 uv5=pos.xy;
            uv5/=vec2(.4); // 缩小并平移坐标
            uv5-=vec2(-.5,-1.05);
            float c5=uv5.y; // 获取y坐标值用于计算
            float stripe=smoothstep(.09,.1,c5)-smoothstep(.19,.2,c5); // 使用 smoothstep 函数创建条纹
            col=mix(col,COLOR_5,stripe); // 将条纹颜色与原颜色混合
            
            // 心形纹理处理
            // 处理位置，生成心形纹理效果
            vec2 uv6=pos.xy;
            uv6/=vec2(.4); // 缩小并平移坐标
            uv6-=vec2(-.7,-1.9);
            uv6.y/=.7; // 修改y轴缩放
            uv6.x/=1.4; // 修改x轴缩放
            float c6=heartSDF(uv6); // 应用心形 SDF 函数
            float heart=1.-smoothstep(1.8,1.81,c6); // 使用 smoothstep 函数平滑过渡
            col=mix(col,COLOR_5,heart); // 将心形颜色与原颜色混合
        }
        
        // 雾效处理
        float fog=exp(-.000005*pow(posOrigin.z,6.));
        col=mix(col,RAYMARCH_BACKGROUND,1.-fog);
        
        return col; // 返回最终颜色
    }
    
    /**
    * 计算并返回一个“跳跃的 Dumpty”形状的 vec4 值，包含形状的 sdf 值和颜色。
    *
    * @param p 输入的三维坐标，代表当前点的位置。
    * @param res 初始的 vec4 结果，用于累积各个部分的 sdf 值和颜色。
    * @return 计算后的 vec4 结果，包含整个“跳跃的 Dumpty”形状的 sdf 值和颜色。
    */
    vec4 jumpyDumpty(vec3 p,vec4 res){
        // 计算头部
        vec3 p1=p;
        float head=sphereSDF(p1,.69);// 头部球体
        head=opIntersection(head,boxSDF(p1-vec3(0.,1.3,0.),vec3(1.)));// 头部方体，用于给球体增加形状
        res=opUnion(res,vec4(COLOR_1,head));// 将头部的 sdf 值和颜色加入到累积结果中
        
        // 计算耳朵
        vec3 p2=p;
        p2.x=abs(p2.x);// 确保耳朵对称
        float ear=ellipsoidSDF(rotate(p2-vec3(.45,.7,0.),-PI/3.,vec3(0.,0.,1.)),vec3(.1,.25,.1));// 耳朵椭球体
        res=opUnion(res,vec4(COLOR_1,ear),.025);// 将耳朵的 sdf 值和颜色加入到累积结果中，.025 为混合权重
        
        // 计算身体
        vec3 p3=p;
        p3.y-=.3;
        p3.y/=.8;// 调整身体的形状
        float body=coneSDF(p3-vec3(0.,-.6,0.),.75,.5,1.);// 身体圆锥体
        body=opIntersection(body,boxSDF(p3-vec3(0.,-1.,0.),vec3(1.)));// 身体下方的方体，用于给圆锥体增加形状
        body*=.8;// 调整身体的大小
        res=opUnion(res,vec4(COLOR_2,body));// 将身体的 sdf 值和颜色加入到累积结果中
        
        // 计算裙带
        vec3 p4=p;
        p4.y-=.14;
        p4.y/=.8;
        p4/=1.05;
        p4.y*=-1.;// 调整裙带的形状
        float skirt=coneSDF(p4-vec3(0.,-.6,0.),.75,.5,1.);// 裙带圆锥体
        skirt=opIntersection(skirt,boxSDF(p4-vec3(0.,-1.,0.),vec3(1.)));// 裙带下方的方体，用于给圆锥体增加形状
        skirt*=.8;// 调整裙带的大小
        p4*=1.05;
        skirt=opIntersection(skirt,boxSDF(p4-vec3(0.,.8,0.),vec3(1.)));// 与身体上部的方体相交，形成裙带的边缘
        res=opUnion(res,vec4(COLOR_2,skirt));// 将裙带的 sdf 值和颜色加入到累积结果中
        
        // 计算腰带
        vec3 p5=p;
        p5.y-=.24;
        p5.y/=.8;
        p5/=1.04;
        float belt=coneSDF(p5-vec3(0.,-.6,0.),.75,.5,1.);// 腰带圆锥体
        belt=opIntersection(belt,boxSDF(p5-vec3(0.,-1.,0.),vec3(1.)));// 腰带下方的方体，用于给圆锥体增加形状
        belt*=.8;// 调整腰带的大小
        p5*=1.04;
        belt=opIntersection(belt,boxSDF(p5-vec3(0.,.8,0.),vec3(1.)));// 与身体上部的方体相交，形成腰带的边缘
        res=opUnion(res,vec4(COLOR_4,belt));// 将腰带的 sdf 值和颜色加入到累积结果中
        
        return res;// 返回最终的累积结果
    }
    
    // 定义SDF图层操作，用于光线映射。
    // 参数 p: 当前点的位置向量。
    // 返回值 res: 经过SDF图层操作后的结果，包含颜色和深度信息的向量。
    vec4 raymarchMap(vec3 p){
        vec4 res=vec4(1.);// 初始化结果向量
        // 将当前点转换到“跳跃 Dumpty”空间，并对结果进行处理。
        vec3 p1=p;
        p1=worldPosToJumpyDumpty(p1);
        res=jumpyDumpty(p1,res);
        
        // 处理平面SDF图层，并与之前的结果进行合并。
        vec3 p2=p;
        res=opUnion(res,vec4(vec3(1.),planeSDF(p2)+.75));
        
        return res;// 返回合并后的结果
    }
    
    // 主函数，负责渲染图像。
    // 参数 fragColor: 输出的像素颜色。
    // 参数 fragCoord: 当前像素的坐标。
    void mainImage(out vec4 fragColor,in vec2 fragCoord){
        // 计算当前像素的UV坐标，并调整其比例以适应屏幕。
        vec2 uv=fragCoord/iResolution.xy;
        uv=ratio(uv,iResolution.xy);
        
        // 初始化颜色变量，并设置相机位置。
        vec3 col=vec3(0.);
        // vec3 camera=vec3(0.,10.,30.); // 默认相机位置
        vec3 camera=vec3(-30.,15.,50.);// 设置新的相机位置
        
        // 执行光线映射，并将结果赋值给颜色变量。
        col=raymarch(camera,uv).rgb;
        
        // 将最终颜色赋值给像素。
        fragColor=vec4(col,1.);
    }