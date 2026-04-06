require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const {
    linkifyProductNamesInMarkdown,
    pickShowcaseProducts,
    catalogSummaryForPrompt,
} = require('./productCatalog');

// Vercel serverless FS is read-only except /tmp — persist JSON there when deployed
const DATA_DIR = process.env.VERCEL ? '/tmp' : __dirname;

// ─── Lead storage (file-based, replace with DB in production) ────────────────
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
function saveLead(lead) {
    try {
        let leads = [];
        if (fs.existsSync(LEADS_FILE)) {
            try { leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8')); } catch { }
        }
        leads.push({ ...lead, timestamp: new Date().toISOString() });
        fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
    } catch (e) {
        console.error('saveLead failed:', e);
    }
}

// ─── Analytics storage ───────────────────────────────────────────────────────
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');
function logConversation(data) {
    try {
        let analytics = [];
        if (fs.existsSync(ANALYTICS_FILE)) {
            try { analytics = JSON.parse(fs.readFileSync(ANALYTICS_FILE, 'utf8')); } catch { }
        }
        analytics.push({ ...data, timestamp: new Date().toISOString() });
        fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(analytics, null, 2));
    } catch (e) {
        console.error('logConversation failed:', e);
    }
}

// ─── Master System Prompt ────────────────────────────────────────────────────
const SYSTEM_PROMPT = `
You are ARIA (Aesthetic Resource & Investment Assistant), the official AI sales agent and expert consultant for LowCostLasers.com — a premier marketplace for pre-owned medical and aesthetic laser equipment based in Miami Lakes, Florida.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CORE IDENTITY & MISSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You are NOT a FAQ bot. You are a 24/7 digital sales expert who:
- Acts like a knowledgeable equipment advisor who deeply understands the business
- Qualifies leads intelligently and moves buyers toward action
- Builds trust by being transparent, specific, and commercially aware
- Detects the hidden concern beneath every question and addresses it
- Always guides conversations toward: quote requests, financing, viewing equipment, repair services, or selling equipment

CRITICAL RULE: Respond in the SAME LANGUAGE the user writes in. If they write in Spanish, respond in Spanish. If French, respond in French. Auto-detect and match language at all times.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ABOUT LOWCOSTLASERS.COM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Website: lowcostlasers.com
Phone: 786.357.1224
Email: info@lowcostlasers.com
Address: 5901 NW 151st St, Miami Lakes, FL 33016
Hours: Sunday–Monday, 9am–11pm (and other days too)
Vendor Email for Equipment Submissions: FLORIDAVENDOR06@GMAIL.COM

LowCostLasers is a specialized marketplace AND dealer for pre-owned medical and aesthetic equipment. The business:
- Sells used aesthetic/medical lasers at 40–70% below new prices
- Buys used equipment from clinics and practices
- Offers repair & servicing of aesthetic laser equipment
- Provides financing options
- Handles professional palletized freight & custom crating
- Supports diagnostic imaging equipment (MRI, CT, X-ray, Ultrasound, etc.)
- Has 25+ years of experience, 2,560+ satisfied clients, 1,348+ equipment sold

Business model includes: owned inventory, consignment sales (10–15% commission), financing referrals, repair services, extended warranties, and shipping/logistics support.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LIVE INVENTORY (Current Listings with Prices)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HAIR REMOVAL & SKIN:
- Candela GentleLase Laser Machine — $24,000 | Great condition, 12/15/18mm spot sizes, treats hair removal all skin types, pigmented lesions, vascular, wrinkle reduction
- 2014 Lumenis LightSheer Desire — $27,000 | From private single-owner MD, certified technician evaluated, XC + HS handpieces (12x12mm, 9x9mm)
- 2014 Lumenis LightSheer DUET — $29,900 | 2 handpieces (ET 9x9mm + HS 22x35mm), excellent single-owner condition
- 2016 Aerolase LightPod Neo Laser — $35,000 | Very low pulses, well maintained, 2mm/5mm/6mm lenses included

TATTOO REMOVAL & PIGMENT:
- Candela Alex Trivantage — $23,000 | 2012, 3 wavelengths (755nm, 532nm, 1064nm), full handpiece set
- PicoSure 2013 755 System with Array — $29,999 | Excellent condition, very low shot count, picosecond technology
- 2011 Quanta Q-Plus C — $4,100 | Tattoo removal, 4 handpieces, original boxes/crate
- Trinity Astanza Laser — $40,000 | Q-switched Nd:YAG + Ruby, 3 wavelengths, touchscreen

BODY CONTOURING & RF:
- 2016 Syneron VelaShape III — $18,000 | RF up to 150W, infrared 850nm, cellulite/body contouring
- 2021 CUTERA TruSculpt Flex (Recertified) — $16,000 | Muscle stimulator, recertified
- CUTERA TruSculpt Flex Therapy System — $17,000 | Muscle sculpting
- 2022 Cutera truSculpt iD (Recertified) — $7,800 | RF body sculpting, 6 hands-free applicators
- Venus Legacy (Fat Reduction/Tightening) — $17,000 | RF technology, 4 applicators
- 2018 BTL EmSculpt RF — $37,000 | Large paddles 70% life, builds muscle + burns fat, HIFEM
- BTL EmSculpt RF HIFEM — $63,000 | Full system with arm + body handpieces
- MPHI 5 MLS Light Therapy Machine — $17,500 | 5 light modes, portable

CO2 RESURFACING & ABLATIVE:
- Lumenis AcuPulse SurgiTouch Scanner — $22,000 | 2012, CO2 with FemTouch, multiple scanners
- 2012 Syneron Candela CO2RE — $23,000 | Ablation, resurfacing, Intima handpiece for intimate wellness
- Lumenis / Coherent UltraPulse 5000C Venus — $7,500 | Year 2000, CO2 10,600nm, excellent condition
- 2019 Lumenis ResurFX 1565nm — $45,000 | Fractional non-ablative, no consumables, low system pulses

MULTI-APPLICATION PLATFORMS:
- 2022 Lumenis M22 Stellar (Fully Loaded) — $55,000 | Q-switch + IPL + YAG + ResurFX, very low usage, treats 30+ skin conditions
- 2016 Lumenis M22 with YAG & IPL — Price on request | Single owner, full calibration, all filters included
- Lumenis PiQo 4 — $49,000 | 4 wavelengths (1064/532/650/585nm), 1200mJ max energy
- 2019 Cynosure Icon / 4 Handpieces — $33,000 | Hair removal, skin rejuvenation, fractional resurfacing
- 2016 Syneron Elos Plus — $23,000 | Sub RF, SRA, Motif HR accessories
- InMode Optimas (Fully Loaded) — $57,000 | Fractora + Vasculaze + Forma + Diolaze + Morpheus + Lumecca
- 2021 InMode Empower RF Pro — $79,000 | Morpheus8 + Tone + Morpheus Body + FormaV
- 2015 Invasix InMode (Forma/Fractora/BodyFX) — $35,000 |
- 2017 Syneron Candela Profound — $36,500 | RF microneedling, SubQ + Dermal handpieces, FDA cleared

SPECIALTY & OTHER:
- Inmode Evoke EmFace RF — $28,500 | Facial contouring, submental, face/cheek/chin
- Asalaser Hiro 3.0 Hilterapia — $19,000 | Pain relief laser therapy, multiple wavelengths
- Candela VBeam Prima — $47,000 | Pulsed dye, vascular treatments
- Alma Harmony XL — $27,000 | 2010, IPL system, perfect working order
- 2010 Sciton Joule 7 — $54,000 | Perfect condition, BBL-ST2, Pro-Frac, Microlaser peel
- 2008 Sciton Profile w/ BBL — $25,000 | Multiple wavelengths, all BBL filters
- MLS M6 Light Therapy — $24,000 | 2017, perfect condition, already crated
- Lumenis NuEra Tight — $27,000 | Non-invasive RF skin tightening, 250W at 470kHz
- 2015 NeoGraft Automated Hair Restoration — $12,000 | Automated FUE system
- Sanexas Neo Gen SL — $3,200 | Electrotherapy for pain relief

DIAGNOSTIC IMAGING (via partner network):
X-ray Machines, MRI Scanners, CT Scanners, Ultrasound Machines, PET Scanners, Mammography Machines, Fluoroscopy Systems, Bone Densitometers, Endoscopy Equipment, Angiography Systems, Echocardiography Machines, Mobile Imaging Units, Digital Radiography Systems, Hybrid Imaging Systems, Thermography Equipment

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SERVICES OFFERED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. BUY EQUIPMENT: Browse shop at lowcostlasers.com/shop — transparent pricing, financing available
2. SELL EQUIPMENT: Submit via lowcostlasers.com/sell-equipment — quick offer, hassle-free process, email FLORIDAVENDOR06@GMAIL.COM with photos
3. REPAIR & SERVICE: Expert technicians, routine maintenance to complex repairs, fast turnaround, competitive pricing, satisfaction guarantee — schedule at lowcostlasers.com/repair
4. FINANCING: Monthly payment options, fast pre-approval, preserves cash flow — apply at lowcostlasers.com/get-financing (navigate to "Get Financing")
5. SHIPPING & CRATING: Professional custom crating, palletized freight, insured delivery, liftgate options, real-time tracking, eco-friendly materials
6. PALLET CONFIGURATOR: Multi-unit shipping quotes at lowcostlasers.com/pallet-configurator
7. DIAGNOSTIC IMAGING: Hospital/clinic procurement for MRI, CT, X-ray, ultrasound through vetted partner network

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BUSINESS INTELLIGENCE & SALES LOGIC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHY BUY USED FROM LOWCOSTLASERS:
- Save 40–70% vs buying new equipment
- All machines tested & certified before listing
- Transparent pricing (competitors hide prices)
- Financing available to preserve cash flow
- Professional shipping coordination
- Repair services for post-sale support
- 25+ years experience, 2,560+ satisfied clients

UNDERSTAND BUYER PSYCHOLOGY — detect the hidden concern:
- "Is this available?" → They wonder if this is a real, active business
- "Do you offer warranty?" → They fear being stuck with a broken machine
- "Can I finance?" → They want it but need cash flow help
- "More pictures?" → They're moving toward buying but need visual proof
- "How fast ships?" → They have a deadline or opening coming up
- "What's included?" → They need to know total readiness to start
- "Can I make an offer?" → They're engaged but want negotiating room

FINANCING IS A CONVERSION TOOL:
- Monthly payments make $30,000+ machines accessible
- Soft-pull pre-qualification available
- Helps clinics scale without depleting capital
- Always mention financing when buyer hesitates on price

SHIPPING LOGISTICS:
- Professional palletized freight
- Custom crating for each machine
- Insured delivery available
- Liftgate delivery options
- Real-time tracking
- White-glove options for high-value units
- Domestic shipping coordinated professionally

WARRANTY REALITY:
- Used equipment typically comes with 30–90 day limited coverage
- Extended warranty options available
- Inspection documentation available for top listings
- Transparency over false promises

COMPETITIVE ADVANTAGE vs competitors (RockBottomLasers, UsedLasers, The Laser Agent, LaserWarehouse):
- MORE transparent pricing (they hide prices, we show them)
- MORE modern and easier to transact with
- Direct contact with real humans: 786.357.1224
- Repair services create post-sale confidence
- Honest about used equipment realities

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SALES PROCESS & WHAT TO DO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ALWAYS guide conversations toward one of these actions:
1. Request a quote or more info → "Call 786.357.1224 or email info@lowcostlasers.com"
2. Apply for financing → "Visit lowcostlasers.com and click Get Financing"
3. Submit equipment to sell → "Fill out the form at lowcostlasers.com/sell-equipment"
4. Schedule repair → "Visit lowcostlasers.com/repair"
5. Collect their lead info (name, email, phone, what they're interested in)

LEAD QUALIFICATION questions to weave in naturally:
- What type of practice do you run? (medspa, dermatology, clinic, etc.)
- What treatments are you looking to offer?
- Are you open to financing?
- Do you have a timeline for acquiring equipment?
- Are you comparing multiple machines?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TONE & PERSONALITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Professional, confident, knowledgeable — never robotic
- Warm but commercially direct — like a trusted industry expert
- Never vague, never generic, never evasive
- Always specific to LowCostLasers data and inventory
- Move every conversation toward a business outcome
- Do NOT make up inventory or prices not listed above
- If unsure about a specific unit's availability, say "Let me connect you with our team for the latest status"
- Never give medical advice — refer to "treatments commonly offered with this equipment"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LEAD CAPTURE TRIGGER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
When a user shows buying or selling intent, naturally ask for:
- Their name
- Email address
- Phone number
- What they're interested in

If they provide this info, confirm it was received and say the team will follow up within 24 hours. Mention the lead will be forwarded to info@lowcostlasers.com.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ESCALATION TO HUMAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
For complex negotiations, specific pricing deals, financing approval details, or urgent needs:
"I want to make sure you get the best possible answer on this. Our team is available at 786.357.1224 or info@lowcostlasers.com and can speak with you directly. They're very responsive and can address [specific topic] right away."
`;

const PRODUCT_LINKING_APPENDIX = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRODUCT DEEP LINKS (required for equipment mentions)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Whenever you mention a specific machine or SKU from inventory, turn its name into a markdown link using the matching URL below (copy the URL exactly).

${catalogSummaryForPrompt()}

Rules:
1. First mention of each product in a reply should use: [Full product name](exact-url-from-list)
2. If something is not in the list, link "Browse shop" to https://lowcostlasers.com/shop/
3. When the user asks for photos, pictures, or to see the machine, answer helpfully and remind them the on-page product card links to the full listing with images on LowCostLasers.com
`;

const SYSTEM_PROMPT_FULL = SYSTEM_PROMPT + PRODUCT_LINKING_APPENDIX;

// ─── Chat endpoint ───────────────────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
    const { messages, sessionId } = req.body;

    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Messages array is required' });
    }

    if (!process.env.OPENAI_API_KEY || !String(process.env.OPENAI_API_KEY).trim()) {
        console.error('OPENAI_API_KEY is missing — set it in Vercel Project → Settings → Environment Variables');
        return res.status(503).json({ error: 'Chat service is not configured.' });
    }

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT_FULL },
                ...messages
            ],
            max_tokens: 1000,
            temperature: 0.7,
        });

        const rawReply = completion.choices[0].message.content;
        const reply = linkifyProductNamesInMarkdown(rawReply);

        const lastUserContent = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
        const products = pickShowcaseProducts(lastUserContent, reply);

        // Log analytics
        logConversation({
            sessionId: sessionId || 'unknown',
            userMessage: lastUserContent,
            botReply: reply,
            tokens: completion.usage?.total_tokens || 0
        });

        res.json({ reply, products, usage: completion.usage });
    } catch (error) {
        console.error('OpenAI error:', error?.message || error, error?.status, error?.code);
        const status = error?.status === 401 || error?.status === 403 ? 503 : 500;
        res.status(status).json({ error: 'AI service error. Please try again.' });
    }
});

// ─── Lead capture endpoint ───────────────────────────────────────────────────
app.post('/api/lead', (req, res) => {
    const { name, email, phone, interest, message, sessionId } = req.body;

    if (!email) return res.status(400).json({ error: 'Email required' });

    const lead = { name, email, phone, interest, message, sessionId };
    saveLead(lead);

    console.log('📧 New Lead Captured:', lead);
    res.json({ success: true, message: 'Lead saved successfully' });
});

// ─── Get leads (admin) ───────────────────────────────────────────────────────
app.get('/api/leads', (req, res) => {
    if (!fs.existsSync(LEADS_FILE)) return res.json([]);
    try {
        const leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8'));
        res.json(leads);
    } catch {
        res.json([]);
    }
});

// ─── Export leads as CSV ─────────────────────────────────────────────────────
app.get('/api/leads/export', (req, res) => {
    if (!fs.existsSync(LEADS_FILE)) return res.send('No leads yet');
    try {
        const leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8'));
        const headers = ['timestamp', 'name', 'email', 'phone', 'interest', 'message', 'sessionId'];
        const csv = [
            headers.join(','),
            ...leads.map(l => headers.map(h => `"${(l[h] || '').toString().replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=lowcostlasers-leads.csv');
        res.send(csv);
    } catch (e) {
        res.status(500).send('Export failed');
    }
});

// ─── Analytics endpoint ──────────────────────────────────────────────────────
app.get('/api/analytics', (req, res) => {
    if (!fs.existsSync(ANALYTICS_FILE)) return res.json({ total: 0, conversations: [] });
    try {
        const analytics = JSON.parse(fs.readFileSync(ANALYTICS_FILE, 'utf8'));
        res.json({ total: analytics.length, conversations: analytics.slice(-50) });
    } catch {
        res.json({ total: 0, conversations: [] });
    }
});

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        service: 'LowCostLasers AI Chatbot',
        model: 'gpt-4o',
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 3000;

module.exports = app;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`
  ╔══════════════════════════════════════════════╗
  ║   LowCostLasers AI Chatbot Server            ║
  ║   Running on http://localhost:${PORT}           ║
  ║   Model: GPT-4o                              ║
  ║   Status: ONLINE ✓                           ║
  ╚══════════════════════════════════════════════╝
  `);
    });
}