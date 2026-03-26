# Dashboard Spec

## Overview
An internal-only dashboard to view, score, filter, and export candidate responses.

## Layout
```
┌─────────────────────────────────────────────────┐
│  Header (title, count badge, search, import/exp)│
├─────────────────────────────────────────────────┤
│  Filters (score range, sort, availability)       │
├─────────────────────────────────────────────────┤
│  Stats Row (total, avg score, high scorers, etc) │
├──────────────────────┬──────────────────────────┤
│  Score Distribution  │  Skills Breakdown         │
│  (bar chart)         │  (bar chart)              │
├──────────────────────┴──────────────────────────┤
│  Response Table (sortable, searchable)           │
│  ┌────┬──────┬───────┬────────┬───────┬────────┐│
│  │ #  │ Name │ Email │ Score  │ Date  │ View   ││
│  └────┴──────┴───────┴────────┴───────┴────────┘│
└─────────────────────────────────────────────────┘
```

## Scoring System

### How Scores Work
Each scored question has:
- **Weight** (0–10): How important this criterion is
- **Raw Score**: Points earned for the answer
- **Weighted Score**: `rawScore × (weight / 10)`
- **Final %**: `sum(weighted) / sum(maxWeighted) × 100`

### Tiers
| Tier | Range | Action |
|------|-------|--------|
| 🟢 High | 70%+ | Schedule interview |
| 🟡 Mid | 40–69% | Review manually |
| 🔴 Low | <40% | Auto-reject or hold |

### Textarea Scoring (Heuristic)
For open-ended responses, a length-based heuristic is used by default:
- 50 chars → score 2
- 100 chars → score 5
- 200+ chars → score 10 (capped)

> **Note:** Replace with manual scoring or AI-based scoring when Claude Code integration is ready.

## Features
- [x] Response table with search, filter, sort
- [x] Score badges (color-coded by tier) 
- [x] Stats cards (total, avg, high scorers, immediate start)
- [x] Score distribution chart
- [x] Skills breakdown chart
- [x] Candidate detail modal with full score breakdown
- [x] Import JSON (merge with existing)
- [x] Export CSV

## Future Enhancements
- [ ] AI-powered scoring for textarea responses (via Claude)
- [ ] Notes/tags per candidate
- [ ] Bulk actions (reject, shortlist)
- [ ] Email integration (send response directly from dashboard)
- [ ] Server-side storage (replace localStorage)

## Customization Points
- **Scoring criteria**: Edit `data/scoring_criteria.json`
- **Dashboard styling**: Edit `dashboard/css/styles.css`
- **Criteria in code**: Edit `CRITERIA` array in `dashboard/js/app.js`
