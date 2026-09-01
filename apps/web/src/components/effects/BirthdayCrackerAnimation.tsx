'use client';

import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

interface BirthdayCrackerAnimationProps {
  durationMs?: number;
  onComplete?: () => void;
}

export const BirthdayCrackerAnimation: React.FC<BirthdayCrackerAnimationProps> = ({
  durationMs = 5000,
  onComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Festive birthday party popper color palette
    const festiveColors = [
      '#FF1493', // Deep Pink
      '#FF4500', // Orange Red
      '#FFD700', // Gold
      '#00FF7F', // Spring Green
      '#1E90FF', // Dodger Blue
      '#9370DB', // Medium Purple
      '#FF69B4', // Hot Pink
      '#00FFFF', // Cyan
      '#FFA500', // Bright Orange
      '#635BFF', // Cyber Indigo
    ];

    // 1. Initial Explosive Party Popper Crackers Burst (Left & Right Poppers)
    // Left Birthday Popper Cannon
    confetti({
      particleCount: 80,
      angle: 60,
      spread: 70,
      origin: { x: 0.05, y: 0.85 },
      startVelocity: 65,
      colors: festiveColors,
      ticks: 300,
      gravity: 0.9,
      scalar: 1.2,
      zIndex: 9999,
    });

    // Right Birthday Popper Cannon
    confetti({
      particleCount: 80,
      angle: 120,
      spread: 70,
      origin: { x: 0.95, y: 0.85 },
      startVelocity: 65,
      colors: festiveColors,
      ticks: 300,
      gravity: 0.9,
      scalar: 1.2,
      zIndex: 9999,
    });

    // Center Grand Birthday Popper Burst
    setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 120,
        origin: { x: 0.5, y: 0.6 },
        startVelocity: 50,
        colors: festiveColors,
        ticks: 350,
        gravity: 0.8,
        scalar: 1.3,
        shapes: ['circle', 'square'],
        zIndex: 9999,
      });
    }, 200);

    // 2. Cascading Ribbon Streamers & Star Crackers Interval
    const end = Date.now() + durationMs;
    const interval = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(interval);
        return;
      }

      // Continuous side poppers
      confetti({
        particleCount: 12,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.75 },
        startVelocity: 45,
        colors: festiveColors,
        zIndex: 9999,
      });

      confetti({
        particleCount: 12,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.75 },
        startVelocity: 45,
        colors: festiveColors,
        zIndex: 9999,
      });

      // Streamer shower from the top
      if (Math.random() > 0.4) {
        confetti({
          particleCount: 20,
          angle: 90,
          spread: 100,
          origin: { x: Math.random(), y: 0 },
          startVelocity: 20,
          gravity: 0.6,
          colors: festiveColors,
          scalar: 1.1,
          zIndex: 9999,
        });
      }
    }, 250);

    // 3. Floating Party Sparkles Canvas Layer
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const handleResize = () => {
          if (!canvas) return;
          width = canvas.width = window.innerWidth;
          height = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        interface Sparkle {
          x: number;
          y: number;
          size: number;
          color: string;
          alpha: number;
          vy: number;
          vx: number;
          rot: number;
          rotSpeed: number;
        }

        const sparkles: Sparkle[] = [];
        for (let i = 0; i < 40; i++) {
          sparkles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 6 + 3,
            color: festiveColors[Math.floor(Math.random() * festiveColors.length)],
            alpha: Math.random(),
            vy: Math.random() * 1.5 + 0.5,
            vx: (Math.random() - 0.5) * 1,
            rot: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.05,
          });
        }

        let animId: number;
        const renderSparkles = () => {
          ctx.clearRect(0, 0, width, height);

          for (const s of sparkles) {
            s.y += s.vy;
            s.x += s.vx;
            s.rot += s.rotSpeed;
            if (s.y > height) {
              s.y = -10;
              s.x = Math.random() * width;
            }

            ctx.save();
            ctx.translate(s.x, s.y);
            ctx.rotate(s.rot);
            ctx.fillStyle = s.color;
            ctx.globalAlpha = Math.abs(Math.sin(Date.now() * 0.003 + s.x)) * 0.8 + 0.2;

            // Draw 4-point sparkle star
            ctx.beginPath();
            for (let i = 0; i < 4; i++) {
              ctx.lineTo(Math.cos((i * Math.PI) / 2) * s.size, Math.sin((i * Math.PI) / 2) * s.size);
              ctx.lineTo(
                Math.cos((i * Math.PI) / 2 + Math.PI / 4) * (s.size * 0.35),
                Math.sin((i * Math.PI) / 2 + Math.PI / 4) * (s.size * 0.35)
              );
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          }

          animId = requestAnimationFrame(renderSparkles);
        };

        renderSparkles();

        const timer = setTimeout(() => {
          onComplete?.();
        }, durationMs);

        return () => {
          clearInterval(interval);
          clearTimeout(timer);
          window.removeEventListener('resize', handleResize);
          cancelAnimationFrame(animId);
        };
      }
    }

    const timer = setTimeout(() => {
      onComplete?.();
    }, durationMs);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
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
