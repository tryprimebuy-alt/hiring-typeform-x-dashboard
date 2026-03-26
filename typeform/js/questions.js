/**
 * questions.js — Customer Research Associate application form.
 *
 * Each question object:
 * {
 *   id:            string   — Unique key
 *   type:          string   — 'text' | 'textarea' | 'email' | 'number' | 'choice' | 'multi-choice'
 *   text:          string   — The question headline
 *   description:   string   — (optional) Helper text below headline
 *   required:      boolean  — Mandatory?
 *   placeholder:   string   — (optional)
 *   options:       array    — (for choice) { label, value, score? }
 *   validation:    object   — (optional) { minLength, maxLength, min, max }
 *   scoringWeight: number   — (optional) 0-10 weight for dashboard scoring
 *   section:       string   — (optional) Visual section header shown before question
 * }
 */

// eslint-disable-next-line no-unused-vars
const QUESTIONS = [

  // ─── SECTION: Basic Details ───────────────────────────────────────────────
  {
    id: 'full_name',
    type: 'text',
    text: "What's your full name?",
    section: 'Basic Details',
    required: true,
    placeholder: 'e.g. Priya Sharma',
  },
  {
    id: 'whatsapp_number',
    type: 'text',
    text: "What's your WhatsApp number?",
    required: true,
    placeholder: '+91 98765 43210',
  },
  {
    id: 'email',
    type: 'email',
    text: "What's your email address?",
    required: true,
    placeholder: 'you@example.com',
  },
  {
    id: 'city',
    type: 'text',
    text: "Which city are you currently based in?",
    required: true,
    placeholder: 'e.g. Mumbai',
  },
  {
    id: 'age',
    type: 'number',
    text: "What's your age?",
    required: true,
    placeholder: 'e.g. 25',
    validation: { min: 16, max: 65 },
  },

  // ─── SECTION: Language Comfort ────────────────────────────────────────────
  {
    id: 'english_comfort',
    type: 'choice',
    text: 'Are you comfortable speaking English on the phone for 5–6 hours a day?',
    section: 'Language Comfort',
    required: true,
    scoringWeight: 9,
    options: [
      { label: 'Yes, completely comfortable', value: 'yes_comfortable', score: 10 },
      { label: "Somewhat comfortable, but I can manage", value: 'somewhat', score: 5 },
      { label: "No, I'm not comfortable with that", value: 'no', score: 1 },
    ],
  },
  {
    id: 'hindi_comfort',
    type: 'choice',
    text: 'Are you comfortable speaking Hindi on the phone?',
    required: true,
    scoringWeight: 5,
    options: [
      { label: 'Yes, fluently', value: 'fluent', score: 10 },
      { label: 'Yes, conversationally', value: 'conversational', score: 6 },
      { label: 'No', value: 'no', score: 2 },
    ],
  },

  // ─── SECTION: Work Setup ──────────────────────────────────────────────────
  {
    id: 'work_setup',
    type: 'choice',
    text: 'Do you have access to a laptop/computer, stable internet, and a quiet place to make calls?',
    description: 'Phone required — no telepathy yet 📞',
    section: 'Work Setup',
    required: true,
    scoringWeight: 8,
    options: [
      { label: 'Yes, I have all three', value: 'all_three', score: 10 },
      { label: 'I have a laptop and internet, but no quiet space', value: 'no_quiet_space', score: 4 },
      { label: 'I only have a smartphone', value: 'smartphone_only', score: 1 },
    ],
  },

  // ─── SECTION: Availability ────────────────────────────────────────────────
  {
    id: 'availability',
    type: 'choice',
    text: 'Are you currently available to start within the next 7–10 days?',
    section: 'Availability',
    required: true,
    scoringWeight: 6,
    options: [
      { label: 'Yes, I can start immediately', value: 'immediate', score: 10 },
      { label: 'Yes, within 7–10 days', value: '7_10_days', score: 7 },
      { label: 'No, I need more than 2 weeks', value: '>2_weeks', score: 2 },
    ],
  },

  // ─── SECTION: Educational Background ──────────────────────────────────────
  {
    id: 'education',
    type: 'choice',
    text: 'Which of these best describes your educational background?',
    section: 'Educational Background',
    required: true,
    scoringWeight: 7,
    options: [
      { label: 'B.Pharm (Bachelor of Pharmacy)', value: 'bpharm', score: 10 },
      { label: 'Pharm.D (Doctor of Pharmacy)', value: 'pharmd', score: 10 },
      { label: 'BAMS (Bachelor of Ayurvedic Medicine and Surgery)', value: 'bams', score: 9 },
      { label: 'BHMS (Bachelor of Homeopathic Medicine and Surgery)', value: 'bhms', score: 9 },
      { label: 'B.Sc Nursing / Allied Health Sciences', value: 'nursing_health', score: 8 },
      { label: 'Psychology / Sociology', value: 'psych_socio', score: 7 },
      { label: 'Journalism / Mass Communication', value: 'journalism', score: 6 },
      { label: 'Life Sciences / Biotechnology', value: 'life_sciences', score: 7 },
      { label: 'Other — but I have a strong interest in health/wellness', value: 'other_interested', score: 4 },
      { label: 'Other — no health or science background', value: 'other_none', score: 1 },
    ],
  },

  // ─── SECTION: Domain Knowledge ────────────────────────────────────────────
  {
    id: 'domain_knowledge',
    type: 'choice',
    text: 'How would you rate your understanding of joint health conditions like arthritis and osteoarthritis?',
    section: 'Domain Knowledge',
    required: true,
    scoringWeight: 8,
    options: [
      { label: 'I have formal education in this (studied it in my course)', value: 'formal_education', score: 10 },
      { label: 'I have a general understanding from personal/family experience', value: 'personal_experience', score: 7 },
      { label: 'I know the basics — what arthritis is, that it affects joints', value: 'basics', score: 5 },
      { label: "I don't know much, but I'm a fast learner and willing to study", value: 'willing_to_learn', score: 3 },
      { label: 'I have no idea what these are', value: 'no_idea', score: 0 },
    ],
  },

  // ─── SECTION: Business Understanding ──────────────────────────────────────
  {
    id: 'business_understanding',
    type: 'choice',
    text: 'Do you have a basic understanding of what digital marketing or D2C (Direct to Consumer) business means?',
    section: 'Business Understanding',
    required: true,
    scoringWeight: 6,
    options: [
      { label: 'Yes, I understand the basics — ads, funnels, customer acquisition', value: 'understands', score: 10 },
      { label: "I've heard of it and have a surface-level understanding", value: 'surface_level', score: 6 },
      { label: "Not really, but I'm very interested in learning", value: 'interested', score: 3 },
      { label: "No, and I'm not particularly interested", value: 'not_interested', score: 0 },
    ],
  },

  // ─── SECTION: Technical Comfort ───────────────────────────────────────────
  {
    id: 'technical_comfort',
    type: 'choice',
    text: 'How comfortable are you with basic computer tools?',
    description: 'Google Sheets, Google Drive, typing, etc.',
    section: 'Technical Comfort',
    required: true,
    scoringWeight: 7,
    options: [
      { label: 'Very comfortable — I use these daily', value: 'very_comfortable', score: 10 },
      { label: 'Comfortable enough — I can figure things out', value: 'comfortable', score: 6 },
      { label: 'Not very comfortable — I mostly use my phone for everything', value: 'not_comfortable', score: 2 },
    ],
  },

  // ─── SECTION: Marketing Insight Task ──────────────────────────────────────
  {
    id: 'marketing_insights',
    type: 'textarea',
    text: 'Read this real customer quote and tell us what 3 marketing insights you\'d pull from it.',
    section: 'Marketing Insight Task',
    description: '"I\'ve seen so many doctors. They\'re not able to pinpoint what exactly it is. They\'ve put me on painkillers and their verdict is that I have to go for knee replacement in both legs. But I don\'t want to go for it. I just want to walk freely again."',
    required: true,
    placeholder: 'Write your 3 insights below...',
    validation: { minLength: 100 },
    scoringWeight: 10,
  },
];
