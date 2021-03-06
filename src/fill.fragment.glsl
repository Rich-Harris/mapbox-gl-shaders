#ifdef GL_ES
precision mediump float;
#else
#define lowp
#define mediump
#define highp
#endif

#pragma mapbox: define color lowp
uniform lowp float u_opacity;

void main() {
    #pragma mapbox: initialize color lowp

    gl_FragColor = color * u_opacity;

#ifdef OVERDRAW_INSPECTOR
    gl_FragColor = vec4(1.0);
#endif
}
