'use strict';

var circle = {
  "fragmentSource": "#ifdef GL_ES\nprecision mediump float;\n#else\n#define lowp\n#define mediump\n#define highp\n#endif\n\nuniform lowp float u_blur;\nuniform lowp float u_opacity;\n\n#pragma mapbox: define color lowp\nvarying lowp float v_antialiasblur;\n\nvarying vec2 v_extrude;\n\nvoid main() {\n    #pragma mapbox: initialize color lowp\n\n    float t = smoothstep(1.0 - max(u_blur, v_antialiasblur), 1.0, length(v_extrude));\n    gl_FragColor = color * (1.0 - t) * u_opacity;\n\n#ifdef OVERDRAW_INSPECTOR\n    gl_FragColor = vec4(1.0);\n#endif\n}\n",
  "vertexSource": "#ifdef GL_ES\nprecision highp float;\n#else\n#define lowp\n#define mediump\n#define highp\n#endif\n\nuniform mat4 u_matrix;\nuniform vec2 u_extrude_scale;\nuniform float u_devicepixelratio;\n\nattribute vec2 a_pos;\n\n#pragma mapbox: define radius mediump\n\nvarying vec2 v_extrude;\nvarying lowp float v_antialiasblur;\n\nvoid main(void) {\n    #pragma mapbox: initialize radius mediump\n    // unencode the extrusion vector that we snuck into the a_pos vector\n    v_extrude = vec2(mod(a_pos, 2.0) * 2.0 - 1.0);\n\n    vec2 extrude = v_extrude * radius * u_extrude_scale;\n    // multiply a_pos by 0.5, since we had it * 2 in order to sneak\n    // in extrusion data\n    gl_Position = u_matrix * vec4(floor(a_pos * 0.5), 0, 1);\n\n    gl_Position.xy += extrude;\n\n    // This is a minimum blur distance that serves as a faux-antialiasing for\n    // the circle. since blur is a ratio of the circle's size and the intent is\n    // to keep the blur at roughly 1px, the two are inversely related.\n    v_antialiasblur = 1.0 / u_devicepixelratio / radius;\n}\n"
}

var collisionbox = {
  "fragmentSource": "#ifdef GL_ES\nprecision mediump float;\n#else\n#define lowp\n#define mediump\n#define highp\n#endif\n\nuniform float u_zoom;\nuniform float u_maxzoom;\n\nvarying float v_max_zoom;\nvarying float v_placement_zoom;\n\nvoid main() {\n\n    float alpha = 0.5;\n\n    gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0) * alpha;\n\n    if (v_placement_zoom > u_zoom) {\n        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0) * alpha;\n    }\n\n    if (u_zoom >= v_max_zoom) {\n        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0) * alpha * 0.25;\n    }\n\n    if (v_placement_zoom >= u_maxzoom) {\n        gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0) * alpha * 0.2;\n    }\n}\n",
  "vertexSource": "#ifdef GL_ES\nprecision highp float;\n#else\n#define lowp\n#define mediump\n#define highp\n#endif\n\nattribute vec2 a_pos;\nattribute vec2 a_extrude;\nattribute vec2 a_data;\n\nuniform mat4 u_matrix;\nuniform float u_scale;\n\nvarying float v_max_zoom;\nvarying float v_placement_zoom;\n\nvoid main() {\n    gl_Position = u_matrix * vec4(a_pos + a_extrude / u_scale, 0.0, 1.0);\n\n    v_max_zoom = a_data.x;\n    v_placement_zoom = a_data.y;\n}\n"
}

var debug = {
  "fragmentSource": "#ifdef GL_ES\nprecision mediump float;\n#else\n#define lowp\n#define mediump\n#define highp\n#endif\n\nuniform lowp vec4 u_color;\n\nvoid main() {\n    gl_FragColor = u_color;\n}\n",
  "vertexSource": "#ifdef GL_ES\nprecision highp float;\n#else\n#define lowp\n#define mediump\n#define highp\n#endif\n\nattribute vec2 a_pos;\n\nuniform mat4 u_matrix;\n\nvoid main() {\n    gl_Position = u_matrix * vec4(a_pos, step(32767.0, a_pos.x), 1);\n}\n"
}

var fill = {
  "fragmentSource": "#ifdef GL_ES\nprecision mediump float;\n#else\n#define lowp\n#define mediump\n#define highp\n#endif\n\n#pragma mapbox: define color lowp\nuniform lowp float u_opacity;\n\nvoid main() {\n    #pragma mapbox: initialize color lowp\n\n    gl_FragColor = color * u_opacity;\n\n#ifdef OVERDRAW_INSPECTOR\n    gl_FragColor = vec4(1.0);\n#endif\n}\n",
  "vertexSource": "#ifdef GL_ES\nprecision highp float;\n#else\n#define lowp\n#define mediump\n#define highp\n#endif\n\nattribute vec2 a_pos;\n\nuniform mat4 u_matrix;\n\nvoid main() {\n    gl_Position = u_matrix * vec4(a_pos, 0, 1);\n}\n"
}

var icon = {
  "fragmentSource": "#ifdef GL_ES\nprecision mediump float;\n#else\n#define lowp\n#define mediump\n#define highp\n#endif\n\nuniform sampler2D u_texture;\nuniform sampler2D u_fadetexture;\nuniform lowp float u_opacity;\n\nvarying vec2 v_tex;\nvarying vec2 v_fade_tex;\n\nvoid main() {\n    lowp float alpha = texture2D(u_fadetexture, v_fade_tex).a * u_opacity;\n    gl_FragColor = texture2D(u_texture, v_tex) * alpha;\n\n#ifdef OVERDRAW_INSPECTOR\n    gl_FragColor = vec4(1.0);\n#endif\n}\n",
  "vertexSource": "#ifdef GL_ES\nprecision highp float;\n#else\n#define lowp\n#define mediump\n#define highp\n#endif\n\nattribute vec2 a_pos;\nattribute vec2 a_offset;\nattribute vec4 a_data1;\nattribute vec4 a_data2;\n\n\n// matrix is for the vertex position.\nuniform mat4 u_matrix;\n\nuniform mediump float u_zoom;\nuniform bool u_skewed;\nuniform vec2 u_extrude_scale;\n\nuniform vec2 u_texsize;\n\nvarying vec2 v_tex;\nvarying vec2 v_fade_tex;\n\nvoid main() {\n    vec2 a_tex = a_data1.xy;\n    mediump float a_labelminzoom = a_data1[2];\n    mediump vec2 a_zoom = a_data2.st;\n    mediump float a_minzoom = a_zoom[0];\n    mediump float a_maxzoom = a_zoom[1];\n\n    // u_zoom is the current zoom level adjusted for the change in font size\n    mediump float z = 2.0 - step(a_minzoom, u_zoom) - (1.0 - step(a_maxzoom, u_zoom));\n\n    vec2 extrude = u_extrude_scale * (a_offset / 64.0);\n    if (u_skewed) {\n        gl_Position = u_matrix * vec4(a_pos + extrude, 0, 1);\n        gl_Position.z += z * gl_Position.w;\n    } else {\n        gl_Position = u_matrix * vec4(a_pos, 0, 1) + vec4(extrude, 0, 0);\n    }\n\n    v_tex = a_tex / u_texsize;\n    v_fade_tex = vec2(a_labelminzoom / 255.0, 0.0);\n}\n"
}

var line = {
  "fragmentSource": "#ifdef GL_ES\nprecision mediump float;\n#else\n#define lowp\n#define mediump\n#define highp\n#endif\n\nuniform lowp vec4 u_color;\nuniform lowp float u_opacity;\nuniform float u_blur;\n\nvarying vec2 v_linewidth;\nvarying vec2 v_normal;\nvarying float v_gamma_scale;\n\nvoid main() {\n    // Calculate the distance of the pixel from the line in pixels.\n    float dist = length(v_normal) * v_linewidth.s;\n\n    // Calculate the antialiasing fade factor. This is either when fading in\n    // the line in case of an offset line (v_linewidth.t) or when fading out\n    // (v_linewidth.s)\n    float blur = u_blur * v_gamma_scale;\n    float alpha = clamp(min(dist - (v_linewidth.t - blur), v_linewidth.s - dist) / blur, 0.0, 1.0);\n\n    gl_FragColor = u_color * (alpha * u_opacity);\n\n#ifdef OVERDRAW_INSPECTOR\n    gl_FragColor = vec4(1.0);\n#endif\n}\n",
  "vertexSource": "#ifdef GL_ES\nprecision highp float;\n#else\n#define lowp\n#define mediump\n#define highp\n#endif\n\n// floor(127 / 2) == 63.0\n// the maximum allowed miter limit is 2.0 at the moment. the extrude normal is\n// stored in a byte (-128..127). we scale regular normals up to length 63, but\n// there are also \"special\" normals that have a bigger length (of up to 126 in\n// this case).\n// #define scale 63.0\n#define scale 0.015873016\n\nattribute vec2 a_pos;\nattribute vec4 a_data;\n\nuniform mat4 u_matrix;\nuniform mediump float u_ratio;\nuniform mediump float u_linewidth;\nuniform mediump float u_gapwidth;\nuniform mediump float u_antialiasing;\nuniform mediump float u_extra;\nuniform mat2 u_antialiasingmatrix;\nuniform mediump float u_offset;\nuniform mediump float u_blur;\n\nvarying vec2 v_normal;\nvarying vec2 v_linewidth;\nvarying float v_gamma_scale;\n\nvoid main() {\n    vec2 a_extrude = a_data.xy - 128.0;\n    float a_direction = mod(a_data.z, 4.0) - 1.0;\n\n    // We store the texture normals in the most insignificant bit\n    // transform y so that 0 => -1 and 1 => 1\n    // In the texture normal, x is 0 if the normal points straight up/down and 1 if it's a round cap\n    // y is 1 if the normal points up, and -1 if it points down\n    mediump vec2 normal = mod(a_pos, 2.0);\n    normal.y = sign(normal.y - 0.5);\n    v_normal = normal;\n\n    float inset = u_gapwidth + (u_gapwidth > 0.0 ? u_antialiasing : 0.0);\n    float outset = u_gapwidth + u_linewidth * (u_gapwidth > 0.0 ? 2.0 : 1.0) + u_antialiasing;\n\n    // Scale the extrusion vector down to a normal and then up by the line width\n    // of this vertex.\n    mediump vec2 dist = outset * a_extrude * scale;\n\n    // Calculate the offset when drawing a line that is to the side of the actual line.\n    // We do this by creating a vector that points towards the extrude, but rotate\n    // it when we're drawing round end points (a_direction = -1 or 1) since their\n    // extrude vector points in another direction.\n    mediump float u = 0.5 * a_direction;\n    mediump float t = 1.0 - abs(u);\n    mediump vec2 offset = u_offset * a_extrude * scale * normal.y * mat2(t, -u, u, t);\n\n    // Remove the texture normal bit of the position before scaling it with the\n    // model/view matrix.\n    gl_Position = u_matrix * vec4(floor(a_pos * 0.5) + (offset + dist) / u_ratio, 0.0, 1.0);\n\n    // position of y on the screen\n    float y = gl_Position.y / gl_Position.w;\n\n    // how much features are squished in the y direction by the tilt\n    float squish_scale = length(a_extrude) / length(u_antialiasingmatrix * a_extrude);\n\n    // how much features are squished in all directions by the perspectiveness\n    float perspective_scale = 1.0 / (1.0 - min(y * u_extra, 0.9));\n\n    v_linewidth = vec2(outset, inset);\n    v_gamma_scale = perspective_scale * squish_scale;\n}\n"
}

var linepattern = {
  "fragmentSource": "#ifdef GL_ES\nprecision mediump float;\n#else\n#define lowp\n#define mediump\n#define highp\n#endif\n\nuniform float u_blur;\n\nuniform vec2 u_pattern_size_a;\nuniform vec2 u_pattern_size_b;\nuniform vec2 u_pattern_tl_a;\nuniform vec2 u_pattern_br_a;\nuniform vec2 u_pattern_tl_b;\nuniform vec2 u_pattern_br_b;\nuniform float u_fade;\nuniform float u_opacity;\n\nuniform sampler2D u_image;\n\nvarying vec2 v_normal;\nvarying vec2 v_linewidth;\nvarying float v_linesofar;\nvarying float v_gamma_scale;\n\nvoid main() {\n    // Calculate the distance of the pixel from the line in pixels.\n    float dist = length(v_normal) * v_linewidth.s;\n\n    // Calculate the antialiasing fade factor. This is either when fading in\n    // the line in case of an offset line (v_linewidth.t) or when fading out\n    // (v_linewidth.s)\n    float blur = u_blur * v_gamma_scale;\n    float alpha = clamp(min(dist - (v_linewidth.t - blur), v_linewidth.s - dist) / blur, 0.0, 1.0);\n\n    float x_a = mod(v_linesofar / u_pattern_size_a.x, 1.0);\n    float x_b = mod(v_linesofar / u_pattern_size_b.x, 1.0);\n    float y_a = 0.5 + (v_normal.y * v_linewidth.s / u_pattern_size_a.y);\n    float y_b = 0.5 + (v_normal.y * v_linewidth.s / u_pattern_size_b.y);\n    vec2 pos_a = mix(u_pattern_tl_a, u_pattern_br_a, vec2(x_a, y_a));\n    vec2 pos_b = mix(u_pattern_tl_b, u_pattern_br_b, vec2(x_b, y_b));\n\n    vec4 color = mix(texture2D(u_image, pos_a), texture2D(u_image, pos_b), u_fade);\n\n    alpha *= u_opacity;\n\n    gl_FragColor = color * alpha;\n\n#ifdef OVERDRAW_INSPECTOR\n    gl_FragColor = vec4(1.0);\n#endif\n}\n",
  "vertexSource": "#ifdef GL_ES\nprecision highp float;\n#else\n#define lowp\n#define mediump\n#define highp\n#endif\n\n// floor(127 / 2) == 63.0\n// the maximum allowed miter limit is 2.0 at the moment. the extrude normal is\n// stored in a byte (-128..127). we scale regular normals up to length 63, but\n// there are also \"special\" normals that have a bigger length (of up to 126 in\n// this case).\n// #define scale 63.0\n#define scale 0.015873016\n\n// We scale the distance before adding it to the buffers so that we can store\n// long distances for long segments. Use this value to unscale the distance.\n#define LINE_DISTANCE_SCALE 2.0\n\nattribute vec2 a_pos;\nattribute vec4 a_data;\n\nuniform mat4 u_matrix;\nuniform mediump float u_ratio;\nuniform mediump float u_linewidth;\nuniform mediump float u_gapwidth;\nuniform mediump float u_antialiasing;\nuniform mediump float u_extra;\nuniform mat2 u_antialiasingmatrix;\nuniform mediump float u_offset;\n\nvarying vec2 v_normal;\nvarying vec2 v_linewidth;\nvarying float v_linesofar;\nvarying float v_gamma_scale;\n\nvoid main() {\n    vec2 a_extrude = a_data.xy - 128.0;\n    float a_direction = mod(a_data.z, 4.0) - 1.0;\n    float a_linesofar = (floor(a_data.z / 4.0) + a_data.w * 64.0) * LINE_DISTANCE_SCALE;\n\n    // We store the texture normals in the most insignificant bit\n    // transform y so that 0 => -1 and 1 => 1\n    // In the texture normal, x is 0 if the normal points straight up/down and 1 if it's a round cap\n    // y is 1 if the normal points up, and -1 if it points down\n    mediump vec2 normal = mod(a_pos, 2.0);\n    normal.y = sign(normal.y - 0.5);\n    v_normal = normal;\n\n    float inset = u_gapwidth + (u_gapwidth > 0.0 ? u_antialiasing : 0.0);\n    float outset = u_gapwidth + u_linewidth * (u_gapwidth > 0.0 ? 2.0 : 1.0) + u_antialiasing;\n\n    // Scale the extrusion vector down to a normal and then up by the line width\n    // of this vertex.\n    mediump vec2 dist = outset * a_extrude * scale;\n\n    // Calculate the offset when drawing a line that is to the side of the actual line.\n    // We do this by creating a vector that points towards the extrude, but rotate\n    // it when we're drawing round end points (a_direction = -1 or 1) since their\n    // extrude vector points in another direction.\n    mediump float u = 0.5 * a_direction;\n    mediump float t = 1.0 - abs(u);\n    mediump vec2 offset = u_offset * a_extrude * scale * normal.y * mat2(t, -u, u, t);\n\n    // Remove the texture normal bit of the position before scaling it with the\n    // model/view matrix.\n    gl_Position = u_matrix * vec4(floor(a_pos * 0.5) + (offset + dist) / u_ratio, 0.0, 1.0);\n    v_linesofar = a_linesofar;\n\n    // position of y on the screen\n    float y = gl_Position.y / gl_Position.w;\n\n    // how much features are squished in the y direction by the tilt\n    float squish_scale = length(a_extrude) / length(u_antialiasingmatrix * a_extrude);\n\n    // how much features are squished in all directions by the perspectiveness\n#ifndef MAPBOX_GL_JS\n    float perspective_scale = 1.0 / (1.0 - y * u_extra);\n#else\n    float perspective_scale = 1.0 / (1.0 - min(y * u_extra, 0.9));\n#endif\n\n    v_linewidth = vec2(outset, inset);\n    v_gamma_scale = perspective_scale * squish_scale;\n}\n"
}

var linesdfpattern = {
  "fragmentSource": "#ifdef GL_ES\nprecision mediump float;\n#else\n#define lowp\n#define mediump\n#define highp\n#endif\n\nuniform lowp vec4 u_color;\nuniform lowp float u_opacity;\n\nuniform float u_blur;\nuniform sampler2D u_image;\nuniform float u_sdfgamma;\nuniform float u_mix;\n\nvarying vec2 v_normal;\nvarying vec2 v_linewidth;\nvarying vec2 v_tex_a;\nvarying vec2 v_tex_b;\nvarying float v_gamma_scale;\n\nvoid main() {\n    // Calculate the distance of the pixel from the line in pixels.\n    float dist = length(v_normal) * v_linewidth.s;\n\n    // Calculate the antialiasing fade factor. This is either when fading in\n    // the line in case of an offset line (v_linewidth.t) or when fading out\n    // (v_linewidth.s)\n    float blur = u_blur * v_gamma_scale;\n    float alpha = clamp(min(dist - (v_linewidth.t - blur), v_linewidth.s - dist) / blur, 0.0, 1.0);\n\n    float sdfdist_a = texture2D(u_image, v_tex_a).a;\n    float sdfdist_b = texture2D(u_image, v_tex_b).a;\n    float sdfdist = mix(sdfdist_a, sdfdist_b, u_mix);\n    alpha *= smoothstep(0.5 - u_sdfgamma, 0.5 + u_sdfgamma, sdfdist);\n\n    gl_FragColor = u_color * (alpha * u_opacity);\n\n#ifdef OVERDRAW_INSPECTOR\n    gl_FragColor = vec4(1.0);\n#endif\n}\n",
  "vertexSource": "#ifdef GL_ES\nprecision highp float;\n#else\n#define lowp\n#define mediump\n#define highp\n#endif\n\n// floor(127 / 2) == 63.0\n// the maximum allowed miter limit is 2.0 at the moment. the extrude normal is\n// stored in a byte (-128..127). we scale regular normals up to length 63, but\n// there are also \"special\" normals that have a bigger length (of up to 126 in\n// this case).\n// #define scale 63.0\n#define scale 0.015873016\n\n// We scale the distance before adding it to the buffers so that we can store\n// long distances for long segments. Use this value to unscale the distance.\n#define LINE_DISTANCE_SCALE 2.0\n\nattribute vec2 a_pos;\nattribute vec4 a_data;\n\nuniform mat4 u_matrix;\nuniform mediump float u_ratio;\nuniform mediump float u_linewidth;\nuniform mediump float u_gapwidth;\nuniform mediump float u_antialiasing;\nuniform vec2 u_patternscale_a;\nuniform float u_tex_y_a;\nuniform vec2 u_patternscale_b;\nuniform float u_tex_y_b;\nuniform float u_extra;\nuniform mat2 u_antialiasingmatrix;\nuniform mediump float u_offset;\n\nvarying vec2 v_normal;\nvarying vec2 v_linewidth;\nvarying vec2 v_tex_a;\nvarying vec2 v_tex_b;\nvarying float v_gamma_scale;\n\nvoid main() {\n    vec2 a_extrude = a_data.xy - 128.0;\n    float a_direction = mod(a_data.z, 4.0) - 1.0;\n    float a_linesofar = (floor(a_data.z / 4.0) + a_data.w * 64.0) * LINE_DISTANCE_SCALE;\n\n    // We store the texture normals in the most insignificant bit\n    // transform y so that 0 => -1 and 1 => 1\n    // In the texture normal, x is 0 if the normal points straight up/down and 1 if it's a round cap\n    // y is 1 if the normal points up, and -1 if it points down\n    mediump vec2 normal = mod(a_pos, 2.0);\n    normal.y = sign(normal.y - 0.5);\n    v_normal = normal;\n\n    float inset = u_gapwidth + (u_gapwidth > 0.0 ? u_antialiasing : 0.0);\n    float outset = u_gapwidth + u_linewidth * (u_gapwidth > 0.0 ? 2.0 : 1.0) + u_antialiasing;\n\n    // Scale the extrusion vector down to a normal and then up by the line width\n    // of this vertex.\n    mediump vec2 dist = outset * a_extrude * scale;\n\n    // Calculate the offset when drawing a line that is to the side of the actual line.\n    // We do this by creating a vector that points towards the extrude, but rotate\n    // it when we're drawing round end points (a_direction = -1 or 1) since their\n    // extrude vector points in another direction.\n    mediump float u = 0.5 * a_direction;\n    mediump float t = 1.0 - abs(u);\n    mediump vec2 offset = u_offset * a_extrude * scale * normal.y * mat2(t, -u, u, t);\n\n    // Remove the texture normal bit of the position before scaling it with the\n    // model/view matrix.\n    gl_Position = u_matrix * vec4(floor(a_pos * 0.5) + (offset + dist) / u_ratio, 0.0, 1.0);\n\n    v_tex_a = vec2(a_linesofar * u_patternscale_a.x, normal.y * u_patternscale_a.y + u_tex_y_a);\n    v_tex_b = vec2(a_linesofar * u_patternscale_b.x, normal.y * u_patternscale_b.y + u_tex_y_b);\n\n    // position of y on the screen\n    float y = gl_Position.y / gl_Position.w;\n\n    // how much features are squished in the y direction by the tilt\n    float squish_scale = length(a_extrude) / length(u_antialiasingmatrix * a_extrude);\n\n    // how much features are squished in all directions by the perspectiveness\n    float perspective_scale = 1.0 / (1.0 - min(y * u_extra, 0.9));\n\n    v_linewidth = vec2(outset, inset);\n    v_gamma_scale = perspective_scale * squish_scale;\n}\n"
}

var outline = {
  "fragmentSource": "#ifdef GL_ES\nprecision mediump float;\n#else\n#define lowp\n#define mediump\n#define highp\n#endif\n\n#pragma mapbox: define outline_color lowp\n\nuniform lowp float u_opacity;\n\nvarying vec2 v_pos;\n\nvoid main() {\n    #pragma mapbox: initialize outline_color lowp\n\n    float dist = length(v_pos - gl_FragCoord.xy);\n    float alpha = smoothstep(1.0, 0.0, dist);\n    gl_FragColor = outline_color * (alpha * u_opacity);\n\n#ifdef OVERDRAW_INSPECTOR\n    gl_FragColor = vec4(1.0);\n#endif\n}\n",
  "vertexSource": "#ifdef GL_ES\nprecision highp float;\n#else\n#define lowp\n#define mediump\n#define highp\n#endif\n\nattribute vec2 a_pos;\n\nuniform mat4 u_matrix;\nuniform vec2 u_world;\n\nvarying vec2 v_pos;\n\nvoid main() {\n    gl_Position = u_matrix * vec4(a_pos, 0, 1);\n    v_pos = (gl_Position.xy / gl_Position.w + 1.0) / 2.0 * u_world;\n}\n"
}

var outlinepattern = {
  "fragmentSource": "#ifdef GL_ES\nprecision mediump float;\n#else\n#define lowp\n#define mediump\n#define highp\n#endif\n\nuniform float u_opacity;\nuniform vec2 u_pattern_tl_a;\nuniform vec2 u_pattern_br_a;\nuniform vec2 u_pattern_tl_b;\nuniform vec2 u_pattern_br_b;\nuniform float u_mix;\n\nuniform sampler2D u_image;\n\nvarying vec2 v_pos_a;\nvarying vec2 v_pos_b;\nvarying vec2 v_pos;\n\nvoid main() {\n    vec2 imagecoord = mod(v_pos_a, 1.0);\n    vec2 pos = mix(u_pattern_tl_a, u_pattern_br_a, imagecoord);\n    vec4 color1 = texture2D(u_image, pos);\n\n    vec2 imagecoord_b = mod(v_pos_b, 1.0);\n    vec2 pos2 = mix(u_pattern_tl_b, u_pattern_br_b, imagecoord_b);\n    vec4 color2 = texture2D(u_image, pos2);\n\n    // find distance to outline for alpha interpolation\n\n    float dist = length(v_pos - gl_FragCoord.xy);\n    float alpha = smoothstep(1.0, 0.0, dist);\n    \n\n    gl_FragColor = mix(color1, color2, u_mix) * alpha * u_opacity;\n\n#ifdef OVERDRAW_INSPECTOR\n    gl_FragColor = vec4(1.0);\n#endif\n}\n",
  "vertexSource": "#ifdef GL_ES\nprecision highp float;\n#else\n#define lowp\n#define mediump\n#define highp\n#endif\n\n#ifndef MAPBOX_GL_JS\nuniform vec2 u_patternscale_a;\nuniform vec2 u_patternscale_b;\nuniform vec2 u_offset_a;\nuniform vec2 u_offset_b;\n#else\nuniform vec2 u_pattern_size_a;\nuniform vec2 u_pattern_size_b;\nuniform vec2 u_pixel_coord_upper;\nuniform vec2 u_pixel_coord_lower;\nuniform float u_scale_a;\nuniform float u_scale_b;\nuniform float u_tile_units_to_pixels;\n#endif\n\nattribute vec2 a_pos;\n\nuniform mat4 u_matrix;\nuniform vec2 u_world;\n\nvarying vec2 v_pos_a;\nvarying vec2 v_pos_b;\nvarying vec2 v_pos;\n\n\nvoid main() {\n    gl_Position = u_matrix * vec4(a_pos, 0, 1);\n#ifndef MAPBOX_GL_JS\n    v_pos_a = u_patternscale_a * a_pos + u_offset_a;\n    v_pos_b = u_patternscale_b * a_pos + u_offset_b;\n    v_pos = (gl_Position.xy/gl_Position.w + 1.0) / 2.0 * u_world;\n#else\n    vec2 scaled_size_a = u_scale_a * u_pattern_size_a;\n    vec2 scaled_size_b = u_scale_b * u_pattern_size_b;\n\n    // the correct offset needs to be calculated.\n    // \n    // The offset depends on how many pixels are between the world origin and\n    // the edge of the tile:\n    // vec2 offset = mod(pixel_coord, size)\n    //\n    // At high zoom levels there are a ton of pixels between the world origin\n    // and the edge of the tile. The glsl spec only guarantees 16 bits of\n    // precision for highp floats. We need more than that.\n    //\n    // The pixel_coord is passed in as two 16 bit values:\n    // pixel_coord_upper = floor(pixel_coord / 2^16)\n    // pixel_coord_lower = mod(pixel_coord, 2^16)\n    //\n    // The offset is calculated in a series of steps that should preserve this precision:\n    vec2 offset_a = mod(mod(mod(u_pixel_coord_upper, scaled_size_a) * 256.0, scaled_size_a) * 256.0 + u_pixel_coord_lower, scaled_size_a);\n    vec2 offset_b = mod(mod(mod(u_pixel_coord_upper, scaled_size_b) * 256.0, scaled_size_b) * 256.0 + u_pixel_coord_lower, scaled_size_b);\n\n    v_pos_a = (u_tile_units_to_pixels * a_pos + offset_a) / scaled_size_a;\n    v_pos_b = (u_tile_units_to_pixels * a_pos + offset_b) / scaled_size_b;\n\n    v_pos = (gl_Position.xy / gl_Position.w + 1.0) / 2.0 * u_world;\n#endif\n}\n"
}

var pattern = {
  "fragmentSource": "#ifdef GL_ES\nprecision mediump float;\n#else\n#define lowp\n#define mediump\n#define highp\n#endif\n\nuniform float u_opacity;\nuniform vec2 u_pattern_tl_a;\nuniform vec2 u_pattern_br_a;\nuniform vec2 u_pattern_tl_b;\nuniform vec2 u_pattern_br_b;\nuniform float u_mix;\n\nuniform sampler2D u_image;\n\nvarying vec2 v_pos_a;\nvarying vec2 v_pos_b;\n\nvoid main() {\n\n    vec2 imagecoord = mod(v_pos_a, 1.0);\n    vec2 pos = mix(u_pattern_tl_a, u_pattern_br_a, imagecoord);\n    vec4 color1 = texture2D(u_image, pos);\n\n    vec2 imagecoord_b = mod(v_pos_b, 1.0);\n    vec2 pos2 = mix(u_pattern_tl_b, u_pattern_br_b, imagecoord_b);\n    vec4 color2 = texture2D(u_image, pos2);\n\n    gl_FragColor = mix(color1, color2, u_mix) * u_opacity;\n\n#ifdef OVERDRAW_INSPECTOR\n    gl_FragColor = vec4(1.0);\n#endif\n}\n",
  "vertexSource": "#ifdef GL_ES\nprecision highp float;\n#else\n#define lowp\n#define mediump\n#define highp\n#endif\n\n#ifndef MAPBOX_GL_JS\nuniform mat4 u_matrix;\nuniform vec2 u_patternscale_a;\nuniform vec2 u_patternscale_b;\nuniform vec2 u_offset_a;\nuniform vec2 u_offset_b;\n#else\nuniform mat4 u_matrix;\nuniform vec2 u_pattern_size_a;\nuniform vec2 u_pattern_size_b;\nuniform vec2 u_pixel_coord_upper;\nuniform vec2 u_pixel_coord_lower;\nuniform float u_scale_a;\nuniform float u_scale_b;\nuniform float u_tile_units_to_pixels;\n#endif\n\nattribute vec2 a_pos;\n\nvarying vec2 v_pos_a;\nvarying vec2 v_pos_b;\n\nvoid main() {\n    gl_Position = u_matrix * vec4(a_pos, 0, 1);\n#ifndef MAPBOX_GL_JS\n    v_pos_a = u_patternscale_a * a_pos + u_offset_a;\n    v_pos_b = u_patternscale_b * a_pos + u_offset_b;\n#else\n    vec2 scaled_size_a = u_scale_a * u_pattern_size_a;\n    vec2 scaled_size_b = u_scale_b * u_pattern_size_b;\n\n    // the correct offset needs to be calculated.\n    // \n    // The offset depends on how many pixels are between the world origin and\n    // the edge of the tile:\n    // vec2 offset = mod(pixel_coord, size)\n    //\n    // At high zoom levels there are a ton of pixels between the world origin\n    // and the edge of the tile. The glsl spec only guarantees 16 bits of\n    // precision for highp floats. We need more than that.\n    //\n    // The pixel_coord is passed in as two 16 bit values:\n    // pixel_coord_upper = floor(pixel_coord / 2^16)\n    // pixel_coord_lower = mod(pixel_coord, 2^16)\n    //\n    // The offset is calculated in a series of steps that should preserve this precision:\n    vec2 offset_a = mod(mod(mod(u_pixel_coord_upper, scaled_size_a) * 256.0, scaled_size_a) * 256.0 + u_pixel_coord_lower, scaled_size_a);\n    vec2 offset_b = mod(mod(mod(u_pixel_coord_upper, scaled_size_b) * 256.0, scaled_size_b) * 256.0 + u_pixel_coord_lower, scaled_size_b);\n\n    v_pos_a = (u_tile_units_to_pixels * a_pos + offset_a) / scaled_size_a;\n    v_pos_b = (u_tile_units_to_pixels * a_pos + offset_b) / scaled_size_b;\n#endif\n}\n"
}

var raster = {
  "fragmentSource": "#ifdef GL_ES\nprecision mediump float;\n#else\n#define lowp\n#define mediump\n#define highp\n#endif\n\n#ifndef MAPBOX_GL_JS\nuniform sampler2D u_image;\nuniform float u_opacity;\n#endif\n\n#ifndef MAPBOX_GL_JS\nvarying vec2 v_pos;\n#else\nuniform float u_opacity0;\nuniform float u_opacity1;\nuniform sampler2D u_image0;\nuniform sampler2D u_image1;\nvarying vec2 v_pos0;\nvarying vec2 v_pos1;\n#endif\n\nuniform float u_brightness_low;\nuniform float u_brightness_high;\n\nuniform float u_saturation_factor;\nuniform float u_contrast_factor;\nuniform vec3 u_spin_weights;\n\nvoid main() {\n\n#ifndef MAPBOX_GL_JS\n    vec4 color = texture2D(u_image, v_pos) * u_opacity;\n#else\n    // read and cross-fade colors from the main and parent tiles\n    vec4 color0 = texture2D(u_image0, v_pos0);\n    vec4 color1 = texture2D(u_image1, v_pos1);\n    vec4 color = color0 * u_opacity0 + color1 * u_opacity1;\n#endif\n    vec3 rgb = color.rgb;\n\n    // spin\n    rgb = vec3(\n        dot(rgb, u_spin_weights.xyz),\n        dot(rgb, u_spin_weights.zxy),\n        dot(rgb, u_spin_weights.yzx));\n\n    // saturation\n    float average = (color.r + color.g + color.b) / 3.0;\n    rgb += (average - rgb) * u_saturation_factor;\n\n    // contrast\n    rgb = (rgb - 0.5) * u_contrast_factor + 0.5;\n\n    // brightness\n    vec3 u_high_vec = vec3(u_brightness_low, u_brightness_low, u_brightness_low);\n    vec3 u_low_vec = vec3(u_brightness_high, u_brightness_high, u_brightness_high);\n\n    gl_FragColor = vec4(mix(u_high_vec, u_low_vec, rgb), color.a);\n\n#ifdef OVERDRAW_INSPECTOR\n    gl_FragColor = vec4(1.0);\n#endif\n}\n",
  "vertexSource": "#ifdef GL_ES\nprecision highp float;\n#else\n#define lowp\n#define mediump\n#define highp\n#endif\n\nuniform mat4 u_matrix;\n#ifndef MAPBOX_GL_JS\nuniform float u_buffer;\n#else\nuniform vec2 u_tl_parent;\nuniform float u_scale_parent;\nuniform float u_buffer_scale;\n#endif\n\nattribute vec2 a_pos;\n#ifdef MAPBOX_GL_JS\nattribute vec2 a_texture_pos;\n#endif\n\n#ifndef MAPBOX_GL_JS\nvarying vec2 v_pos;\n\n#else\nvarying vec2 v_pos0;\nvarying vec2 v_pos1;\n#endif\n\nvoid main() {\n    gl_Position = u_matrix * vec4(a_pos, 0, 1);\n#ifndef MAPBOX_GL_JS\n    float dimension = (8192.0 + 2.0 * u_buffer);\n    v_pos = (a_pos / dimension) + (u_buffer / dimension);\n#else\n    v_pos0 = (((a_texture_pos / 32767.0) - 0.5) / u_buffer_scale ) + 0.5;\n    v_pos1 = (v_pos0 * u_scale_parent) + u_tl_parent;\n#endif\n}\n"
}

var sdf = {
  "fragmentSource": "#ifdef GL_ES\nprecision mediump float;\n#else\n#define lowp\n#define mediump\n#define highp\n#endif\n\nuniform sampler2D u_texture;\nuniform sampler2D u_fadetexture;\nuniform lowp vec4 u_color;\nuniform lowp float u_opacity;\nuniform lowp float u_buffer;\nuniform lowp float u_gamma;\n\nvarying vec2 v_tex;\nvarying vec2 v_fade_tex;\nvarying float v_gamma_scale;\n\nvoid main() {\n    lowp float dist = texture2D(u_texture, v_tex).a;\n    lowp float fade_alpha = texture2D(u_fadetexture, v_fade_tex).a;\n    lowp float gamma = u_gamma * v_gamma_scale;\n    lowp float alpha = smoothstep(u_buffer - gamma, u_buffer + gamma, dist) * fade_alpha;\n\n    gl_FragColor = u_color * (alpha * u_opacity);\n\n#ifdef OVERDRAW_INSPECTOR\n    gl_FragColor = vec4(1.0);\n#endif\n}\n",
  "vertexSource": "#ifdef GL_ES\nprecision highp float;\n#else\n#define lowp\n#define mediump\n#define highp\n#endif\n\nattribute vec2 a_pos;\nattribute vec2 a_offset;\nattribute vec4 a_data1;\nattribute vec4 a_data2;\n\n\n// matrix is for the vertex position.\nuniform mat4 u_matrix;\n\nuniform mediump float u_zoom;\nuniform bool u_skewed;\nuniform vec2 u_extrude_scale;\n\nuniform vec2 u_texsize;\n\nvarying vec2 v_tex;\nvarying vec2 v_fade_tex;\nvarying float v_gamma_scale;\n\nvoid main() {\n    vec2 a_tex = a_data1.xy;\n    mediump float a_labelminzoom = a_data1[2];\n    mediump vec2 a_zoom = a_data2.st;\n    mediump float a_minzoom = a_zoom[0];\n    mediump float a_maxzoom = a_zoom[1];\n\n    // u_zoom is the current zoom level adjusted for the change in font size\n    mediump float z = 2.0 - step(a_minzoom, u_zoom) - (1.0 - step(a_maxzoom, u_zoom));\n\n    vec2 extrude = u_extrude_scale * (a_offset / 64.0);\n    if (u_skewed) {\n        gl_Position = u_matrix * vec4(a_pos + extrude, 0, 1);\n        gl_Position.z += z * gl_Position.w;\n    } else {\n        gl_Position = u_matrix * vec4(a_pos, 0, 1) + vec4(extrude, 0, 0);\n    }\n\n    v_gamma_scale = (gl_Position.w - 0.5);\n\n    v_tex = a_tex / u_texsize;\n    v_fade_tex = vec2(a_labelminzoom / 255.0, 0.0);\n}\n"
}

var util = "float evaluate_zoom_function_1(const vec4 values, const float t) {\n    if (t < 1.0) {\n        return mix(values[0], values[1], t);\n    } else if (t < 2.0) {\n        return mix(values[1], values[2], t - 1.0);\n    } else {\n        return mix(values[2], values[3], t - 2.0);\n    }\n}\nvec4 evaluate_zoom_function_4(const vec4 value0, const vec4 value1, const vec4 value2, const vec4 value3, const float t) {\n    if (t < 1.0) {\n        return mix(value0, value1, t);\n    } else if (t < 2.0) {\n        return mix(value1, value2, t - 1.0);\n    } else {\n        return mix(value2, value3, t - 2.0);\n    }\n}\n";

exports.circle = circle;
exports.collisionbox = collisionbox;
exports.debug = debug;
exports.fill = fill;
exports.icon = icon;
exports.line = line;
exports.linepattern = linepattern;
exports.linesdfpattern = linesdfpattern;
exports.outline = outline;
exports.outlinepattern = outlinepattern;
exports.pattern = pattern;
exports.raster = raster;
exports.sdf = sdf;
exports.util = util;