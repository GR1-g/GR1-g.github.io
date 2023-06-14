import { _vec3, vec } from "./mth/mth_vec.js";
import { _camera, cam, camRot } from "./mth/mth_camera.js";
import { icosahedronInit, octahedronInit, cubeInit, tetrahedronInit,
         icosahedronDraw, octahedronDraw, cubeDraw, tetrahedronDraw } from "./platon.js";
import { primCreate, primDraw, primLoad } from "./anim/render/prim.js";
import { loadShader } from "./anim/render/res/shaders.js";

export let azimuth;
export let elevator;
export let dist;
let camera;
let locAtUp = {
  loc: vec(0, 0, 0),
  at: vec(0, 0, 0),
  up: vec(0, 0, 0)
};

export function camMouse(deltaX, deltaY, deltaW) {
  /*
  locAtUp.at.x += deltaX / 100;
  locAtUp.at.y += deltaY / 100;
  locAtUp.loc.x += -deltaX / 100;
  locAtUp.loc.y += deltaY / 100;
  locAtUp.loc.z += deltaW / 100;
  if (locAtUp.loc.z < 0) {
    locAtUp.loc.z = 0;
  }
  */
}

export function initGL() {
  const canvas = document.getElementById("glCanvas");
  const gl = canvas.getContext("webgl2");

  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);

  let vs, fs, text;
  let filename = "default";
//  let filename = "fractal";

  locAtUp.loc = vec(8, 8, 8);
  locAtUp.at = vec(0, 0, 0);
  locAtUp.up = vec(0, 1, 0); 

  const ft1 = fetch(`/shader/${filename}/vert.glsl`).then((res) => res.text()).then((data) => {
    vs = data;
  });
  const ft2 = fetch(`/shader/${filename}/frag.glsl`).then((res) => res.text()).then((data) => {
    fs = data;
  });
  const ft3 = fetch('cow.obj').then((res) => res.text()).then((data) => {
    text = data.split("\n");
  });
  /*
  const vs = `#version 300 es
              in highp vec4 in_pos;
              out highp vec2 color;

              void main() {
                gl_Position = in_pos;
                color = in_pos.xy;
              }`

  const fs = `#version 300 es
              out highp vec4 o_color; 
              in highp vec2 color;

              uniform highp float time;
              void main()
              {
                o_color = vec4(color.xy * cos(time) * cos(time), 1, 1);
              }`
 
  const vertexSh = loadShader(gl, gl.VERTEX_SHADER, vs);
  const fragmentSh = loadShader(gl, gl.FRAGMENT_SHADER, fs);
  const program = gl.createProgram();

  gl.attachShader(program, vertexSh);
  gl.attachShader(program, fragmentSh);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      alert("fail");        
  */

  const allData = Promise.all([ft1, ft2, ft3]);
  allData.then((res) => {
    const vertexSh = loadShader(gl, gl.VERTEX_SHADER, vs);
    const fragmentSh = loadShader(gl, gl.FRAGMENT_SHADER, fs);
    const program = gl.createProgram();

    gl.attachShader(program, vertexSh);
    gl.attachShader(program, fragmentSh);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const Buf = gl.getProgramInfoLog(program);
      console.log(Buf);
    }

    const uniformTime = gl.getUniformLocation(program, "time");
    const uniformVP = gl.getUniformLocation(program, "MatrVP");
    const posLoc = gl.getAttribLocation(program, "in_pos");
    const normLoc = gl.getAttribLocation(program, "in_norm");

    const pos = [-1, -1, 0, -1, 1, 0, 1, -1, 0, 1, 1, -1];
    const norm = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    const vert = {
      pos: pos,
      norm: norm
    };
    const ind = [0, 1, 2, 3];

    const beginTime = Date.now();

//    let prim = primCreate(gl, gl.TRIANGLE_STRIP, vert, ind, posLoc, normLoc);
    let prim = primLoad(gl, text, posLoc, normLoc);

    const v1 = vec(0, 0, -2);
    const v2 = vec(0 , 0, 0);
    const v3 = vec(0, 0, 2);
    const v4 = vec(0, 0, 4);
//    let vertex1 = icosahedronInit(v1);
//    let vertex2 = octahedronInit(1, v2);
//    let vertex3 = cubeInit(1, v3);
//    let vertex4 = tetrahedronInit(1, v4);

    const draw = () => {
      gl.useProgram(program);
 
//      icosahedronDraw(gl, vertex1, posLoc, normLoc);
//      octahedronDraw(gl, vertex2, posLoc, normLoc);
//      cubeDraw(gl, vertex3, posLoc, normLoc);
//      tetrahedronDraw(gl, vertex4, posLoc, normLoc);

      primDraw(gl, prim);

      let Loc = locAtUp.loc;
      let At = locAtUp.at;
      let Up1 = locAtUp.up;
      camera = cam(0.1, 0.1, 300, Loc, At, Up1, 47, 47);
      const timeFromStart = Date.now() - beginTime;
      gl.uniform1f(uniformTime, (timeFromStart) / 1000);
      let MatrVP = camera.MatrVP;
      let buf = new Float32Array([
        ...MatrVP.A[0],
        ...MatrVP.A[1],
        ...MatrVP.A[2],
        ...MatrVP.A[3]
      ])
      gl.uniformMatrix4fv(uniformVP, false, buf);

      window.requestAnimationFrame(draw);
    };

    draw();      
  });
}