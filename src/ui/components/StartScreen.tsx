/**
 * Start/Splash Screen Component
 */

interface StartScreenProps {
  onStart: () => void;
}

export const StartScreen = ({ onStart }: StartScreenProps) => {
  return (
    <div className="fixed inset-0 flex flex-col min-h-screen">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/assets/backgrounds/teldrassil.png)',
          filter: 'brightness(1)',
        }}
      />

      {/* Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/30 to-black/70" />

      {/* Logo - Absolute positioned */}
      <div className="absolute top-[5vh] left-0 right-0 z-20 flex justify-center">
        <img
          src="/assets/logos/game-logo.png"
          alt="Aethervine"
          className="h-[15vh] max-h-32 object-contain drop-shadow-2xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-end justify-center px-6 pb-[8vh]">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center">
            {/* Start Button */}
            <button
              onClick={onStart}
              className="transition-all hover:scale-105"
            >
              <img
                src="/assets/logos/start-button.png"
                alt="Start"
                className="h-[20vh] max-h-40 object-contain drop-shadow-2xl"
              />
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
