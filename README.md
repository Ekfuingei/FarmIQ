# 🌱 FarmIQ — The African Farmer's Super-App

One app that replaces the need for an agronomist, a weather station, a market trader, and a farming advisor — powered by **Gemini AI**, working across Africa on low-end phones.

---

## ✨ Features (Built with Gemini AI)

| Module | Status | Tech |
|--------|--------|------|
| 🔬 **AI Crop Doctor** | ✅ Ready | Gemini Vision API — snap photo → diagnosis + treatment |
| ☁️ **Weather Forecast** | ✅ Ready | Open-Meteo + alerts (heavy rain, heat, drought risk) |
| 🌾 **Grow & Yield** | ✅ Ready | Planting calendar, care reminders, crop rotation, post-harvest tips |
| 🛒 **Market Prices** | 🧪 Demo | Placeholder — hook up crowdsourced data |
| 🚜 **Tool Sharing** | ✅ Ready | List/book tractor, sprayer, harvester, pump — GPS, ratings |
| 🎙️ **Voice Assistant** | ✅ Ready | Speak → Gemini answers → spoken reply (Hausa, Yoruba, Igbo, Pidgin, French, Arabic, Swahili) |
| 👥 **Farmer Community** | 📋 Planned | Supabase-backed forum |

---

## 🚀 Quick Start

### 1. Get a Gemini API Key (Free)

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click **Create API Key**
4. Copy the key

### 2. Clone & Install

```bash
cd FarmIQ
cp .env.example .env
# Edit .env and add: GEMINI_API_KEY=your_key_here
npm install
```

### 3. Run

```bash
npm run dev
```

- **Frontend**: http://localhost:5173  
- **API**: http://localhost:3001  

### 4. Demo the Crop Doctor

1. Open http://localhost:5173
2. Go to **Crop Doctor**
3. Upload a photo of a plant leaf (or any crop image)
4. Select crop type (maize, cassava, yam, cocoa, sorghum, rice)
5. Click **Diagnose** — Gemini AI analyzes and returns diagnosis + treatment plan

---

## 📁 Project Structure

```
FarmIQ/
├── server/                 # Backend (Express)
│   ├── index.js            # API entry
│   └── routes/
│       ├── crop-doctor.js  # Gemini Vision for crop diagnosis
│       ├── weather.js      # Open-Meteo integration
│       └── market.js       # Market prices (demo)
├── src/                    # React frontend
│   ├── pages/
│   │   ├── CropDoctor.jsx  # AI Crop Doctor UI
│   │   ├── Weather.jsx     # 7-day forecast
│   │   ├── Market.jsx      # Live market prices
│   │   └── Home.jsx        # Dashboard
│   └── App.jsx
├── .env.example            # Copy to .env and add GEMINI_API_KEY
└── package.json
```

---

## 🔧 Tech Stack (Gemini Edition)

| Layer | Tool | Notes |
|-------|------|-------|
| **AI / Crop Doctor** | Gemini 2.5 Flash (Vision) | Image understanding, disease/pest/deficiency diagnosis |
| **Voice (planned)** | Gemini TTS / Live API | Hausa, Yoruba, Igbo, Pidgin support |
| **Weather** | Open-Meteo API | Free, no key, 1–11 km resolution |
| **Frontend** | React + Vite | PWA-ready, works on low-end phones |
| **Backend** | Express | Simple REST API |
| **Database (planned)** | Supabase | Auth, market data, tool rentals |

---

## 🌍 Supported Crops (AI Crop Doctor)

- **West Africa**: Maize • Cassava • Yam • Cocoa • Sorghum • Rice  
- **East Africa**: Beans • Teff • Coffee • Millet  
- **Southern Africa**: Maize • Sorghum  
- **Central Africa**: Cassava • Plantain • Coffee • Palm oil  
- **North Africa**: Wheat • Barley • Olives • Dates • Citrus  
- **Pan-African**: Vegetables • Cowpea  

Responses are in plain, farmer-friendly language with low-cost, locally available treatment suggestions.

---

## 💰 Free for farmers

FarmIQ is **free to use** — crop diagnosis, weather, and market prices at no cost. Built for smallholder farmers.

---

## 🏆 Why FarmIQ?

- **250M+** smallholder farmers across Africa  
- **5 problems** solved in one app  
- **3-minute demo**: Snap leaf → get diagnosis  
- **SDG aligned**: Zero Hunger • Climate Action • Decent Work  

---

## 📜 License

MIT — build, ship, and scale for farmers.
