CREATE TABLE IF NOT EXISTS automations (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active',
  triggers VARCHAR(255),
  actions VARCHAR(255),
  stats_sent INT DEFAULT 0,
  stats_converted INT DEFAULT 0,
  icon VARCHAR(100),
  color VARCHAR(50),
  bg_color VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial templates if table is empty
INSERT INTO automations (title, description, status, triggers, actions, stats_sent, stats_converted, icon, color, bg_color)
SELECT 'Abandoned Cart Recovery', 'Automatically send WhatsApp reminders to users who left items in their cart.', 'active', 'Cart Abandoned', '2 Messages', 1205, 342, 'Clock', 'text-orange-500', 'bg-orange-50'
WHERE NOT EXISTS (SELECT 1 FROM automations WHERE title = 'Abandoned Cart Recovery');

INSERT INTO automations (title, description, status, triggers, actions, stats_sent, stats_converted, icon, color, bg_color)
SELECT 'Welcome Series', 'Onboard new signups with a 3-day educational drip campaign.', 'active', 'New Signup', '3 Emails', 840, 512, 'Users', 'text-blue-500', 'bg-blue-50'
WHERE NOT EXISTS (SELECT 1 FROM automations WHERE title = 'Welcome Series');

INSERT INTO automations (title, description, status, triggers, actions, stats_sent, stats_converted, icon, color, bg_color)
SELECT 'Post-Purchase Feedback', 'Ask for a review on WhatsApp 7 days after an order is delivered.', 'paused', 'Order Delivered', '1 Message', 430, 85, 'MessageSquare', 'text-purple-500', 'bg-purple-50'
WHERE NOT EXISTS (SELECT 1 FROM automations WHERE title = 'Post-Purchase Feedback');
