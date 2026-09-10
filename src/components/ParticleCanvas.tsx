import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  color: string;
}

export function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let angleY = 0;
    let angleX = 0;

    const colors = ['#00F2FE', '#10B981', '#A855F7', '#00F2FE', '#10B981'];

    function resize() {
      if (!canvas) return;
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      if (ctx) ctx.scale(dpr, dpr);
    }

    function initParticles() {
      const count = Math.min(120, Math.floor((width * height) / 8000));
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: (Math.random() - 0.5) * 400,
          y: (Math.random() - 0.5) * 400,
          z: (Math.random() - 0.5) * 400,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          vz: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 2 + 1,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    }

    function project(p: Particle) {
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);

      // Rotate around Y
      const x1 = p.x * cosY - p.z * sinY;
      const z1 = p.x * sinY + p.z * cosY;
      // Rotate around X
      const y1 = p.y * cosX - z1 * sinX;
      const z2 = p.y * sinX + z1 * cosX;

      const focal = 350;
      const scale = focal / (focal + z2 + 200);
      return {
        x: width / 2 + x1 * scale,
        y: height / 2 + y1 * scale,
        scale,
        z: z2,
      };
    }

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      // Mouse influence on rotation
      const targetAngleY = mouseRef.current.active ? mouseRef.current.x * 0.005 : 0;
      const targetAngleX = mouseRef.current.active ? mouseRef.current.y * 0.003 : 0;
      angleY += 0.003 + targetAngleY * 0.02;
      angleX += targetAngleX * 0.02;

      // Update particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // Wrap
        if (Math.abs(p.x) > 250) p.vx *= -1;
        if (Math.abs(p.y) > 250) p.vy *= -1;
        if (Math.abs(p.z) > 250) p.vz *= -1;
      }

      // Sort by z for depth
      const projected = particles.map((p) => ({ p, proj: project(p) }));
      projected.sort((a, b) => b.proj.z - a.proj.z);

      // Draw connections
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].proj.x - projected[j].proj.x;
          const dy = projected[i].proj.y - projected[j].proj.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const opacity = (1 - dist / 120) * 0.25 * Math.min(projected[i].proj.scale, projected[j].proj.scale);
            ctx.beginPath();
            ctx.moveTo(projected[i].proj.x, projected[i].proj.y);
            ctx.lineTo(projected[j].proj.x, projected[j].proj.y);
            ctx.strokeStyle = `rgba(0, 242, 254, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (const { p, proj } of projected) {
        const size = p.size * proj.scale;
        const opacity = Math.min(1, proj.scale * 0.9);

        // Glow
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, size * 3, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(proj.x, proj.y, 0, proj.x, proj.y, size * 3);
        grad.addColorStop(0, p.color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.globalAlpha = opacity * 0.15;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = opacity;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(draw);
    }

    function handleMouseMove(e: MouseEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left - width / 2) / (width / 2),
        y: (e.clientY - rect.top - height / 2) / (height / 2),
        active: true,
      };
    }

    function handleMouseLeave() {
      mouseRef.current = { x: 0, y: 0, active: false };
    }

    resize();
    initParticles();
    draw();

    window.addEventListener('resize', () => {
      resize();
      initParticles();
    });
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationRef.current);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />;
}
