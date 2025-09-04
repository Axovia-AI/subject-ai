-- Add scored_count column to usage_stats table to track subject line scoring usage
ALTER TABLE public.usage_stats 
ADD COLUMN scored_count INTEGER NOT NULL DEFAULT 0;