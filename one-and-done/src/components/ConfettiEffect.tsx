import { useEffect, useState } from "react";

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
}

interface ConfettiEffectProps {
  isActive: boolean;
  onComplete: () => void;
  duration?: number;
}

export default function ConfettiEffect({
  isActive,
  onComplete,
  duration = 3000,
}: ConfettiEffectProps) {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);

  const colors = [
    "#10b981",
    "#3b82f6",
    "#8b5cf6",
    "#f59e0b",
    "#ef4444",
    "#06b6d4",
  ];

  const createConfettiPiece = (id: number): ConfettiPiece => ({
    id,
    x: Math.random() * window.innerWidth,
    y: -10,
    vx: (Math.random() - 0.5) * 4,
    vy: Math.random() * 3 + 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: Math.random() * 6 + 4,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 6,
  });

  useEffect(() => {
    if (!isActive) return;

    // Create initial confetti burst
    const initialConfetti = Array.from({ length: 80 }, (_, i) =>
      createConfettiPiece(i)
    );
    setConfetti(initialConfetti);

    let animationFrame: number;
    let startTime = Date.now();

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;

      if (elapsed > duration) {
        setConfetti([]);
        onComplete();
        return;
      }

      setConfetti((prevConfetti) =>
        prevConfetti
          .map((piece) => ({
            ...piece,
            x: piece.x + piece.vx,
            y: piece.y + piece.vy,
            vy: piece.vy + 0.1, // gravity
            rotation: piece.rotation + piece.rotationSpeed,
          }))
          .filter((piece) => piece.y < window.innerHeight + 10)
      );

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isActive, duration, onComplete]);

  if (!isActive || confetti.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute rounded-full"
          style={{
            left: piece.x,
            top: piece.y,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            boxShadow: `0 0 6px ${piece.color}40`,
          }}
        />
      ))}
    </div>
  );
}
