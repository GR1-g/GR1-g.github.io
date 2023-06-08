export class _vertex{
  constructor( pos, norm ) {
    this.pos = pos;
    this.norm = norm;
  }
}

export function vertSet( pos, norm ) {
  let vert = new _vertex(pos, norm );
  return vert;
}

export class _prim {
  constructor( gl, type, v, ind ) {
    this.IBuf = null;
    this.VBuf = null;
    if (v !== null) {
      this.VBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.VBuf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(v.pos), gl.STATIC_DRAW);
      gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
//      gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

      gl.enableVertexAttribArray(0);
//      gl.enableVertexAttribArray(1);
    }

    if (ind !== null) {
      this.IBuf = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IBuf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ind), gl.STATIC_DRAW);
      this.num = ind.length;
    }
    else {
      this.num = v.pos.length / 3;
    }

    this.type = type;
  }
}

export function primCreate( gl, type, v, ind ) {
  let pr = new _prim(gl, type, v, ind );
  return pr;
}

export function primDraw( gl, pr ) {
  if (pr.IBuf !== null) {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pr.IBuf);
    gl.drawElements(pr.type, pr.num, gl.UNSIGNED_SHORT  , 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pr.IBuf);
  }
  else {
    gl.drawArrays(pr.type, 0, pr.num);
  }
}