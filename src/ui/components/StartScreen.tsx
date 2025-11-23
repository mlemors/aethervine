/**
 * Start/Splash Screen Component
 */

interface StartScreenProps {
  onStart: () => void;
}

export const StartScreen = ({ onStart }: StartScreenProps) => {
  return (
    <div className="fixed inset-0 flex flex-col">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/assets/backgrounds/teldrassil.png)',
          filter: 'brightness(0.6)',
        }}
      />

      {/* Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/30 to-black/70" />

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center justify-between min-h-[80vh]">
            {/* Logo */}
            <div className="flex-1 flex items-center justify-center">
              <img
                src="/assets/logos/game-logo.png"
                alt="Aethervine"
                className="h-40 object-contain drop-shadow-2xl"
              />
            </div>
            
            {/* Start Button */}
            <button
              onClick={onStart}
              className="px-12 py-4 bg-gradient-to-r from-aether-cyan to-aether-teal hover:from-aether-cyan-dark hover:to-aether-cyan text-white text-xl font-bold rounded-lg transition-all shadow-2xl border-2 border-aether-gold hover:scale-105 mb-20"
            >
              START
            </button>
          </div>
        </div>
      </div>

      {/* Footer - Always at bottom */}
      <div className="relative z-10 py-4 text-center text-gray-400 text-sm">
        <p>
          Made with React, Phaser & much ❤️ by{' '}
          <a
            href="https://mlemors.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-aether-teal hover:text-aether-gold font-semibold"
          >
            mlemors
          </a>
        </p>
      </div>
    </div>
  );
};
