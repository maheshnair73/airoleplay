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
import { Mail, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const OutlookIntegrationModal = ({ open, onClose, connectionId }) => {
  const [loading, setLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState("disconnected");
  const [formData, setFormData] = useState({
    client_id: "",
    client_secret: "",
    tenant_id: "",
    email_address: "",
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
        setFormData({
          client_id: data.config?.client_id || "",
          client_secret: data.config?.client_secret || "",
          tenant_id: data.config?.tenant_id || "",
          email_address: data.config?.email_address || "",
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
        integration_type: "outlook",
        status: "connected",
        config: {
          client_id: formData.client_id,
          client_secret: formData.client_secret,
          tenant_id: formData.tenant_id,
          email_address: formData.email_address,
          auto_detect_meetings: formData.auto_detect_meetings,
          auto_detect_demos: formData.auto_detect_demos,
          prep_hours_before: formData.prep_hours_before,
          scan_interval_minutes: formData.scan_interval_minutes,
          keywords: formData.keywords
        },
        metadata: {
          connected_at: new Date().toISOString(),
          last_sync: null
        }
      };

      if (connectionId) {
        const { error } = await supabase
          .from("integration_connections")
          .update(connectionData)
          .eq("id", connectionId);

        if (error) throw error;
        toast.success("Outlook integration updated successfully");
      } else {
        const { error } = await supabase
          .from("integration_connections")
          .insert([connectionData]);

        if (error) throw error;
        toast.success("Outlook connected successfully");
      }

      setAuthStatus("connected");
      onClose();
    } catch (error) {
      console.error("Error saving Outlook integration:", error);
      toast.error("Failed to connect Outlook");
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
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Setup Instructions:</p>
              <ol className="list-decimal list-inside space-y-1 text-blue-800">
                <li>Register an app in Azure AD Portal</li>
                <li>Add Microsoft Graph API permissions: Mail.Read, Calendars.Read</li>
                <li>Create a client secret</li>
                <li>Copy the Application ID, Tenant ID, and Client Secret</li>
                <li>Paste the credentials below</li>
              </ol>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="email_address">Email Address</Label>
              <Input
                id="email_address"
                type="email"
                placeholder="user@company.com"
                value={formData.email_address}
                onChange={(e) => setFormData({ ...formData, email_address: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="client_id">Application (Client) ID</Label>
              <Input
                id="client_id"
                placeholder="12345678-1234-1234-1234-123456789012"
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="tenant_id">Directory (Tenant) ID</Label>
              <Input
                id="tenant_id"
                placeholder="87654321-4321-4321-4321-210987654321"
                value={formData.tenant_id}
                onChange={(e) => setFormData({ ...formData, tenant_id: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="client_secret">Client Secret</Label>
              <Input
                id="client_secret"
                type="password"
                placeholder="Enter your client secret"
                value={formData.client_secret}
                onChange={(e) => setFormData({ ...formData, client_secret: e.target.value })}
                required
              />
            </div>

            <div className="space-y-4 pt-4 border-t">
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
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Connecting..." : connectionId ? "Update" : "Connect Outlook"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OutlookIntegrationModal;
