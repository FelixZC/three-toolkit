// Author @patriciogv ( patriciogonzalezvivo.com ) - 2015

#ifdef GL_ES
precision mediump float;
#endif

// Copyright (c) Patricio Gonzalez Vivo, 2015 - http://patriciogonzalezvivo.com/
// I am the sole copyright owner of this Work.
//
// You cannot host, display, distribute or share this Work in any form,
// including physical and digital. You cannot use this Work in any
// commercial or non-commercial product, website or project. You cannot
// sell this Work and you cannot mint an NFTs of it.
// I share this Work for educational purposes, and you can link to it,
// through an URL, proper attribution and unmodified screenshot, as part
// of your educational material. If these conditions are too restrictive
// please contact me and we'll definitely work it out.

uniform vec2 u_resolution; // 帧缓冲的分辨率
uniform float u_time; // 时间统一变量

#define PI 3.14159265358979323846 // 定义圆周率

/**
 * 2D旋转函数
 * @param _st 二维坐标
 * @param _angle 旋转角度
 * @return 旋转后的二维坐标
 */
vec2 rotate2D(vec2 _st, float _angle){
    _st -= 0.5;
    _st =  mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle)) * _st;
    _st += 0.5;
    return _st;
}

/**
 * 平铺函数
 * @param _st 二维坐标
 * @param _zoom 平铺倍数
 * @return 平铺后的二维坐标
 */
vec2 tile(vec2 _st, float _zoom){
    _st *= _zoom;
    return fract(_st);
}

/**
 * 画一个带平滑边界的盒子
 * @param _st 二维坐标
 * @param _size 盒子的大小
 * @param _smoothEdges 边缘平滑度
 * @return 盒子内部的布尔值
 */
float box(vec2 _st, vec2 _size, float _smoothEdges){
    _size = vec2(0.5)-_size*0.5;
    vec2 aa = vec2(_smoothEdges*0.5);
    vec2 uv = smoothstep(_size,_size+aa,_st);
    uv *= smoothstep(_size,_size+aa,vec2(1.0)-_st);
    return uv.x*uv.y;
}

void main(void){
    vec2 st = gl_FragCoord.xy/u_resolution.xy; // 角度坐标
    vec3 color = vec3(0.0);

    // 将空间分为4部分
    st = tile(st,4.);

    // 使用矩阵将空间旋转45度
    st = rotate2D(st,PI*0.25);

    // 画一个正方形
    color = vec3(box(st,vec2(0.7),0.01));
    // color = vec3(st,0.0);

    gl_FragColor = vec4(color,1.0);
}