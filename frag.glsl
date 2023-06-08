#version 300 es
precision highp float;
out vec4 o_color; 
in vec2 color;

uniform float time;
vec3 Loc = vec3(8, 8, 8);
vec3 Ka = vec3(1, 1, 1);
vec3 Ks = vec3(1, 1, 1);
vec3 Kd = vec3(1, 1, 1);
float Ph = 50.0;

vec2 mul( vec2 z1, vec2 z2 ) {
  float a = z1.x * z2.x - z1.y * z2.y, b = z1.x * z2.y + z1.y * z2.x;

  return vec2(a, b);
}

float len( vec2 z ) {
  return sqrt(z.x * z.x + z.y * z.y);
} 

vec3 Jul( vec2 z, vec2 c ) {
  float i = 0.0;
 
  while (i < 255.0 && len(z) < 2.0)
  {
    z = mul(z, z) + c;
    i = i + 1.0;
  }
  i = i / 255.0;
  return vec3(i, i / 8.0, i * 8.0);
}

vec3 Shade( vec3 P, vec3 N ) {
  vec3 L = normalize(vec3(8.0 * sin(time), 2, 3));
  vec3 LC = vec3(1, 1, 1);
  vec3 V = normalize(P - Loc);
  vec3 color = vec3(0);

  color = Ka;
  N = faceforward(N, V, N);

  color += max(0.0, dot(N, L)) * Kd * LC;

  vec3 R = reflect(V, N);
  color += pow(max(0.0, dot(R, L)), Ph) * Ks * LC;

  return color;
}

void main() {
//  o_color = vec4(color.xy * cos(time) * cos(time), 1, 1);
  o_color = vec4(Jul(color.xy, vec2(0.35 + 0.08 * sin(time / 3.0 + 3.0), 0.39 + 0.08 * sin(1.1 * time / 3.0))), 1);
//  o_color = vec4(Jul(color.xy, color.xy), 1);
}