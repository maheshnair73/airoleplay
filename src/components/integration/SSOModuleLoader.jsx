import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ExternalLink } from 'lucide-react';

export default function SSOModuleLoader({ 
    targetAppUrl, 
    modulePath = '', 
    title = 'External Module',
    height = '600px' 
}) {
    const [isLoading, setIsLoading] = useState(true);
    const [ssoUrl, setSSOUrl] = useState('');
    const [user, setUser] = useState(null);

    useEffect(() => {
        const setupSSO = async () => {
            try {
                // Get current user for SSO
                const currentUser = await User.me();
                setUser(currentUser);

                // Generate SSO URL with user token
                const token = localStorage.getItem('base44_token') || sessionStorage.getItem('base44_token');
                
                const ssoParams = new URLSearchParams({
                    sso_token: token,
                    user_email: currentUser.email,
                    user_name: currentUser.full_name,
                    return_url: window.location.href
                });

                const fullUrl = `${targetAppUrl}${modulePath}?${ssoParams.toString()}`;
                setSSOUrl(fullUrl);
                setIsLoading(false);

            } catch (error) {
                console.error('SSO setup failed:', error);
                setIsLoading(false);
            }
        };

        setupSSO();
    }, [targetAppUrl, modulePath]);

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <span className="ml-2">Loading module...</span>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{title}</CardTitle>
                <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(ssoUrl, '_blank')}
                >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Open in New Tab
                </Button>
            </CardHeader>
            <CardContent className="p-0">
                <iframe
                    src={ssoUrl}
                    className="w-full border-0 rounded-b-lg"
                    style={{ height }}
                    title={title}
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                />
            </CardContent>
        </Card>
    );
}