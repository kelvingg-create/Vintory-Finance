import { useNavigate } from 'react-router-dom';
import { authClient, useSession } from '../lib/auth-client';

/**
 * Hook to get the current session
 */
export { useSession };

/**
 * Hook for sign in
 */
export function useSignIn() {
  const navigate = useNavigate();

  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    const result = await authClient.signIn.email({
      email,
      password,
      rememberMe,
    });

    if (result.error) {
      throw new Error(result.error.message || 'Sign in failed');
    }

    navigate('/dashboard');
    return result.data;
  };

  return { signIn };
}

/**
 * Hook for sign up
 */
export function useSignUp() {
  const navigate = useNavigate();

  const signUp = async (email: string, password: string, name: string) => {
    const result = await authClient.signUp.email({
      email,
      password,
      name,
    });

    if (result.error) {
      throw new Error(result.error.message || 'Sign up failed');
    }

    navigate('/dashboard');
    return result.data;
  };

  return { signUp };
}

/**
 * Hook for sign out
 */
export function useSignOut() {
  const navigate = useNavigate();

  const signOut = async () => {
    await authClient.signOut();
    navigate('/');
  };

  return { signOut };
}
