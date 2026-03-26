import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plug,
  Plus,
  Activity,
  Users,
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle,
  Database,
  Mail,
  GraduationCap,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

export default function IntegrationPlatform() {
  const navigate = useNavigate();
  const [connectors, setConnectors] = useState([]);
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalConnectors: 0,
    activeConnections: 0,
    activeFlows: 0,
    totalExecutions: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [connectorsRes, accountsRes, flowsRes] = await Promise.all([
        supabase.from('connectors').select('*').eq('status', 'active').order('type'),
        supabase.from('connected_accounts').select('*').eq('status', 'connected'),
        supabase.from('integration_flows').select('*').order('created_at', { ascending: false }),
      ]);

      if (connectorsRes.error) throw connectorsRes.error;
      if (accountsRes.error) throw accountsRes.error;
      if (flowsRes.error) throw flowsRes.error;

      setConnectors(connectorsRes.data || []);
      setConnectedAccounts(accountsRes.data || []);
      setFlows(flowsRes.data || []);

      const totalExecutions = flowsRes.data?.reduce((sum, flow) => sum + (flow.execution_count || 0), 0) || 0;

      setStats({
        totalConnectors: connectorsRes.data?.length || 0,
        activeConnections: accountsRes.data?.length || 0,
        activeFlows: flowsRes.data?.filter(f => f.status === 'active').length || 0,
        totalExecutions,
      });

    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load integration platform data');
    } finally {
      setLoading(false);
    }
  };

  const getConnectorIcon = (type) => {
    switch (type) {
      case 'crm':
        return <Users className="h-5 w-5" />;
      case 'lms':
        return <GraduationCap className="h-5 w-5" />;
      case 'auth':
        return <Plug className="h-5 w-5" />;
      case 'communication':
        return <Mail className="h-5 w-5" />;
      default:
        return <Database className="h-5 w-5" />;
    }
  };

  const getConnectorsByType = (type) => {
    return connectors.filter(c => c.type === type);
  };

  const isConnectorConnected = (connectorId) => {
    return connectedAccounts.some(acc => acc.connector_id === connectorId);
  };

  const handleConnectClick = (connector) => {
    navigate('/integrations/connect', { state: { connector } });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading integration platform...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="h-8 w-8 text-blue-600" />
            Integration Platform
          </h1>
          <p className="text-gray-600 mt-1">
            Connect your favorite apps and automate workflows
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/integrations/flows/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Flow
          </Button>
          <Button variant="outline" onClick={() => navigate('/integrations/flows')}>
            <Activity className="h-4 w-4 mr-2" />
            View Flows
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Available Connectors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalConnectors}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.activeConnections}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Flows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.activeFlows}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Executions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats.totalExecutions}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Connectors</TabsTrigger>
          <TabsTrigger value="crm">CRM</TabsTrigger>
          <TabsTrigger value="lms">LMS</TabsTrigger>
          <TabsTrigger value="auth">Auth & Productivity</TabsTrigger>
          <TabsTrigger value="connected">Connected</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          <ConnectorGrid
            connectors={connectors}
            isConnectorConnected={isConnectorConnected}
            handleConnectClick={handleConnectClick}
            getConnectorIcon={getConnectorIcon}
          />
        </TabsContent>

        <TabsContent value="crm" className="space-y-4 mt-6">
          <ConnectorGrid
            connectors={getConnectorsByType('crm')}
            isConnectorConnected={isConnectorConnected}
            handleConnectClick={handleConnectClick}
            getConnectorIcon={getConnectorIcon}
          />
        </TabsContent>

        <TabsContent value="lms" className="space-y-4 mt-6">
          <ConnectorGrid
            connectors={getConnectorsByType('lms')}
            isConnectorConnected={isConnectorConnected}
            handleConnectClick={handleConnectClick}
            getConnectorIcon={getConnectorIcon}
          />
        </TabsContent>

        <TabsContent value="auth" className="space-y-4 mt-6">
          <ConnectorGrid
            connectors={getConnectorsByType('auth')}
            isConnectorConnected={isConnectorConnected}
            handleConnectClick={handleConnectClick}
            getConnectorIcon={getConnectorIcon}
          />
        </TabsContent>

        <TabsContent value="connected" className="space-y-4 mt-6">
          <ConnectorGrid
            connectors={connectors.filter(c => isConnectorConnected(c.id))}
            isConnectorConnected={isConnectorConnected}
            handleConnectClick={handleConnectClick}
            getConnectorIcon={getConnectorIcon}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ConnectorGrid({ connectors, isConnectorConnected, handleConnectClick, getConnectorIcon }) {
  if (connectors.length === 0) {
    return (
      <div className="text-center py-12">
        <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No connectors found in this category</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {connectors.map((connector) => {
        const isConnected = isConnectorConnected(connector.id);

        return (
          <Card key={connector.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    {getConnectorIcon(connector.type)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{connector.display_name}</CardTitle>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {connector.type.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                {isConnected && (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4 min-h-[40px]">
                {connector.description}
              </CardDescription>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Auth Type:</span>
                  <Badge variant="outline">{connector.auth_type}</Badge>
                </div>
                {connector.supports_webhooks && (
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <Zap className="h-4 w-4" />
                    <span>Supports Webhooks</span>
                  </div>
                )}
              </div>

              <Button
                className="w-full"
                variant={isConnected ? 'outline' : 'default'}
                onClick={() => handleConnectClick(connector)}
              >
                {isConnected ? 'Manage Connection' : 'Connect'}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
