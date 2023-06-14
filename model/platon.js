import { _vec3, vec, addvec, subvec, crsvec } from "./mth/mth_vec.js";
import { primCreate, primDraw } from "./anim/render/prim.js";

function norm3( pos, ind ) {
  let norm = [], normals = [], v = [];

  for (let i = 0; i < pos.length / 3; i++) {
    norm.push(vec(0, 0, 0));
    v.push(vec(pos[3 * i], pos[3 * i + 1], pos[3 * i + 2]));
  }

  for (let i = 0; i < ind.length; i += 3)
  {
    let p0 = v[ind[i]], p1 = v[ind[i + 1]], p2 = v[ind[i + 2]];
    let n = crsvec(subvec(p1, p0), subvec(p2, p0)).norm();

    norm[ind[i]] = addvec(norm[ind[i]], n);
    norm[ind[i + 1]] = addvec(norm[ind[i + 1]], n);
    norm[ind[i + 2]] = addvec(norm[ind[i + 2]], n);
  }

  for (let i = 0; i < norm.length; i++)
  {
    norm[i] = norm[i].norm();
    normals.push(norm[i].x);
    normals.push(norm[i].y);
    normals.push(norm[i].z);
  }
  return normals;
}

/***
 * CUBE
 ***/

export function cubeInit( size, v ) {
  let x = v.x, y = v.y, z = v.z;
  let s = size / 2;

  let v1 = [s + x, s + y, s + z], v2 = [s + x, s + y, -s + z], v3 = [s + x, -s + y, s + z], v4 = [-s + x, s + y, s + z],
      v5 = [s + x, -s + y, -s + z], v6 = [-s + x, -s + y, s + z], v7 = [-s + x, s + y, -s + z], v8 = [-s + x, -s + y, -s + z];

  let vert = [];
  let pos = [...v1, ...v2, ...v3, ...v4, ...v5, ...v6, ...v7, ...v8];

  let ind = [
    3, 5, 2, 
    0, 3, 2, 
    1, 0, 2, 
    1, 2, 4,
    6, 3, 1, 
    1, 3, 0, 
    6, 1, 7,
    1, 4, 7,
    2, 5, 7, 
    2, 7, 4, 
    3, 6, 7, 
    3, 7, 5
  ];

  let normals = norm3(pos, ind);

  for (let i = 0; i < 12; i++) {
    let ind1 = ind[3 * i], ind2 = ind[3 * i + 1], ind3 = ind[3 * i + 2];
    let index = new Float32Array([ind1, ind2, ind3]);
    let norm = new Float32Array([normals[3 * ind1], normals[3 * ind1 + 1], normals[3 * ind1 + 2],
                                 normals[3 * ind2], normals[3 * ind2 + 1], normals[3 * ind2 + 2],
                                 normals[3 * ind3], normals[3 * ind3 + 1], normals[3 * ind3 + 2]]);
    vert.push({pos: pos, norm: norm, ind: index});
  }

  return vert;    
}

export function cubeDraw( gl, vertex, posLoc, normLoc ) {
  let prim;

  for (let i = 0; i < 12; i++) {
    prim = primCreate(gl, gl.TRIANGLES, vertex[i], vertex[i].ind, posLoc, normLoc);
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

  let vert = [];
  let pos = [...v1, ...v2, ...v3, ...v4];
  let ind = [3, 0, 2,
             3, 2, 1,
             3, 1, 0,
             0, 1, 2];

  let normals = norm3(pos, ind);;

  for (let i = 0; i < 4; i++) {
    let ind1 = ind[3 * i], ind2 = ind[3 * i + 1], ind3 = ind[3 * i + 2];
    let index = new Float32Array([ind1, ind2, ind3]);
    let norm = new Float32Array([normals[3 * ind1], normals[3 * ind1 + 1], normals[3 * ind1 + 2],
                                 normals[3 * ind2], normals[3 * ind2 + 1], normals[3 * ind2 + 2],
                                 normals[3 * ind3], normals[3 * ind3 + 1], normals[3 * ind3 + 2]]);
    vert.push({pos: pos, norm: norm, ind: index});
  }

  return vert;
}

export function tetrahedronDraw( gl, vertex, posLoc, normLoc ) {
  let prim;

  for (let i = 0; i < 4; i++) {
    prim = primCreate(gl, gl.TRIANGLES, vertex[i], vertex[i].ind, posLoc, normLoc);
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

  let vert = [];
  let pos = [...v1, ...v2, ...v3, ...v4, ...v5, ...v6];
  let ind = [4, 1, 3,
             4, 2, 0,
             4, 0, 1,
             2, 3, 5,
             1, 0, 5,
             4, 3, 2,
             3, 1, 5,
             0, 2, 5]
  let normals = norm3(pos, ind);;

  for (let i = 0; i < 8; i++) {
    let ind1 = ind[3 * i], ind2 = ind[3 * i + 1], ind3 = ind[3 * i + 2];
    let index = new Float32Array([ind1, ind2, ind3]);
    let norm = new Float32Array([normals[3 * ind1], normals[3 * ind1 + 1], normals[3 * ind1 + 2],
                                 normals[3 * ind2], normals[3 * ind2 + 1], normals[3 * ind2 + 2],
                                 normals[3 * ind3], normals[3 * ind3 + 1], normals[3 * ind3 + 2]]);
    vert.push({pos: pos, norm: norm, ind: index});
  }

  return vert;    
}

export function octahedronDraw( gl, vertex, posLoc, normLoc ) {
  let prim;

  for (let i = 0; i < 8; i++) {
    prim = primCreate(gl, gl.TRIANGLES, vertex[i], vertex[i].ind, posLoc, normLoc);
    primDraw(gl, prim);
  }
}

/***
 * ICOSAHEDRON
 ***/

export function icosahedronInit( v ) {
  let x = v.x, y = v.y, z = v.z;
  let f = 1, p = 1 / 1.618;
  let v1 = [x, p + y, f + z], v2 = [x, -p + y, f + z], v3 = [-f + x, y, p + z], v4 = [f + x, y, p + z],
      v5 = [p + x, f + y, z], v6 =[-p + x, f + y, z], v7 = [p + x, -f + y, z], v8 = [-p + x, -f + y, z],
      v9 = [x, p + y, -f + z], v10 = [x, -p + y, -f + z], v11 = [-f + x, y, -p + z], v12 = [f + x, y, -p + z];

  let vert = [];
  let pos = [...v1, ...v2, ...v3, ...v4, ...v5, ...v6,
             ...v7, ...v8, ...v9, ...v10, ...v11, ...v12];
  let ind = [0, 2, 1, 0, 1, 3,
             0, 5, 2, 0, 4, 5,
             0, 3, 4, 1, 2, 6,
             1, 7, 6, 3, 1, 6,
             2, 5, 10, 2, 10, 7,
             11, 4, 3, 11, 3, 6,
             8, 9, 10, 8, 11, 9,
             5, 4, 8, 5, 8, 10,
             4, 11, 8, 9, 6, 7,
             10, 9, 7, 9, 11, 6];
  let normals = norm3(pos, ind);

  for (let i = 0; i < 20; i++) {
    let ind1 = ind[3 * i], ind2 = ind[3 * i + 1], ind3 = ind[3 * i + 2];
    let index = new Float32Array([ind1, ind2, ind3]);
    let norm = new Float32Array([normals[3 * ind1], normals[3 * ind1 + 1], normals[3 * ind1 + 2],
                                 normals[3 * ind2], normals[3 * ind2 + 1], normals[3 * ind2 + 2],
                                 normals[3 * ind3], normals[3 * ind3 + 1], normals[3 * ind3 + 2]]);
    vert.push({pos: pos, norm: norm, ind: index});
  }

  return vert;
}

export function icosahedronDraw( gl, vertex, posLoc, normLoc ) {
  let prim;

  for (let i = 0; i < 20; i++) {
    prim = primCreate(gl, gl.TRIANGLES, vertex[i], vertex[i].ind, posLoc, normLoc);
    primDraw(gl, prim);
  }      
}