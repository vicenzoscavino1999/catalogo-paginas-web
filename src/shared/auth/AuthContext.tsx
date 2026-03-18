import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/shared/auth/supabase";
import type { AppRole, AuthProfile } from "@/shared/auth/types";

interface AuthActionResult {
  error: string | null;
}

interface AuthContextValue {
  isConfigured: boolean;
  isLoading: boolean;
  session: Session | null;
  user: User | null;
  profile: AuthProfile | null;
  role: AppRole | null;
  canAccessWorkspace: boolean;
  signIn: (email: string, password: string) => Promise<AuthActionResult>;
  signUp: (email: string, password: string) => Promise<AuthActionResult>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const defaultContextValue: AuthContextValue = {
  isConfigured: isSupabaseConfigured,
  isLoading: false,
  session: null,
  user: null,
  profile: null,
  role: null,
  canAccessWorkspace: false,
  signIn: async () => ({ error: "Supabase no esta configurado." }),
  signUp: async () => ({ error: "Supabase no esta configurado." }),
  signOut: async () => undefined,
  refreshProfile: async () => undefined,
};

const AuthContext = createContext<AuthContextValue>(defaultContextValue);

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function readProfile(userId: string) {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, role, created_at")
    .eq("id", userId)
    .maybeSingle<AuthProfile>();

  if (error) {
    console.error("No se pudo leer el perfil auth:", error.message);
    return null;
  }

  return data;
}

async function readProfileWithRetry(userId: string) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const profile = await readProfile(userId);

    if (profile) {
      return profile;
    }

    await wait(250 * (attempt + 1));
  }

  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);

  const refreshProfile = useCallback(async () => {
    if (!supabase || !user) {
      setProfile(null);
      return;
    }

    const nextProfile = await readProfileWithRetry(user.id);
    setProfile(nextProfile);
  }, [user]);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    const authClient = supabase;
    let isActive = true;

    async function bootstrap() {
      setIsLoading(true);

      const {
        data: { session: currentSession },
      } = await authClient.auth.getSession();

      if (!isActive) {
        return;
      }

      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        const nextProfile = await readProfileWithRetry(currentSession.user.id);

        if (!isActive) {
          return;
        }

        setProfile(nextProfile);
      } else {
        setProfile(null);
      }

      if (isActive) {
        setIsLoading(false);
      }
    }

    void bootstrap();

    const {
      data: { subscription },
    } = authClient.auth.onAuthStateChange((_event, nextSession) => {
      void (async () => {
        if (!isActive) {
          return;
        }

        setSession(nextSession);
        setUser(nextSession?.user ?? null);

        if (nextSession?.user) {
          const nextProfile = await readProfileWithRetry(nextSession.user.id);

          if (!isActive) {
            return;
          }

          setProfile(nextProfile);
        } else {
          setProfile(null);
        }

        if (isActive) {
          setIsLoading(false);
        }
      })();
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const role = profile?.role ?? null;

    return {
      isConfigured: isSupabaseConfigured,
      isLoading,
      session,
      user,
      profile,
      role,
      canAccessWorkspace: role === "admin" || role === "editor",
      signIn: async (email, password) => {
        if (!supabase) {
          return { error: "Supabase no esta configurado." };
        }

        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        return { error: error?.message ?? null };
      },
      signUp: async (email, password) => {
        if (!supabase) {
          return { error: "Supabase no esta configurado." };
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        return { error: error?.message ?? null };
      },
      signOut: async () => {
        if (!supabase) {
          return;
        }

        await supabase.auth.signOut();
      },
      refreshProfile,
    };
  }, [isLoading, profile, refreshProfile, session, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
