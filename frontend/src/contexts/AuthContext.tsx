import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
// Import AxiosError and isAxiosError directly from axios
import { isAxiosError, AxiosError } from 'axios';
// Import our configured axios instance
import configuredAxiosInstance from '../setupAxios';

// Define the key used for storing the JWT token in localStorage
const JWT_TOKEN_STORAGE_KEY = 'aegisAuthToken';
// const USER_ID_STORAGE_KEY = 'aegisUserId'; // REMOVED

interface User {
  id: number;
  username: string;
  email?: string; // Email might come from /me endpoint
  role: string;
}

// Interface for the actual API response for login/session (/api/me)
interface UserApiResponse {
  user: User;
  message?: string;
}

// Interface for the login API response (/api/login)
interface LoginApiResponse {
  token: string;
  user: User;
  message?: string;
}

// Interface for the register API response (/api/register)
// Backend register returns: { message: string, user: { id, username, email, role } }
// It does NOT return a token - user must log in after registering.
interface RegisterApiResponse {
    message: string;
    user: User; // User info without token
}


export interface AuthContextType {
  user: User | null;
  token: string | null; // Added token state
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  // Register now just completes registration, doesn't log in. Returns message, not user.
  register: (username: string, email: string, password: string) => Promise<string>;
  logout: () => Promise<void>;
  updatePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider: Provides authentication context to the entire frontend
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null); // Added token state
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Check for stored JWT token on initial load
  useEffect(() => {
    const checkStoredToken = async () => {
      setLoading(true);
      clearError();
      const storedToken = localStorage.getItem(JWT_TOKEN_STORAGE_KEY);

      if (storedToken) {
        console.log('Found stored JWT token.');
        try {
          // Use our configured instance for requests
          const response = await configuredAxiosInstance.get<UserApiResponse>('/api/me');
          if (response.data && response.data.user) {
              console.log('Successfully validated token and fetched user data:', response.data.user);
              setUser(response.data.user);
              setToken(storedToken); // Set token state since it's valid
          } else {
              console.warn('Stored token found, but failed to fetch user data or token invalid.');
              localStorage.removeItem(JWT_TOKEN_STORAGE_KEY); // Clear invalid stored token
              setUser(null);
              setToken(null);
              throw new Error('Failed to fetch user data or token invalid.');
          }
        } catch (err) {
          let errorMessage = 'An unknown error occurred while validating the token.';
          if (isAxiosError(err)) {
            const axiosError = err as AxiosError<{ message?: string }>;
            errorMessage = axiosError.response?.data?.message || axiosError.message || 'Failed to fetch user data.';
            console.error('Axios error validating token or fetching user data:', axiosError.response?.data || axiosError.message);
            if (axiosError.response?.status === 401) {
               console.log('Token expired or invalid, clearing storage.');
               localStorage.removeItem(JWT_TOKEN_STORAGE_KEY);
            }
          } else if (err instanceof Error) {
            errorMessage = err.message;
            console.error('Error validating token or fetching user data:', err.message);
          } else {
             console.error('Non-error thrown while validating token:', err);
          }
          setError(errorMessage);
          setUser(null);
          setToken(null);
          throw err; // Re-throw error for component handling
        }
      } else {
          console.log('No stored JWT token found.');
          setUser(null);
          setToken(null);
      }
      setLoading(false);
    };
    checkStoredToken();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  const login = useCallback(async (username: string, password: string) => {
    setLoading(true);
    clearError();
    try {
      // Use our configured instance for requests
      const response = await configuredAxiosInstance.post<LoginApiResponse>('/api/login', { username, password });
      if (response.data && response.data.user && response.data.token) {
        const loggedInUser = response.data.user;
        const receivedToken = response.data.token;
        setUser(loggedInUser);
        setToken(receivedToken);
        localStorage.setItem(JWT_TOKEN_STORAGE_KEY, receivedToken); // Store JWT token
        console.log('Login successful, stored JWT token.');
      } else {
        throw new Error('Login response did not contain user data or token.');
      }
    } catch (err) { // Use inferred 'unknown' type
      let errorMessage = 'An unknown error occurred during login.';
       if (isAxiosError(err)) {
           const axiosError = err as AxiosError<{ message?: string }>;
           errorMessage = axiosError.response?.data?.message || axiosError.message || 'Login failed. Please check credentials.';
           console.error('Axios error during login:', axiosError.response?.data || axiosError.message);
       } else if (err instanceof Error) {
           errorMessage = err.message;
           console.error('Error during login:', err.message);
       } else {
           console.error('Non-error thrown during login:', err);
       }
      setError(errorMessage);
      localStorage.removeItem(JWT_TOKEN_STORAGE_KEY); // Clear any potentially stored token on failure
      setUser(null);
      setToken(null);
      throw err; // Re-throw error for component handling
    } finally {
      setLoading(false);
    }
  }, [clearError]);

  // Register creates the user but does NOT log them in (no token returned)
  const register = useCallback(async (username: string, email: string, password: string): Promise<string> => {
    setLoading(true);
    clearError();
    // Clear any existing auth state immediately on registration attempt
    localStorage.removeItem(JWT_TOKEN_STORAGE_KEY);
    setUser(null);
    setToken(null);
    try {
      // Use our configured instance for requests
      const response = await configuredAxiosInstance.post<RegisterApiResponse>('/api/register', { username, email, password });
        if (response.data && response.data.message) {
            console.log('Registration successful:', response.data.message);
            // Do NOT set user state or store token here. User must log in separately.
            return response.data.message; // Return success message
        } else {
            throw new Error('Registration response missing message.');
        }
    } catch (err) { // Use inferred 'unknown' type
       let errorMessage = 'An unknown error occurred during registration.';
       if (isAxiosError(err)) {
           const axiosError = err as AxiosError<{ message?: string }>;
           errorMessage = axiosError.response?.data?.message || axiosError.message || 'Registration failed.';
           console.error('Axios error during registration:', axiosError.response?.data || axiosError.message);
       } else if (err instanceof Error) {
           errorMessage = err.message;
            console.error('Error during registration:', err.message);
       } else {
           console.error('Non-error thrown during registration:', err);
       }
      setError(errorMessage);
      throw err; // Re-throw error for component handling
    } finally {
      setLoading(false);
    }
  }, [clearError]);

  const logout = useCallback(async () => {
    console.log('Logout initiated');
    const currentToken = localStorage.getItem(JWT_TOKEN_STORAGE_KEY);
    // Optional: Call backend logout endpoint (it's a no-op, doesn't need token)
    if (currentToken) {
        try {
             // Use our configured instance for requests
             await configuredAxiosInstance.post('/api/logout');
             console.log('Backend logout endpoint called (optional).');
        } catch (err) { // Use inferred 'unknown' type
            // Don't block logout if this fails, just log the error
            if (isAxiosError(err)) {
                const axiosError = err as AxiosError<{ message?: string }>;
                console.error('Axios error calling backend logout (optional):', axiosError.response?.data || axiosError.message);
            } else if (err instanceof Error) {
                 console.error('Error calling backend logout (optional):', err.message);
            } else {
                 console.error('Non-error thrown calling backend logout (optional):', err);
            }
        }
    }
    // Clear local storage and state regardless of backend call success
    localStorage.removeItem(JWT_TOKEN_STORAGE_KEY); // Clear stored JWT token
    setUser(null); // Clear user state
    setToken(null); // Clear token state
    clearError(); // Clear any previous errors
    console.log('User logged out (localStorage cleared).');
  }, [clearError]);

 const updatePassword = useCallback(async (oldPassword: string, newPassword: string) => {
    setLoading(true);
    clearError();
    try {
        // Use our configured instance for requests
        await configuredAxiosInstance.put('/api/update-password', { oldPassword, newPassword });
        console.log('Password update request sent successfully.');
        // Potentially show a success message to the user
        // No need to update user/token state here
    } catch (err) { // Use inferred 'unknown' type
        let errorMessage = 'An unknown error occurred during password update.';
        if (isAxiosError(err)) {
            const axiosError = err as AxiosError<{ message?: string }>;
            errorMessage = axiosError.response?.data?.message || axiosError.message || 'Password update failed.';
            console.error('Axios error during password update:', axiosError.response?.data || axiosError.message);
        } else if (err instanceof Error) {
            errorMessage = err.message;
            console.error('Error during password update:', err.message);
        } else {
            console.error('Non-error thrown during password update:', err);
        }
      setError(errorMessage);
      throw err; // Re-throw error for component handling
    } finally {
      setLoading(false);
    }
 }, [clearError]);


  // Context value provided to consumers
  const value: AuthContextType = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    updatePassword,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// useAuth: Custom hook for consuming authentication context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 