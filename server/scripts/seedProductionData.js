const { Pool } = require('pg');
require('dotenv').config({ path: './.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const wsId = '11111111-1111-4111-8111-111111111111';

  // 1. Check automation rules
  const rulesCount = await pool.query('SELECT count(*) FROM automation_rules WHERE workspace_id = $1;', [wsId]);
  console.log('Current automation rules count:', rulesCount.rows[0].count);

  if (parseInt(rulesCount.rows[0].count, 10) === 0) {
    console.log('Seeding baseline automation rules...');
    const rules = [
      {
        name: 'Welcome Greeting & Quick Menu',
        trigger: 'KEYWORD',
        conditions: JSON.stringify([{ type: 'keywords', value: ['hi', 'hello', 'namaste', 'hey', 'start'] }]),
        actions: JSON.stringify([
          {
            type: 'send_interactive',
            header: '🏛️ Prakash Institute of Science & Technology',
            message: 'Namaste! 🙏 Welcome to Prakash Institute (Kota & Delhi NCR).\n\nAdmissions for Academic Session 2027 are now open. How can we guide your preparation today?',
            footer: '👉 Tap a quick link below to get instant info',
            buttons: [
              { id: 'btn-101', title: '📚 Course Fees', payload: 'COURSE_FEES' },
              { id: 'btn-102', title: '🎯 Book Free Demo', payload: 'BOOK_DEMO' },
              { id: 'btn-103', title: '📍 Campus & Hostel', payload: 'CAMPUS_HOSTEL' }
            ]
          }
        ]),
        priority: 10,
        enabled: true
      },
      {
        name: 'Course Fees & Scholarship Disclosure',
        trigger: 'KEYWORD',
        conditions: JSON.stringify([{ type: 'keywords', value: ['fee', 'fees', 'charges', 'price', 'cost', 'scholarship'] }]),
        actions: JSON.stringify([
          {
            type: 'send_text',
            message: '📘 Prakash Institute Program Fee Structure (2026-27):\n\n1️⃣ JEE Dropper (1-Year): ₹45,000/yr\n2️⃣ Foundation JEE (11th & 12th): ₹35,000/yr\n3️⃣ NEET Medical Intensive: ₹55,000/yr\n\n🎁 Merit Scholarship: Up to 75% discount based on our scholarship assessment test!'
          }
        ]),
        priority: 20,
        enabled: true
      },
      {
        name: 'Free Live Demo Class Reservation',
        trigger: 'KEYWORD',
        conditions: JSON.stringify([{ type: 'keywords', value: ['demo', 'trial', 'free class', 'sample lecture'] }]),
        actions: JSON.stringify([
          {
            type: 'send_interactive',
            header: '🎯 Reserve Free Demo Class Seat',
            message: 'Great! Experience Kota’s top faculty in live classroom action. Which demo batch would you like to join?',
            footer: 'Free access for students & parents',
            buttons: [
              { id: 'btn-demo-jee', title: '⚡ Physics Demo', payload: 'SLOT_JEE_PHYSICS' },
              { id: 'btn-demo-neet', title: '🧬 Biology Demo', payload: 'SLOT_NEET_BIOLOGY' }
            ]
          }
        ]),
        priority: 30,
        enabled: true
      },
      {
        name: 'Stop & Opt-Out Compliance Handler',
        trigger: 'KEYWORD',
        conditions: JSON.stringify([{ type: 'keywords', value: ['stop', 'unsubscribe', 'optout', 'cancel'] }]),
        actions: JSON.stringify([
          {
            type: 'opt_out_contact',
            message: 'You have been successfully unsubscribed from Prakash Institute WhatsApp alerts. Send "START" anytime to resubscribe.'
          }
        ]),
        priority: 1,
        enabled: true
      }
    ];

    for (const r of rules) {
      await pool.query(
        `INSERT INTO automation_rules (workspace_id, name, trigger, conditions_json, actions_json, priority, stop_flag, enabled)
         VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6, TRUE, $7);`,
        [wsId, r.name, r.trigger, r.conditions, r.actions, r.priority, r.enabled]
      );
    }
    console.log('✅ Baseline automation rules seeded into Neon PostgreSQL!');
  }

  await pool.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

