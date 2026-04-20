import React, { useState, useEffect } from 'react';
import { localAuth } from '@/lib/localAuth';
import { Loader2 } from 'lucide-react';
import CorporateAuth from './CorporateAuth';

export default function AuthWrapper({ children }) {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    localAuth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = localAuth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') setUser(session?.user ?? null);
      if (event === 'SIGNED_OUT') setUser(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user) return <CorporateAuth />;

  return children;
}
