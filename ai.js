import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.14.0';

env.allowLocalModels = false;
env.localModelPath = null;
env.useBrowserCache = true;

let generatorPromise = null;

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
  ]);
}

function pageKind() {
  const p = (location.pathname || '').toLowerCase();
  if (p.includes('dashboard')) return 'dashboard';
  if (p.includes('tracker')) return 'tracker';
  if (p.includes('login')) return 'login';
  return 'index';
}

function fallbackAnswer(prompt) {
  const k = pageKind();
  const p = (prompt || '').toLowerCase();
  if (k === 'tracker') {
    if (p.includes('track')) return 'This page shows the live tracker. You can see ETA above and the map updates as the BaoBao moves.';
    if (p.includes('arrive') || p.includes('eta')) return 'ETA updates automatically based on progress along the route shown on the map.';
    if (p.includes('rate') || p.includes('rating')) return 'You can rate the ride once it arrives. A rating popup will appear and you can earn points.';
    if (p.includes('points') || p.includes('rewards') || p.includes('free ride')) return 'Rating a ride grants 5 points. Every 50 points gives 1 Free Ride, usable during booking.';
    return 'Ask me about live tracking, ETA, rating, or points. I can help guide you through the tracker.';
  }
  if (k === 'dashboard') {
    if (p.includes('register')) return 'To register, go to Register on the home page, fill in your details, then login to access the dashboard.';
    if (p.includes('login') || p.includes('log in')) return 'Use your ID number and password on the Login page. After logging in, you will be redirected to the dashboard.';
    if (p.includes('book')) return 'On the dashboard, choose a card and click Book Now. Wait 5s to enable payment options, then select a method.';
    if (p.includes('track')) return 'After booking/payment, click Track Now to open the live tracker with real‑time location and ETA.';
    if (p.includes('pay')) return 'You can pay Personal or Online (scan the QR). After payment you can proceed to Track Now.';
    if (p.includes('points') || p.includes('rewards') || p.includes('free ride')) return 'You earn 5 points after rating a ride. Every 50 points grants 1 Free Ride. Points and Free Rides show in the header.';
    if (p.includes('profile') || p.includes('name') || p.includes('email')) return 'Use Edit Profile on the header to update your name and email. Changes are saved locally.';
    return 'I am here to help with booking, payments, tracking, and rewards. What would you like to do?';
  }
  if (k === 'login') {
    if (p.includes('login') || p.includes('password') || p.includes('id')) return 'Enter your ID number and password, then press Login to go to the dashboard.';
    if (p.includes('register') || p.includes('sign up')) return 'Click Register to create your account first, then return here to login.';
    return 'Ask me about logging in or registering. I can guide you to the next step.';
  }
  // index
  if (p.includes('register')) return 'To register, click Register on the home page, fill in your details, then login to access the dashboard.';
  if (p.includes('login') || p.includes('log in')) return 'Use your ID number and password on the Login page. After logging in, you will be redirected to the dashboard.';
  if (p.includes('book')) return 'On the dashboard, choose a card and click Book Now. Wait 5s to enable payment options, then select a method.';
  if (p.includes('track')) return 'After booking/payment, click Track Now to open the live tracker with real‑time location and ETA.';
  if (p.includes('pay')) return 'You can pay Personal or Online (scan the QR). After payment you can proceed to Track Now.';
  if (p.includes('points') || p.includes('rewards') || p.includes('free ride')) return 'You earn 5 points after rating a ride. Every 50 points grants 1 Free Ride. Points and Free Rides show in the header.';
  return 'I am here to help with registration, login, and next steps. What would you like to do?';
}

async function ensureGenerator() {
  if (!generatorPromise) {
    generatorPromise = (async () => {
      try {
        return await pipeline('text-generation', 'Xenova/Qwen2.5-0.5B-Instruct', { device: 'wasm' });
      } catch (e) {
        return await pipeline('text-generation', 'Xenova/distilgpt2', { device: 'wasm' });
      }
    })();
  }
  return generatorPromise;
}

window.generateAIResponse = async function(prompt) {
  try {
    const gen = await withTimeout(ensureGenerator(), 8000);
    const prefix = 'You are a concise, helpful BaoBao assistant. Keep answers short and actionable.\nUser: ' + prompt + '\nAssistant:';
    const out = await withTimeout(gen(prefix, { max_new_tokens: 160, temperature: 0.7, top_p: 0.9 }), 10000);
    const text = (out && out[0] && out[0].generated_text) ? out[0].generated_text : '';
    const cleaned = text.replace(prefix, '').trim();
    return cleaned || fallbackAnswer(prompt);
  } catch (e) {
    return fallbackAnswer(prompt);
  }
};

(async () => { try { await ensureGenerator(); } catch (e) {} })();
