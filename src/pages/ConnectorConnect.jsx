import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ExternalLink, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ConnectorConnect() {
  const location = useLocation();
  const navigate = useNavigate();
  const connector = location.state?.connector;

  const [connecting, setConnecting] = useState(false);
  const [existingConnection, setExistingConnection] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [instanceUrl, setInstanceUrl] = useState('');

  useEffect(() => {
    if (!connector) {
      navigate('/integrations/platform');
      return;
    }

    loadExistingConnection();

    const handleMessage = (event) => {
      if (event.data?.type === 'connector-oauth-success') {
        handleOAuthSuccess(event.data);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [connector]);

  const loadExistingConnection = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('connected_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('connector_id', connector.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setExistingConnection(data);
      }
    } catch (error) {
      console.error('Error loading connection:', error);
    }
  };

  const handleOAuth2Connect = () => {
    setConnecting(true);

    const { data: { user } } = supabase.auth.getUser();

    const authUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/connector-oauth/authorize?connector=${connector.name}&user_id=${user?.id}`;

    const width = 600;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    window.open(
      authUrl,
      'connector-oauth',
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  const handleOAuthSuccess = async (eventData) => {
    try {
      const connectionData = JSON.parse(atob(eventData.data));

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', user.id)
        .maybeSingle();

      const expiresAt = connectionData.expires_in
        ? new Date(Date.now() + connectionData.expires_in * 1000).toISOString()
        : null;

      const saveData = {
        user_id: user.id,
        company_id: profile?.company_id,
        connector_id: connector.id,
        access_token: connectionData.access_token,
        refresh_token: connectionData.refresh_token,
        token_type: connectionData.token_type,
        expires_at: expiresAt,
        scope: connectionData.scope,
        external_user_id: connectionData.external_user_id,
        external_email: connectionData.external_email,
        external_display_name: connectionData.external_display_name,
        instance_url: connectionData.instance_url,
        status: 'connected',
      };

      if (existingConnection) {
        const { error } = await supabase
          .from('connected_accounts')
          .update(saveData)
          .eq('id', existingConnection.id);

        if (error) throw error;
        toast.success('Connection updated successfully');
      } else {
        const { error } = await supabase
          .from('connected_accounts')
          .insert([saveData]);

        if (error) throw error;
        toast.success(`${connector.display_name} connected successfully`);
      }

      setConnecting(false);
      loadExistingConnection();

    } catch (error) {
      console.error('Error saving connection:', error);
      toast.error('Failed to save connection');
      setConnecting(false);
    }
  };

  const handleApiKeyConnect = async () => {
    if (!apiKey) {
      toast.error('API key is required');
      return;
    }

    if (connector.name === 'moodle' && !instanceUrl) {
      toast.error('Moodle instance URL is required');
      return;
    }

    try {
      setConnecting(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', user.id)
        .maybeSingle();

      const saveData = {
        user_id: user.id,
        company_id: profile?.company_id,
        connector_id: connector.id,
        access_token: apiKey,
        token_type: 'Bearer',
        instance_url: instanceUrl || connector.base_url,
        status: 'connected',
      };

      if (existingConnection) {
        const { error } = await supabase
          .from('connected_accounts')
          .update(saveData)
          .eq('id', existingConnection.id);

        if (error) throw error;
        toast.success('Connection updated successfully');
      } else {
        const { error } = await supabase
          .from('connected_accounts')
          .insert([saveData]);

        if (error) throw error;
        toast.success(`${connector.display_name} connected successfully`);
      }

      loadExistingConnection();

    } catch (error) {
      console.error('Error connecting:', error);
      toast.error('Failed to connect');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!existingConnection) return;

    if (!confirm('Are you sure you want to disconnect? This will stop all related flows.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('connected_accounts')
        .delete()
        .eq('id', existingConnection.id);

      if (error) throw error;

      toast.success('Disconnected successfully');
      setExistingConnection(null);

    } catch (error) {
      console.error('Error disconnecting:', error);
      toast.error('Failed to disconnect');
    }
  };

  if (!connector) {
    return null;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate('/integrations/platform')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Platform
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{connector.display_name}</CardTitle>
              <CardDescription className="mt-2">{connector.description}</CardDescription>
            </div>
            {existingConnection && (
              <CheckCircle className="h-8 w-8 text-green-600" />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2">
            <Badge>{connector.type.toUpperCase()}</Badge>
            <Badge variant="outline">{connector.auth_type}</Badge>
            {connector.supports_webhooks && (
              <Badge variant="secondary">Webhooks Supported</Badge>
            )}
          </div>

          {existingConnection && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-green-900 mb-1">Connected Successfully!</p>
                  {existingConnection.external_email && (
                    <p className="text-sm text-green-800">{existingConnection.external_email}</p>
                  )}
                  {existingConnection.external_display_name && (
                    <p className="text-sm text-green-700">{existingConnection.external_display_name}</p>
                  )}
                  <p className="text-xs text-green-600 mt-2">
                    Connected on {new Date(existingConnection.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {connector.auth_type === 'oauth2' ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">Connect with one click!</p>
                    <p className="text-blue-800">
                      Securely connect your {connector.display_name} account using OAuth.
                      Your credentials are never stored in our system.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full"
                onClick={handleOAuth2Connect}
                disabled={connecting}
              >
                {connecting ? 'Connecting...' : existingConnection ? 'Reconnect' : `Connect ${connector.display_name}`}
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">API Key Authentication</p>
                    <p className="text-blue-800">
                      Enter your {connector.display_name} API key to connect.
                    </p>
                  </div>
                </div>
              </div>

              {connector.name === 'moodle' && (
                <div>
                  <Label htmlFor="instanceUrl">Moodle Instance URL</Label>
                  <Input
                    id="instanceUrl"
                    type="url"
                    placeholder="https://your-moodle-site.com"
                    value={instanceUrl}
                    onChange={(e) => setInstanceUrl(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    The full URL to your Moodle installation
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="apiKey">API Key / Token</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Enter your API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>

              <Button
                size="lg"
                className="w-full"
                onClick={handleApiKeyConnect}
                disabled={connecting}
              >
                {connecting ? 'Connecting...' : existingConnection ? 'Update API Key' : 'Connect'}
              </Button>
            </div>
          )}

          {existingConnection && (
            <div className="pt-4 border-t">
              <Button
                variant="destructive"
                onClick={handleDisconnect}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            </div>
          )}

          {connector.documentation_url && (
            <div className="pt-4 border-t">
              <a
                href={connector.documentation_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                View API Documentation
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {existingConnection && (
        <Card>
          <CardHeader>
            <CardTitle>Available Actions & Triggers</CardTitle>
            <CardDescription>
              What you can do with this connector
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {connector.triggers && connector.triggers.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Triggers</h4>
                <div className="grid gap-2">
                  {connector.triggers.map((trigger, idx) => (
                    <div key={idx} className="bg-gray-50 rounded p-3">
                      <p className="font-medium text-sm">{trigger.name}</p>
                      <p className="text-xs text-gray-600">{trigger.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {connector.actions && connector.actions.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Actions</h4>
                <div className="grid gap-2">
                  {connector.actions.map((action, idx) => (
                    <div key={idx} className="bg-gray-50 rounded p-3">
                      <p className="font-medium text-sm">{action.name}</p>
                      <p className="text-xs text-gray-600">{action.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
