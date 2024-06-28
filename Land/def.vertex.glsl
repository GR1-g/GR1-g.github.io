#version 300 es
precision highp float;

in highp vec3 in_pos;
in highp vec3 in_text;
in highp vec3 in_norm;

out highp vec3 pos;
out highp vec3 text;
out highp vec3 norm;
out highp vec3 loc;

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

void main()
{
    gl_Position = MatrVP * vec4(in_pos, 1.0);
    pos = in_pos;
    text = in_text;
    norm = normalize(in_norm);
    loc = CamLoc;
}
