import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Zap, Bell, Palette, Brain } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";

interface GeneralSettingsProps {
  preferences: {
    theme_preference: string | null;
    notification_enabled: boolean | null;
    auto_optimize: boolean | null;
    ai_model_preference: string | null;
  } | null;
  onUpdate: (preferences: any) => void;
  isLoading: boolean;
}

export const GeneralSettings: React.FC<GeneralSettingsProps> = ({ 
  preferences, 
  onUpdate, 
  isLoading 
}) => {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  // Handle preference updates with optimistic UI
  const handlePreferenceChange = async (key: string, value: any) => {
    const newPreferences = { ...preferences, [key]: value };
    
    try {
      await onUpdate(newPreferences);
      toast({
        title: "Settings updated",
        description: "Your preferences have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to save your preferences. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle theme change - update both theme and preferences
  const handleThemeChange = async (newTheme: string) => {
    // Immediately apply the theme
    setTheme(newTheme);
    
    // Also save to preferences
    await handlePreferenceChange('theme_preference', newTheme);
  };

  // AI Model options with descriptions
  const aiModels = [
    { 
      value: 'gpt-4o-mini', 
      label: 'GPT-4 Mini', 
      description: 'Fast and efficient for most tasks',
      badge: 'Recommended'
    },
    { 
      value: 'gpt-4o', 
      label: 'GPT-4', 
      description: 'Most powerful model for complex optimizations',
      badge: 'Pro'
    }
  ];

  const currentModel = aiModels.find(model => 
    model.value === (preferences?.ai_model_preference || 'gpt-4o-mini')
  );

  return (
    <div className="space-y-6">
      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Appearance
          </CardTitle>
          <CardDescription>
            Customize the visual appearance of your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="theme">Theme Preference</Label>
              <p className="text-sm text-muted-foreground">
                Choose your preferred color scheme
              </p>
            </div>
            <Select
              value={theme || 'system'}
              onValueChange={handleThemeChange}
              disabled={isLoading}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* AI Model Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            AI Configuration
          </CardTitle>
          <CardDescription>
            Configure your AI model preferences for email optimization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label htmlFor="ai-model">AI Model</Label>
            <Select
              value={preferences?.ai_model_preference || 'gpt-4o-mini'}
              onValueChange={(value) => handlePreferenceChange('ai_model_preference', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {aiModels.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col items-start">
                        <div className="flex items-center gap-2">
                          <span>{model.label}</span>
                          {model.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {model.badge}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {model.description}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {currentModel && (
              <p className="text-sm text-muted-foreground">
                Currently using: <strong>{currentModel.label}</strong> - {currentModel.description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="space-y-1">
              <Label htmlFor="auto-optimize">Auto-Optimization</Label>
              <p className="text-sm text-muted-foreground">
                Automatically optimize subject lines as you type
              </p>
            </div>
            <Switch
              id="auto-optimize"
              checked={preferences?.auto_optimize ?? false}
              onCheckedChange={(checked) => handlePreferenceChange('auto_optimize', checked)}
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notifications
          </CardTitle>
          <CardDescription>
            Manage your notification preferences and alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive performance insights and optimization tips
              </p>
            </div>
            <Switch
              id="notifications"
              checked={preferences?.notification_enabled ?? true}
              onCheckedChange={(checked) => handlePreferenceChange('notification_enabled', checked)}
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Performance Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Quick Stats
          </CardTitle>
          <CardDescription>
            Your current optimization performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">12</div>
              <div className="text-sm text-muted-foreground">Emails Optimized</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">+23%</div>
              <div className="text-sm text-muted-foreground">Avg. Open Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};