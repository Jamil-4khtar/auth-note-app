import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      if (errorCode === 'auth/wrong-password') {
        setError('Wrong password.');
      } else if (errorCode === 'auth/user-not-found') {
        setError('User not found');
      } else if (errorCode === 'auth/invalid-credential') {
        setError('Invalid credentials');
      } else {
        setError(`Authentication error: ${errorCode} ${errorMessage}`);
      }
    }
    setLoading(false);
  }

  async function handleGoogleSignIn(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      setError('Google sign-in failed');
    }
    setLoading(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-100 dark:from-neutral-900 dark:to-neutral-800 transition-colors py-12 px-4"
    >
      <div className="max-w-md w-full space-y-8 bg-white/90 dark:bg-neutral-900/90 shadow-2xl rounded-2xl p-6 border border-border dark:border-neutral-800 backdrop-blur transition-colors">
        <div className="flex flex-col items-center gap-2">
          <img src="/image.png" alt="Logo" className="h-20 w-20 mb-2" />
          <h2 className="text-center text-3xl font-bold text-foreground dark:text-white tracking-tight">
            Log in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/30 p-3 border border-red-200 dark:border-red-700 transition-colors text-center">
              <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
            </div>
          )}
          <div className="space-y-4">
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="block w-full px-4 py-3 rounded-xl border border-border dark:border-neutral-700 placeholder-gray-500 dark:placeholder-neutral-400 text-foreground dark:text-white bg-background dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-all shadow-sm"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="block w-full px-4 py-3 rounded-xl border border-border dark:border-neutral-700 placeholder-gray-500 dark:placeholder-neutral-400 text-foreground dark:text-white bg-background dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-all shadow-sm"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow transition-all duration-200"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </span>
            ) : 'Login'}
          </button>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-base font-semibold bg-white border border-border dark:bg-neutral-800 dark:border-neutral-700 text-foreground dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-700 transition-all duration-200 mt-2"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5 mr-2" />
            Sign in with Google
          </button>
          <div className="text-sm text-center">
            <Link
              to="/signup"
              className="font-medium text-indigo-600 dark:text-blue-400 hover:text-indigo-500 dark:hover:text-blue-300 transition-colors"
            >
              Don't have an account? Sign up
            </Link>
          </div>
        </form>
      </div>
    </motion.div>
  );
}