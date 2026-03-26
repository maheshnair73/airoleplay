import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowLeft,
  Plus,
  Play,
  Pause,
  Edit,
  Trash2,
  MoreVertical,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function IntegrationFlows() {
  const navigate = useNavigate();
  const [flows, setFlows] = useState([]);
  const [connectors, setConnectors] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFlows();
  }, []);

  const loadFlows = async () => {
    try {
      setLoading(true);

      const [flowsRes, connectorsRes] = await Promise.all([
        supabase
          .from('integration_flows')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('connectors')
          .select('*'),
      ]);

      if (flowsRes.error) throw flowsRes.error;
      if (connectorsRes.error) throw connectorsRes.error;

      setFlows(flowsRes.data || []);

      const connectorsMap = {};
      (connectorsRes.data || []).forEach(c => {
        connectorsMap[c.id] = c;
      });
      setConnectors(connectorsMap);

    } catch (error) {
      console.error('Error loading flows:', error);
      toast.error('Failed to load flows');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (flowId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

      const { error } = await supabase
        .from('integration_flows')
        .update({ status: newStatus })
        .eq('id', flowId);

      if (error) throw error;

      toast.success(`Flow ${newStatus === 'active' ? 'activated' : 'paused'}`);
      loadFlows();

    } catch (error) {
      console.error('Error toggling flow status:', error);
      toast.error('Failed to update flow status');
    }
  };

  const handleDelete = async (flowId) => {
    if (!confirm('Are you sure you want to delete this flow? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('integration_flows')
        .delete()
        .eq('id', flowId);

      if (error) throw error;

      toast.success('Flow deleted successfully');
      loadFlows();

    } catch (error) {
      console.error('Error deleting flow:', error);
      toast.error('Failed to delete flow');
    }
  };

  const handleTestFlow = async (flowId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/flow-executor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flow_id: flowId,
          trigger_data: { test: true, timestamp: new Date().toISOString() },
        }),
      });

      if (!response.ok) {
        throw new Error('Flow execution failed');
      }

      const result = await response.json();

      if (result.success) {
        toast.success(`Flow executed successfully in ${result.execution_time_ms}ms`);
      } else {
        toast.error('Flow execution completed with errors');
      }

    } catch (error) {
      console.error('Error testing flow:', error);
      toast.error('Failed to execute flow');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: { variant: 'default', icon: CheckCircle, text: 'Active' },
      inactive: { variant: 'secondary', icon: Pause, text: 'Inactive' },
      error: { variant: 'destructive', icon: XCircle, text: 'Error' },
      draft: { variant: 'outline', icon: AlertCircle, text: 'Draft' },
    };

    const config = variants[status] || variants.draft;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading flows...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Button variant="ghost" onClick={() => navigate('/integrations/platform')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Platform
          </Button>
          <h1 className="text-3xl font-bold mt-4">Integration Flows</h1>
          <p className="text-gray-600 mt-1">Manage your automation workflows</p>
        </div>
        <Button onClick={() => navigate('/integrations/flows/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Flow
        </Button>
      </div>

      {flows.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No flows yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first automation flow to connect your apps
              </p>
              <Button onClick={() => navigate('/integrations/flows/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Flow
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Flows</CardTitle>
            <CardDescription>
              {flows.length} {flows.length === 1 ? 'flow' : 'flows'} configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Executions</TableHead>
                  <TableHead className="text-right">Success Rate</TableHead>
                  <TableHead className="text-right">Last Run</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flows.map((flow) => {
                  const triggerConnector = connectors[flow.trigger_connector_id];
                  const successRate = flow.execution_count > 0
                    ? Math.round((flow.success_count / flow.execution_count) * 100)
                    : 0;

                  return (
                    <TableRow key={flow.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{flow.name}</p>
                          {flow.description && (
                            <p className="text-sm text-gray-500">{flow.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {triggerConnector && (
                            <>
                              <span className="text-sm font-medium">
                                {triggerConnector.display_name}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {flow.trigger_type}
                              </Badge>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(flow.status)}</TableCell>
                      <TableCell className="text-right">{flow.execution_count || 0}</TableCell>
                      <TableCell className="text-right">
                        {flow.execution_count > 0 ? (
                          <span className={successRate >= 90 ? 'text-green-600' : successRate >= 70 ? 'text-yellow-600' : 'text-red-600'}>
                            {successRate}%
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-sm text-gray-600">
                        {flow.last_execution_at
                          ? new Date(flow.last_execution_at).toLocaleDateString()
                          : 'Never'}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/integrations/flows/${flow.id}/edit`)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleTestFlow(flow.id)}>
                              <Play className="h-4 w-4 mr-2" />
                              Test Run
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(flow.id, flow.status)}>
                              {flow.status === 'active' ? (
                                <>
                                  <Pause className="h-4 w-4 mr-2" />
                                  Pause
                                </>
                              ) : (
                                <>
                                  <Play className="h-4 w-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(flow.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
