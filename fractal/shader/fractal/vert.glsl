#version 300 es
precision highp float;

in highp vec3 in_pos;
in highp vec3 in_norm;

out highp vec3 pos;
out highp vec3 norm;

uniform mat4 MatrVP;

void main() {
  gl_Position = /*MatrVP **/ vec4(in_pos, 1);
  pos = in_pos * vec3(2, 2, 2);
  norm = in_norm;
}