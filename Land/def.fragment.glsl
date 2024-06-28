#version 300 es
precision highp float;

in vec3 pos;
in vec3 text;
in vec3 norm;
in vec3 loc;

layout(std140) uniform Material
{
    vec4 IsText[2];
    vec4 IsTrans;
};

uniform sampler2D Tex0;
uniform sampler2D Tex1;
uniform sampler2D Tex2;
uniform sampler2D Tex3;
uniform sampler2D Tex4;

out vec4 o_color;

void main()
{
    vec3 v = normalize(pos - loc);
    vec3 n = normalize(faceforward(norm, v, norm));
    vec3 l = normalize(vec3(1.0, 2.0, 3.0));
    vec4 tc0 = texture(Tex0, text.xy);
    vec4 tc1 = texture(Tex1, text.xy);
    vec4 tc2;
    if (text.z == 0.0)
        tc2 = texture(Tex2, text.xy);
    else
        tc2 = texture(Tex3, text.xy);
    vec4 tc4 = texture(Tex4, text.xy);

    if (pos.y > 30.0) {
        vec3 color = max(0.0, dot(n, l)) * tc4.rgb;
        o_color = vec4(color, IsTrans.x);
    }
    else if (pos.y > 20.0 && pos.y < 30.0) {
        float x = (pos.y - 20.0) / 10.0;
        vec3 text = tc4.rgb * x + tc1.rgb * (1.0 - x);
        vec3 color = max(0.0, dot(n, l)) * text;
        o_color = vec4(color, IsTrans.x);
    }
    else if (pos.y > 10.0) {
        vec3 color = max(0.0, dot(n, l)) * tc1.rgb;
        o_color = vec4(color, IsTrans.x);
    }
    else if (pos.y > 5.0 && pos.y < 10.0) {
        float x = (pos.y - 5.0) / 5.0;
        vec3 text = tc1.rgb * x + tc2.rgb * (1.0 - x);
        vec3 color = max(0.0, dot(n, l)) * text;
        o_color = vec4(color, IsTrans.x);
    }
    else if (pos.y > 1.5) {
        vec3 color = max(0.0, dot(n, l)) * tc2.rgb;
        o_color = vec4(color, IsTrans.x);
    }
    else if (pos.y < 1.5 && pos.y > -1.9) {
        float x = (pos.y + 2.0) / 3.5;
        vec3 text = tc2.rgb * x + tc0.rgb * (1.0 - x);
        vec3 color = max(0.0, dot(n, l)) * text;
        o_color = vec4(color, IsTrans.x);
    }
    else {
        vec3 color = max(0.0, dot(n, l)) * tc0.rgb;
        o_color = vec4(color, IsTrans.x);
    }
}