precision mediump float;

uniform vec3 color;
uniform sampler2D texture2d;
uniform float opacity;

varying vec2 vUv;

void main() {
    vec4 texel = texture(texture2d, vUv);
    gl_FragColor = vec4(color, opacity) * texel; // 结合颜色、透明度和纹理颜色
    // 如果不需要纹理，可以直接使用 gl_FragColor = vec4(color, opacity);
}