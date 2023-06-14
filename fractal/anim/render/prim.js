import { vec, crsvec, subvec, addvec} from "../../mth/mth_vec.js";
import { matrIdentity } from "../../mth/mth_matr.js";

export class _prim {
  constructor( gl, type, vert, ind, posLoc, normLoc ) {
    this.IBuf = null;
    this.VBuf = null;
    this.NBuf = null;
    if (vert !== null) {
      this.VBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.VBuf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vert.pos), gl.STATIC_DRAW);
      gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 12, 0);
      gl.enableVertexAttribArray(posLoc);      
      this.NBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.NBuf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vert.norm), gl.STATIC_DRAW);
      gl.vertexAttribPointer(normLoc, 3, gl.FLOAT, false, 12, 0);
      gl.enableVertexAttribArray(normLoc);
    }

    if (ind !== null) {
      this.IBuf = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IBuf);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(ind), gl.STATIC_DRAW);
      this.num = ind.length;
    }
    else {
      this.num = vert.pos.length / 3;
    }

    this.trans = matrIdentity();
    this.type = type;
  }
}

export function primCreate( gl, type, vert, ind, posLoc, normLoc ) {
  let pr = new _prim(gl, type, vert, ind, posLoc, normLoc );
  return pr;
}

export function primDraw( gl, prim ) {    
  if (prim.IBuf !== null) {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, prim.IBuf);
    gl.drawElements(prim.type, prim.num, gl.UNSIGNED_SHORT, 0);
  }
  else {
    gl.drawArrays(prim.type, 0, prim.num);
  }
}

export function primLoad( gl, text, posLoc, normLoc ) {
  let nv = 0, nf = 0, ind = [], vert = [],
      pos = [], pos2 = [], norm = [], norm2 = [];
  let prim;

  nv = nf = 0;
 
  for (let i = 0; i < text.length; i++) 
  {
    let massiv = text[i].split(" ");
    if (massiv[0] === 'v') 
    {
      pos[nv] = vec(parseFloat(massiv[1]) / 4, parseFloat(massiv[2]) / 4, parseFloat(massiv[3]) / 4);
      norm[nv] = vec(0, 0, 0);
      nv++;
    }
    else if (massiv[0] === 'f') 
    {
      let n = 0, c = 0, c0 = 0, c1 = 0;
      for (let j = 0; j < 3; j++)
      {
        let num = massiv[j + 1].split("//");
        c = num[0];

        if (c < 0)
        {
          c = nv + c;
        }
        else
        {
          c--;
        }

        if (n === 0)
        {
          c0 = c;
        }
        else if (n === 1) 
        {
          c1 = c;
        }
        else 
        {
          ind[nf++] = c0;
          ind[nf++] = c1;
          ind[nf++] = c;
          c1 = c;
        }
        n++;
      }
    }
  }

  for (let i = 0; i < nf; i += 3)
  {
    let p0 = pos[ind[i]], p1 = pos[ind[i + 1]], p2 = pos[ind[i + 2]];
    let n = crsvec(subvec(p1, p0), subvec(p2, p0)).norm();

    norm[ind[i]] = addvec(norm[ind[i]], n);
    norm[ind[i + 1]] = addvec(norm[ind[i + 1]], n);
    norm[ind[i + 2]] = addvec(norm[ind[i + 2]], n);
  }

  for (let i = 0; i < nv; i++) {
    norm[i] = norm[i].norm();
    norm2.push(norm[i].x);
    norm2.push(norm[i].y);
    norm2.push(norm[i].z);
    pos2.push(pos[i].x);
    pos2.push(pos[i].y);
    pos2.push(pos[i].z);
  }

  vert = {
    pos: pos2,
    norm: norm2
  };
 
  prim = primCreate(gl, gl.TRIANGLES, vert, ind, posLoc, normLoc);
  return prim;
}