/*
  # Add Disposition Fields and Dummy Data for EffyLeads

  1. Schema Updates
    - Add `disposition` field to leads table (e.g., 'interested', 'not_interested', 'callback', 'not_qualified')
    - Add `sub_disposition` field to leads table for more granular tracking
    - Add `next_call_date` field for calendar scheduling
    - Add `last_contact_date` field to track last interaction
    
  2. Dummy Data
    - Insert sample companies
    - Insert sample leads with various statuses, dispositions, and scheduled callbacks
    - Creates realistic CRM data for testing and demonstration
    
  3. Notes
    - All dates use realistic future dates for follow-ups
    - Includes variety of lead statuses across the sales pipeline
    - Demonstrates disposition tracking for call outcomes
*/

-- Add disposition fields to leads table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'disposition'
  ) THEN
    ALTER TABLE leads ADD COLUMN disposition text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'sub_disposition'
  ) THEN
    ALTER TABLE leads ADD COLUMN sub_disposition text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'next_call_date'
  ) THEN
    ALTER TABLE leads ADD COLUMN next_call_date timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'last_contact_date'
  ) THEN
    ALTER TABLE leads ADD COLUMN last_contact_date timestamptz;
  END IF;

  -- Add contact fields if they don't exist (for consistent naming)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'contact_name'
  ) THEN
    ALTER TABLE leads ADD COLUMN contact_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'contact_email'
  ) THEN
    ALTER TABLE leads ADD COLUMN contact_email text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'contact_phone'
  ) THEN
    ALTER TABLE leads ADD COLUMN contact_phone text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'company_name'
  ) THEN
    ALTER TABLE leads ADD COLUMN company_name text;
  END IF;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_next_call_date ON leads(next_call_date) WHERE next_call_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_disposition ON leads(disposition) WHERE disposition IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

-- Add comments for documentation
COMMENT ON COLUMN leads.disposition IS 'Primary call disposition: interested, not_interested, callback_requested, voicemail, no_answer, not_qualified, do_not_call';
COMMENT ON COLUMN leads.sub_disposition IS 'Detailed sub-disposition: budget_concerns, timing_issues, decision_maker_unavailable, needs_more_info, competitor_using, etc';
COMMENT ON COLUMN leads.next_call_date IS 'Scheduled date/time for next call or follow-up';
COMMENT ON COLUMN leads.last_contact_date IS 'Date of last contact attempt or successful conversation';

-- Insert dummy companies (using gen_random_uuid() to avoid UUID format issues)
INSERT INTO companies (company_name, industry, website, description, created_at)
SELECT * FROM (VALUES 
  ('TechCorp Solutions', 'Software', 'https://techcorp.example.com', 'Enterprise software solutions provider', now() - interval '30 days'),
  ('Global Retail Inc', 'Retail', 'https://globalretail.example.com', 'Leading retail chain with 500+ locations', now() - interval '25 days'),
  ('FinanceFlow LLC', 'Financial Services', 'https://financeflow.example.com', 'Financial technology and services company', now() - interval '20 days'),
  ('HealthTech Medical', 'Healthcare', 'https://healthtech.example.com', 'Healthcare technology and EMR solutions', now() - interval '15 days'),
  ('EduLearn Systems', 'Education', 'https://edulearn.example.com', 'Educational technology platform', now() - interval '10 days'),
  ('ManufacturePro', 'Manufacturing', 'https://manufacturepro.example.com', 'Industrial manufacturing solutions', now() - interval '5 days'),
  ('CloudScale Inc', 'Cloud Services', 'https://cloudscale.example.com', 'Cloud infrastructure and hosting', now() - interval '3 days'),
  ('MarketingHub Co', 'Marketing', 'https://marketinghub.example.com', 'Digital marketing automation platform', now() - interval '2 days')
) AS v(company_name, industry, website, description, created_at)
WHERE NOT EXISTS (SELECT 1 FROM companies WHERE companies.company_name = v.company_name);

-- Insert dummy leads with various dispositions and statuses
INSERT INTO leads (
  lead_name, contact_name, company_name, contact_email, contact_phone, 
  status, stage, source, disposition, sub_disposition, 
  next_call_date, last_contact_date, notes, created_at
)
SELECT * FROM (VALUES 
  (
    'TechCorp - Sarah Johnson',
    'Sarah Johnson',
    'TechCorp Solutions',
    'sarah.johnson@techcorp.example.com',
    '+1-555-0101',
    'new',
    'new',
    'Website Form',
    'interested',
    'requested_demo',
    now() + interval '2 days',
    now() - interval '1 day',
    'Interested in our enterprise solution. Has budget approved for Q2.',
    now() - interval '5 days'
  ),
  (
    'Global Retail - Michael Chen',
    'Michael Chen',
    'Global Retail Inc',
    'mchen@globalretail.example.com',
    '+1-555-0102',
    'contacted',
    'contacted',
    'Cold Call',
    'callback_requested',
    'decision_maker_unavailable',
    now() + interval '3 days',
    now() - interval '2 hours',
    'VP unavailable. Gatekeeper friendly. Call back Thursday 2pm.',
    now() - interval '8 days'
  ),
  (
    'FinanceFlow - Amanda Rodriguez',
    'Amanda Rodriguez',
    'FinanceFlow LLC',
    'arodriguez@financeflow.example.com',
    '+1-555-0103',
    'qualified',
    'qualified',
    'LinkedIn',
    'interested',
    'needs_more_info',
    now() + interval '1 day',
    now() - interval '3 days',
    'Qualified lead. Needs ROI calculator and case studies for financial services.',
    now() - interval '12 days'
  ),
  (
    'HealthTech - Dr. James Park',
    'Dr. James Park',
    'HealthTech Medical',
    'jpark@healthtech.example.com',
    '+1-555-0104',
    'meeting_scheduled',
    'meeting_scheduled',
    'Referral',
    'interested',
    'demo_scheduled',
    now() + interval '5 days',
    now() - interval '1 day',
    'Demo scheduled for Friday. Interested in HIPAA compliance features.',
    now() - interval '6 days'
  ),
  (
    'EduLearn - Lisa Thompson',
    'Lisa Thompson',
    'EduLearn Systems',
    'lthompson@edulearn.example.com',
    '+1-555-0105',
    'proposal_sent',
    'proposal_sent',
    'Conference',
    'interested',
    'reviewing_proposal',
    now() + interval '7 days',
    now() - interval '5 days',
    'Proposal sent on Monday. Follow up scheduled for next week.',
    now() - interval '20 days'
  ),
  (
    'ManufacturePro - Robert Williams',
    'Robert Williams',
    'ManufacturePro',
    'rwilliams@manufacturepro.example.com',
    '+1-555-0106',
    'negotiation',
    'negotiation',
    'Trade Show',
    'interested',
    'pricing_negotiation',
    now() + interval '1 day',
    now() - interval '1 hour',
    'Negotiating on volume discount. Expecting to close this week.',
    now() - interval '45 days'
  ),
  (
    'CloudScale - Jennifer Lee',
    'Jennifer Lee',
    'CloudScale Inc',
    'jlee@cloudscale.example.com',
    '+1-555-0107',
    'new',
    'new',
    'Email Campaign',
    'voicemail',
    'left_voicemail',
    now() + interval '1 day',
    now() - interval '6 hours',
    'Left voicemail. Mentioned special Q1 pricing.',
    now() - interval '2 days'
  ),
  (
    'MarketingHub - David Brown',
    'David Brown',
    'MarketingHub Co',
    'dbrown@marketinghub.example.com',
    '+1-555-0108',
    'contacted',
    'contacted',
    'Partner Referral',
    'not_interested',
    'using_competitor',
    NULL,
    now() - interval '1 day',
    'Currently using competitor. Happy with current solution. Do not follow up.',
    now() - interval '4 days'
  ),
  (
    'DataAnalytics - Emily Davis',
    'Emily Davis',
    'DataAnalytics Corp',
    'edavis@dataanalytics.example.com',
    '+1-555-0109',
    'qualified',
    'qualified',
    'Cold Email',
    'interested',
    'budget_approved',
    now() + interval '4 days',
    now() - interval '2 days',
    'Budget approved. Ready for technical evaluation.',
    now() - interval '15 days'
  ),
  (
    'SecureNet - Kevin Martinez',
    'Kevin Martinez',
    'SecureNet Systems',
    'kmartinez@securenet.example.com',
    '+1-555-0110',
    'new',
    'new',
    'Website Chat',
    'callback_requested',
    'timing_not_right',
    now() + interval '30 days',
    now() - interval '3 hours',
    'Interested but not until Q3. Set reminder to follow up in 30 days.',
    now() - interval '1 day'
  ),
  (
    'AutoTech - Maria Garcia',
    'Maria Garcia',
    'AutoTech Solutions',
    'mgarcia@autotech.example.com',
    '+1-555-0111',
    'meeting_scheduled',
    'meeting_scheduled',
    'LinkedIn',
    'interested',
    'technical_evaluation',
    now() + interval '6 days',
    now() - interval '4 days',
    'Technical demo scheduled. Bring solutions architect.',
    now() - interval '10 days'
  ),
  (
    'RetailTech - Thomas Anderson',
    'Thomas Anderson',
    'RetailTech Inc',
    'tanderson@retailtech.example.com',
    '+1-555-0112',
    'contacted',
    'contacted',
    'Cold Call',
    'no_answer',
    'no_response',
    now() + interval '2 days',
    now() - interval '8 hours',
    'No answer on 3 attempts. Try again in 2 days.',
    now() - interval '3 days'
  )
) AS v(lead_name, contact_name, company_name, contact_email, contact_phone, status, stage, source, disposition, sub_disposition, next_call_date, last_contact_date, notes, created_at)
WHERE NOT EXISTS (SELECT 1 FROM leads WHERE leads.contact_email = v.contact_email);