'use client';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { FcGoogle } from 'react-icons/fc'; // You'll need to install react-icons

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, signup, signInWithGoogle } = useAuth(); // Destructure signInWithGoogle

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
      console.error("Auth error:", error); // Log the full error for debugging
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      // On successful Google sign-in, the user will be redirected or
      // your AuthContext will update the user state.
    } catch (error) {
      setError('Failed to sign in with Google. Please try again.');
      console.error("Google sign-in error:", error); // Log the full error for debugging
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-6">
        <h2 className="text-2xl font-bold text-center mb-6">
          {isSignup ? 'Create Account' : 'Sign In'}
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Loading...' : (isSignup ? 'Sign Up' : 'Sign In')}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Or continue with
        </div>

        <Button
          type="button"
          className="w-full mt-4 flex items-center justify-center space-x-2"
          variant="outline"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <FcGoogle className="h-5 w-5" />
          <span>Sign in with Google</span>
        </Button>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setIsSignup(!isSignup)}
            className="text-blue-600 hover:underline text-sm"
          >
            {isSignup ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </button>
        </div>
      </Card>
    </div>
  );
}