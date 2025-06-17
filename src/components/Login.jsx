'use client';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { FcGoogle } from 'react-icons/fc';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, signup, signInWithGoogle } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();

    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    try {
      setError('');
      setLoading(true);

      if (isSignup) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
    } catch (error) {
      setError('Failed to ' + (isSignup ? 'create account' : 'sign in') + '. Please try again.');
      console.error("Auth error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
    } catch (error) {
      setError('Failed to sign in with Google. Please try again.');
      console.error("Google sign-in error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-800 p-4 relative overflow-hidden flex items-center justify-center">
      {/* Background graphics */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] opacity-40">
          <div className="w-full h-full bg-gradient-to-br from-emerald-400/30 via-emerald-500/20 to-transparent rounded-full blur-3xl transform -translate-x-1/3 -translate-y-1/3"></div>
        </div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] opacity-35">
          <div className="w-full h-full bg-gradient-to-tl from-red-400/25 via-red-500/15 to-transparent rounded-full blur-3xl transform translate-x-1/3 translate-y-1/3"></div>
        </div>
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] opacity-30">
          <div className="w-full h-full bg-gradient-to-r from-blue-400/20 via-purple-400/15 to-transparent rounded-full blur-2xl transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[length:60px_60px]"></div>
        <div className="absolute top-20 left-20 w-32 h-32 border border-emerald-400/20 rounded-3xl transform rotate-12"></div>
        <div className="absolute top-32 right-32 w-24 h-24 border border-red-400/20 rounded-full"></div>
        <div className="absolute bottom-40 left-40 w-20 h-20 border border-blue-400/20 rounded-2xl transform -rotate-6"></div>
        <div className="absolute bottom-32 right-24 w-28 h-28 border border-purple-400/20 rounded-full"></div>
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/8 to-transparent"></div>
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-white/8 to-transparent"></div>
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-white/8 to-transparent"></div>
        <div className="absolute top-16 right-1/3 w-3 h-3 bg-emerald-400/40 rounded-full shadow-lg shadow-emerald-400/20"></div>
        <div className="absolute top-1/3 left-16 w-2 h-2 bg-red-400/40 rounded-full shadow-lg shadow-red-400/20"></div>
        <div className="absolute bottom-1/4 right-16 w-4 h-4 bg-blue-400/35 rounded-full shadow-lg shadow-blue-400/20"></div>
        <div className="absolute bottom-16 left-1/3 w-2.5 h-2.5 bg-purple-400/40 rounded-full shadow-lg shadow-purple-400/20"></div>
        <div className="absolute top-1/3 right-1/2 opacity-20">
          <svg width="120" height="80" viewBox="0 0 120 80">
            <path d="M0,40 Q30,0 60,40 T120,40" fill="none" stroke="url(#gradient1)" strokeWidth="2" />
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="absolute bottom-1/3 left-1/3 opacity-18">
          <svg width="100" height="60" viewBox="0 0 100 60">
            <path d="M0,30 Q25,60 50,30 T100,30" fill="none" stroke="url(#gradient2)" strokeWidth="1.5" />
            <defs>
              <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center justify-center">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/95 backdrop-blur-xl shadow-2xl shadow-black/30 border border-white/20 flex items-center justify-center">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full shadow-inner"></div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-red-400 to-red-500 rounded-full shadow-sm"></div>
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-white mb-1 tracking-tight">SwiftLink</h1>
          <p className="text-slate-300 text-sm font-medium">Streamlined payroll management</p>
        </div>

        {/* Card */}
        <Card className="bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl shadow-black/30 rounded-3xl p-0 overflow-hidden flex flex-row w-[700px] h-[400px]">
          <div className="w-1/2 p-8 flex flex-col justify-center">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-1 tracking-tight">
                {isSignup ? 'Create Account' : 'Sign In'}
              </h2>
              <p className="text-gray-500 text-sm font-medium">
                {isSignup ? 'Join SwiftLink to manage your payroll efficiently' : 'Welcome back to SwiftLink'}
              </p>
            </div>

            {error && (
              <div className="bg-red-50/95 backdrop-blur-sm border border-red-200/60 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm flex items-start">
                <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@company.com" className="h-10 px-4 text-sm rounded-md border-gray-300/60 bg-white/90 placeholder-gray-400" />
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Enter your password" className="h-10 px-4 text-sm rounded-md border-gray-300/60 bg-white/90 placeholder-gray-400" />
              <Button type="submit" className="w-full h-10 text-sm bg-gray-900 hover:bg-gray-800 text-white rounded-md disabled:opacity-50" disabled={loading}>
                {loading ? (isSignup ? 'Creating Account...' : 'Signing In...') : isSignup ? 'Create Account' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button type="button" onClick={() => setIsSignup(!isSignup)} className="text-xs text-gray-600 hover:text-emerald-600 font-medium underline underline-offset-4">
                {isSignup ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
              </button>
            </div>
          </div>

          {/* Google login */}
          
          <div className="w-1/2 p-8 flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-50">
          <p className="text-gray-500 text-sm font-medium"> Or sign in with</p>
          <br></br>
            <Button type="button" onClick={handleGoogleSignIn} disabled={loading} className="w-full h-12 bg-white/90 hover:bg-white backdrop-blur-sm text-gray-700 font-semibold rounded-xl border border-gray-300/60 transition-all duration-200 hover:border-gray-400 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
              <div className="flex items-center justify-center space-x-2">
                <FcGoogle className="h-5 w-5" />
                <span>Continue with Google</span>
              </div>
            </Button>
            
          </div>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400 font-medium">Fast. Secure. Done Right.</p>
        </div>
      </div>
    </div>
  );
}
