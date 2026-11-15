# NexusLearn

**An AI study app that turns your notes into a personal knowledge graph, with AI-generated diagrams, concept tracking and a spaced-repetition review queue.**

![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![D3.js](https://img.shields.io/badge/D3.js-F9A03C?logo=d3dotjs&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_API-8E75B2?logo=googlegemini&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)

## Screenshots

> _Screenshots coming soon._
>
> `![NexusLearn dashboard](docs/screenshot-dashboard.png)`

## Features

- **AI note processing**: paste or type raw notes and Gemini 2.0 Flash rewrites them into clean, structured notes
- **Concept extraction**: the AI pulls key concepts (subject, one-line definition, difficulty, related concepts) out of your notes
- **Knowledge graph (Brain Map)**: an interactive D3 force-directed graph of your concepts, with drag, zoom and subject colour-coding
- **Automatic connections**: new concepts are linked to related ones by text similarity
- **Auto-generated diagrams**: the AI produces flow, cycle and hierarchy diagrams, rendered as custom SVG components
- **Spaced-repetition review**: confidence scores decay over time, and the dashboard ranks concepts by review priority
- **Knowledge gaps panel** on the dashboard (currently populated with sample data)
- **AI quizzes** generated from your own concepts
- **Brain AI chat** that answers questions using the concepts in your knowledge base
- **OCR**: extracts text from photos of handwritten or printed notes with Tesseract.js
- **3D models page** that finds and embeds related 3D models from Sketchfab
- **Demo mode**: works without an API key, using sample data and simulated AI responses

## Tech Stack

| Area | Technology |
| --- | --- |
| UI | React 19, React Router, Framer Motion |
| State | Zustand |
| Visualisation | D3.js (force-directed graph), custom SVG diagrams |
| AI | Google Gemini API (REST, `gemini-2.0-flash`) |
| OCR | Tesseract.js |
| 3D content | Sketchfab API embeds |
| Build tool | Vite |

## Getting Started

**Requirements:** Node.js 18+

```bash
git clone https://github.com/Anand357/nexuslearn.git
cd nexuslearn
npm install
npm run dev
```

Open the local URL Vite prints.

### API keys

You don't need a `.env` file. API keys are never stored in the code. Open **Settings** in the app and paste your own key:

- **Gemini API key** (free at [Google AI Studio](https://aistudio.google.com/app/apikey)) powers note rewriting, concept extraction, diagrams, quizzes and Brain AI chat.

Keys are kept only in memory in your browser and are sent only to Google's Gemini API. Without a key, the app runs in demo mode.

Build for production:

```bash
npm run build
npm run preview
```

## Project Structure

```
nexuslearn/
├── index.html
├── vite.config.js
└── src/
    ├── App.jsx                     # Routes
    ├── components/
    │   ├── diagrams/
    │   │   └── DiagramRenderer.jsx # Flow / cycle / hierarchy SVG diagrams
    │   └── layout/                 # Layout, Sidebar, Topbar
    ├── pages/
    │   ├── Dashboard.jsx           # Mastery stats, review queue, gaps
    │   ├── MyNotes.jsx             # Note input, OCR, AI processing
    │   ├── BrainMapPage.jsx        # D3 knowledge graph
    │   ├── ConceptsPage.jsx
    │   ├── QuizPage.jsx
    │   ├── BrainAIPage.jsx         # Chat over your knowledge base
    │   ├── ModelsPage.jsx          # Sketchfab 3D models
    │   └── Settings.jsx            # API keys
    ├── services/
    │   ├── gemini.js               # Gemini prompts and API calls
    │   ├── ocr.js                  # Tesseract.js
    │   └── sketchfab.js
    ├── stores/                     # Zustand stores (brain, quiz, user)
    └── utils/
        ├── cosineSimilarity.js     # Concept linking
        ├── decayScore.js           # Confidence decay + review priority
        └── parseTags.js
```

## What I Learned

- Prompt engineering for structured output: getting an LLM to return reliable JSON for concepts, diagrams and quizzes, and parsing it safely
- Building interactive data visualisations with D3 force simulations inside React
- Modelling learning with simple algorithms: confidence decay over time and a weighted review-priority score
- Running OCR in the browser with Tesseract.js
- Handling user-supplied API keys safely on the client instead of hardcoding secrets

## License

This project is licensed under the [MIT License](LICENSE).
