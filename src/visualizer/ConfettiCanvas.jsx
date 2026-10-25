import { useEffect, useRef } from 'react';

export default function ConfettiCanvas({ trigger }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!trigger) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 400);

    const colors = ['#4ade80', '#22c55e', '#38bdf8', '#fbbf24', '#f472b6', '#a78bfa', '#34d399'];
    const particles = Array.from({ length: 65 }, () => ({
      x: width / 2 + (Math.random() - 0.5) * 100,
      y: height * 0.7,
      vx: (Math.random() - 0.5) * 14,
      vy: -Math.random() * 12 - 6,
      size: Math.random() * 7 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 12,
      gravity: 0.35,
      alpha: 1,
      shape: Math.random() > 0.5 ? 'rect' : 'circle'
    }));

    let animId;
    function render() {
      ctx.clearRect(0, 0, width, height);
      let alive = false;

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.98;
        p.rotation += p.rotSpeed;
        p.alpha -= 0.012;

        if (p.alpha > 0) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;

          if (p.shape === 'rect') {
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.6);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      });

      if (alive) {
        animId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    }

    render();

    return () => {
      cancelAnimationFrame(animId);
      ctx.clearRect(0, 0, width, height);
    };
  }, [trigger]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 20,
        width: '100%',
        height: '100%'
      }}
    />
  );
}
