import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slack, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const SlackIntegrationModal = ({ open, onClose, connectionId }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    workspace_name: "",
    webhook_url: "",
    bot_token: "",
    channel_id: "",
    auto_post_roleplay: true,
    notify_on_completion: true,
    default_channel: "#sales-training"
  });

  useEffect(() => {
    if (connectionId) {
      loadConnection();
    }
  }, [connectionId]);

  const loadConnection = async () => {
    try {
      const { data, error } = await supabase
        .from("integration_connections")
        .select("*")
        .eq("id", connectionId)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setFormData({
          workspace_name: data.config?.workspace_name || "",
          webhook_url: data.config?.webhook_url || "",
          bot_token: data.access_token || "",
          channel_id: data.config?.channel_id || "",
          auto_post_roleplay: data.config?.auto_post_roleplay ?? true,
          notify_on_completion: data.config?.notify_on_completion ?? true,
          default_channel: data.config?.default_channel || "#sales-training"
        });
      }
    } catch (error) {
      console.error("Error loading connection:", error);
      toast.error("Failed to load connection details");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("company_id")
        .eq("id", user.id)
        .maybeSingle();

      const connectionData = {
        user_id: user.id,
        company_id: profile?.company_id,
        integration_type: "slack",
        status: "connected",
        access_token: formData.bot_token,
        config: {
          workspace_name: formData.workspace_name,
          webhook_url: formData.webhook_url,
          channel_id: formData.channel_id,
          auto_post_roleplay: formData.auto_post_roleplay,
          notify_on_completion: formData.notify_on_completion,
          default_channel: formData.default_channel
        },
        metadata: {
          connected_at: new Date().toISOString()
        }
      };

      if (connectionId) {
        const { error } = await supabase
          .from("integration_connections")
          .update(connectionData)
          .eq("id", connectionId);

        if (error) throw error;
        toast.success("Slack integration updated successfully");
      } else {
        const { error } = await supabase
          .from("integration_connections")
          .insert([connectionData]);

        if (error) throw error;
        toast.success("Slack connected successfully");
      }

      onClose();
    } catch (error) {
      console.error("Error saving Slack integration:", error);
      toast.error("Failed to connect Slack");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Slack className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <DialogTitle>Connect Slack</DialogTitle>
              <DialogDescription>
                Integrate Slack to send AI roleplay scenarios and receive notifications
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Setup Instructions:</p>
              <ol className="list-decimal list-inside space-y-1 text-blue-800">
                <li>Go to your Slack workspace settings</li>
                <li>Create a new app or use an existing one</li>
                <li>Enable Incoming Webhooks and copy the webhook URL</li>
                <li>Generate a Bot User OAuth Token with required permissions</li>
                <li>Paste the credentials below</li>
              </ol>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="workspace_name">Workspace Name</Label>
              <Input
                id="workspace_name"
                placeholder="my-company"
                value={formData.workspace_name}
                onChange={(e) => setFormData({ ...formData, workspace_name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="webhook_url">Webhook URL</Label>
              <Input
                id="webhook_url"
                type="url"
                placeholder="https://hooks.slack.com/services/..."
                value={formData.webhook_url}
                onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Used to send messages to Slack channels
              </p>
            </div>

            <div>
              <Label htmlFor="bot_token">Bot User OAuth Token</Label>
              <Textarea
                id="bot_token"
                placeholder="xoxb-..."
                value={formData.bot_token}
                onChange={(e) => setFormData({ ...formData, bot_token: e.target.value })}
                rows={3}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Required scopes: channels:read, chat:write, users:read
              </p>
            </div>

            <div>
              <Label htmlFor="channel_id">Default Channel ID</Label>
              <Input
                id="channel_id"
                placeholder="C01234567"
                value={formData.channel_id}
                onChange={(e) => setFormData({ ...formData, channel_id: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional: Specific channel ID for roleplay notifications
              </p>
            </div>

            <div>
              <Label htmlFor="default_channel">Default Channel Name</Label>
              <Input
                id="default_channel"
                placeholder="#sales-training"
                value={formData.default_channel}
                onChange={(e) => setFormData({ ...formData, default_channel: e.target.value })}
              />
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-post Roleplay Sessions</Label>
                  <p className="text-xs text-gray-500">
                    Automatically share roleplay sessions in Slack
                  </p>
                </div>
                <Switch
                  checked={formData.auto_post_roleplay}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, auto_post_roleplay: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Completion Notifications</Label>
                  <p className="text-xs text-gray-500">
                    Notify when a user completes a roleplay session
                  </p>
                </div>
                <Switch
                  checked={formData.notify_on_completion}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, notify_on_completion: checked })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Connecting..." : connectionId ? "Update" : "Connect Slack"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SlackIntegrationModal;
