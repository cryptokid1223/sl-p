import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../supabaseClient';

interface LoginFormProps {
  mode?: 'signin' | 'signup';
  onSuccess?: () => void;
}

export default function LoginForm({ mode = 'signin', onSuccess }: LoginFormProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(mode === 'signup');
  const [signupMessage, setSignupMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSignupMessage('Signup successful! Please check your email and confirm your account before signing in.');
        setIsSignUp(false);
      } else {
        await login(email, password);
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-sm mx-auto p-8 rounded-2xl shadow-2xl border-2 border-green-400/40 bg-black/50 backdrop-blur-2xl relative font-mono"
      style={{
        boxShadow: '0 0 48px 0 #00ffae55, 0 2px 24px 0 #000a',
        overflow: 'hidden',
      }}
    >
      {/* Animated border glow */}
      <div className="absolute inset-0 pointer-events-none z-10 animate-glow rounded-2xl border-2 border-green-400/40" style={{ boxShadow: '0 0 32px 8px #00ffae55' }} />
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{background: 'repeating-linear-gradient(135deg,rgba(0,255,174,0.04) 0 2px,transparent 2px 40px),repeating-linear-gradient(-135deg,rgba(0,255,174,0.04) 0 2px,transparent 2px 40px)'}} />
      <h2 className="relative z-20 text-3xl font-extrabold text-green-200 mb-8 text-center tracking-widest drop-shadow-glow" style={{fontFamily: '"JetBrains Mono", "Fira Mono", monospace'}}> 
        {isSignUp ? 'Sign Up' : 'Sign In'}
      </h2>
      {signupMessage && (
        <div className="relative z-20 text-green-400 mb-4 text-center font-semibold drop-shadow-glow">{signupMessage}</div>
      )}
      <div className="mb-6 relative z-20">
        <label className="block text-green-200 mb-2 font-semibold tracking-wide">Email</label>
        <input
          type="email"
          className="input-field bg-black/60 border-green-400/40 text-green-100 placeholder:text-green-400 focus:ring-2 focus:ring-green-400 focus:border-green-400 shadow-inner rounded-lg px-4 py-3 transition-all duration-200 hover:border-green-300/80"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>
      <div className="mb-8 relative z-20">
        <label className="block text-green-200 mb-2 font-semibold tracking-wide">Password</label>
        <input
          type="password"
          className="input-field bg-black/60 border-green-400/40 text-green-100 placeholder:text-green-400 focus:ring-2 focus:ring-green-400 focus:border-green-400 shadow-inner rounded-lg px-4 py-3 transition-all duration-200 hover:border-green-300/80"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </div>
      {error && <div className="relative z-20 text-pink-400 mb-4 text-center font-semibold drop-shadow-glow">{error}</div>}
      <button
        type="submit"
        className="relative z-20 w-full py-3 rounded-lg font-bold text-lg bg-gradient-to-r from-green-400 via-blue-500 to-green-400 text-black shadow-lg hover:from-green-300 hover:to-blue-400 hover:scale-105 transition-all duration-200 border-2 border-green-400/60 focus:outline-none focus:ring-2 focus:ring-green-400"
        disabled={loading}
        style={{ textShadow: '0 0 8px #00ffae' }}
      >
        {loading ? (isSignUp ? 'Signing up...' : 'Signing in...') : (isSignUp ? 'Sign Up' : 'Sign In')}
      </button>
      <div className="relative z-20 text-center mt-6">
        {isSignUp ? (
          <span className="text-green-300 text-sm">Already have an account?{' '}
            <button type="button" className="underline hover:text-blue-400" onClick={() => { setIsSignUp(false); setSignupMessage(null); }}>Sign In</button>
          </span>
        ) : (
          <span className="text-green-300 text-sm">Don&apos;t have an account?{' '}
            <button type="button" className="underline hover:text-blue-400" onClick={() => setIsSignUp(true)}>Sign Up</button>
          </span>
        )}
      </div>
      <style>{`
        .drop-shadow-glow {
          text-shadow: 0 0 8px #00ffae, 0 0 2px #00ffae;
        }
        @keyframes glow {
          0% { box-shadow: 0 0 32px 8px #00ffae55, 0 0 0 0 #00ffae00; }
          50% { box-shadow: 0 0 48px 16px #00ffae99, 0 0 0 0 #00ffae00; }
          100% { box-shadow: 0 0 32px 8px #00ffae55, 0 0 0 0 #00ffae00; }
        }
        .animate-glow {
          animation: glow 2.5s ease-in-out infinite;
        }
      `}</style>
    </form>
  );
} 