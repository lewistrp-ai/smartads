import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null); // 'workshop', 'pro', 'client', 'admin'
    const [plan, setPlan] = useState(null); // 'free', 'pro', 'agency'
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Get current session from Supabase
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchUserProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // 2. Listen for auth changes (login, logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchUserProfile(session.user.id);
            } else {
                setRole(null);
                setPlan(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchUserProfile = async (userId) => {
        try {
            // Assuming you have a 'users' table in Supabase holding the role and plan
            const { data, error } = await supabase
                .from('users')
                .select('role, plan')
                .eq('id', userId)
                .single();

            if (error) throw error;

            setRole(data?.role || 'workshop');
            setPlan(data?.plan || 'free');
        } catch (error) {
            console.error('Error fetching user profile:', error);
            // Fallbacks
            setRole('workshop');
        } finally {
            setLoading(false);
        }
    };

    const signIn = async (email, password) => {
        return supabase.auth.signInWithPassword({ email, password });
    };

    const signUp = async (email, password) => {
        return supabase.auth.signUp({ email, password });
    };

    const signOut = async () => {
        return supabase.auth.signOut();
    };

    const value = {
        user,
        role,
        plan,
        signIn,
        signUp,
        signOut,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
