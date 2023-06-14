#version 300 es
precision highp float;
out vec4 o_color; 

in vec3 pos;
in vec3 norm;

uniform float time;

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

void main() {
  o_color = vec4(Jul(pos.xy, vec2(0.35 + 0.08 * sin(time / 3.0 + 3.0), 0.39 + 0.08 * sin(1.1 * time / 3.0))), 1);
//  o_color = vec4(Jul(pos.xy, pos.xy), 1);
}   