export class _vec3 {
    constructor(x, y, z) {
  
      this.x = x;
      this.y = y;
      this.z = z;
    }

    add = (vec) => {
      let nvec = new _vec3(0, 0, 0);

      nvec.x = this.x + vec.x;
      nvec.y = this.Y + vec.y;
      nvec.z = this.Z + vec.z;
      return nvec;
    }
    
    sub = (vec) => {
      let nvec = new _vec3(0, 0, 0);
  
      nvec.x = this.x - vec.x;
      nvec.y = this.y - vec.y;
      nvec.z = this.z - vec.z;
      return nvec;
    }
    
    mul = (f) => {
      let nvec = new _vec3(0, 0, 0);

      nvec.x = this.x * f;
      nvec.y = this.y * f;
      nvec.z = this.z * f;
      return nvec;
    }

    crs = (vec) => {
      let nvec = new _vec3(0, 0, 0);
  
      nvec.x = this.y * vec.z - this.z * vec.y;
      nvec.y = this.z * vec.x - this.x * vec.z;
      nvec.z = this.x * vec.y - this.y * vec.x;
      return nvec;
    }
  
    div = (num) => {
      let nvec = new _vec3(0, 0, 0);
      
      if (num === 0)
        return nvec;

      nvec.x = this.x / num;
      nvec.y = this.y / num;
      nvec.z = this.z / num;
      return nvec;
    }
  
    dot = (vec) => {
      let f;
  
      return f = this.x * vec.x + this.y * vec.y + this.z * vec.z;
    }
    
    norm = () => {
      let nvec = new _vec3(0, 0, 0);
      let f = this.dot(this);
  
      return nvec = this.div(Math.sqrt(f));
    }

    len = () => {
      let f = Math.sqrt(this.dot(this));

      return f;
    }

    pointTrans = (m) => {
      let nvec = new _vec3(0, 0, 0);

      nvec.x = this.x * m.A[0][0] + this.y * m.A[1][0] + this.z * m.A[2][0];
      nvec.y = this.x * m.A[0][1] + this.y * m.A[1][1] + this.z * m.A[2][1];
      nvec.z = this.x * m.A[0][2] + this.y * m.A[1][2] + this.z * m.A[2][2];
      return nvec;
    }
  }

  export function D2R( num ) {
    let f;

    return f = num * (Math.PI / 180.0);
  }

  export function R2D( num ) {
    let f;

    return f = num * (180.0 / Math.PI);
  }

  export function vec(x, y, z) {
    let vector = new _vec3(x, y, z);
    return vector;
  }

  export function addvec( vec1, vec2 ) {
    let nvec = vec(0, 0, 0);

    nvec.x = vec1.x + vec2.x;
    nvec.y = vec1.y + vec2.y;
    nvec.z = vec1.z + vec2.z;
    return nvec;
  }

  export function subvec( vec1, vec2 ) {
    let nvec = new _vec3(0, 0, 0);
  
    nvec.x = vec1.x - vec2.x;
    nvec.y = vec1.y - vec2.y;
    nvec.z = vec1.z - vec2.z;
    return nvec;
  }

  export function crsvec( vec1, vec2 ) {
    let nvec = new _vec3(0, 0, 0);
  
    nvec.x = vec1.y * vec2.z - vec1.z * vec2.y;
    nvec.y = vec1.z * vec2.x - vec1.x * vec2.z;
    nvec.z = vec1.x * vec2.y - vec1.y * vec2.x;
    return nvec;
  }