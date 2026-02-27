import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import CorporateAuthMessage from './CorporateAuth';

export default function AuthWrapper({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (session) {
                    const currentUser = await User.me();
                    setUser(currentUser);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Auth check error:', error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                try {
                    const currentUser = await User.me();
                    setUser(currentUser);
                } catch (error) {
                    console.error('Failed to load user profile:', error);
                    setUser(null);
                }
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
            }
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!user) {
        return <CorporateAuthMessage />;
    }

    return children;
}
