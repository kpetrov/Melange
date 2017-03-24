out vec4 fragColor;

uniform float dt;
uniform float curlAmt;

int VEL = 0;

const float smallf = 0.0000001f;
vec2 N = uTD2DInfos[VEL].res.zw;

float curl(int i, int j, int sz = 1)
{
  // ivec2 sz = ivec2(5);
  return -0.5 * ( texelFetch(sTD2DInputs[VEL], ivec2(i+sz, j), 0).y - texelFetch(sTD2DInputs[VEL], ivec2(i-sz, j), 0).y +
                  texelFetch(sTD2DInputs[VEL], ivec2(i, j-sz), 0).x - texelFetch(sTD2DInputs[VEL], ivec2(i, j+sz), 0).x) * N.x;
}


void main()
{
  ivec2 TC = ivec2(gl_FragCoord.xy);

  // Find derivative of the magnitude (n = del |w|)
  // float dw_dy = ( curl(TC.x+sz, TC.y) - curl(TC.x-sz, TC.y) ) * 0.5f;
  // float dw_dx = ( curl(TC.x, TC.y+sz) - curl(TC.x, TC.y-sz) ) * 0.5f;

  float dw_dy = 0.;
  float dw_dx = 0.;

  int size[3] = int[](1, 5, 10);
  for (int i = 0; i < 3; i++) {
    int sz = size[i];
    dw_dx += ( curl(TC.x+sz, TC.y) - curl(TC.x-sz, TC.y) ) * 0.5f;
    dw_dy += ( curl(TC.x, TC.y+sz) - curl(TC.x, TC.y-sz) ) * 0.5f;
  }
  dw_dy /= 3.;
  dw_dx /= 3.;
  // Calculate vector length. (|n|)
  float mag = sqrt(dw_dx * dw_dx + dw_dy * dw_dy);

  // checks for divide by zero
  float cx = curl(TC.x, TC.y);
  float fx = mag > smallf ? curlAmt * dt * dw_dx * cx/(mag*N.y) : 0.;
  float fy = mag > smallf ? curlAmt * dt * dw_dy * cx/(mag*N.x) : 0.;

  // N x w
  vec4 V = texelFetch(sTD2DInputs[VEL], TC, 0);

  V.x += fx;
  V.y -= fy;

  fragColor = V;
}