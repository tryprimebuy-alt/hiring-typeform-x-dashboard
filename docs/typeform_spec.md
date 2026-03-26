# Typeform Spec

## Overview
A Typeform-style, one-question-per-screen application form for the VoC Researcher role.

## Design Requirements
- **Dark mode** — dark background (#0f0f13), light text
- **One question per screen** — smooth transition between questions
- **Progress bar** — gradient bar at top showing completion
- **Keyboard navigation** — Enter to advance, arrow keys for choices
- **Mobile responsive** — full-width on small screens
- **Inter font** via Google Fonts

## Question Types Supported
| Type | Behavior |
|------|----------|
| `text` | Single-line text input |
| `email` | Email input with validation |
| `url` | URL input |
| `number` | Numeric input |
| `textarea` | Multi-line text area |
| `select` | Dropdown |
| `choice` | Single-select cards (A, B, C, D) |
| `multi-choice` | Multi-select cards |

## Validation
- Required fields must be filled before advancing
- Email format validation
- Min/max length for textareas
- Visual error messages below the input

## Submission
- All answers saved to `localStorage` under key `typeform_responses`
- Each submission gets a unique ID and timestamp
- After submit → show thank-you screen
- Responses can be exported as JSON

## Customization Points
- **Questions**: Edit `typeform/js/questions.js`
- **Branding**: Edit `config/form_config.json`
- **Styles**: Edit `typeform/css/styles.css` (design tokens at top)
