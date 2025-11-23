/**
 * Login/Splash Screen Component
 */

import { useState, useEffect } from 'react';
import { useAccountStore } from '../stores/accountStore';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onBack?: () => void;
}

export const LoginScreen = ({ onLoginSuccess, onBack }: LoginScreenProps) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { login, register } = useAccountStore();

  // ESC key handler to go back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onBack) {
        onBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'login') {
      const success = login(username, password);
      if (success) {
        onLoginSuccess();
      } else {
        setError('Invalid username or password');
      }
    } else {
      // Validation
      if (username.length < 3) {
        setError('Username must be at least 3 characters');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }

      const success = register(username, '', password);
      if (success) {
        onLoginSuccess();
      } else {
        setError('Username already exists');
      }
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col min-h-screen">
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

      {/* Logo - Absolute positioned */}
      <div className="absolute top-[5vh] left-0 right-0 z-20 flex justify-center">
        <img
          src="/assets/logos/game-logo.png"
          alt="Aethervine"
          className="h-[15vh] max-h-32 object-contain drop-shadow-2xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
        {/* Login Form */}
        <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg border-2 border-cyan-500/30 shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-wow-gold transition-colors"
                placeholder="Enter your username"
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="Enter your password"
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            {error && (
              <div className="bg-red-900/50 border border-red-500 rounded-lg px-4 py-3 text-red-200 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-aether-cyan to-aether-teal hover:from-aether-cyan-dark hover:to-aether-cyan text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg border-2 border-aether-gold"
            >
              {mode === 'login' ? 'Login' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            {mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  onClick={() => setMode('register')}
                  className="text-aether-teal hover:text-aether-gold font-semibold"
                >
                  Register here
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-aether-teal hover:text-aether-gold font-semibold"
                >
                  Login here
                </button>
              </p>
            )}
          </div>
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
