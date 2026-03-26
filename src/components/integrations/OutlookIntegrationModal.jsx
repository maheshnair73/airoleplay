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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Mail, AlertCircle, CheckCircle, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const OutlookIntegrationModal = ({ open, onClose, connectionId }) => {
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [authStatus, setAuthStatus] = useState("disconnected");
  const [connectionData, setConnectionData] = useState(null);
  const [formData, setFormData] = useState({
    auto_detect_meetings: true,
    auto_detect_demos: true,
    prep_hours_before: 24,
    scan_interval_minutes: 30,
    keywords: ["demo", "meeting", "call", "presentation", "discussion"]
  });

  useEffect(() => {
    if (connectionId) {
      loadConnection();
    }

    const handleMessage = (event) => {
      if (event.data?.type === 'outlook-oauth-success') {
        handleOAuthSuccess(event.data.data);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
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
        setAuthStatus(data.status || "disconnected");
        setConnectionData(data);
        setFormData({
          auto_detect_meetings: data.config?.auto_detect_meetings ?? true,
          auto_detect_demos: data.config?.auto_detect_demos ?? true,
          prep_hours_before: data.config?.prep_hours_before || 24,
          scan_interval_minutes: data.config?.scan_interval_minutes || 30,
          keywords: data.config?.keywords || ["demo", "meeting", "call", "presentation", "discussion"]
        });
      }
    } catch (error) {
      console.error("Error loading connection:", error);
      toast.error("Failed to load connection details");
    }
  };

  const handleConnectOutlook = () => {
    setConnecting(true);
    const authUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/outlook-oauth/authorize`;
    const width = 600;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    window.open(
      authUrl,
      'outlook-oauth',
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  const handleOAuthSuccess = async (encodedData) => {
    try {
      const data = JSON.parse(atob(encodedData));
      setConnectionData(data);
      setAuthStatus("connected");
      setConnecting(false);
      toast.success(`Connected as ${data.display_name}`);
    } catch (error) {
      console.error("Error parsing OAuth data:", error);
      toast.error("Failed to process connection");
      setConnecting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!connectionData) {
      toast.error("Please connect your Outlook account first");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("company_id")
        .eq("id", user.id)
        .maybeSingle();

      const saveData = {
        user_id: user.id,
        company_id: profile?.company_id,
        integration_type: "outlook",
        status: "connected",
        config: {
          email_address: connectionData.email,
          display_name: connectionData.display_name,
          auto_detect_meetings: formData.auto_detect_meetings,
          auto_detect_demos: formData.auto_detect_demos,
          prep_hours_before: formData.prep_hours_before,
          scan_interval_minutes: formData.scan_interval_minutes,
          keywords: formData.keywords
        },
        auth_tokens: {
          access_token: connectionData.access_token,
          refresh_token: connectionData.refresh_token,
          expires_at: new Date(Date.now() + connectionData.expires_in * 1000).toISOString()
        },
        metadata: {
          connected_at: new Date().toISOString(),
          last_sync: null,
          user_id: connectionData.user_id
        }
      };

      if (connectionId) {
        const { error } = await supabase
          .from("integration_connections")
          .update(saveData)
          .eq("id", connectionId);

        if (error) throw error;
        toast.success("Outlook integration updated successfully");
      } else {
        const { error } = await supabase
          .from("integration_connections")
          .insert([saveData]);

        if (error) throw error;
        toast.success("Outlook connected successfully");
      }

      onClose();
    } catch (error) {
      console.error("Error saving Outlook integration:", error);
      toast.error("Failed to save Outlook integration");
    } finally {
      setLoading(false);
    }
  };

  const addKeyword = () => {
    const newKeyword = prompt("Enter a new keyword:");
    if (newKeyword && !formData.keywords.includes(newKeyword.toLowerCase())) {
      setFormData({
        ...formData,
        keywords: [...formData.keywords, newKeyword.toLowerCase()]
      });
    }
  };

  const removeKeyword = (keyword) => {
    setFormData({
      ...formData,
      keywords: formData.keywords.filter(k => k !== keyword)
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="flex items-center gap-2">
                Connect Outlook
                {authStatus === "connected" && (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
              </DialogTitle>
              <DialogDescription>
                Analyze emails and automatically trigger AI roleplay preparation
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {authStatus === "disconnected" && !connectionData && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">Connect with one click!</p>
                  <p className="text-blue-800">
                    Securely connect your Microsoft Outlook account using OAuth. No need to manually configure anything.
                  </p>
                </div>
              </div>

              <div className="flex justify-center py-4">
                <Button
                  type="button"
                  onClick={handleConnectOutlook}
                  disabled={connecting}
                  size="lg"
                  className="gap-2"
                >
                  <Mail className="h-5 w-5" />
                  {connecting ? "Connecting..." : "Connect with Outlook"}
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}

          {connectionData && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-900 mb-1">Connected Successfully!</p>
                <p className="text-sm text-green-800">
                  <strong>{connectionData.display_name}</strong>
                </p>
                <p className="text-sm text-green-700">{connectionData.email}</p>
              </div>
            </div>
          )}

          {(authStatus === "connected" || connectionData) && (
            <div className="space-y-4">
              <h4 className="font-medium">Detection Settings</h4>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-detect Meetings</Label>
                  <p className="text-xs text-gray-500">
                    Automatically create prep sessions for detected meetings
                  </p>
                </div>
                <Switch
                  checked={formData.auto_detect_meetings}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, auto_detect_meetings: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-detect Demos</Label>
                  <p className="text-xs text-gray-500">
                    Automatically create prep sessions for product demos
                  </p>
                </div>
                <Switch
                  checked={formData.auto_detect_demos}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, auto_detect_demos: checked })
                  }
                />
              </div>

              <div>
                <Label htmlFor="prep_hours_before">Preparation Time (hours before event)</Label>
                <Input
                  id="prep_hours_before"
                  type="number"
                  min="1"
                  max="168"
                  value={formData.prep_hours_before}
                  onChange={(e) => setFormData({ ...formData, prep_hours_before: parseInt(e.target.value) })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  How many hours before an event to trigger the AI roleplay prep
                </p>
              </div>

              <div>
                <Label htmlFor="scan_interval">Email Scan Interval (minutes)</Label>
                <Input
                  id="scan_interval"
                  type="number"
                  min="5"
                  max="1440"
                  value={formData.scan_interval_minutes}
                  onChange={(e) => setFormData({ ...formData, scan_interval_minutes: parseInt(e.target.value) })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  How often to check for new emails
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Detection Keywords</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addKeyword}>
                    Add Keyword
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.keywords.map((keyword, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="cursor-pointer hover:bg-red-100"
                      onClick={() => removeKeyword(keyword)}
                    >
                      {keyword} ×
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Click a keyword to remove it. System searches for these terms in email subjects and bodies.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {(authStatus === "connected" || connectionData) && (
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : connectionId ? "Update Settings" : "Save Connection"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OutlookIntegrationModal;
