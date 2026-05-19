import { useEffect, useState } from 'react';

interface CelebrationProps {
  isVisible: boolean;
  points: number;
  onComplete: () => void;
}

const particles = ['🎉', '✨', '🌟', '💫', '🎊', '⭐'];

export function Celebration({ isVisible, points, onComplete }: CelebrationProps) {
  const [particlesArray, setParticlesArray] = useState<{ id: number; emoji: string; x: number; y: number; delay: number }[]>([]);

  useEffect(() => {
    if (isVisible) {
      const newParticles = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        emoji: particles[Math.floor(Math.random() * particles.length)],
        x: 20 + Math.random() * 60,
        y: 30 + Math.random() * 40,
        delay: Math.random() * 0.5,
      }));
      setParticlesArray(newParticles);

      const timer = setTimeout(() => {
        onComplete();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      
      <div className="relative text-center animate-bounce">
        <div className="text-6xl mb-4">🎉</div>
        <div className="text-4xl font-bold text-white drop-shadow-lg">
          +{points}
        </div>
        <div className="text-xl text-white/90 mt-2">太棒了！</div>
      </div>

      {particlesArray.map((particle) => (
        <div
          key={particle.id}
          className="absolute text-3xl animate-float"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${1.5 + Math.random()}s`,
          }}
        >
          {particle.emoji}
        </div>
      ))}
    </div>
  );
}

export default Celebration;
