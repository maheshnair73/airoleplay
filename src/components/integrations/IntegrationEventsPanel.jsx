import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Mail,
  Zap,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  PlayCircle,
  Activity
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const IntegrationEventsPanel = ({ connections }) => {
  const [scanning, setScanning] = useState(false);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    loadRecentEvents();
  }, [connections]);

  const loadRecentEvents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const connectionIds = connections.map(c => c.id);
      if (connectionIds.length === 0) {
        setRecentEvents([]);
        setLoadingEvents(false);
        return;
      }

      const { data, error } = await supabase
        .from("integration_events")
        .select(`
          *,
          integration_connections!inner(integration_type, user_id),
          roleplay_sessions(id, scenario_type, status)
        `)
        .in("connection_id", connectionIds)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentEvents(data || []);
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleScanEmails = async (connectionId) => {
    setScanning(true);
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-integration-events`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'scan_emails',
          connectionId: connectionId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to scan emails');
      }

      toast.success(result.message || 'Emails scanned successfully');
      loadRecentEvents();
    } catch (error) {
      console.error("Error scanning emails:", error);
      toast.error(error.message || "Failed to scan emails");
    } finally {
      setScanning(false);
    }
  };

  const outlookConnection = connections.find(c => c.integration_type === 'outlook' && c.status === 'connected');
  const slackConnection = connections.find(c => c.integration_type === 'slack' && c.status === 'connected');

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'email_received':
        return <Mail className="h-4 w-4 text-blue-600" />;
      case 'slack_message':
        return <Zap className="h-4 w-4 text-purple-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatEventTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            How AI Triggers Work
          </CardTitle>
          <CardDescription>
            Automated AI roleplay session creation based on your integrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 rounded-lg mt-1">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">1. Email Detection</h4>
                <p className="text-sm text-gray-600">
                  When Outlook is connected, the system scans your emails for trigger keywords like "demo", "meeting", or "call".
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-50 rounded-lg mt-1">
                <Zap className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">2. Trigger Matching</h4>
                <p className="text-sm text-gray-600">
                  The system checks your active AI triggers to see if any conditions match the email content or Slack message.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-50 rounded-lg mt-1">
                <PlayCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">3. Session Creation</h4>
                <p className="text-sm text-gray-600">
                  A roleplay session is automatically created based on your trigger template (scenario type, difficulty, etc.).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-50 rounded-lg mt-1">
                <CheckCircle2 className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">4. Notification (Optional)</h4>
                <p className="text-sm text-gray-600">
                  If Slack is connected, you'll receive a notification about the new prep session in your configured channel.
                </p>
              </div>
            </div>
          </div>

          {!outlookConnection && !slackConnection && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>No integrations connected.</strong> Connect Slack or Outlook to enable automatic AI roleplay session creation.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {outlookConnection && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Scanner
              </span>
              <Badge variant="default" className="bg-green-600">Active</Badge>
            </CardTitle>
            <CardDescription>
              Manually scan your Outlook inbox for new emails
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Emails are automatically scanned every {outlookConnection.config?.scan_interval_minutes || 30} minutes.
                You can also trigger a manual scan below.
              </AlertDescription>
            </Alert>

            <Button
              onClick={() => handleScanEmails(outlookConnection.id)}
              disabled={scanning}
              className="w-full gap-2"
            >
              {scanning ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Scanning Emails...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Scan Emails Now
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Integration Events
          </CardTitle>
          <CardDescription>
            Latest events processed from your integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingEvents ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : recentEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="font-medium mb-1">No events yet</p>
              <p className="text-sm">Events will appear here when emails are detected or Slack messages trigger actions</p>
              {outlookConnection && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 gap-2"
                  onClick={() => handleScanEmails(outlookConnection.id)}
                >
                  <RefreshCw className="h-4 w-4" />
                  Scan Emails Now
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {recentEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="mt-1">
                    {getEventIcon(event.event_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm truncate">
                        {event.event_data?.subject || event.event_data?.text || 'Event'}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {event.integration_connections.integration_type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{formatEventTime(event.created_at)}</span>
                      {event.processed && (
                        <>
                          <span>•</span>
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                          <span className="text-green-600">Processed</span>
                        </>
                      )}
                      {event.roleplay_sessions && (
                        <>
                          <span>•</span>
                          <Zap className="h-3 w-3 text-blue-600" />
                          <span className="text-blue-600">Session Created</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationEventsPanel;
