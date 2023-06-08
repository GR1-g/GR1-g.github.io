/* 03.06*/
function Prim() {
  let primVertexArray = gl.createVertexArray();
  let primVertexBuffer = gl.createBuffer();
  let primIndexBuffer = gl.createBuffer();
//  let indices = new Uint16Array();
  const pos = [-1, -1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0];

  gl.bindVertexArray(primVertexArray);
  gl.bindBuffer(gl.ARRAY_BUFFER, primVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENTS_ARRAY_BUFFER, primIndexBuffer);

  /*
  const numOfVercices = 12;
  const numOfUniformFloats = 12;
  let ubuffer = gl.createBuffer;
  let blk_loc;      

  Prim();
  gl.drawArrays(gl.TRIANGLES, numOfVercices, gl.UNSIGNED_SHORT, 0);

  gl.bindBuffer(gl.UNIFORM_BUFFER, ubuffer);
  gl.bufferData(gl.UNIFORM_BUFFER, numOfUniformFloats * 4, gl.STATIC_DRAW);  

  blk_loc = gl.getUniformBlockIndex(program, ubuffer);
  gl.uniformBlockBinding(program, blk_loc, /*???*/ //numOfUniformFloats);
//gl.bindBufferBase(gl.UNIFORM_BUTTER, /*???*/ numOfUniformFloats, ubuffer); 

}
/**/

function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
      alert("fail");

  return shader;
}

import { _vec3, vec } from "./mth/mth_vec.js";
import { _camera, cam, camRot } from "./mth/mth_camera.js";
import { icosahedronInit, octahedronInit, cubeInit, tetrahedronInit,
         icosahedronDraw, octahedronDraw, cubeDraw, tetrahedronDraw } from "./platon.js";
import { vertSet, primCreate, primDraw } from "./prim.js";

export let camera;

export function initGL() {
  const canvas = document.getElementById("glCanvas");
  const gl = canvas.getContext("webgl2");

  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  let vs, fs;

  const Loc = vec(8, 8, 8);
  const At = vec(0, 0, 0);
  const Up1 = vec(0, 1, 0);
  let MatrVP;

  camera = cam(0.1, 0.1, 300, Loc, At, Up1, 47, 47);

  const ft1 = fetch("/shader/vert.glsl").then((res) => res.text()).then((data) => {
    vs = data;
  });
  const ft2 = fetch("/shader/frag.glsl").then((res) => res.text()).then((data) => {
    fs = data;
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

  const allData = Promise.all([ft1, ft2]);
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

    const pos = [-1, -1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0];
    const norm = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    let vertex = vertSet(pos, norm);
    const beginTime = Date.now();

    let prim = primCreate(gl, gl.TRIANGLE_STRIP, vertex, null);

//    const v = vec(1, 1, 0);
//    let massiv = icosahedronInit();
//    let massiv = octahedronInit(1, v);
//    let massiv = cubeInit(1, v);
//    let massiv = tetrahedronInit(2, v);

    const draw = () => {
//      icosahedronDraw(gl, massiv);
//      octahedronDraw(gl, massiv);
//      cubeDraw(gl, massiv);
//      tetrahedronDraw(gl, massiv);

      primDraw(gl, prim);

      gl.useProgram(program);

      const timeFromStart = Date.now() - beginTime;
      gl.uniform1f(uniformTime, (timeFromStart) / 1000);
      MatrVP = camera.MatrVP;
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