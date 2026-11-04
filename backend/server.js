
/**
 * BLUE MONKEY CARD - Lithic Native Backend
 * Secured Credit Builder - Lead Bank Sponsor
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(bodyParser.json());

// Lithic Client - Sandbox vs Production
const LITHIC_KEY = process.env.LITHIC_API_KEY;
const LITHIC_URL = process.env.LITHIC_BASE_URL || 'https://sandbox.lithic.com';

const lithic = axios.create({
  baseURL: LITHIC_URL,
  headers: { 
    Authorization: LITHIC_KEY,
    'Content-Type': 'application/json'
  }
});

// Simple in-memory DB - Replace with Supabase/Neon Postgres for production
let users = [];
let cards = [];
let transactions = [];

console.log(`[Blue Monkey] Starting with Lithic at ${LITHIC_URL}`);

// --- 1. SIGNUP + KYC ---
app.post('/api/signup', async (req, res) => {
  const { email, name, phone, ssn_last4, dob } = req.body;
  if (!email || !name) return res.status(400).json({ error: 'email and name required' });

  // LIVE: Call Persona API here
  // const persona = await axios.post('https://withpersona.com/api/v1/inquiries', {...})
  // For sandbox, auto-approve if email valid
  const kycStatus = 'APPROVED';
  const kycId = `kyc_${Date.now()}`;

  const user = {
    id: `user_${Date.now()}`,
    email, name, phone, ssn_last4, dob,
    kycStatus,
    kycId,
    lithicAccountToken: null, // Will create in next step
    createdAt: new Date().toISOString(),
    balanceCents: 0
  };
  users.push(user);
  
  // LITHIC STEP: Create Account Holder (required for real cards in production)
  // In sandbox this is optional, but we do it for production readiness
  try {
    if (LITHIC_KEY && LITHIC_KEY !== 'your_sandbox_key_here') {
      const holderRes = await lithic.post('/v1/account_holders', {
        first_name: name.split(' ')[0],
        last_name: name.split(' ').slice(1).join(' ') || 'Monkey',
        email: email,
        phone_number: phone || '+15551234567',
        address: {
          address1: '123 Banana Lane',
          city: 'Austin',
          state: 'TX',
          postal_code: '78701',
          country: 'USA'
        },
        kyc_exempt: true, // Set false in production, requires real KYC
        business_account_token: process.env.LITHIC_BUSINESS_TOKEN
      });
      user.lithicAccountToken = holderRes.data.token;
    }
  } catch (e) {
    console.warn('[Lithic] Account holder creation skipped (sandbox no key or KYC):', e.response?.data || e.message);
  }

  console.log(`[Blue Monkey] New user: ${email} - KYC: ${kycStatus}`);
  res.json({ user, message: 'Ooo-ooo! Approved! Welcome to Blue Monkey Card 🐒' });
});

// --- 2. DEPOSIT + CREATE BLUE MONKEY CARD (Secured) ---
app.post('/api/deposit', async (req, res) => {
  const { userId, amountCents } = req.body; // 20000 = $200
  if (!amountCents || amountCents < 10000) return res.status(400).json({ error: 'Minimum $100 deposit (10000 cents)' });

  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'user not found' });
  if (user.kycStatus !== 'APPROVED') return res.status(403).json({ error: 'KYC not approved' });

  user.balanceCents = amountCents;

  try {
    let lithicCard;
    if (LITHIC_KEY && LITHIC_KEY !== 'your_sandbox_key_here') {
      // REAL LITHIC CALL - Creates virtual card with spend limit = deposit
      const resCard = await lithic.post('/v1/cards', {
        type: 'VIRTUAL', // Change to 'PHYSICAL' for blue metal after approval
        memo: `Blue Monkey Card - ${user.name} - Secured`,
        spend_limit: amountCents, // Secured: limit = deposit
        spend_limit_duration: 'FOREVER', // Lifetime limit for secured card
        state: 'OPEN',
        // For custom blue metal later:
        // type: 'PHYSICAL',
        // shipping_address: { ... },
        // product_id: 'blue_metal_product', // You create this in Lithic dashboard with your design
        account_holder_token: user.lithicAccountToken || undefined
      });
      lithicCard = resCard.data;
    } else {
      // Mock card when no key (demo mode)
      lithicCard = {
        token: `card_mock_${Date.now()}`,
        last_four: '1967',
        state: 'OPEN',
        spend_limit: amountCents,
        type: 'VIRTUAL',
        memo: `Blue Monkey Card - ${user.name}`
      };
    }

    const card = {
      id: lithicCard.token,
      userId,
      lithicToken: lithicCard.token,
      lastFour: lithicCard.last_four || '1967',
      limitCents: amountCents,
      state: lithicCard.state,
      type: lithicCard.type,
      createdAt: new Date().toISOString(),
      // Custom design reference
      design: {
        color: 'Electric Blue #2D7FF9',
        mascot: 'blue_monkey_swing_final.png',
        chipColor: 'Banana Yellow #FFD60A'
      }
    };
    cards.push(card);

    console.log(`[Blue Monkey] Card created: ...${card.lastFour} for ${user.email} - Limit $${amountCents/100}`);
    res.json({ 
      card, 
      user,
      message: `Blue is swinging! Your Blue Monkey Card ...${card.lastFour} is live with $${amountCents/100} limit. Add to Apple Pay!` 
    });

  } catch (e) {
    console.error('[Lithic Error]', e.response?.data || e.message);
    res.status(500).json({ error: 'Card creation failed', details: e.response?.data || e.message });
  }
});

// --- 3. LIST CARDS FOR USER ---
app.get('/api/cards/:userId', (req, res) => {
  const userCards = cards.filter(c => c.userId === req.params.userId);
  res.json(userCards);
});

// --- 4. LITHIC WEBHOOK - Real Visa transactions ---
app.post('/api/webhooks/lithic', (req, res) => {
  const event = req.body;
  console.log('[Blue Monkey Webhook] Event:', event.event_type || event.type);

  // Lithic webhook format: event_type + data
  const type = event.event_type || event.type;
  const data = event.data || event;

  if (type === 'transaction.created' || type === 'transaction') {
    // Real spend at H-E-B, Whataburger, etc.
    transactions.push({
      id: data.token,
      cardToken: data.card_token,
      amountCents: data.amount, // Negative = spend, positive = refund
      merchant: data.merchant?.descriptor || data.merchant?.name || 'Unknown Merchant',
      mcc: data.merchant?.mcc,
      status: data.status || 'PENDING',
      createdAt: new Date().toISOString(),
      // For Bananas rewards
      bananasEarned: Math.abs(data.amount) > 0 ? Math.floor(Math.abs(data.amount) / 100) : 0 // 1 banana per $1
    });
    console.log(`[Blue Monkey] Transaction: $${Math.abs(data.amount)/100} at ${data.merchant?.descriptor}`);
  }

  if (type === 'card.shipped') {
    console.log(`[Blue Monkey] Blue Metal Card shipped! Token: ${data.token}`);
  }

  // Must return 200 quickly for Lithic
  res.status(200).json({ received: true });
});

// --- 5. TRANSACTIONS FOR USER ---
app.get('/api/transactions/:userId', (req, res) => {
  const userCardTokens = cards.filter(c => c.userId === req.params.userId).map(c => c.id);
  const userTx = transactions.filter(t => userCardTokens.includes(t.cardToken));
  res.json(userTx);
});

// --- 6. ADD MONEY / PAY BALANCE ---
app.post('/api/pay', async (req, res) => {
  const { userId, amountCents } = req.body;
  // In live: Call Plaid + Stripe ACH to pull from user's bank to sponsor bank
  // For now: mock payment
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'user not found' });
  
  // Simulate payment reduces balance owed (simplified for secured card)
  res.json({ message: `Payment of $${amountCents/100} received! Blue does a happy dance 🐒🍌`, newBalance: 0 });
});

// --- 7. FREEZE / UNFREEZE CARD ---
app.post('/api/cards/:cardId/freeze', async (req, res) => {
  const card = cards.find(c => c.id === req.params.cardId);
  if (!card) return res.status(404).json({ error: 'card not found' });

  try {
    if (LITHIC_KEY) {
      await lithic.patch(`/v1/cards/${card.lithicToken}`, { state: 'PAUSED' });
    }
    card.state = 'PAUSED';
    res.json({ card, message: 'Blue is frozen! 🥶 Card paused.' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/', (req, res) => {
  res.send(`
    <h1>🐒 Blue Monkey Card API - Lithic Native</h1>
    <p>Live on Lead Bank via Lithic</p>
    <ul>
      <li>POST /api/signup - Create user + KYC</li>
      <li>POST /api/deposit - Create secured Blue Monkey Card (Lithic)</li>
      <li>GET /api/cards/:userId - List cards</li>
      <li>POST /api/webhooks/lithic - Lithic transaction webhook</li>
      <li>GET /api/transactions/:userId - Transactions + Bananas</li>
    </ul>
    <p>Ooo-ooo! Ready to swing!</p>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🐒 Blue Monkey Card (Lithic + Lead Bank) swinging on http://localhost:${PORT}`));
