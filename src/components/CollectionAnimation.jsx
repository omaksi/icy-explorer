import { useEffect, useState } from 'react';

export default function CollectionAnimation({ word, onComplete }) {
  // Generate particles once on mount using useState initializer function
  const [particles] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      angle: (Math.PI * 2 * i) / 30 + Math.random() * 0.3,
      distance: 80 + Math.random() * 150,
      size: 12 + Math.random() * 24,
      duration: 0.8 + Math.random() * 0.5,
      delay: Math.random() * 0.15,
    }))
  );

  useEffect(() => {
    // Trigger completion callback after animation
    const timeout = setTimeout(() => {
      onComplete?.();
    }, 1000);

    return () => clearTimeout(timeout);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center">
      {/* Full screen flash effect */}
      <div className="absolute inset-0 bg-yellow-300/30 animate-pulse"
           style={{ animation: 'flash 0.3s ease-out' }} />

      {/* Main word with collection animation */}
      <div className="word-collect-animation relative">
        <div className="bg-gradient-to-br from-yellow-200 via-amber-300 to-orange-400
                        border-8 border-yellow-100 rounded-2xl p-12 text-center
                        shadow-2xl shadow-yellow-500/70">
          <div className="text-8xl font-bold text-white mb-4 drop-shadow-2xl"
               style={{ textShadow: '0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(255,215,0,0.6)' }}>
            {word}
          </div>
          <div className="text-4xl font-bold text-green-600 drop-shadow-lg">
            ✓ ZOZBIERANÉ! ✓
          </div>
          <div className="text-2xl font-bold text-yellow-800 mt-2">
            🎉 +1 Slovo 🎉
          </div>
        </div>
      </div>

      {/* Particle explosion - colorful circles */}
      {particles.map(particle => {
        const x = Math.cos(particle.angle) * particle.distance;
        const y = Math.sin(particle.angle) * particle.distance;
        const colors = ['bg-yellow-400', 'bg-amber-400', 'bg-orange-400', 'bg-red-400', 'bg-pink-400'];
        const color = colors[particle.id % colors.length];

        return (
          <div
            key={particle.id}
            className="absolute top-1/2 left-1/2 pointer-events-none"
            style={{
              animation: `sparkle ${particle.duration}s ease-out forwards`,
              animationDelay: `${particle.delay}s`,
            }}
          >
            <div
              className={`${color} rounded-full shadow-2xl`}
              style={{
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                transform: `translate(${x}px, ${y}px)`,
                boxShadow: `0 0 ${particle.size}px rgba(255,215,0,0.8)`,
              }}
            />
          </div>
        );
      })}

      {/* Large star bursts */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
        <div
          key={`star-${i}`}
          className="absolute top-1/2 left-1/2 text-yellow-300 text-6xl pointer-events-none drop-shadow-2xl"
          style={{
            animation: `sparkle ${1 + i * 0.1}s ease-out forwards`,
            animationDelay: `${i * 0.05}s`,
            transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-60px)`,
            textShadow: '0 0 20px rgba(255,215,0,1)',
          }}
        >
          ⭐
        </div>
      ))}

      {/* Expanding glowing rings */}
      {[0, 1, 2, 3].map(i => (
        <div
          key={`ring-${i}`}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                     border-8 border-yellow-300 rounded-full pointer-events-none"
          style={{
            width: '150px',
            height: '150px',
            animation: `expandRing ${1}s ease-out forwards`,
            animationDelay: `${i * 0.1}s`,
            boxShadow: '0 0 30px rgba(255,215,0,0.8)',
          }}
        />
      ))}

      {/* Confetti emojis */}
      {['🎉', '🎊', '✨', '💫', '🌟'].map((emoji, i) => (
        <div
          key={`emoji-${i}`}
          className="absolute top-1/2 left-1/2 text-5xl pointer-events-none"
          style={{
            animation: `sparkle ${0.8}s ease-out forwards`,
            animationDelay: `${i * 0.1}s`,
            transform: `translate(-50%, -50%) rotate(${i * 72}deg) translateY(-100px)`,
          }}
        >
          {emoji}
        </div>
      ))}
    </div>
  );
}
