export default function WordPopup({ word }) {
  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
      {/* Outer glow ring */}
      <div className="absolute inset-0 bg-yellow-400/30 rounded-xl blur-2xl animate-pulse"
           style={{ width: '120%', height: '120%', left: '-10%', top: '-10%' }} />

      {/* Main popup with stronger animation */}
      <div className="relative bg-gradient-to-br from-amber-800 via-amber-900 to-yellow-900
                      border-4 border-yellow-400 rounded-xl p-8 text-center
                      shadow-2xl shadow-yellow-500/50 chest-open-animation">

        {/* Large rotating sparkles */}
        <div className="absolute -top-8 -right-8 text-6xl animate-spin-slow drop-shadow-lg"
             style={{ animation: 'sparkleRotate 2s ease-in-out infinite' }}>✨</div>
        <div className="absolute -top-8 -left-8 text-6xl animate-spin-slow drop-shadow-lg"
             style={{ animation: 'sparkleRotate 2s ease-in-out infinite', animationDelay: '0.5s' }}>✨</div>
        <div className="absolute -bottom-8 -right-8 text-6xl animate-spin-slow drop-shadow-lg"
             style={{ animation: 'sparkleRotate 2s ease-in-out infinite', animationDelay: '1s' }}>✨</div>
        <div className="absolute -bottom-8 -left-8 text-6xl animate-spin-slow drop-shadow-lg"
             style={{ animation: 'sparkleRotate 2s ease-in-out infinite', animationDelay: '1.5s' }}>✨</div>

        {/* Floating stars */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute text-yellow-300 text-3xl pointer-events-none drop-shadow-lg"
            style={{
              animation: 'floatStar 3s ease-in-out infinite',
              animationDelay: `${i * 0.2}s`,
              left: `${Math.cos((i * Math.PI * 2) / 8) * 80 + 50}%`,
              top: `${Math.sin((i * Math.PI * 2) / 8) * 80 + 50}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            ⭐
          </div>
        ))}

        <div className="relative z-10">
          <div className="text-yellow-300 text-lg mb-3 font-bold"
               style={{ animation: 'bounce 1s ease-in-out infinite' }}>
            🎁 VYBRANÉ SLOVO! 🎁
          </div>
          <div className="text-6xl font-bold text-yellow-100 mb-4 drop-shadow-xl"
               style={{ animation: 'popScale 1.5s ease-in-out infinite' }}>
            {word}
          </div>
          <div className="text-yellow-200 text-base font-semibold animate-pulse bg-yellow-900/50 rounded-lg px-4 py-2">
            ⚡ Stlač MEDZERNÍK pre zozbieranie ⚡
          </div>
        </div>
      </div>
    </div>
  );
}
