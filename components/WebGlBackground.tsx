"use client";

import { useEffect, useRef } from "react";

/**
 * Komponent WebGlBackground renderuje elegancki, interaktywny shader tła WebGL.
 * Zapewnia:
 * 1. Płynne, estetyczne gradienty dynamiczne zależne od motywu (jasny / ciemny).
 * 2. Wyraźną, nowoczesną siatkę proceduralną (grid) z węzłami na przecięciach.
 * 3. Interaktywny reflektor (spotlight) płynnie śledzący kursor myszy.
 * 4. Obsługę prefers-reduced-motion oraz skalowania DPR (Retina / HiDPI).
 */
export default function WebGlBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = (canvas.getContext("webgl2", {
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    }) ||
      canvas.getContext("webgl", {
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      })) as WebGLRenderingContext | null;

    if (!gl) {
      return;
    }

    // Kod shadera wierzchołków (Vertex Shader)
    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = (a_position + 1.0) * 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Kod shadera fragmentów (Fragment Shader)
    const fsSource = `
      precision mediump float;
      varying vec2 v_uv;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_time;
      uniform float u_is_dark;
      uniform float u_dpr;

      void main() {
        vec2 st = gl_FragCoord.xy / u_resolution.xy;
        float aspect = u_resolution.x / u_resolution.y;

        // Współrzędne w pikselach CSS (niezależne od DPR ekranu)
        vec2 pixelCoord = gl_FragCoord.xy / max(u_dpr, 1.0);
        vec2 mousePixel = vec2(u_mouse.x * (u_resolution.x / max(u_dpr, 1.0)), (1.0 - u_mouse.y) * (u_resolution.y / max(u_dpr, 1.0)));

        // 1. Dynamiczny, subtelny gradient tła
        vec3 darkBase = vec3(0.063, 0.075, 0.129); // #101321
        vec3 darkAccent = vec3(0.02, 0.18, 0.16);   // szmaragdowa głębia
        vec3 darkGlow2 = vec3(0.12, 0.04, 0.08);    // ciepły akcent

        // Czysta, świeża, promienna biel w trybie jasnym
        vec3 lightBase = vec3(0.988, 0.992, 1.0);    // #fcfdfe
        vec3 lightAccent = vec3(0.965, 0.98, 1.0);   // bardzo delikatny, jasny błękit
        vec3 lightGlow2 = vec3(0.992, 0.988, 1.0);   // subtelna perłowa poświata

        vec3 baseColor = mix(lightBase, darkBase, u_is_dark);
        vec3 accentColor = mix(lightAccent, darkAccent, u_is_dark);
        vec3 accent2Color = mix(lightGlow2, darkGlow2, u_is_dark);

        float wave1 = sin(st.x * 2.5 + u_time * 0.25) * 0.5 + 0.5;
        float wave2 = cos(st.y * 2.0 - u_time * 0.2) * 0.5 + 0.5;
        vec3 ambientGrad = mix(baseColor, accentColor, wave1 * 0.25);
        ambientGrad = mix(ambientGrad, accent2Color, wave2 * (1.0 - st.x) * 0.15);

        // 2. Interaktywny reflektor (Spotlight) wokół kursora
        float distToMousePx = distance(pixelCoord, mousePixel);
        float spotlightRadiusPx = 360.0;
        float spotlight = smoothstep(spotlightRadiusPx, 0.0, distToMousePx);

        // 3. Wyraźna, proceduralna siatka (Grid) z węzłami przecięcia
        float cellSize = 48.0; // Rozmiar komórki w pikselach logicznych
        vec2 cellOffset = abs(fract(pixelCoord / cellSize - 0.5) - 0.5) * cellSize;
        float distToLine = min(cellOffset.x, cellOffset.y);

        // Wyznaczenie ostrych i czytelnych linii z antyaliasingiem
        float lineWidth = 1.0;
        float lineAlpha = 1.0 - smoothstep(lineWidth * 0.4, lineWidth * 1.4, distToLine);

        // Węzły na przecięciach siatki (subtelne punkty w rogach komórek)
        float distToIntersection = length(cellOffset);
        float dotAlpha = 1.0 - smoothstep(1.2, 2.8, distToIntersection);

        // Widoczność siatki: delikatna i jasna w light mode, wyraźna w dark mode
        float baseLineAlpha = mix(0.06, 0.22, u_is_dark);
        float spotLineBonus = mix(0.12, 0.65, u_is_dark);
        float effectiveLineAlpha = lineAlpha * (baseLineAlpha + spotlight * spotLineBonus);

        float baseDotAlpha = mix(0.08, 0.45, u_is_dark);
        float spotDotBonus = mix(0.15, 0.55, u_is_dark);
        float effectiveDotAlpha = dotAlpha * (baseDotAlpha + spotlight * spotDotBonus);

        // Barwy siatki dostosowane do trybu jasnego i ciemnego
        vec3 lightGridColor = vec3(0.82, 0.86, 0.92); // bardzo subtelna, jasna, elegancka siatka w light mode
        vec3 lightActiveGrid = vec3(0.35, 0.62, 0.88); // delikatny błękit pod reflektorem
        vec3 darkGridColor = vec3(0.18, 0.42, 0.48);  // stonowany morski w dark mode
        vec3 darkActiveGrid = vec3(0.25, 0.95, 0.78);  // świetlisty szmaragd pod reflektorem

        vec3 gridBase = mix(lightGridColor, darkGridColor, u_is_dark);
        vec3 gridActive = mix(lightActiveGrid, darkActiveGrid, u_is_dark);
        vec3 gridColor = mix(gridBase, gridActive, spotlight);

        // Prawidłowe miksowanie z tłem za pomocą mix() (zamiast addytywnego += niszczącego biel)
        vec3 finalColor = mix(ambientGrad, gridColor, clamp(effectiveLineAlpha, 0.0, 1.0));
        finalColor = mix(finalColor, gridActive, clamp(effectiveDotAlpha, 0.0, 1.0));

        // Subtelna poświata reflektora w tle
        vec3 lightGlow = vec3(0.88, 0.94, 1.0);
        vec3 darkGlow = vec3(0.08, 0.50, 0.45);
        vec3 glowColor = mix(lightGlow, darkGlow, u_is_dark);
        float glowStrength = mix(0.05, 0.22, u_is_dark);
        finalColor += glowColor * (spotlight * glowStrength);

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    // Funkcje kompilacji shaderów
    function createShader(type: number, source: string): WebGLShader | null {
      if (!gl) return null;
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Błąd kompilacji shadera WebGL:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = createShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Błąd linkowania programu WebGL:", gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return;
    }

    gl.useProgram(program);

    // Bufor prostokąta pełnoekranowego (Quad)
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0,
      ]),
      gl.STATIC_DRAW
    );

    const aPositionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(aPositionLocation);
    gl.vertexAttribPointer(aPositionLocation, 2, gl.FLOAT, false, 0, 0);

    // Uniforms
    const uResolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const uMouseLocation = gl.getUniformLocation(program, "u_mouse");
    const uTimeLocation = gl.getUniformLocation(program, "u_time");
    const uIsDarkLocation = gl.getUniformLocation(program, "u_is_dark");
    const uDprLocation = gl.getUniformLocation(program, "u_dpr");

    // Zmienne stanu animacji i pozycji kursora z interpolacją (lerp)
    let animationFrameId: number;
    let targetMouseX = 0.5;
    let targetMouseY = 0.35;
    let currentMouseX = 0.5;
    let currentMouseY = 0.35;
    const startTime = performance.now();

    // Śledzenie ruchu kursora
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        targetMouseX = (e.clientX - rect.left) / rect.width;
        targetMouseY = (e.clientY - rect.top) / rect.height;
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Obsługa skalowania rozdzielczości okna
    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const displayWidth = window.innerWidth;
      const displayHeight = window.innerHeight;

      const physicalWidth = Math.floor(displayWidth * dpr);
      const physicalHeight = Math.floor(displayHeight * dpr);

      if (canvas.width !== physicalWidth || canvas.height !== physicalHeight) {
        canvas.width = physicalWidth;
        canvas.height = physicalHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Główna pętla renderowania
    const render = () => {
      // Płynna interpolacja pozycji spotlight
      currentMouseX += (targetMouseX - currentMouseX) * 0.08;
      currentMouseY += (targetMouseY - currentMouseY) * 0.08;

      const isDark = document.documentElement.classList.contains("dark") ? 1.0 : 0.0;

      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const elapsed = prefersReducedMotion ? 0.0 : (performance.now() - startTime) * 0.001;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      gl.uniform2f(uResolutionLocation, canvas.width, canvas.height);
      gl.uniform2f(uMouseLocation, currentMouseX, currentMouseY);
      gl.uniform1f(uTimeLocation, elapsed);
      gl.uniform1f(uIsDarkLocation, isDark);
      gl.uniform1f(uDprLocation, dpr);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", resizeCanvas);
      if (positionBuffer) gl.deleteBuffer(positionBuffer);
      if (vertexShader) gl.deleteShader(vertexShader);
      if (fragmentShader) gl.deleteShader(fragmentShader);
      if (program) gl.deleteProgram(program);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none -z-10 w-full h-full"
      aria-hidden="true"
    />
  );
}