precision mediump float;

attribute vec3 vertexPosition;
attribute vec2 vertextTextureCoord;

varying vec2 fragTexCoord;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

void main() {
  fragTexCoord = vertextTextureCoord;
  gl_Position = mProj * mView * mWorld * vec4(vertexPosition, 1.0);
}
