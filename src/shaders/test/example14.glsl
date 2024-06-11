// 根据给定的点和半径，计算该点到球心的最短距离
float sdSphere(vec3 p,float r)
{
    return length(p)-r; // 计算点到球心的距离并减去半径
}

// 根据给定的点、法向量和高度，计算点到平面的最短距离
float sdPlane(vec3 p,vec3 n,float h)
{
    return dot(p,n)+h; // 计算点到平面的距离
}

// 计算两个形状的并集
float opUnion(float d1,float d2)
{
    return min(d1,d2); // 返回两个距离中的较小值，代表并集的最短距离
}

// 计算两个二维距离的并集
vec2 opUnion(vec2 d1,vec2 d2)
{
    return(d1.x<d2.x)?d1:d2; // 返回两个距离中的较小距离值
}

// 计算两个形状的交集
float opIntersection(float d1,float d2)
{
    return max(d1,d2); // 返回两个距离中的较大值，代表交集的最短距离
}

// 计算两个形状的差集
float opSubtraction(float d1,float d2)
{
    return max(-d1,d2); // 返回负的d1和d2中的较大值，用于差集计算
}

// 平滑并集操作
float opSmoothUnion(float d1,float d2,float k){
    float h=clamp(.5+.5*(d2-d1)/k,0.,1.); // 使用 clamp 函数限制 h 的范围
    return mix(d2,d1,h)-k*h*(1.-h); // 使用 mix 函数进行平滑混合
}

// 平滑差集操作
float opSmoothSubtraction(float d1,float d2,float k){
    float h=clamp(.5-.5*(d2+d1)/k,0.,1.); // 使用 clamp 函数限制 h 的范围
    return mix(d2,-d1,h)+k*h*(1.-h); // 使用 mix 函数进行平滑混合
}

// 平滑交集操作
float opSmoothIntersection(float d1,float d2,float k){
    float h=clamp(.5-.5*(d2-d1)/k,0.,1.); // 使用 clamp 函数限制 h 的范围
    return mix(d2,d1,h)+k*h*(1.-h); // 使用 mix 函数进行平滑混合
}

// 根据当前坐标计算贴图坐标
vec2 map(vec3 p){
    vec2 d=vec2(1e10,0.); // 初始化一个较大的距离值
    
    // 计算两个球体的最短距离，并应用平滑并集操作
    float d1=sdSphere(p-vec3(0.,0.,-2.),1.); // 球体1
    float d2=sdSphere(p-vec3(0.,.8+abs(sin(iTime)),-2),.5); // 球体2
    d1=opSmoothUnion(d1,d2,.5);
    d=opUnion(d,vec2(d1,1.)); // 更新距离
    
    // 计算平面的最短距离，并应用并集操作
    float d3=sdPlane(p-vec3(0.,-1.,0.),vec3(0.,1.,0.),.1); // 平面
    d=opUnion(d,vec2(d3,2.)); // 更新距离
    
    return d; // 返回最短距离和对应的形状标识
}

// 计算给定点的法向量
vec3 calcNormal(in vec3 p)
{
    const float h=.0001; // 微小步长
    const vec2 k=vec2(1,-1);
    return normalize(k.xyy*map(p+k.xyy*h).x+ // 在不同方向上偏移并计算梯度
    k.yyx*map(p+k.yyx*h).x+ // 在不同方向上偏移并计算梯度
    k.yxy*map(p+k.yxy*h).x+ // 在不同方向上偏移并计算梯度
    k.xxx*map(p+k.xxx*h).x); // 在不同方向上偏移并计算梯度
}

// 计算软阴影
// ro: 光源位置
// rd: 光线方向
// mint: 最小距离
// maxt: 最大距离
// k: 阴影衰减因子
float softshadow(in vec3 ro,in vec3 rd,float mint,float maxt,float k)
{
    float res=1.;
    float t=mint;
    for(int i=0;i<256&&t<maxt;i++)
    {
        float h=map(ro+rd*t).x;
        if(h<.001)
        return 0.;
        res=min(res,k*h/t);
        t+=h;
    }
    return res;
}

/**
 * 根据像素坐标计算场景颜色
 * 
 * @param fragCoord 像素坐标，对应屏幕上的一个点
 * @return vec3 返回计算得到的该点的颜色值
 */
vec3 getSceneColor(vec2 fragCoord){
    // 将像素坐标转换为UV坐标，并进行标准化处理，考虑屏幕宽高比
    vec2 uv=fragCoord/iResolution.xy;
    uv=(uv-.5)*2.;
    uv.x*=iResolution.x/iResolution.y;
    
    // 初始化摄像机位置
    vec3 ro=vec3(0.,0.,1.);
    // 根据UV计算视线方向
    vec3 rd=normalize(vec3(uv,0.)-ro);
    
    // 初始化颜色变量
    vec3 col=vec3(0.);
    // 初始化深度变量
    float depth=0.;
    // 遍历光线交点，最多遍历128次
    for(int i=0;i<128;i++){
        // 计算当前深度下的视线与场景交点位置
        vec3 p=ro+rd*depth;
        // 获取交点信息，包括距离和材质标识
        vec2 res=map(p);
        float d=res.x;
        float m=res.y;
        // 更新深度值
        depth+=d;
        // 如果交点距离小于阈值，进行光照计算
        if(d<.01){
            // 计算交点的法向量
            vec3 normal=calcNormal(p);
            
            // 初始化光源颜色和物体颜色
            vec3 objectColor=vec3(1.);
            vec3 lightColor=vec3(.875,.286,.333);
            
            // 特殊材质处理
            if(m==2.){
                lightColor=vec3(1.);
            }
            
            // 计算环境光
            float ambIntensity=.2;
            vec3 ambient=lightColor*ambIntensity;
            col+=ambient*objectColor;
            
            // 计算漫反射
            vec3 lightPos=vec3(10.,10.,10.);
            vec3 lightDir=normalize(lightPos-p);
            float diff=dot(normal,lightDir);
            diff=max(diff,0.);
            vec3 diffuse=lightColor*diff;
            // 计算软阴影
            float shadow=softshadow(p,lightDir,.01,10.,16.);
            col+=diffuse*objectColor*shadow;
            
            // 计算镜面反射
            vec3 reflectDir=reflect(-lightDir,normal);
            vec3 viewDir=normalize(ro-p);
            vec3 halfVec=normalize(lightDir+viewDir);
            float spec=dot(normal,halfVec);
            spec=max(spec,0.);
            float shininess=32.;
            spec=pow(spec,shininess);
            vec3 specular=lightColor*spec;
            col+=specular*objectColor;
            
            // 找到第一个交点后停止循环
            break;
        }
    }
    
    return col;
}
/**
 * 主要的图像处理函数。
 * 
 * @param fragColor 输出参数，代表像素的颜色，是一个vec4向量。
 * @param fragCoord 输入参数，代表当前处理的像素的坐标，是一个vec2向量。
 */
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec3 tot = vec3(0.); // 初始化最终的颜色向量
    
    float AA_size = 1.0; // 超采样尺寸，控制抗锯齿的强度
    float count = 0.0; // 用于累积处理的像素数量
    // 超采样循环，用来平滑最终的颜色输出
    for (float aaY = 0.0; aaY < AA_size; aaY++) {
        for (float aaX = 0.0; aaX < AA_size; aaX++) {
            // 对每个亚像素进行颜色采样，并累加到tot中
            tot += getSceneColor(fragCoord + vec2(aaX, aaY) / AA_size);
            count += 1.0; // 增加处理的像素计数
        }
    }
    // 对累加的颜色进行平均，以减少噪声和提高图像质量
    tot /= count;
    
    // 将最终的颜色赋值给fragColor，完成图像处理
    fragColor = vec4(tot, 1.0);
}