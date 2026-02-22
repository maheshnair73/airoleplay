import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Loader2 } from 'lucide-react';
import CorporateAuthMessage from './CorporateAuth';

export default function AuthWrapper({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);
            } catch (error) {
                // For preview purposes, create a mock user
                setUser({
                    email: 'demo@preview.com',
                    name: 'Demo User',
                    role: 'user'
                });
            } finally {
                setIsLoading(false);
            }
        };
        checkAuth();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            </div>
        );
    }

    if (!user) {
        return <CorporateAuthMessage />;
    }

    return children;
}