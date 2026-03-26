import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Zap,
  Play,
  Save,
  Settings,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';

export default function FlowBuilder() {
  const { flowId } = useParams();
  const navigate = useNavigate();

  const [flowName, setFlowName] = useState('');
  const [flowDescription, setFlowDescription] = useState('');
  const [triggerConnector, setTriggerConnector] = useState('');
  const [triggerType, setTriggerType] = useState('');
  const [steps, setSteps] = useState([]);
  const [connectors, setConnectors] = useState([]);
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedStep, setExpandedStep] = useState(null);

  useEffect(() => {
    loadData();
  }, [flowId]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [connectorsRes, accountsRes] = await Promise.all([
        supabase.from('connectors').select('*').eq('status', 'active'),
        supabase.from('connected_accounts').select('*, connectors(*)').eq('status', 'connected'),
      ]);

      if (connectorsRes.error) throw connectorsRes.error;
      if (accountsRes.error) throw accountsRes.error;

      setConnectors(connectorsRes.data || []);
      setConnectedAccounts(accountsRes.data || []);

      if (flowId) {
        const { data: flow, error } = await supabase
          .from('integration_flows')
          .select('*, integration_flow_steps(*)')
          .eq('id', flowId)
          .maybeSingle();

        if (error) throw error;
        if (flow) {
          setFlowName(flow.name);
          setFlowDescription(flow.description || '');
          setTriggerConnector(flow.trigger_connector_id || '');
          setTriggerType(flow.trigger_type || '');
          setSteps(flow.integration_flow_steps?.sort((a, b) => a.step_order - b.step_order) || []);
        }
      }

    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load flow data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStep = () => {
    const newStep = {
      id: `temp-${Date.now()}`,
      step_order: steps.length + 1,
      step_type: 'action',
      connector_id: '',
      connected_account_id: '',
      action_type: '',
      action_config: {},
      field_mapping: {},
      conditions: [],
      on_error: 'stop',
      retry_count: 3,
    };
    setSteps([...steps, newStep]);
    setExpandedStep(newStep.id);
  };

  const handleRemoveStep = (stepId) => {
    setSteps(steps.filter(s => s.id !== stepId));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(steps);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const reordered = items.map((item, index) => ({
      ...item,
      step_order: index + 1,
    }));

    setSteps(reordered);
  };

  const updateStep = (stepId, updates) => {
    setSteps(steps.map(step =>
      step.id === stepId ? { ...step, ...updates } : step
    ));
  };

  const getConnectedAccountsForConnector = (connectorId) => {
    return connectedAccounts.filter(acc => acc.connector_id === connectorId);
  };

  const getActionsForConnector = (connectorId) => {
    const connector = connectors.find(c => c.id === connectorId);
    return connector?.actions || [];
  };

  const getTriggersForConnector = (connectorId) => {
    const connector = connectors.find(c => c.id === connectorId);
    return connector?.triggers || [];
  };

  const handleSave = async () => {
    if (!flowName || !triggerConnector || !triggerType) {
      toast.error('Please fill in flow name, trigger connector, and trigger type');
      return;
    }

    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', user.id)
        .maybeSingle();

      const flowData = {
        name: flowName,
        description: flowDescription,
        user_id: user.id,
        company_id: profile?.company_id,
        trigger_connector_id: triggerConnector,
        trigger_type: triggerType,
        status: 'active',
      };

      let savedFlowId = flowId;

      if (flowId) {
        const { error } = await supabase
          .from('integration_flows')
          .update(flowData)
          .eq('id', flowId);

        if (error) throw error;

        await supabase
          .from('integration_flow_steps')
          .delete()
          .eq('flow_id', flowId);

      } else {
        const { data, error } = await supabase
          .from('integration_flows')
          .insert([flowData])
          .select()
          .single();

        if (error) throw error;
        savedFlowId = data.id;
      }

      if (steps.length > 0) {
        const stepsToSave = steps.map(step => ({
          flow_id: savedFlowId,
          step_order: step.step_order,
          step_type: step.step_type,
          connector_id: step.connector_id,
          connected_account_id: step.connected_account_id,
          action_type: step.action_type,
          action_config: step.action_config,
          field_mapping: step.field_mapping,
          conditions: step.conditions,
          on_error: step.on_error,
          retry_count: step.retry_count,
        }));

        const { error: stepsError } = await supabase
          .from('integration_flow_steps')
          .insert(stepsToSave);

        if (stepsError) throw stepsError;
      }

      toast.success('Flow saved successfully');
      navigate('/integrations/flows');

    } catch (error) {
      console.error('Error saving flow:', error);
      toast.error('Failed to save flow');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    if (!flowId) {
      toast.error('Please save the flow before testing');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/flow-executor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flow_id: flowId,
          trigger_data: { test: true },
        }),
      });

      if (!response.ok) {
        throw new Error('Flow execution failed');
      }

      const result = await response.json();
      toast.success(`Flow executed ${result.success ? 'successfully' : 'with errors'}`);

    } catch (error) {
      console.error('Error testing flow:', error);
      toast.error('Failed to test flow');
    }
  };

  if (loading && !connectors.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading flow builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={() => navigate('/integrations/flows')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Flows
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleTest} disabled={!flowId}>
            <Play className="h-4 w-4 mr-2" />
            Test Flow
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Flow'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Flow Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="flowName">Flow Name</Label>
            <Input
              id="flowName"
              placeholder="e.g., Salesforce Lead to Moodle User"
              value={flowName}
              onChange={(e) => setFlowName(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="flowDescription">Description</Label>
            <Textarea
              id="flowDescription"
              placeholder="Describe what this flow does..."
              value={flowDescription}
              onChange={(e) => setFlowDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="triggerConnector">Trigger Connector</Label>
              <Select value={triggerConnector} onValueChange={setTriggerConnector}>
                <SelectTrigger>
                  <SelectValue placeholder="Select connector" />
                </SelectTrigger>
                <SelectContent>
                  {connectors.map(connector => (
                    <SelectItem key={connector.id} value={connector.id}>
                      {connector.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="triggerType">Trigger Event</Label>
              <Select
                value={triggerType}
                onValueChange={setTriggerType}
                disabled={!triggerConnector}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select trigger" />
                </SelectTrigger>
                <SelectContent>
                  {getTriggersForConnector(triggerConnector).map(trigger => (
                    <SelectItem key={trigger.id} value={trigger.id}>
                      {trigger.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Flow Steps</CardTitle>
            <Button onClick={handleAddStep}>
              <Plus className="h-4 w-4 mr-2" />
              Add Step
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {steps.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No steps added yet. Click "Add Step" to get started.</p>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="steps">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-3"
                  >
                    {steps.map((step, index) => (
                      <Draggable key={step.id} draggableId={step.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="bg-white border rounded-lg"
                          >
                            <div className="flex items-center gap-3 p-4">
                              <div {...provided.dragHandleProps}>
                                <GripVertical className="h-5 w-5 text-gray-400" />
                              </div>

                              <Badge>{step.step_order}</Badge>

                              <div className="flex-1">
                                <p className="font-medium">
                                  {step.action_type || 'Configure action'}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {connectors.find(c => c.id === step.connector_id)?.display_name || 'Select connector'}
                                </p>
                              </div>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                              >
                                {expandedStep === step.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveStep(step.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>

                            {expandedStep === step.id && (
                              <div className="border-t p-4 space-y-4 bg-gray-50">
                                <div>
                                  <Label>Connector</Label>
                                  <Select
                                    value={step.connector_id}
                                    onValueChange={(value) => updateStep(step.id, { connector_id: value, connected_account_id: '', action_type: '' })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select connector" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {connectors.map(connector => (
                                        <SelectItem key={connector.id} value={connector.id}>
                                          {connector.display_name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                {step.connector_id && (
                                  <div>
                                    <Label>Connected Account</Label>
                                    <Select
                                      value={step.connected_account_id}
                                      onValueChange={(value) => updateStep(step.id, { connected_account_id: value })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select account" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {getConnectedAccountsForConnector(step.connector_id).map(account => (
                                          <SelectItem key={account.id} value={account.id}>
                                            {account.external_email || account.external_display_name || 'Connected Account'}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}

                                {step.connector_id && (
                                  <div>
                                    <Label>Action</Label>
                                    <Select
                                      value={step.action_type}
                                      onValueChange={(value) => updateStep(step.id, { action_type: value })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select action" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {getActionsForConnector(step.connector_id).map(action => (
                                          <SelectItem key={action.id} value={action.id}>
                                            {action.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}

                                <div>
                                  <Label>On Error</Label>
                                  <Select
                                    value={step.on_error}
                                    onValueChange={(value) => updateStep(step.id, { on_error: value })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="stop">Stop Flow</SelectItem>
                                      <SelectItem value="continue">Continue</SelectItem>
                                      <SelectItem value="retry">Retry</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
