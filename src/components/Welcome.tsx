import React, { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface WelcomeProps {
  onEnter: () => void;
}

export const Welcome: React.FC<WelcomeProps> = ({ onEnter }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) return;

    let animationFrameId: number;

    const vs = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;
      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fs = `
      precision highp float;
      varying vec2 v_texCoord;
      uniform float u_time;
      uniform vec2 u_resolution;

      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                 -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
            + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
            dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 a0 = x - floor(x + 0.5);
        vec3 g = a0 * vec3(x0.x,x12.x,x12.z) + h * vec3(x0.y,x12.y,x12.w);
        vec3 l = 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 m1 = 1.0 - m;
        vec3 v1 = m * g * l;
        return 130.0 * dot(m1*m1*m1, v1);
      }

      void main() {
        vec2 uv = v_texCoord;
        vec3 background = vec3(0.039, 0.027, 0.063); 
        vec3 violet = vec3(0.541, 0.247, 0.988);    
        vec3 magenta = vec3(0.820, 0.247, 0.839);   
        vec3 blue = vec3(0.290, 0.373, 0.910);      

        float t = u_time * 0.4;
        float n1 = snoise(uv * 3.0 + vec2(t * 0.2, t * -0.5)) * 0.5 + 0.5;
        float n2 = snoise(uv * 5.0 + vec2(t * -0.3, t * 0.4)) * 0.5 + 0.5;
        float n3 = snoise(uv * 2.0 + vec2(sin(t * 0.5), cos(t * 0.3))) * 0.5 + 0.5;

        vec3 auraColor = mix(violet, magenta, n1);
        auraColor = mix(auraColor, blue, n2 * 0.3);

        float flow = pow(1.0 - uv.y, 2.0) * n3;
        vec3 finalColor = mix(background, auraColor, flow * 0.6);
        finalColor += auraColor * pow(n1 * n2, 3.0) * 0.4;

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    const compileShader = (type: number, src: string) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s));
        gl.deleteShader(s);
        return null;
      }
      return s;
    };

    const program = gl.createProgram();
    const vertexShader = compileShader(gl.VERTEX_SHADER, vs);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fs);
    if (!program || !vertexShader || !fragmentShader) return;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const pos = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, 'u_time');
    const uRes = gl.getUniformLocation(program, 'u_resolution');

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    const render = (time: number) => {
      if (uTime) gl.uniform1f(uTime, time * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <main className="relative h-screen w-screen flex flex-col justify-between items-center overflow-hidden bg-black text-white font-sans">
      {/* Background WebGL Shader */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 w-full h-full block" />

      {/* Animated Character Silhouette */}
      <div className="absolute inset-0 z-10 pointer-events-none flex justify-center items-center p-4">
        <motion.img
          alt="HunterFit Character"
          className="w-auto h-[80vh] max-h-full max-w-full object-contain mix-blend-screen"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjw81qtWj9hSHJDygPiPWDAg8geTfN5Czda2vkJYM9QJXnBQZdmvTsnVXoe8vqJplqB-OS_jqc1IvUpLbK8w2a8-ROxQg8e2P-NKimmzO4VLZmfG2fdfJQuhNYIv_rz_DmMOhriya9SfuOBAkUmHZyURTlh69GvREik1iVLMYOVrt19Pdl7kd9CY_7WMQ6UDU9p2eUSEkwIZPhFvvjCu3j6PU5-UmZh3-3pO0kinwRp9FKRKmxH1iH1T1bVRyzEbojsg"
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.03, 1],
            opacity: [0.65, 0.85, 0.65]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90"></div>
      </div>

      {/* Header logo */}
      <header className="relative z-20 w-full pt-12 px-6 flex justify-center items-start pointer-events-none">
        <h1 className="text-2.5xl md:text-3xl font-display font-light tracking-widest text-[#d4bbff] uppercase opacity-90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          HunterFit
        </h1>
      </header>

      {/* Footer Enter CTA */}
      <footer className="relative z-20 w-full pb-16 px-8 flex justify-center md:justify-end items-end">
        <button
          onClick={onEnter}
          className="glow-button btn-technical font-display text-sm px-10 py-4 cursor-pointer"
          style={{
            animation: 'subtleGlow 3s infinite alternate ease-in-out',
            border: '1px solid rgba(138, 63, 252, 0.6)',
            boxShadow: '0 0 15px rgba(138, 63, 252, 0.4)',
            background: 'rgba(21, 18, 27, 0.7)',
            backdropFilter: 'blur(8px)',
            borderRadius: '4px'
          }}
        >
          <span className="btn-technical-inner"></span>
          <span className="relative z-10 flex items-center justify-center gap-2 tracking-widest">
            Enter System
            <ArrowRight className="w-4 h-4" />
          </span>
        </button>
      </footer>
    </main>
  );
};
