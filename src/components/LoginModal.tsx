import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface LoginModalProps {
  onClose: () => void;
}

export function LoginModal({ onClose }: LoginModalProps) {
  const { login, signup, isDemoMode } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePassword = (pw: string) => {
    if (pw.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(pw)) return 'Password must contain an uppercase letter';
    if (!/[0-9]/.test(pw)) return 'Password must contain a number';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!validateEmail(email)) {
      setError('Invalid email address');
      return;
    }

    if (mode === 'signup') {
      const pwError = validatePassword(password);
      if (pwError) {
        setError(pwError);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    setIsLoading(true);
    try {
      if (mode === 'signup') {
        await signup(email, password);
      } else {
        await login('email', email, password);
      }
      onClose();
    } catch (err: any) {
      const msg = err?.code || err?.message || 'Authentication failed';
      // Map Firebase error codes to friendly messages
      const errorMap: Record<string, string> = {
        'auth/user-not-found': 'No account found with this email',
        'auth/wrong-password': 'Incorrect password',
        'auth/email-already-in-use': 'An account with this email already exists',
        'auth/too-many-requests': 'Too many attempts. Please try again later',
        'auth/invalid-credential': 'Invalid credentials. Check your email and password',
      };
      setError(errorMap[msg] || msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setIsLoading(true);
    try {
      await login('google');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="panel w-full max-w-sm mx-4 border-pablo-green/20">
        <div className="panel-header">
          <span className="panel-title">
            {isDemoMode ? 'Demo Access' : 'Secure Access'}
          </span>
          <button onClick={onClose} className="text-pablo-muted hover:text-pablo-light transition-colors text-xs">
            [x]
          </button>
        </div>

        <div className="p-5">
          <h2 className="font-serif text-xl tracking-[0.2em] text-center mb-0.5 text-pablo-light">
            PABLO
          </h2>
          <p className="text-pablo-muted text-[9px] text-center mb-5 tracking-[0.2em] uppercase">
            {mode === 'login' ? 'Access your terminal' : 'Join the network'}
          </p>

          {isDemoMode && (
            <div className="mb-3 p-2 bg-pablo-gold/5 border border-pablo-gold/20">
              <p className="text-pablo-gold text-[10px] font-mono">
                Demo mode -- preferences saved locally
              </p>
            </div>
          )}

          {error && (
            <div className="mb-3 p-2 bg-red-900/10 border border-red-800/20">
              <p className="text-red-400 text-[10px] font-mono">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-pablo-muted text-[9px] uppercase tracking-[0.15em] block mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-pablo text-xs"
                placeholder="trader@pablo.io"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="text-pablo-muted text-[9px] uppercase tracking-[0.15em] block mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-pablo text-xs"
                placeholder={'\u2022'.repeat(12)}
                required
                minLength={mode === 'signup' ? 8 : 1}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
              {mode === 'signup' && (
                <p className="text-pablo-muted text-[9px] mt-1">
                  Min 8 chars, 1 uppercase, 1 number
                </p>
              )}
            </div>

            {mode === 'signup' && (
              <div>
                <label className="text-pablo-muted text-[9px] uppercase tracking-[0.15em] block mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="input-pablo text-xs"
                  placeholder={'\u2022'.repeat(12)}
                  required
                  autoComplete="new-password"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-pablo w-full disabled:opacity-50"
            >
              {isLoading ? 'connecting...' : mode === 'login' ? 'Access Terminal' : 'Create Account'}
            </button>
          </form>

          {!isDemoMode && (
            <>
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-pablo-border" />
                <span className="text-pablo-muted text-[9px] uppercase tracking-[0.15em]">or</span>
                <div className="flex-1 h-px bg-pablo-border" />
              </div>

              <button
                onClick={handleGoogle}
                disabled={isLoading}
                className="btn-pablo-outline w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>
            </>
          )}

          <p className="text-center mt-4 text-pablo-muted text-[10px]">
            {mode === 'login' ? (
              <>
                New here?{' '}
                <button onClick={() => { setMode('signup'); setError(''); }} className="text-pablo-green hover:underline">
                  Create account
                </button>
              </>
            ) : (
              <>
                Have an account?{' '}
                <button onClick={() => { setMode('login'); setError(''); }} className="text-pablo-green hover:underline">
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
