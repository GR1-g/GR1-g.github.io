#version 300 es
precision highp float;
out vec4 o_color; 

in vec3 pos;
in vec3 norm;

uniform float time;

vec3 Loc = vec3(8, 8, 8);
vec3 Ka = vec3(0.25, 0.2, 0.07);
vec3 Ks = vec3(0.75, 0.6, 0.2);
vec3 Kd = vec3(0.6, 0.5, 0.3);
float Ph = 51.2;

vec3 Shade( vec3 P, vec3 N ) {
  vec3 L = normalize(vec3(8.0 * sin(time), 2, 3));
  vec3 LC = vec3(1, 1, 1);
  vec3 V = normalize(P - Loc);
  vec3 color = vec3(0);

  color = Ka;
  //N = faceforward(N, V, N);

  color += max(0.0, dot(N, L)) * Kd * LC;

  vec3 R = reflect(V, N);
  color += pow(max(0.0, dot(R, L)), Ph) * Ks * LC;

  return color;
}

void main() {
//  o_color = vec4(pos.xy * cos(time) * cos(time), 1, 1);
  o_color = vec4(Shade(pos, normalize(norm)), 1);
}