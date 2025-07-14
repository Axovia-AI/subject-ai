import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsageLimits } from './UsageLimits';
import { UsageHistory } from './UsageHistory';
import { BarChart3, History, Target } from 'lucide-react';

interface UsageOverviewProps {
  userId: string;
}

export const UsageOverview: React.FC<UsageOverviewProps> = ({ userId }) => {
  return (
    <div className="container max-w-6xl mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Usage & Billing</h1>
        <p className="text-muted-foreground mt-2">
          Monitor your SubjectAI usage, limits, and billing information
        </p>
      </div>

      <Tabs defaultValue="limits" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="limits" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Current Usage
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            Usage History
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="limits" className="space-y-6">
          <UsageLimits userId={userId} />
        </TabsContent>
        
        <TabsContent value="history" className="space-y-6">
          <UsageHistory userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};