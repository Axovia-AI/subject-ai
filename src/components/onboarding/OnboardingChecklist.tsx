import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Check, X, User, Mail, CreditCard, BarChart3, Link } from 'lucide-react';

type StepId = 'profile' | 'optimizer' | 'subscription' | 'analytics' | 'email-platform';

interface ChecklistItem {
  id: StepId;
  title: string;
  link: string;
  icon: React.ReactNode;
  comingSoon?: boolean;
}

interface OnboardingChecklistProps {
  completedSteps?: StepId[];
  onStepClick?: (stepId: StepId, link: string) => void;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 'profile',
    title: 'Complete your profile',
    link: 'settings',
    icon: <User className="w-4 h-4" />,
  },
  {
    id: 'optimizer',
    title: 'Optimize your first subject line',
    link: 'optimizer',
    icon: <Mail className="w-4 h-4" />,
  },
  {
    id: 'subscription',
    title: 'Choose a subscription plan',
    link: 'pricing',
    icon: <CreditCard className="w-4 h-4" />,
  },
  {
    id: 'analytics',
    title: 'Explore analytics',
    link: 'analytics',
    icon: <BarChart3 className="w-4 h-4" />,
  },
  {
    id: 'email-platform',
    title: 'Connect your email platform',
    link: 'email-platform',
    icon: <Link className="w-4 h-4" />,
    comingSoon: true,
  },
];

export const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({
  completedSteps = [],
  onStepClick,
}) => {
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    return localStorage.getItem('onboarding_dismissed') === 'true';
  });

  const completedCount = completedSteps.length;
  const totalCount = CHECKLIST_ITEMS.length;
  const progressPercentage = (completedCount / totalCount) * 100;
  const isAllComplete = completedCount === totalCount;

  const handleDismiss = () => {
    localStorage.setItem('onboarding_dismissed', 'true');
    setIsDismissed(true);
  };

  const handleStepClick = (item: ChecklistItem) => {
    if (item.comingSoon) return;
    onStepClick?.(item.id, item.link);
  };

  if (isDismissed) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-xl">Getting Started</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {completedCount} of {totalCount} complete
            {isAllComplete && " - You're all set!"}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDismiss}
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progressPercentage} className="h-2" />

        <div className="space-y-2">
          {CHECKLIST_ITEMS.map((item) => {
            const isCompleted = completedSteps.includes(item.id);

            return (
              <div
                key={item.id}
                data-testid={`checklist-item-${item.id}`}
                data-completed={isCompleted}
                className={`
                  flex items-center gap-3 p-3 rounded-lg border transition-all duration-200
                  ${isCompleted
                    ? 'bg-primary/5 border-primary/20'
                    : 'bg-background border-border hover:border-primary/30'
                  }
                  ${item.comingSoon ? 'opacity-60' : ''}
                `}
              >
                <div
                  className={`
                    flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200
                    ${isCompleted
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    item.icon
                  )}
                </div>

                <Button
                  variant="ghost"
                  className={`
                    flex-1 justify-start h-auto p-0 font-normal
                    ${isCompleted ? 'line-through text-muted-foreground' : ''}
                  `}
                  onClick={() => handleStepClick(item)}
                  disabled={item.comingSoon}
                  aria-label={item.title}
                >
                  {item.title}
                </Button>

                {item.comingSoon && (
                  <Badge variant="secondary" className="text-xs">
                    Coming soon
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default OnboardingChecklist;
