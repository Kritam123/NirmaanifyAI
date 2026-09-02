'use client';

import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

interface FirecrackerAnimationProps {
  durationMs?: number;
  onComplete?: () => void;
}

export const FirecrackerAnimation: React.FC<FirecrackerAnimationProps> = ({
  durationMs = 6000,
  onComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // 1. Trigger realistic confetti cannons
    const end = Date.now() + durationMs;
    const colors = ['#635BFF', '#22D3EE', '#EC4899', '#F59E0B', '#10B981', '#F43F5E', '#A855F7'];

    const confettiInterval = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(confettiInterval);
        return;
      }

      // Left cannon
      confetti({
        particleCount: 7,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
        zIndex: 9999,
      });

      // Right cannon
      confetti({
        particleCount: 7,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
        zIndex: 9999,
      });

      // Center burst
      if (Math.random() > 0.6) {
        confetti({
          particleCount: 15,
          spread: 100,
          origin: { x: 0.5, y: 0.4 },
          colors,
          zIndex: 9999,
          shapes: ['circle', 'square'],
        });
      }
    }, 150);

    // 2. High-Performance Real-Time Canvas Firecrackers & Fireworks
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      alpha: number;
      decay: number;
      size: number;
      gravity: number;
      flicker: boolean;
    }

    interface Rocket {
      x: number;
      y: number;
      targetY: number;
      speed: number;
      color: string;
      trail: { x: number; y: number; alpha: number }[];
    }

    const particles: Particle[] = [];
    const rockets: Rocket[] = [];

    const firecrackerColors = [
      '#635BFF',
      '#22D3EE',
      '#EC4899',
      '#F59E0B',
      '#10B981',
      '#F43F5E',
      '#38BDF8',
      '#E11D48',
      '#FBBF24',
      '#A855F7',
      '#FFFFFF',
    ];

    const createExplosion = (x: number, y: number, color: string) => {
      const particleCount = 70 + Math.floor(Math.random() * 50);
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 2;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: Math.random() > 0.3 ? color : firecrackerColors[Math.floor(Math.random() * firecrackerColors.length)],
          alpha: 1,
          decay: Math.random() * 0.015 + 0.012,
          size: Math.random() * 3 + 2,
          gravity: 0.12,
          flicker: Math.random() > 0.5,
        });
      }
    };

    const launchRocket = () => {
      const startX = width * 0.15 + Math.random() * (width * 0.7);
      const targetY = height * 0.15 + Math.random() * (height * 0.4);
      rockets.push({
        x: startX,
        y: height,
        targetY,
        speed: Math.random() * 4 + 10,
        color: firecrackerColors[Math.floor(Math.random() * firecrackerColors.length)],
        trail: [],
      });
    };

    // Initial volley of firecrackers
    for (let i = 0; i < 4; i++) {
      setTimeout(launchRocket, i * 250);
    }

    const rocketInterval = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(rocketInterval);
        return;
      }
      launchRocket();
      if (Math.random() > 0.4) {
        setTimeout(launchRocket, 100);
      }
    }, 450);

    const render = () => {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';

      // Update and draw rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.y -= r.speed;
        r.x += (Math.random() - 0.5) * 2;

        r.trail.push({ x: r.x, y: r.y, alpha: 1 });
        if (r.trail.length > 8) r.trail.shift();

        // Draw trail
        for (const t of r.trail) {
          ctx.beginPath();
          ctx.arc(t.x, t.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = r.color;
          ctx.shadowBlur = 8;
          ctx.shadowColor = r.color;
          ctx.fill();
        }

        // Check if rocket reached explosion height
        if (r.y <= r.targetY) {
          createExplosion(r.x, r.y, r.color);
          rockets.splice(i, 1);
        }
      }

      // Update and draw explosion particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        const displayAlpha = p.flicker && Math.random() > 0.5 ? p.alpha * 0.4 : p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = displayAlpha;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const completeTimer = setTimeout(() => {
      onComplete?.();
    }, durationMs);

    return () => {
      clearInterval(confettiInterval);
      clearInterval(rocketInterval);
      clearTimeout(completeTimer);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [durationMs, onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ background: 'transparent' }}
      />
    </div>
  );
};
