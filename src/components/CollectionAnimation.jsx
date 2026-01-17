import { useEffect, useState } from 'react';

export default function CollectionAnimation({ word, onComplete }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate random particles
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      angle: (Math.PI * 2 * i) / 20,
      distance: 50 + Math.random() * 100,
      size: 8 + Math.random() * 16,
      duration: 0.6 + Math.random() * 0.4,
      delay: Math.random() * 0.1,
    }));
    setParticles(newParticles);

    // Trigger completion callback after animation
    const timeout = setTimeout(() => {
      onComplete?.();
    }, 800);

    return () => clearTimeout(timeout);
  }, [onComplete]);

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
      {/* Main word with collection animation */}
      <div className="word-collect-animation">
        <div className="bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500
                        border-4 border-yellow-200 rounded-lg p-8 text-center
                        shadow-2xl shadow-amber-500/50">
          <div className="text-6xl font-bold text-white mb-2 drop-shadow-lg animate-pulse">
            {word}
          </div>
          <div className="text-2xl font-bold text-yellow-100">
            ✓ Zozbierané!
          </div>
        </div>
      </div>

      {/* Particle explosion */}
      {particles.map(particle => {
        const x = Math.cos(particle.angle) * particle.distance;
        const y = Math.sin(particle.angle) * particle.distance;

        return (
          <div
            key={particle.id}
            className="absolute top-0 left-0 pointer-events-none"
            style={{
              animation: `sparkle ${particle.duration}s ease-out forwards`,
              animationDelay: `${particle.delay}s`,
            }}
          >
            <div
              className="bg-gradient-to-br from-yellow-300 to-amber-500 rounded-full shadow-lg"
              style={{
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                transform: `translate(${x}px, ${y}px)`,
              }}
            />
          </div>
        );
      })}

      {/* Star bursts */}
      {[0, 1, 2, 3, 4].map(i => (
        <div
          key={`star-${i}`}
          className="absolute top-0 left-0 text-yellow-300 text-4xl pointer-events-none"
          style={{
            animation: `sparkle ${0.8 + i * 0.1}s ease-out forwards`,
            animationDelay: `${i * 0.05}s`,
            transform: `rotate(${i * 72}deg) translateY(-40px)`,
          }}
        >
          ★
        </div>
      ))}

      {/* Glowing rings */}
      {[0, 1, 2].map(i => (
        <div
          key={`ring-${i}`}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                     border-4 border-yellow-300 rounded-full pointer-events-none"
          style={{
            width: '100px',
            height: '100px',
            animation: `sparkle ${0.6}s ease-out forwards`,
            animationDelay: `${i * 0.1}s`,
            opacity: 0.7 - i * 0.2,
          }}
        />
      ))}
    </div>
  );
}
