import React, { useEffect, useRef } from 'react';

export default function WinModal({ showWinModal, setShowWinModal, resetBoard }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!showWinModal || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const colors = ['#3b82f6', '#10b981', '#f43f5e', '#a855f7', '#f59e0b', '#ec4899'];
    const particles = [];

    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        r: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        dx: Math.random() * 2 - 1,
        dy: Math.random() * 3 + 2,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 2 - 1
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.y += p.dy;
        p.x += p.dx;
        p.rotation += p.rotationSpeed;

        if (p.y < canvas.height) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.r, -p.r, p.r * 2, p.r * 1.5);
          ctx.restore();
        } else {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [showWinModal]);

  if (!showWinModal) return null;

  return (
    <div className="bingo-modal-overlay no-print">
      <canvas ref={canvasRef} className="bingo-confetti-canvas" />
      <div className="bingo-modal">
        <h2>Bingo!</h2>
        <p>You've completed a line.</p>
        <div className="bingo-modal-actions">
          <button className="btn-secondary" onClick={() => setShowWinModal(false)}>Keep Playing</button>
          <button className="btn-primary" onClick={resetBoard}>New Card</button>
        </div>
      </div>
    </div>
  );
}
