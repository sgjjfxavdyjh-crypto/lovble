import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signIn: (identifier: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
  profile: any;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }
      
      setProfile(data);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          fetchProfile(session.user.id);
        }, 0);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });

    if (error) {
      toast.error(error.message);
      return { error };
    }

    // محاولة تسجيل الدخول مباشرةً باستخدام كلمة المرور (تحقق من قاعدة البيانات)
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      toast.error(signInError.message);
      return { error: signInError };
    }

    try {
      if (data.user) {
        await supabase.from('profiles').upsert({ id: data.user.id, name, role: 'client', email });
      }
    } catch (e) {
      // قد تفشل إذا لم توجد صلاحيات/جدول - لا نوقف التدفق
    }

    toast.success('تم إنشاء الحساب وتسجيل الدخول بنجاح');
    return { error: null };
  };

  const signIn = async (identifier: string, password: string) => {
    // identifier can be username or email. Attempt to resolve to email via profiles table.
    let emailToUse: string | null = null;

    try {
      // try to find by username (column 'username')
      let { data: profile, error } = await supabase
        .from('profiles')
        .select('id,email,name,username')
        .or(`username.eq.${identifier},name.eq.${identifier}`)
        .maybeSingle();

      if (!error && profile) {
        if ((profile as any).email) emailToUse = (profile as any).email;
      }
    } catch (e) {
      // ignore
    }

    // if identifier looks like an email, use it directly
    if (!emailToUse && identifier.includes('@')) {
      emailToUse = identifier;
    }

    if (!emailToUse) {
      const msg = 'لم أتمكن من العثور على بريد مرتبط باسم المستخدم.';
      toast.error(msg);
      return { error: new Error(msg) };
    }

    const { error } = await supabase.auth.signInWithPassword({ email: emailToUse, password });

    if (error) {
      toast.error(error.message);
      return { error };
    }

    toast.success('مرحباً بك!');
    return { error: null };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('تم تسجيل الخروج بنجاح');
    }
  };

  const isAdmin = profile?.role === 'admin';

  const value: AuthContextType = {
    user,
    session,
    signUp,
    signIn,
    signOut,
    loading,
    profile,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
