#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

// 透纳风格色彩配置增强
vec3 skyTopColor=vec3(.8,.4,.8);// 温暖的紫罗兰色天空顶部
vec3 sunsetColor=vec3(1.,.6,.1);// 落日时分的金橙色
vec3 sunCoreColor=vec3(1.,.9,.7);// 太阳核心的强烈光芒
vec3 seaBaseColor=vec3(.05,.2,.5);// 深海蓝
vec3 seaReflectColor=vec3(1.,.8,.6);// 海面反射的夕阳色彩
vec3 cloudBaseColor=vec3(1.,.95,.9);// 云的基础色
vec3 cloudShadowColor=vec3(.7,.7,.7);// 云的阴影部分

float sunRadius=.05;// 太阳半径比例调整
float cloudDensity=.3;// 云密度调整（影响云的可见度）
float cloudSpeed=.1;// 云移动速度


// 计算云彩噪声
float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

// 太阳位置计算考虑时间变化
vec2 getSunPosition(){
    return vec2(.5+.1*sin(u_time),.5+.1*cos(u_time));
}

// 云彩噪声函数，增加复杂度
float fbm(vec2 p){
    float value=0.;
    float freq=.5;
    float amp=.5;
    for(int i=0;i<4;i++){
        value+=noise(p*freq)*amp;
        freq*=1.9;
        amp*=.5;
    }
    return value;
}

void main(){
    vec2 st=gl_FragCoord.xy/u_resolution;
    vec3 color=vec3(0.);
    
    // 太阳核心
    vec2 sunPos=getSunPosition();
    float distToSun=length(st-sunPos);
    if(distToSun<sunRadius){
        color=sunCoreColor;
    }else{
        // 天空渐变与夕阳色彩
        float sunsetIntensity=smoothstep(sunRadius,1.5*sunRadius,distToSun);
        color=mix(skyTopColor,sunsetColor,sunsetIntensity);
        
        // 海洋反射
        if(st.y>.6){
            float waterDistort=fbm(vec2(st.x+u_time*cloudSpeed,st.y))*.02;
            float reflectIntensity=smoothstep(.6,.7,st.y+waterDistort);
            color=mix(color,seaReflectColor,reflectIntensity);
            color=mix(color,seaBaseColor,1.-reflectIntensity);
        }
        
        // 云彩
        float cloudNoise=fbm(vec2(st.x*10.+u_time*cloudSpeed,st.y*5.));
        float cloudAlpha=smoothstep(cloudDensity-.1,cloudDensity+.1,cloudNoise);
        color=mix(color,cloudBaseColor,cloudAlpha);
        color.rgb*=mix(vec3(1.),cloudShadowColor,.2*cloudAlpha);// 给云彩添加轻微阴影
    }
    
    gl_FragColor=vec4(color,1.);
}