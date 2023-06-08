import { _vec3 } from "./mth/mth_vec.js";
import { primCreate, primDraw } from "./prim.js";

/***
 * CUBE
 ***/

export function cubeInit( size, v ) {
  let x = v.x, y = v.y, z = v.z;
  let s = size / 2;

  let v1 = [s + x, s + y, s + z], v2 = [s + x, s + y, -s + z], v3 = [s + x, -s + y, s + z], v4 = [-s + x, s + y, s + z],
      v5 = [s + x, -s + y, -s + z], v6 = [-s + x, -s + y, s + z], v7 = [-s + x, s + y, -s + z], v8 = [-s + x, -s + y, -s + z];

  let massiv = [];

  massiv.push([...v6, ...v4, ...v3, ...v1]);
  massiv.push([...v8, ...v7, ...v5, ...v2]);
  massiv.push([...v8, ...v7, ...v6, ...v4]);
  massiv.push([...v5, ...v2, ...v3, ...v1]);
  massiv.push([...v4, ...v7, ...v1, ...v2]);
  massiv.push([...v6, ...v8, ...v3, ...v5]);
  return massiv;    
}

export function cubeDraw( gl, massiv ) {
  let prim;

  for (let i = 0; i < 6; i++) {
    prim = primCreate(gl, gl.TRIANGLE_STRIP, massiv[i], null);
    primDraw(gl, prim);
  }    
}

/***
 * TETRAHEDRON
 ***/

export function tetrahedronInit( size, v ) {
  let x = v.x, y = v.y, z = v.z;
  let R = size * Math.sqrt(3 / 8);
  let r = size * Math.sqrt(6) / 12;
  let s = size / 2;

  let v1 = [-s + x, -r + y, r + z], v2 = [x, -r + y, -R + z],
      v3 = [s + x, -r + y,  r + z], v4 = [x, R + y, z];

  let massiv = [];

  massiv.push([...v1, ...v2, ...v3]);
  massiv.push([...v1, ...v2, ...v4]);
  massiv.push([...v1, ...v3, ...v4]); 
  massiv.push([...v2, ...v3, ...v4]);
  return massiv;
}

export function tetrahedronDraw( gl, massiv ) {
  let prim;

  for (let i = 0; i < 4; i++) {
    prim = primCreate(gl, gl.TRIANGLES, massiv[i], null);
    primDraw(gl, prim);
  }      
}

/***
 * OCTAHEDRON
 ***/

export function octahedronInit( size, v ) {
  let x = v.x, y = v.y, z = v.z;
  let r = size / 6 * Math.sqrt(6);
  let R =  size / 2 * Math.sqrt(2);

  let v1 = [-r + x, y, -r + z], v2 = [-r + x, y, r + z], v3 = [r + x, y, -r + z],
      v4 = [r + x, y, r + z], v5 = [x, R + y, z], v6 = [x, -R + y, z];

  let massiv = [];

  massiv.push([...v1, ...v5, ...v2]);
  massiv.push([...v1, ...v5, ...v3]);
  massiv.push([...v3, ...v5, ...v4]);
  massiv.push([...v2, ...v5, ...v4]);
  massiv.push([...v1, ...v6, ...v2]);
  massiv.push([...v1, ...v6, ...v3]);
  massiv.push([...v3, ...v6, ...v4]);
  massiv.push([...v2, ...v6, ...v4]);
  return massiv;    
}

export function octahedronDraw( gl, massiv ) {
  let prim;

  for (let i = 0; i < 8; i++) {
    prim = primCreate(gl, gl.TRIANGLES, massiv[i], null);
    primDraw(gl, prim);
  }
}

/***
 * ICOSAHEDRON
 ***/

export function icosahedronInit() {
  let f = 1.618;
  let massiv = [];
  let v1 = [0, 1, f], v2 = [0, -1, f], v3 = [-f, 0, 1], v4 = [f, 0, 1], v5 = [1, f, 0], v6 =[-1, f, 0],
      v7 = [1, -f, 0], v8 = [-1, -f, 0], v9 = [0, 1, -f], v10 = [0, -1, -f], v11 = [-f, 0, -1], v12 = [f, 0, -1];
        
  massiv.push([...v1, ...v2, ...v3]);
  massiv.push([...v1, ...v2, ...v4]);
  massiv.push([...v1, ...v3, ...v6]);
  massiv.push([...v1, ...v6, ...v5]);    
  massiv.push([...v1, ...v5, ...v4]);
  massiv.push([...v2, ...v3, ...v7]);
  massiv.push([...v2, ...v8, ...v7]);
  massiv.push([...v2, ...v7, ...v4]);
  massiv.push([...v6, ...v3, ...v11]);
  massiv.push([...v8, ...v3, ...v11]);
  massiv.push([...v5, ...v4, ...v12]);
  massiv.push([...v7, ...v4, ...v12]);
  massiv.push([...v9, ...v10, ...v11]);
  massiv.push([...v9, ...v10, ...v12]);
  massiv.push([...v9, ...v6, ...v5]);
  massiv.push([...v9, ...v6, ...v11]);
  massiv.push([...v9, ...v5, ...v4]);
  massiv.push([...v10, ...v8, ...v7]);
  massiv.push([...v10, ...v8, ...v11]);
  massiv.push([...v10,  ...v7, ...v12]);
  return massiv;
}

export function icosahedronDraw( gl, massiv ) {
  let prim;

  for (let i = 0; i < 20; i++) {
    prim = primCreate(gl, gl.TRIANGLES, massiv[i], null);
    primDraw(gl, prim);
  }      
}