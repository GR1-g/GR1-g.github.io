import { _vec3, D2R, vec } from "./mth_vec.js";

export class _matr {
    constructor(A00, A01, A02, A03,
                A10, A11, A12, A13,
                A20, A21, A22, A23,
                A30, A31, A32, A33)
    {
      this.A = [[A00, A01, A02, A03],
                [A10, A11, A12, A13],
                [A20, A21, A22, A23],
                [A30, A31, A32, A33]];
    }

    mulMatr = (M) => {
      let m = new _matr(this.A[0][0] * M.A[0][0] + this.A[0][1] * M.A[1][0] + this.A[0][2] * M.A[2][0] + this.A[0][3] * M.A[3][0],
                        this.A[0][0] * M.A[0][1] + this.A[0][1] * M.A[1][1] + this.A[0][2] * M.A[2][1] + this.A[0][3] * M.A[3][1],
                        this.A[0][0] * M.A[0][2] + this.A[0][1] * M.A[1][2] + this.A[0][2] * M.A[2][2] + this.A[0][3] * M.A[3][2],
                        this.A[0][0] * M.A[0][3] + this.A[0][1] * M.A[1][3] + this.A[0][2] * M.A[2][3] + this.A[0][3] * M.A[3][3],
                        this.A[1][0] * M.A[0][0] + this.A[1][1] * M.A[1][0] + this.A[1][2] * M.A[2][0] + this.A[1][3] * M.A[3][0],
                        this.A[1][0] * M.A[0][1] + this.A[1][1] * M.A[1][1] + this.A[1][2] * M.A[2][1] + this.A[1][3] * M.A[3][1],
                        this.A[1][0] * M.A[0][2] + this.A[1][1] * M.A[1][2] + this.A[1][2] * M.A[2][2] + this.A[1][3] * M.A[3][2],
                        this.A[1][0] * M.A[0][3] + this.A[1][1] * M.A[1][3] + this.A[1][2] * M.A[2][3] + this.A[1][3] * M.A[3][3],
                        this.A[2][0] * M.A[0][0] + this.A[2][1] * M.A[1][0] + this.A[2][2] * M.A[2][0] + this.A[2][3] * M.A[3][0],
                        this.A[2][0] * M.A[0][1] + this.A[2][1] * M.A[1][1] + this.A[2][2] * M.A[2][1] + this.A[2][3] * M.A[3][1],
                        this.A[2][0] * M.A[0][2] + this.A[2][1] * M.A[1][2] + this.A[2][2] * M.A[2][2] + this.A[2][3] * M.A[3][2],
                        this.A[2][0] * M.A[0][3] + this.A[2][1] * M.A[1][3] + this.A[2][2] * M.A[2][3] + this.A[2][3] * M.A[3][3],
                        this.A[3][0] * M.A[0][0] + this.A[3][1] * M.A[1][0] + this.A[3][2] * M.A[2][0] + this.A[3][3] * M.A[3][0],
                        this.A[3][0] * M.A[0][1] + this.A[3][1] * M.A[1][1] + this.A[3][2] * M.A[2][1] + this.A[3][3] * M.A[3][1],
                        this.A[3][0] * M.A[0][2] + this.A[3][1] * M.A[1][2] + this.A[3][2] * M.A[2][2] + this.A[3][3] * M.A[3][2],
                        this.A[3][0] * M.A[0][3] + this.A[3][1] * M.A[1][3] + this.A[3][2] * M.A[2][3] + this.A[3][3] * M.A[3][3]);
      return m;
    }
 }
  
export function matrFrustum( Left, Right, Bottom, Top, Near, Far ) {
  let mf = new _matr(2 * Near / (Right - Left), 0, 0, 0,
                     0, 2 * Near / (Top - Bottom), 0, 0,
                     (Right + Left) / (Right - Left), (Top + Bottom) / (Top - Bottom), -(Far + Near) / (Far - Near), -1,
                     0, 0, -(2 * Near * Far) / (Far - Near), 0);
  return mf;
}
  
export function matrView( Loc, At, Up1 ) {
  let Dir = At.sub(Loc).norm();
  let Right = Dir.crs(Up1).norm();
  let Up = Right.crs(Dir);

  let mv = new _matr(Right.x, Up.x, -Dir.x, 0,
                     Right.y, Up.y, -Dir.y, 0,
                     Right.z, Up.z, -Dir.z, 0,
                     -Loc.dot(Right), -Loc.dot(Up), Loc.dot(Dir), 1);  
  return mv;         
}

export function matrIdentity() {
  let matr = new _matr(1, 0, 0, 0,
                       0, 1, 0, 0,
                       0, 0, 1, 0,
                       0, 0, 0, 1);
  return matr;
}

export function vecMulMatr( v, matr ) {
  let w = v.x * matr.A[0][3] + v.y * matr.A[1][3] + v.z * matr.A[2][3] + matr.A[3][3];
  let nvec = vec((v.x * matr.A[0][0] + v.y * matr.A[1][0] + v.z * matr.A[2][0] + matr.A[3][0]) / w,
                 (v.x * matr.A[0][1] + v.y * matr.A[1][1] + v.z * matr.A[2][1] + matr.A[3][1]) / w,
                 (v.x * matr.A[0][2] + v.y * matr.A[1][2] + v.z * matr.A[2][2] + matr.A[3][2]) / w);
  return nvec;
}

export function matrRot( angle, vec ) {
  let a = D2R(angle);
  let si = Math.sin(a), co = Math.cos(a);
  let v = vec.norm();

  let mr = new _matr(co + v.x * v.x * (1 - co), v.x * v.y * (1 - co) + v.z * si, v.x * v.z * (1 - co) + v.y * si, 0,
                     v.y * v.x * (1 - co) - v.z * si, co + v.y * v.y * (1 - co), v.y * v.z * (1 - co) + v.x * si, 0,
                     v.z * v.x * (1 - co) + v.y * si, v.z * v.y * (1 - co) - v.x * si, co + v.z * v.z * (1 - co), 0,
                     0, 0, 0, 1);  
  return mr;
}

export function rotateX ( angle ) {
  let a = D2R(angle), co = Math.cos(a), si = Math.sin(a);
  let m = new _matr(1, 0, 0, 0,
                    0, co, si, 0,
                    0, -si, co, 0,
                    0, 0, 0, 1);
  return m;
}

export function rotateY ( angle )  {
  let a = D2R(angle), co = Math.cos(a), si = Math.sin(a);
  let m = new _matr(co, 0, -si, 0,
                    0, 1, 0, 0,
                    si, 0, co, 0,
                    0, 0, 0, 1);
  return m; 
}