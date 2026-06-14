require('dotenv').config({ path: __dirname + '/../.env' });
const { createClient } = require('@supabase/supabase-js');
const { fakerEN_IN: faker } = require('@faker-js/faker');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function seedAnalytics() {
  console.log('🌱 Starting Analytics Seeding...');

  const engagements = [];
  const channels = ['WhatsApp', 'Instagram', 'Email', 'Facebook', 'SMS'];
  const eventTypes = ['Sent', 'Delivered', 'Opened', 'Clicked', 'Purchased'];

  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString();
    
    const dailyEvents = faker.number.int({ min: 100, max: 200 });
    
    for (let j = 0; j < dailyEvents; j++) {
      engagements.push({
        event_time: dateStr,
        channel: faker.helpers.arrayElement(channels),
        event_type: faker.helpers.arrayElement(eventTypes),
        user_id: faker.number.int({ min: 10001, max: 11000 }),
        campaign_id: 1
      });
    }
  }

  // Insert in chunks
  let inserted = 0;
  for (let i = 0; i < engagements.length; i += 500) {
    const chunk = engagements.slice(i, i + 500);
    const { error } = await supabase.from('engagements').insert(chunk);
    if (error) {
      console.error('Error seeding engagements chunk:', error.message);
    } else {
      inserted += chunk.length;
    }
  }

  console.log(`✅ Successfully seeded ${inserted} engagements.`);
}

seedAnalytics();
