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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Zap, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const AITriggerModal = ({ open, onClose, trigger, connections }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    integration_type: "",
    trigger_type: "",
    description: "",
    keywords: [],
    scenario_type: "discovery",
    difficulty_level: "medium",
    auto_assign: true
  });
  const [keywordInput, setKeywordInput] = useState("");

  useEffect(() => {
    if (trigger) {
      setFormData({
        integration_type: trigger.integration_type || "",
        trigger_type: trigger.trigger_type || "",
        description: trigger.trigger_config?.description || "",
        keywords: trigger.trigger_config?.keywords || [],
        scenario_type: trigger.roleplay_template?.scenario_type || "discovery",
        difficulty_level: trigger.roleplay_template?.difficulty_level || "medium",
        auto_assign: trigger.trigger_config?.auto_assign ?? true
      });
    }
  }, [trigger]);

  const connectedIntegrations = connections
    .filter(c => c.status === "connected")
    .map(c => c.integration_type);

  const triggerTypes = {
    slack: [
      { value: "slack_mention", label: "Slack Mention" },
      { value: "custom", label: "Custom Trigger" }
    ],
    outlook: [
      { value: "email_meeting", label: "Meeting Scheduled" },
      { value: "email_demo", label: "Demo Scheduled" },
      { value: "email_discussion", label: "Discussion Scheduled" },
      { value: "calendar_event", label: "Calendar Event" },
      { value: "custom", label: "Custom Trigger" }
    ]
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim().toLowerCase())) {
      setFormData({
        ...formData,
        keywords: [...formData.keywords, keywordInput.trim().toLowerCase()]
      });
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keyword) => {
    setFormData({
      ...formData,
      keywords: formData.keywords.filter(k => k !== keyword)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.integration_type) {
      toast.error("Please select an integration type");
      return;
    }

    if (!formData.trigger_type) {
      toast.error("Please select a trigger type");
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

      const triggerData = {
        user_id: user.id,
        company_id: profile?.company_id,
        integration_type: formData.integration_type,
        trigger_type: formData.trigger_type,
        trigger_config: {
          description: formData.description,
          keywords: formData.keywords,
          auto_assign: formData.auto_assign,
          prep_hours_before: 24
        },
        roleplay_template: {
          scenario_type: formData.scenario_type,
          difficulty_level: formData.difficulty_level,
          duration_minutes: 15
        },
        is_active: true
      };

      if (trigger?.id) {
        const { error } = await supabase
          .from("ai_roleplay_triggers")
          .update(triggerData)
          .eq("id", trigger.id);

        if (error) throw error;
        toast.success("Trigger updated successfully");
      } else {
        const { error } = await supabase
          .from("ai_roleplay_triggers")
          .insert([triggerData]);

        if (error) throw error;
        toast.success("Trigger created successfully");
      }

      onClose();
    } catch (error) {
      console.error("Error saving trigger:", error);
      toast.error("Failed to save trigger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <DialogTitle>
                {trigger ? "Edit AI Trigger" : "Create AI Trigger"}
              </DialogTitle>
              <DialogDescription>
                Automatically generate AI roleplay sessions based on integration events
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {connectedIntegrations.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-900">
              <p className="font-medium mb-1">No Integrations Connected</p>
              <p>Please connect at least one integration (Slack or Outlook) before creating triggers.</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="integration_type">Integration Type</Label>
                  <Select
                    value={formData.integration_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, integration_type: value, trigger_type: "" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select integration" />
                    </SelectTrigger>
                    <SelectContent>
                      {connectedIntegrations.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.integration_type && (
                  <div>
                    <Label htmlFor="trigger_type">Trigger Type</Label>
                    <Select
                      value={formData.trigger_type}
                      onValueChange={(value) => setFormData({ ...formData, trigger_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select trigger type" />
                      </SelectTrigger>
                      <SelectContent>
                        {triggerTypes[formData.integration_type]?.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what this trigger does..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="keywords">Detection Keywords</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      id="keywords"
                      placeholder="Add a keyword..."
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddKeyword();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddKeyword}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.keywords.map((keyword, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="cursor-pointer hover:bg-red-100"
                        onClick={() => handleRemoveKeyword(keyword)}
                      >
                        {keyword} ×
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Keywords used to detect relevant events. Click to remove.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="scenario_type">Scenario Type</Label>
                    <Select
                      value={formData.scenario_type}
                      onValueChange={(value) => setFormData({ ...formData, scenario_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="discovery">Discovery Call</SelectItem>
                        <SelectItem value="demo">Product Demo</SelectItem>
                        <SelectItem value="objection">Objection Handling</SelectItem>
                        <SelectItem value="negotiation">Negotiation</SelectItem>
                        <SelectItem value="closing">Closing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="difficulty_level">Difficulty Level</Label>
                    <Select
                      value={formData.difficulty_level}
                      onValueChange={(value) => setFormData({ ...formData, difficulty_level: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || connectedIntegrations.length === 0}
            >
              {loading ? "Saving..." : trigger ? "Update Trigger" : "Create Trigger"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AITriggerModal;
