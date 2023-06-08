#version 300 es

precision highp float;
in highp vec3 in_pos;
out highp vec2 color;

uniform mat4 MatrVP;

void main() {
  gl_Position = MatrVP * vec4(in_pos, 1);
  color = in_pos.xy;
}