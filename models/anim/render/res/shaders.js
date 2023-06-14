export function loadShader(gl, type, source) {
  const shader = gl.createShader(type);
  
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    alert("fail");
  
  return shader;
}