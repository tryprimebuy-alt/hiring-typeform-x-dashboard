# 03 — Custom Typeform & Response Dashboard

Two deliverables in this folder:

1. **Typeform** — A custom-built, multi-step application form (styled like Typeform) that candidates fill out.
2. **Dashboard** — An internal dashboard that displays and filters responses based on your scoring/evaluation criteria.

---

## Folder Structure

```
03_Custom_Typeform_and_Dashboard/
├── README.md                    # You are here
├── typeform/                    # The candidate-facing form
│   ├── index.html               # Entry point
│   ├── css/
│   │   └── styles.css           # All form styles
│   ├── js/
│   │   ├── app.js               # Main form logic (step navigation, validation, submission)
│   │   ├── questions.js          # Question definitions (text, type, options, scoring weights)
│   │   └── storage.js            # Response persistence (localStorage / JSON file / API)
│   └── assets/
│       └── (images, icons, etc.)
│
├── dashboard/                   # The internal response dashboard
│   ├── index.html               # Entry point
│   ├── css/
│   │   └── styles.css           # Dashboard styles
│   ├── js/
│   │   ├── app.js               # Main dashboard logic (render, filter, sort)
│   │   ├── scoring.js           # Scoring engine — applies your criteria to each response
│   │   ├── charts.js            # Chart / visualization helpers
│   │   └── storage.js           # Reads responses (from localStorage / JSON / API)
│   └── assets/
│       └── (images, icons, etc.)
│
├── data/
│   ├── responses.json           # Collected responses (auto-populated by typeform)
│   └── scoring_criteria.json    # Your evaluation criteria + weights
│
├── config/
│   └── form_config.json         # Form settings (title, description, branding, thank-you message)
│
└── docs/
    ├── typeform_spec.md         # Spec: what the typeform should look like and do
    └── dashboard_spec.md        # Spec: what the dashboard should show and how scoring works
```

---

## How It Works

### Typeform (Candidate-Facing)
- Multi-step, one-question-per-screen form (Typeform-style UX)
- Questions defined in `typeform/js/questions.js`
- Responses saved to `data/responses.json` via `typeform/js/storage.js`
- Fully static — no backend required (uses localStorage + JSON export)
- Branding/settings controlled via `config/form_config.json`

### Dashboard (Internal)
- Reads from `data/responses.json`
- Scores each response using criteria in `data/scoring_criteria.json`
- Filters: by score range, date, individual question answers
- Sorts: by total score, date submitted, specific criteria
- Visual charts for response distribution and scoring breakdown
- Candidate detail view with full response + score breakdown

---

## Getting Started

1. Define your questions in `typeform/js/questions.js`
2. Set your scoring criteria in `data/scoring_criteria.json`
3. Customize branding in `config/form_config.json`
4. Open `typeform/index.html` in browser to test the form
5. Open `dashboard/index.html` in browser to view responses

---

## TODO
- [ ] Define all form questions (with types, options, validation rules)
- [ ] Define scoring criteria and weights
- [ ] Build typeform UI (multi-step, animations, mobile-responsive)
- [ ] Build dashboard UI (table view, filters, charts, candidate detail)
- [ ] Wire up response storage (typeform → JSON → dashboard)
- [ ] Add export functionality (CSV/PDF from dashboard)
- [ ] Test end-to-end flow
