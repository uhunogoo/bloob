uniform float u_speed;
uniform vec3 u_color;
uniform float u_color_intense;
uniform vec3 u_color_2;
uniform float u_color_2_intense;
uniform float u_color_2_fill;
uniform float u_pattern_size;

varying vec3 v_height;
varying vec2 vUv;
varying float v_noiseMix;
varying float v_noise;
varying float v_noiseSmall;

vec3 hsb2rgb( in vec3 c ){
    vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0,4.0,2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0 );
    rgb = rgb * rgb * ( 3.0 - 2.0 * rgb);
    return c.z * mix(vec3(1.0), rgb, c.y);
}

float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    float pattern = (sin(u_speed + v_height.x / 10.0) + 1.0) / 2.0;
    float clampedNoise = v_noiseMix;
    
    clampedNoise = clamp(clampedNoise, 0.0, 1.0);
    
    float textureMap = mix(0.0, length(vUv - 0.5) + clampedNoise, clampedNoise); 
    vec3 mixColor = mix(
    u_color  * 2.0  * (1.0 - v_noise) * u_color_intense, 
    u_color_2 * (1.0 - v_noise) * u_color_2_intense,
    clampedNoise
    );
    mixColor = clamp( mixColor, vec3(0.0), vec3(1.0) );
    mixColor += u_color * (clampedNoise * v_noise) * u_color_2_fill * (1.0 - mixColor.r);
    gl_FragColor = vec4( mixColor, 1.0);
    
    pattern = pow(v_noiseSmall * 0.4, 5.0 * u_pattern_size) * 3.0;
    // pattern = (abs(pattern)) * pattern; 
    pattern = clamp(pattern, 0.0, 1.0);
    
    pattern = smoothstep(-0.12, 0.97, v_noise * pattern);
    pattern = clamp(pattern, 0.0, 1.0);

    pattern = sin(pattern * 0.5 * v_noise);
    
    
    vec3 finalColor = mix(
    u_color * 2.0 * ( pattern) * u_color_intense,
    u_color_2 * 2.0 * (pattern) * u_color_2_intense,
    (1.0 - pattern)
    );
    
    finalColor = mixColor + finalColor;
    finalColor = clamp(finalColor, 0.0, 1.0);
    
    
    gl_FragColor = vec4( finalColor - pattern, 1.0);
}