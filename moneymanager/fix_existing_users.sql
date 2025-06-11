-- Fix existing users with missing timestamp and default values
-- Run this script after updating your application to fix existing users

-- Update created_at and updated_at for existing users
UPDATE users 
SET 
    created_at = COALESCE(created_at, NOW()),
    updated_at = COALESCE(updated_at, NOW())
WHERE created_at IS NULL OR updated_at IS NULL OR created_at = '0000-00-00 00:00:00' OR updated_at = '0000-00-00 00:00:00';

-- Set default values for new preference fields if they are NULL
UPDATE users 
SET 
    currency = COALESCE(currency, 'USD'),
    timezone = COALESCE(timezone, 'America/New_York'),
    theme = COALESCE(theme, 'light'),
    language = COALESCE(language, 'en'),
    date_format = COALESCE(date_format, 'MM/DD/YYYY'),
    email_notifications = COALESCE(email_notifications, TRUE),
    push_notifications = COALESCE(push_notifications, FALSE),
    budget_alerts = COALESCE(budget_alerts, TRUE),
    goal_reminders = COALESCE(goal_reminders, TRUE),
    share_data = COALESCE(share_data, FALSE),
    public_profile = COALESCE(public_profile, FALSE),
    analytics_enabled = COALESCE(analytics_enabled, TRUE),
    marketing_enabled = COALESCE(marketing_enabled, FALSE),
    third_party_enabled = COALESCE(third_party_enabled, FALSE),
    share_transactions = COALESCE(share_transactions, FALSE),
    share_goals = COALESCE(share_goals, FALSE),
    newsletters_enabled = COALESCE(newsletters_enabled, TRUE),
    product_updates_enabled = COALESCE(product_updates_enabled, FALSE),
    survey_invitations_enabled = COALESCE(survey_invitations_enabled, FALSE),
    email_verified = COALESCE(email_verified, FALSE),
    two_factor_enabled = COALESCE(two_factor_enabled, FALSE)
WHERE 
    currency IS NULL OR 
    timezone IS NULL OR 
    theme IS NULL OR 
    language IS NULL OR 
    date_format IS NULL;

-- Show updated users to verify
SELECT id, full_name, email, created_at, updated_at, currency, theme 
FROM users 
LIMIT 5;