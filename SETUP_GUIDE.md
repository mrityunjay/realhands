# RealHands — Setup Guide
Follow these steps IN ORDER. Each step has a link and exact instructions.

---

## STEP 1 — Create Meta Developer Account (15 min)
This gives you access to WhatsApp API.

1. Go to: https://developers.facebook.com
2. Click "Get Started" → log in with your Facebook account
3. Click "Create App" → choose "Business" → click Next
4. App name: `RealHands` → click "Create App"
5. On the next screen, scroll to **WhatsApp** → click "Set Up"
6. You'll land on WhatsApp API Setup page

---

## STEP 2 — Get Your API Credentials (10 min)
On the WhatsApp API Setup page:

1. Under "Step 1 — Select phone numbers", note the **Phone Number ID** → copy it
2. Under "Temporary access token" → click "Generate" → copy the token

Now open your `.env` file and fill in:
```
WHATSAPP_PHONE_NUMBER_ID=paste_here
WHATSAPP_ACCESS_TOKEN=paste_here
WHATSAPP_VERIFY_TOKEN=realhands_secret_2024
```

⚠️ Temporary token expires in 24 hours. For permanent: go to System Users in Business Manager.

---

## STEP 3 — Add Your Phone Number for Testing
Still on WhatsApp API Setup:

1. Under "Step 2 — Send and receive messages"
2. "To" field → click "Manage phone number list"
3. Add YOUR mobile number
4. You'll receive a WhatsApp verification code → enter it
5. Now Meta can send messages to your number for testing

---

## STEP 4 — Deploy to Railway (Free Hosting) (10 min)

1. Go to: https://railway.app
2. Click "Start a New Project" → "Deploy from GitHub repo"
   (First connect your GitHub: push this folder to GitHub)

   OR use Railway CLI:
   ```bash
   npm install -g @railway/cli
   railway login
   railway init
   railway up
   ```

3. Go to your Railway project → Settings → Environment Variables
4. Add all values from your `.env` file

⚠️ **CRITICAL — add a persistent volume or you lose all data on every redeploy:**
   - In Railway: your service → **Variables** → add `DB_PATH=/data/realhands.db`
   - Your service → **Settings → Volumes** → "New Volume" → mount path `/data`
   - SQLite now lives on the volume and survives restarts/redeploys.

5. Railway gives you a URL like: `https://realhands-production.up.railway.app`
   Copy this URL — you need it in Step 5.

---

## STEP 5 — Connect Webhook to WhatsApp (5 min)

1. Go back to Facebook Developers → Your App → WhatsApp → Configuration
2. Under "Webhook" → click "Edit"
3. Callback URL: `https://YOUR_RAILWAY_URL/webhook`
4. Verify Token: `realhands_secret_2024`
5. Click "Verify and Save"
6. Under "Webhook fields" → subscribe to **messages**

---

## STEP 6 — Test It! 🎉

Send a WhatsApp message to the test number Meta gave you:
- Type: `KAAM` → you should see the worker registration flow
- Type: `HIRE` → you should see the employer flow

---

## STEP 7 — View Your Dashboard

Open in browser:
```
https://YOUR_RAILWAY_URL/dashboard
```
Password: `realhands123` (change this in .env → DASHBOARD_PASSWORD)

---

## Running Locally (for testing before deploy)

```bash
# In Terminal, go to this folder:
cd /Users/mrityunjaykum.ranjan/labourday

# Fill in your .env file first, then:
npm start

# Server runs at: http://localhost:3000
# Dashboard at:   http://localhost:3000/dashboard
```

For local testing, use ngrok to expose localhost to WhatsApp:
```bash
brew install ngrok
ngrok http 3000
# Copy the https URL → use as webhook URL in Step 5
```

---

## Support
If anything doesn't work, send the error message to your developer.
