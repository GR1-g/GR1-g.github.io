#version 300 es
precision highp float;
out vec4 o_color;
/*
uniform sampler2D inPositionMetal;
uniform sampler2D inNormalRoughness;
uniform sampler2D inSpecular;
uniform sampler2D inBaseColor;

#define pi 3.141592653589793238462643383279

float gShlickBeckmann( float roughness, float nDotDir )
{
  float a = pow(roughness, 2.0),
        tmp = (a + 1.0) * (a + 1.0) / 8.0;
  return 1.0 / (nDotDir * (1 - tmp) + tmp);
}

float gSmith( float roughness, float lDotN, float camDotN )
{
  return gShlickBeckmann(roughness, lDotN) * gShlickBeckmann(Roughness, camDotN);
}

float distribution( float roughness, vec3 n, vec3 h )
{
  float a = pow(roughness, 2.0),
        tmp =  max(dot(normalize(n), normalize(h)), 0.0);
  tmp = tmp * tmp * (a * a - 1.0) + 1.0;
  return pow(a, 2.0) / (pi * tmp * tmp);
}

vec3 frenel( vec3 f0, float cosAngle )
{
  return f0 + (vec3(1.0) - f0) * pow(1.0 - cosAngle, 5.0);
}
*/
void main()
{/*
    ivec2 sc = ivec2(gl_FragCoord.xy);
    vec3 pos, norm, specular, base_color;
    float metal, rough;

    pos = texelFetch(inPositionMetal, sc, 0).xyz;
    norm = texelFetch(inNormalRoughness, sc, 0).xyz;
    specular = texelFetch(inSpecular, sc, 0).xyz;
    base_color = texelFetch(inBaseColor, sc, 0).xyz;
    metal = texelFetch(inPositionMetal, sc, 0).w;
    rough = texelFetch(inNormalRoughness, sc, 0).w;

    vec3 v = vec3(0.0); // normalize(camLoc - pos);
    vec3 l = normalize(5.0, 4.0, 2.0);
    vec3 l_color = vec3(1.0, 0.0, 0.0);

    if (dot(N, L) < 0 || dot(N, V) < 0)
    {
      o_color = vec4(0);
      return;
    }

    h = normalize(v + l); 

    vec3 fren = mix(specular, base_color, metal);
    float g = gSmith(rough, max(0.0, dot(l, n)), max(0.0, dot(v, n))),
           d = distribution(roughness, n, h);
    vec3 f = frenel(fren, dot(h, v));
 
    vec3 fs = f * d * g / 4.0;
    vec3 fd = (1 - length(f) / length(base_color)) * base_color;

    vec3 color = (fd + fs) * lc * dot(l, n) * pi;
*/
//     o_color = vec4(color, 1);
    o_color = vec4(1.0, 1.0, 1.0, 1.0);
}