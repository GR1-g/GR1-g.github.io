#version 300 es
precision highp float;
out vec4 o_color;

layout(std140) uniform Camera
{
    mat4 MatrView;
    mat4 MatrProj;
    mat4 MatrVP;
    vec4 CamLocFrameW;
    vec4 CamDirProjDist;
    vec4 CamRightWp;
    vec4 CamUpHp;
    vec4 CamAtFrameH;
    vec4 CamProjSizeFarClip;
    vec4 SyncGlobalTimeGlobalDeltaTimeTimeDeltaTime;
};

#define CamLoc CamLocFrameW.xyz
#define CamDir CamDirProjDist.xyz
#define CamRight CamRightWp.xyz
#define CamUp CamUpHp.xyz
#define CamAt CamAtFrameH.xyz

#define FrameW CamLocFrameW.w
#define FrameH CamAtFrameH.w
#define ProjDist CamDirProjDist.w
#define ProjSize CamProjSizeFarClip.x
#define ProjFarClip CamProjSizeFarClip.y
#define Wp CamRightWp.w
#define Hp CamUpHp.w

#define GlobalTime SyncGlobalTimeGlobalDeltaTimeTimeDeltaTime.x
#define GlobalDeltaTime SyncGlobalTimeGlobalDeltaTimeTimeDeltaTime.y
#define Time SyncGlobalTimeGlobalDeltaTimeTimeDeltaTime.z
#define DeltaTime SyncGlobalTimeGlobalDeltaTimeTimeDeltaTime.w

struct sphere {
    vec4 addiction;
    vec4 center;
    vec4 colorRad;
};

struct cube {
    vec4 addiction;
    vec4 center;
    vec4 color;
    vec4 size;
};

struct torus {
    vec4 addiction;
    vec4 centerBigRad;
    vec4 colorSmallRad;
};

layout (std140) uniform Shapes {
    vec4 shapesCount;
    sphere s_data[32];
    cube c_data[32];
    torus t_data[32];
};

vec3 Color = vec3(0); 
float koef = 0.0;

float opUnion( float d1, float d2, float k )
{
    float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
    return mix(d2, d1, h) - k * h * (1.0 - h);
}

float opSubtraction( float d1, float d2, float k )
{
    float h = clamp(0.5 - 0.5 * (d2 + d1) / k, 0.0, 1.0);
    return mix(d2, -d1, h) + k * h * (1.0 - h);
}

float opIntersection( float d1, float d2, float k )
{
    float h = clamp(0.5 - 0.5 * (d2 - d1) / k, 0.0, 1.0);
    return mix(d2, d1, h) + k * h * (1.0 - h);
}

float distance_from_sphere(in vec3 p, in vec3 c, float r)
{
    return length(p - c) - r;
}

float distance_from_cube(in vec3 p, in vec3 c, in vec3 b)
{
    vec3 q = abs(p - c) - b;
    return length(max(q, vec3(0.0))) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float distance_from_torus(in vec3 p, in vec3 c, in vec2 t)
{
    p = p - c;
    vec2 q = vec2(length(p.xz) - t.x, p.y);
    return length(q) - t.y;
}

float distance_from_plane(in vec3 p, in vec3 n, float h)
{
    return dot(p, n) + h;
}

float distance_by_number(in vec3 p, int x) {
    if (x < 32) {
        koef = s_data[x].addiction.x;
        return distance_from_sphere(p, s_data[x].center.xyz, s_data[x].colorRad.w);
    } else if (x < 64) {
        koef = c_data[x - 32].addiction.x;
        return distance_from_cube(p, c_data[x - 32].center.xyz, c_data[x - 32].size.xyz);
    } else if (x < 96) {
        koef = t_data[x - 64].addiction.x;
        return distance_from_torus(p, t_data[x - 64].centerBigRad.xyz, vec2(t_data[x - 64].centerBigRad.w, t_data[x - 64].colorSmallRad.w));
    }
    return 10000.0;
}

float map_the_world(in vec3 p)
{
    int i;
    float dist = 0.0, distance = 10000.0, plane;

    // float displacement = Amplitude.x * p.x * sin(Compression.x * Time + Offset.x) + Amplitude.y  * sin(Compression.y * Time + Offset.y) + Amplitude.z * sin(Compression.z * Time + Offset.z);

    plane = distance = distance_from_plane(p, vec3(0.0, 1.0, 0.0), 0.0);
    Color = vec3(0.0, 1.0, 0.0);

    for (i = 0; i < int(shapesCount.x); i++) {
        if (s_data[i].addiction.w == 0.0) {
          dist = distance_from_sphere(p, s_data[i].center.xyz, s_data[i].colorRad.w);
          if (dist < distance) {
            distance = dist;
            Color = s_data[i].colorRad.xyz;
          }
        }
    }

    for (i = 0; i < int(shapesCount.y); i++) {
        if (c_data[i].addiction.w == 0.0) {
          dist = distance_from_cube(p, c_data[i].center.xyz, c_data[i].size.xyz);
          if (dist < distance) {
              distance = dist;
              Color = c_data[i].color.xyz;
          }
        }
    }

    for (i = 0; i < int(shapesCount.z); i++) {
        if (t_data[i].addiction.w == 0.0) {
          dist = distance_from_torus(p, t_data[i].centerBigRad.xyz, vec2(t_data[i].centerBigRad.w, t_data[i].colorSmallRad.w));
          if (dist < distance) {
              distance = dist;
              Color = t_data[i].colorSmallRad.xyz;
          }
        }
    }

    vec3 color = vec3(0.0);
    for (i = 0; i < int(shapesCount.x); i++) {
        if (s_data[i].addiction.w == 1.0) {
            float d = 10000.0, d_sphere = distance_from_sphere(p, s_data[i].center.xyz, s_data[i].colorRad.w);
            if (s_data[i].addiction.x != -1.0) {
                d = distance_by_number(p, int(s_data[i].addiction.x));
                d = opUnion(d, d_sphere, koef);
                //if (d == distance_by_number(p, int(s_data[i].addiction.x)))
                //    color = s_data[int(s_data[i].addiction.x)].colorRad.xyz;
                //else
                    color = s_data[i].colorRad.xyz;
            }
            else if (s_data[i].addiction.y != -1.0) {
                 d = distance_by_number(p, int(s_data[i].addiction.y));
                 d = opSubtraction(d, d_sphere, koef);
                 color = s_data[i].colorRad.xyz;
            }
            else if (s_data[i].addiction.z != -1.0) {
                 d = distance_by_number(p, int(s_data[i].addiction.z));
                 d = opIntersection(d_sphere, d, koef);
                 color = s_data[i].colorRad.xyz;
            }
            if (d < distance) {
                distance = d;
                Color = color;
            }
        }
    }

    for (i = 0; i < int(shapesCount.y); i++) {
        if (c_data[i].addiction.w == 1.0) {
            float d = 10000.0, d_cube = distance_from_cube(p, c_data[i].center.xyz, c_data[i].size.xyz);
            if (c_data[i].addiction.x != -1.0) {
                d = distance_by_number(p, int(c_data[i].addiction.x));
                d = opUnion(d, d_cube, koef);
                color = c_data[i].color.xyz;
            }
            else if (c_data[i].addiction.y != -1.0) {
                 d = distance_by_number(p, int(c_data[i].addiction.y));
                 d = opSubtraction(d, d_cube, koef);
                 color = c_data[i].color.xyz;
            }
            else if (c_data[i].addiction.z != -1.0) {
                 d = distance_by_number(p, int(c_data[i].addiction.z));
                 d = opIntersection(d_cube, d, koef);
                 color = c_data[i].color.xyz;
            }
            if (d < distance) {
                distance = d;
                Color = color;
            }
        }
    }

    for (i = 0; i < int(shapesCount.z); i++) {
        if (t_data[i].addiction.w == 1.0) {
            float d = 10000.0, d_torus = distance_from_torus(p, t_data[i].centerBigRad.xyz, vec2(t_data[i].centerBigRad.w, t_data[i].colorSmallRad.w));
            if (t_data[i].addiction.x != -1.0) {
                d = distance_by_number(p, int(t_data[i].addiction.x));
                d = opUnion(d, d_torus, koef);
                color = t_data[i].colorSmallRad.xyz;
            }
            else if (t_data[i].addiction.y != -1.0) {
                 d = distance_by_number(p, int(t_data[i].addiction.y));
                 d = opSubtraction(d, d_torus, koef);
                 color = t_data[i].colorSmallRad.xyz;
            }
            else if (t_data[i].addiction.z != -1.0) {
                 d = distance_by_number(p, int(t_data[i].addiction.z));
                 d = opIntersection(d_torus, d, koef);
                 color = t_data[i].colorSmallRad.xyz;
            }
            if (d < distance) {
                distance = d;
                Color = color;
            }
        }
    }

    // if (plane <= distance)
    //     return plane;
    return distance; // + displacement;
}

/*
float map_the_world(in vec3 p)
{
    float displacement = sin(5.0 * p.x * sin(Time / 1000.0)) * sin(5.0 * p.y * cos(Time / 1000.0)) * sin(5.0 * p.z * sin(Time / 1000.0 + 3.0)) * 0.25;
    float sphere_0 = distance_from_sphere(p, vec3(0.0), 2.0);
    float plane_0 = distance_from_plane(p, vec3(0, 1, 0), 0.0);
 
    Color = vec3(0.0, 1.0, 0.0);
    return sphere_0 + displacement;
}*/

vec3 calculate_normal(in vec3 p)
{
    const vec3 small_step = vec3(0.001, 0.0, 0.0);

    float gradient_x = map_the_world(p + small_step.xyy) - map_the_world(p - small_step.xyy);
    float gradient_y = map_the_world(p + small_step.yxy) - map_the_world(p - small_step.yxy);
    float gradient_z = map_the_world(p + small_step.yyx) - map_the_world(p - small_step.yyx);

    vec3 normal = vec3(gradient_x, gradient_y, gradient_z);

    return normalize(normal);
}

vec3 ray_march(in vec3 ro, in vec3 rd)
{
    float total_distance_traveled = 0.0;
    const int NUMBER_OF_STEPS = 128;
    const float MINIMUM_HIT_DISTANCE = 0.001;
    const float MAXIMUM_TRACE_DISTANCE = 1000.0;

    for (int i = 0; i < NUMBER_OF_STEPS; ++i)
    {
        vec3 current_position = ro + total_distance_traveled * rd;

        float distance_to_closest = map_the_world(current_position);

        if (distance_to_closest < MINIMUM_HIT_DISTANCE) 
        {
            vec3 normal = calculate_normal(current_position);
            vec3 light_position = vec3(2.0, -5.0, 3.0);
            vec3 direction_to_light = normalize(current_position - light_position);

            float diffuse_intensity = max(0.0, dot(normal, direction_to_light));

            // return vec3(0.0, 1.0, 0.0) * diffuse_intensity;
            return Color * diffuse_intensity;
        }

        if (total_distance_traveled > MAXIMUM_TRACE_DISTANCE)
        {
            break;
        }
        total_distance_traveled += distance_to_closest;
    }
    return vec3(0.0);
}

void main()
{
    // vec2 uv = vUV.st * 2.0 - 1.0;
    vec2 uv = vec2(-1.0, -1.0) + 2.0 * gl_FragCoord.xy / 500.0;

    // uv = (vec4(uv, -0.1, 1) * inverse(MatrView)).xy;
    vec3 ray_dir = normalize(uv.x * CamRight + uv.y * CamUp + CamDir);

    vec3 camera_position = CamLoc; // vec3(0.0, 0.0, -5.0);
    vec3 ro = camera_position;
    vec3 rd = ray_dir; // normalize(vec3(uv.xy, 1.0));

    vec3 shaded_color = ray_march(ro, rd);

    o_color = vec4(shaded_color, 1.0);
}