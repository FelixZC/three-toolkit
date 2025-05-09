// 作者 @patriciogv - 2015
// 标题：Truchet - 10 print

#ifdef GL_ES
precision mediump float;
#endif

// 定义圆周率PI
#define PI 3.14159265358979323846

// 声明统一变量，用于传入屏幕分辨率、鼠标位置和时间
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

/**
* 生成在给定点的随机数。
*
* @param _st 二维坐标点。
* @return 返回在给定点的随机浮点数。
*/
float random (in vec2 _st) {
    return fract(sin(dot(_st.xy,
                vec2(12.9898,78.233)))*
            43758.5453123);
        }
        
        /**
        * 根据Truchet模式和索引生成图案位置。
        *
        * @param _st 二维坐标点。
        * @param _index 图案的索引，用于确定旋转和反射。
        * @return 返回变换后的坐标点。
        */
        vec2 truchetPattern(in vec2 _st,in float _index){
            _index=fract(((_index-.5)*2.));
            if(_index>.75){
                _st=vec2(1.)-_st;
            }else if(_index>.5){
                _st=vec2(1.-_st.x,_st.y);
            }else if(_index>.25){
                _st=1.-vec2(1.-_st.x,_st.y);
            }
            return _st;
        }
        
        void main(){
            // 计算当前像素相对于画布的坐标，并进行放大处理
            vec2 st=gl_FragCoord.xy/u_resolution.xy;
            st*=10.;
            
            // st = (st-vec2(5.0))*(abs(sin(u_time*0.2))*5.);
            // st.x += u_time*3.0;
            
            vec2 ipos=floor(st);// 整数部分，用于计算块位置
            vec2 fpos=fract(st);// 小数部分，用于计算块内的位置
            
            // 应用Truchet模式
            vec2 tile=truchetPattern(fpos,random(ipos));
            
            float color=0.;
            
            // 这里根据tile的x和y值生成迷宫样式的颜色效果
            color=smoothstep(tile.x-.3,tile.x,tile.y)-smoothstep(tile.x,tile.x+.3,tile.y);
            
            // Circles
            // color = (step(length(tile),0.6) -
            //          step(length(tile),0.4) ) +
            //         (step(length(tile-vec2(1.)),0.6) -
            //          step(length(tile-vec2(1.)),0.4) );
            
            // Truchet (2 triangles)
            // color = step(tile.x,tile.y);
            
            gl_FragColor=vec4(vec3(color),1.);// 将颜色应用于当前像素
        }