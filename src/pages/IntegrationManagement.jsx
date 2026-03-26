import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Slack,
  Mail,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Settings,
  Trash2,
  Plus,
  RefreshCw,
  MessageSquare,
  Video,
  Zap
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import SlackIntegrationModal from "@/components/integrations/SlackIntegrationModal";
import OutlookIntegrationModal from "@/components/integrations/OutlookIntegrationModal";
import AITriggerModal from "@/components/integrations/AITriggerModal";

const IntegrationManagement = () => {
  const [connections, setConnections] = useState([]);
  const [triggers, setTriggers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [showSlackModal, setShowSlackModal] = useState(false);
  const [showOutlookModal, setShowOutlookModal] = useState(false);
  const [showTriggerModal, setShowTriggerModal] = useState(false);
  const [selectedTrigger, setSelectedTrigger] = useState(null);

  const integrationTypes = [
    {
      type: "slack",
      name: "Slack",
      icon: Slack,
      description: "Send and receive AI roleplay scenarios via Slack",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      features: ["Push roleplay sessions", "Read messages", "Send notifications"]
    },
    {
      type: "outlook",
      name: "Outlook",
      icon: Mail,
      description: "Analyze emails and trigger AI roleplay preparation",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      features: ["Read emails", "Auto-detect meetings", "Schedule prep sessions"]
    }
  ];

  useEffect(() => {
    loadIntegrations();
    loadTriggers();
  }, []);

  const loadIntegrations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("integration_connections")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setConnections(data || []);
    } catch (error) {
      console.error("Error loading integrations:", error);
      toast.error("Failed to load integrations");
    } finally {
      setLoading(false);
    }
  };

  const loadTriggers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("ai_roleplay_triggers")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTriggers(data || []);
    } catch (error) {
      console.error("Error loading triggers:", error);
    }
  };

  const getConnectionStatus = (type) => {
    const connection = connections.find(c => c.integration_type === type);
    return connection?.status || "disconnected";
  };

  const getConnectionId = (type) => {
    const connection = connections.find(c => c.integration_type === type);
    return connection?.id;
  };

  const handleConnect = (type) => {
    if (type === "slack") {
      setShowSlackModal(true);
    } else if (type === "outlook") {
      setShowOutlookModal(true);
    }
  };

  const handleDisconnect = async (type) => {
    try {
      const connection = connections.find(c => c.integration_type === type);
      if (!connection) return;

      const { error } = await supabase
        .from("integration_connections")
        .delete()
        .eq("id", connection.id);

      if (error) throw error;

      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} disconnected`);
      loadIntegrations();
    } catch (error) {
      console.error("Error disconnecting:", error);
      toast.error("Failed to disconnect integration");
    }
  };

  const handleToggleTrigger = async (triggerId, isActive) => {
    try {
      const { error } = await supabase
        .from("ai_roleplay_triggers")
        .update({ is_active: isActive })
        .eq("id", triggerId);

      if (error) throw error;

      setTriggers(triggers.map(t =>
        t.id === triggerId ? { ...t, is_active: isActive } : t
      ));

      toast.success(isActive ? "Trigger enabled" : "Trigger disabled");
    } catch (error) {
      console.error("Error toggling trigger:", error);
      toast.error("Failed to update trigger");
    }
  };

  const handleDeleteTrigger = async (triggerId) => {
    try {
      const { error } = await supabase
        .from("ai_roleplay_triggers")
        .delete()
        .eq("id", triggerId);

      if (error) throw error;

      toast.success("Trigger deleted");
      loadTriggers();
    } catch (error) {
      console.error("Error deleting trigger:", error);
      toast.error("Failed to delete trigger");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "connected":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <XCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getTriggerTypeLabel = (type) => {
    const labels = {
      email_meeting: "Meeting Scheduled",
      email_demo: "Demo Scheduled",
      email_discussion: "Discussion Scheduled",
      slack_mention: "Slack Mention",
      calendar_event: "Calendar Event",
      custom: "Custom Trigger"
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integration Management</h1>
          <p className="text-gray-600 mt-1">
            Connect your tools and automate AI roleplay preparation
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedTrigger(null);
            setShowTriggerModal(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          New Trigger
        </Button>
      </div>

      <Tabs defaultValue="connections" className="space-y-6">
        <TabsList>
          <TabsTrigger value="connections" className="gap-2">
            <Zap className="h-4 w-4" />
            Connections
          </TabsTrigger>
          <TabsTrigger value="triggers" className="gap-2">
            <Settings className="h-4 w-4" />
            AI Triggers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {integrationTypes.map((integration) => {
              const Icon = integration.icon;
              const status = getConnectionStatus(integration.type);
              const isConnected = status === "connected";

              return (
                <Card key={integration.type} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg ${integration.bgColor}`}>
                          <Icon className={`h-6 w-6 ${integration.color}`} />
                        </div>
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {integration.name}
                            {getStatusIcon(status)}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {integration.description}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Features:</p>
                      <div className="flex flex-wrap gap-2">
                        {integration.features.map((feature, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {isConnected ? (
                        <>
                          <Button
                            variant="outline"
                            className="flex-1 gap-2"
                            onClick={() => handleDisconnect(integration.type)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Disconnect
                          </Button>
                          <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => handleConnect(integration.type)}
                          >
                            <Settings className="h-4 w-4" />
                            Configure
                          </Button>
                        </>
                      ) : (
                        <Button
                          className="flex-1 gap-2"
                          onClick={() => handleConnect(integration.type)}
                        >
                          <Plus className="h-4 w-4" />
                          Connect {integration.name}
                        </Button>
                      )}
                    </div>

                    {isConnected && (
                      <div className="pt-3 border-t">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Status:</span>
                          <Badge variant="default" className="bg-green-600">
                            Active
                          </Badge>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="triggers" className="space-y-4">
          {triggers.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Zap className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No AI Triggers Yet</h3>
                <p className="text-gray-600 text-center mb-4">
                  Create triggers to automatically generate AI roleplay sessions based on your integrations
                </p>
                <Button onClick={() => setShowTriggerModal(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First Trigger
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {triggers.map((trigger) => (
                <Card key={trigger.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="outline" className="font-medium">
                            {trigger.integration_type.toUpperCase()}
                          </Badge>
                          <h3 className="font-semibold">
                            {getTriggerTypeLabel(trigger.trigger_type)}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {trigger.trigger_config?.description || "Automated AI roleplay trigger"}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {trigger.trigger_config?.keywords?.map((keyword, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={trigger.is_active}
                          onCheckedChange={(checked) => handleToggleTrigger(trigger.id, checked)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTrigger(trigger.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {showSlackModal && (
        <SlackIntegrationModal
          open={showSlackModal}
          onClose={() => {
            setShowSlackModal(false);
            loadIntegrations();
          }}
          connectionId={getConnectionId("slack")}
        />
      )}

      {showOutlookModal && (
        <OutlookIntegrationModal
          open={showOutlookModal}
          onClose={() => {
            setShowOutlookModal(false);
            loadIntegrations();
          }}
          connectionId={getConnectionId("outlook")}
        />
      )}

      {showTriggerModal && (
        <AITriggerModal
          open={showTriggerModal}
          onClose={() => {
            setShowTriggerModal(false);
            setSelectedTrigger(null);
            loadTriggers();
          }}
          trigger={selectedTrigger}
          connections={connections}
        />
      )}
    </div>
  );
};

export default IntegrationManagement;
