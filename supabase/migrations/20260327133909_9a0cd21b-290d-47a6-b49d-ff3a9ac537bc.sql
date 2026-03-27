
CREATE TABLE public.monthly_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2020 AND year <= 2100),
  plan_type TEXT NOT NULL CHECK (plan_type IN ('mensal', 'trimestral', 'semestral', 'anual', 'total')),
  confirmed_clients INTEGER DEFAULT 0,
  confirmed_clients_pct NUMERIC(5,2) DEFAULT 0,
  pending_clients INTEGER DEFAULT 0,
  mrr NUMERIC(12,2) DEFAULT 0,
  score NUMERIC(12,2) DEFAULT 0,
  discounts NUMERIC(12,2) DEFAULT 0,
  confirmed_revenue NUMERIC(12,2) DEFAULT 0,
  pending_revenue NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(month, year, plan_type)
);

ALTER TABLE public.monthly_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to monthly_summaries"
  ON public.monthly_summaries FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE TABLE public.daily_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2020 AND year <= 2100),
  day INTEGER NOT NULL CHECK (day >= 1 AND day <= 31),
  closer_name TEXT DEFAULT '',
  pipedrive_clients INTEGER DEFAULT 0,
  portal_clients INTEGER DEFAULT 0,
  avg_ticket NUMERIC(12,2) DEFAULT 0,
  nmrr_monthly NUMERIC(12,2) DEFAULT 0,
  nmrr_quarterly NUMERIC(12,2) DEFAULT 0,
  nmrr_semiannual NUMERIC(12,2) DEFAULT 0,
  nmrr_annual NUMERIC(12,2) DEFAULT 0,
  nmrr_total NUMERIC(12,2) DEFAULT 0,
  clients_monthly INTEGER DEFAULT 0,
  clients_quarterly INTEGER DEFAULT 0,
  clients_semiannual INTEGER DEFAULT 0,
  clients_annual INTEGER DEFAULT 0,
  score NUMERIC(12,2) DEFAULT 0,
  conversion_rate NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(month, year, day)
);

ALTER TABLE public.daily_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to daily_metrics"
  ON public.daily_metrics FOR ALL
  USING (true)
  WITH CHECK (true);
