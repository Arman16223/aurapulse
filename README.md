# ⚡ AuraPulse - Ultimate AI Fitness & Diet Architect Platform

AuraPulse is an elite, commercial-grade, multi-functional **AI Diet, Workout & Planning Platform**. Calibrated specifically for ectomorph "hardgainer" physiology, it combines advanced sports-science principles (mechanical tension, time-under-tension, complete amino acid profiling, and gut cooling kinetics) with premium glassmorphism visuals, smooth CSS layout transitions, live sound-synthesizing rest timers, and an interactive client-side NLP fitness consultant chatbot.

🖥️ **Live Webpage:** [https://arman16223.github.io/aurapulse/](https://arman16223.github.io/aurapulse/)

---

## 🎨 Premium UI/UX & Interaction Architecture

*   **Glassmorphism Visual Language:** Sleek dark mode styled with translucent panels, glow borders, and premium HSL neon gradients (Electric Indigo `#6366f1` to Neon Emerald `#10b981`).
*   **Onboarding Wizard & Process Loading Engine:** An immersive multi-step questionnaire that replaces static forms, feeding into an animated loading screen simulating sports science diagnostic procedures.
*   **Fluid Hydration Bubble:** A gorgeous custom CSS floating liquid wave circle that physically fills up as users log water cup-by-cup toward a 4.0L target.
*   **Dynamic Calorie & Macro surplus Adjuster:** A real-time slider in the dashboard sidebar allowing users to adjust caloric surpluses (+200 to +1000 kcal) and witness responsive protein, carb, and fat gauges adapt dynamically.

---

## 🔬 Scientific Core Pillars Under the Hood

### 1. Straight Sets vs. Circuits (Mechanical Tension)
AuraPulse transitions users away from calorie-depleting circuit training (which spikes metabolism but limits mechanical tension) toward **hypertrophy-focused Straight Sets**. 
By resting **2 to 3 minutes** between compound sets (using the integrated **Live Rest Timer**), trainees fully restore cellular ATP-CP stores, allowing subsequent sets to be performed with maximal mechanical tension—the primary driver of muscle hypertrophy (Schoenfeld et al., 2016).

### 2. Complete Vegetarian Amino Acid Pairing
Since plant-based proteins lack certain essential amino acids (EAAs), AuraPulse strategically structures meals to combine **lysine-deficient grains** (Roti, Rice, Daliya) with **methionine-deficient legumes** (Kala Chana, Mung Daal). This creates high-biological-value complete proteins that successfully trigger Muscle Protein Synthesis (MPS).

### 3. Gut Soothing & Appetite Hacks (Gond Katira & Ghee)
*   **Gond Katira:** Calms the digestive tract andcore body heat. It is scheduled during Meal 2 (11:00 AM) isolated from large meals, ensuring its high fiber content cools the stomach without blunting the appetite for main meals.
*   **Ghee:** Serves as a calorie-density hack (yielding 9 kcal/g). By spreading Ghee generously over rotis and rice, ectomorphs easily reach their +500 kcal surplus target without bloating or physical stomach distension.

---

## 💻 Integrated Audio-Visual Rest Timer
Built directly into the training days, the platform features a visual countdown timer. 
*   **Zero Asset Dependency:** AuraPulse synthesizes a beautiful electronic chime chord (C5 Major Third sliding to E5) dynamically in the browser via the **Web Audio API** when the rest countdown ends. 
*   This makes the application lightweight, fast, and 100% functional offline without loading external audio mp3 files.

---

## 📂 Project Architecture

```bash
aurapulse/
├── index.html     # Semantic DOM outline, onboarding wizard, and structural layouts
├── index.css      # Glassmorphism variables, float wave keyframes, and print stylesheets
├── index.js       # Mifflin-St Jeor calculations, Web Audio chime synthesizer, and NLP Chatbot
├── sitemap.xml    # Search engine crawl maps
├── robots.txt     # Crawler routing instructions
└── README.md      # Platform documentation (You are here!)
```

---

## 🛠️ Installation & Running Locally

Since AuraPulse is built using clean, client-side technologies, you can run it instantly without complex node modules dependencies.

### Option 1: Double Click (Instant)
1. Double-click the **`index.html`** file in your local directory.
2. It will open in your default browser instantly.

### Option 2: Lightweight Python Web Server
1. Open PowerShell / Command Prompt inside the `aurapulse` directory.
2. Execute:
   ```bash
   python -m http.server 8000
   ```
3. Open your browser and navigate to: `http://localhost:8000`

### Option 3: Node.js Serve
1. Run:
   ```bash
   npx serve
   ```
2. Open your browser and navigate to: `http://localhost:3000`

---

## 🚀 Commercial Monetization Ready

AuraPulse is engineered to capture consumer value in the fitness tech industry:
1.  **Print-to-PDF Report Generator:** Print stylesheets (`@media print`) format the entire 7-day diet and training calendar into clean, premium PDF sheets.
2.  **High-Ticket Intake Form:** A premium portal for paid 1-on-1 coaching services, providing a high-ticket conversion funnel.
3.  **Supplement & Gear Store:** Seamless integration blocks highlighting continuous loop bands and complete proteins.

---

## 🛡️ License & Credits
*   **Author:** [Arman16223](https://github.com/Arman16223)
*   **Research References:** Sports science metabolic equations calibrated via Mifflin-St Jeor and hypertrophy metrics sourced from Schoenfeld et al. (Journal of Strength and Conditioning Research).
