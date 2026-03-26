/**
 * app.js — Main dashboard application logic.
 *
 * Responsibilities:
 *   - Load responses from storage
 *   - Score each response via ScoringEngine
 *   - Render table, stats, and charts
 *   - Handle filtering, sorting, search
 *   - Show candidate detail modal
 *   - Import/export functionality
 */

(() => {
  'use strict';

  // --- Scoring criteria (mirrors typeform/js/questions.js scoring fields) ---
  const CRITERIA = [
    {
      questionId: 'english_comfort',
      label: 'English Speaking',
      weight: 9,
      maxScore: 10,
      type: 'choice',
      options: [
        { value: 'yes_comfortable', score: 10 },
        { value: 'somewhat', score: 5 },
        { value: 'no', score: 1 },
      ],
    },
    {
      questionId: 'hindi_comfort',
      label: 'Hindi Speaking',
      weight: 5,
      maxScore: 10,
      type: 'choice',
      options: [
        { value: 'fluent', score: 10 },
        { value: 'conversational', score: 6 },
        { value: 'no', score: 2 },
      ],
    },
    {
      questionId: 'work_setup',
      label: 'Work Setup',
      weight: 8,
      maxScore: 10,
      type: 'choice',
      options: [
        { value: 'all_three', score: 10 },
        { value: 'no_quiet_space', score: 4 },
        { value: 'smartphone_only', score: 1 },
      ],
    },
    {
      questionId: 'availability',
      label: 'Availability',
      weight: 6,
      maxScore: 10,
      type: 'choice',
      options: [
        { value: 'immediate', score: 10 },
        { value: '7_10_days', score: 7 },
        { value: '>2_weeks', score: 2 },
      ],
    },
    {
      questionId: 'education',
      label: 'Education',
      weight: 7,
      maxScore: 10,
      type: 'choice',
      options: [
        { value: 'bpharm', score: 10 },
        { value: 'pharmd', score: 10 },
        { value: 'bams', score: 9 },
        { value: 'bhms', score: 9 },
        { value: 'nursing_health', score: 8 },
        { value: 'psych_socio', score: 7 },
        { value: 'journalism', score: 6 },
        { value: 'life_sciences', score: 7 },
        { value: 'other_interested', score: 4 },
        { value: 'other_none', score: 1 },
      ],
    },
    {
      questionId: 'domain_knowledge',
      label: 'Domain Knowledge',
      weight: 8,
      maxScore: 10,
      type: 'choice',
      options: [
        { value: 'formal_education', score: 10 },
        { value: 'personal_experience', score: 7 },
        { value: 'basics', score: 5 },
        { value: 'willing_to_learn', score: 3 },
        { value: 'no_idea', score: 0 },
      ],
    },
    {
      questionId: 'business_understanding',
      label: 'Business Understanding',
      weight: 6,
      maxScore: 10,
      type: 'choice',
      options: [
        { value: 'understands', score: 10 },
        { value: 'surface_level', score: 6 },
        { value: 'interested', score: 3 },
        { value: 'not_interested', score: 0 },
      ],
    },
    {
      questionId: 'technical_comfort',
      label: 'Technical Comfort',
      weight: 7,
      maxScore: 10,
      type: 'choice',
      options: [
        { value: 'very_comfortable', score: 10 },
        { value: 'comfortable', score: 6 },
        { value: 'not_comfortable', score: 2 },
      ],
    },
    {
      questionId: 'marketing_insights',
      label: 'Marketing Insight Task',
      weight: 10,
      maxScore: 10,
      type: 'textarea',
    },
  ];

  // --- Readable label maps ---
  const EDUCATION_LABELS = {
    bpharm: 'B.Pharm',
    pharmd: 'Pharm.D',
    bams: 'BAMS',
    bhms: 'BHMS',
    nursing_health: 'B.Sc Nursing / Allied Health',
    psych_socio: 'Psychology / Sociology',
    journalism: 'Journalism / Mass Comm.',
    life_sciences: 'Life Sciences / Biotech',
    other_interested: 'Other (interested)',
    other_none: 'Other (no background)',
  };

  const AVAILABILITY_LABELS = {
    immediate: 'Immediately',
    '7_10_days': '7–10 days',
    '>2_weeks': '2+ weeks',
  };

  const ENGLISH_LABELS = {
    yes_comfortable: 'Yes, completely comfortable',
    somewhat: 'Somewhat comfortable, can manage',
    no: 'No, not comfortable',
  };

  const HINDI_LABELS = {
    fluent: 'Yes, fluently',
    conversational: 'Yes, conversationally',
    no: 'No',
  };

  const WORK_SETUP_LABELS = {
    all_three: 'Laptop + Internet + Quiet space ✅',
    no_quiet_space: 'Laptop + Internet, no quiet space',
    smartphone_only: 'Smartphone only',
  };

  const DOMAIN_LABELS = {
    formal_education: 'Formal education (studied in course)',
    personal_experience: 'General understanding (personal/family)',
    basics: 'Knows the basics',
    willing_to_learn: 'Fast learner, willing to study',
    no_idea: 'No knowledge',
  };

  const BUSINESS_LABELS = {
    understands: 'Understands basics (ads, funnels, acquisition)',
    surface_level: 'Surface-level understanding',
    interested: 'Not really, but interested in learning',
    not_interested: 'No, not interested',
  };

  const TECHNICAL_LABELS = {
    very_comfortable: 'Very comfortable — uses daily',
    comfortable: 'Comfortable enough — can figure things out',
    not_comfortable: 'Not very comfortable — mostly phone',
  };

  // --- DOM refs ---
  const tbody = document.getElementById('response-tbody');
  const emptyState = document.getElementById('empty-state');
  const searchInput = document.getElementById('search-input');
  const filterScore = document.getElementById('filter-score');
  const filterAvailability = document.getElementById('filter-availability');
  const sortBy = document.getElementById('sort-by');
  const btnImport = document.getElementById('btn-import');
  const btnExport = document.getElementById('btn-export');
  const fileImport = document.getElementById('file-import');
  const modal = document.getElementById('detail-modal');
  const modalBody = document.getElementById('modal-body');
  const btnCloseModal = document.getElementById('btn-close-modal');

  let allResponses = [];
  let isRefreshing = false;

  function openModal() {
    modal.style.display = 'flex';
    document.body.classList.add('modal-open');
  }

  function closeModal() {
    modal.style.display = 'none';
    document.body.classList.remove('modal-open');
  }

  // --- Init ---
  async function init() {
    await loadAndRender();

    searchInput.addEventListener('input', render);
    filterScore.addEventListener('change', render);
    filterAvailability.addEventListener('change', render);
    sortBy.addEventListener('change', render);

    btnImport.addEventListener('click', () => fileImport.click());
    fileImport.addEventListener('change', async (e) => {
      if (e.target.files[0]) {
        try {
          const count = await ResponseStorage.importJSON(e.target.files[0]);
          alert(`Imported ${count} response(s).`);
          await loadAndRender();
        } catch (err) {
          console.error(err);
          alert('Import failed. Please check your file and backend setup.');
        }
      }
    });

    btnExport.addEventListener('click', () => {
      const headers = ['id', 'timestamp', 'full_name', 'whatsapp_number', 'email', 'city', 'age',
        'english_comfort', 'hindi_comfort', 'work_setup', 'availability',
        'education', 'domain_knowledge', 'business_understanding',
        'technical_comfort', 'marketing_insights'];
      ResponseStorage.exportCSV(allResponses, headers);
    });

    btnCloseModal.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.style.display === 'flex') {
        e.preventDefault();
        closeModal();
      }
    });

    // Pull fresh data periodically when connected to shared backend.
    setInterval(() => {
      loadAndRender();
    }, 10000);
  }

  async function loadAndRender() {
    if (isRefreshing) return;
    isRefreshing = true;

    try {
      const raw = await ResponseStorage.getAll();
      allResponses = ScoringEngine.scoreAll(raw, CRITERIA);
      render();
    } catch (err) {
      console.error(err);
      allResponses = [];
      render();
      document.getElementById('total-count').textContent = 'Load failed';
    } finally {
      isRefreshing = false;
    }
  }

  // --- Render ---
  function render() {
    let filtered = [...allResponses];

    // Search
    const q = searchInput.value.toLowerCase();
    if (q) {
      filtered = filtered.filter(r =>
        (r.answers.full_name || '').toLowerCase().includes(q) ||
        (r.answers.email || '').toLowerCase().includes(q) ||
        (r.answers.city || '').toLowerCase().includes(q)
      );
    }

    // Filter: score
    const scoreFilter = filterScore.value;
    if (scoreFilter !== 'all') {
      filtered = filtered.filter(r => ScoringEngine.tier(r.score.percent) === scoreFilter);
    }

    // Filter: availability
    const availFilter = filterAvailability.value;
    if (availFilter !== 'all') {
      filtered = filtered.filter(r => r.answers.availability === availFilter);
    }

    // Sort
    const sort = sortBy.value;
    filtered.sort((a, b) => {
      switch (sort) {
        case 'score-desc': return b.score.percent - a.score.percent;
        case 'score-asc':  return a.score.percent - b.score.percent;
        case 'date-desc':  return new Date(b.timestamp) - new Date(a.timestamp);
        case 'date-asc':   return new Date(a.timestamp) - new Date(b.timestamp);
        default: return 0;
      }
    });

    renderTable(filtered);
    renderStats(filtered);
    renderCharts(filtered);
    document.getElementById('total-count').textContent = `${allResponses.length} responses`;
  }

  function renderTable(responses) {
    if (responses.length === 0) {
      tbody.innerHTML = '';
      emptyState.style.display = '';
      return;
    }

    emptyState.style.display = 'none';
    tbody.innerHTML = responses.map((r, i) => {
      const tier = ScoringEngine.tier(r.score.percent);
      return `<tr>
        <td>${i + 1}</td>
        <td>${r.answers.full_name || '—'}</td>
        <td>${r.answers.email || '—'}</td>
        <td>${r.answers.city || '—'}</td>
        <td>${EDUCATION_LABELS[r.answers.education] || r.answers.education || '—'}</td>
        <td><span class="score-badge score-${tier}">${r.score.percent}%</span></td>
        <td>${new Date(r.timestamp).toLocaleDateString()}</td>
        <td><button class="btn btn-secondary btn-sm" data-id="${r.id}">View</button></td>
      </tr>`;
    }).join('');

    // Bind view buttons
    tbody.querySelectorAll('[data-id]').forEach(btn => {
      btn.addEventListener('click', () => showDetail(btn.dataset.id));
    });
  }

  function renderStats(responses) {
    document.getElementById('stat-total').textContent = responses.length;

    if (responses.length > 0) {
      const avg = Math.round(responses.reduce((s, r) => s + r.score.percent, 0) / responses.length);
      document.getElementById('stat-avg-score').textContent = avg + '%';
    } else {
      document.getElementById('stat-avg-score').textContent = '—';
    }

    document.getElementById('stat-high').textContent = responses.filter(r => r.score.percent >= 70).length;
    document.getElementById('stat-immediate').textContent = responses.filter(r => r.answers.availability === 'immediate').length;
  }

  function renderCharts(responses) {
    // Score distribution
    const counts = { high: 0, mid: 0, low: 0 };
    responses.forEach(r => { counts[ScoringEngine.tier(r.score.percent)]++; });
    Charts.scoreDistribution('canvas-score-dist', counts);

    // Education breakdown
    const eduCounts = {};
    responses.forEach(r => {
      const edu = r.answers.education;
      if (edu) {
        const label = EDUCATION_LABELS[edu] || edu;
        eduCounts[label] = (eduCounts[label] || 0) + 1;
      }
    });

    const eduData = Object.entries(eduCounts)
      .map(([label, val]) => ({ label, value: val }))
      .sort((a, b) => b.value - a.value);

    Charts.barChart('canvas-skills', eduData);
  }

  function showDetail(id) {
    const r = allResponses.find(x => x.id === id);
    if (!r) return;

    const fields = [
      { label: 'Name', value: r.answers.full_name },
      { label: 'WhatsApp', value: r.answers.whatsapp_number },
      { label: 'Email', value: r.answers.email },
      { label: 'City', value: r.answers.city },
      { label: 'Age', value: r.answers.age },
      { label: 'English Comfort', value: ENGLISH_LABELS[r.answers.english_comfort] || r.answers.english_comfort },
      { label: 'Hindi Comfort', value: HINDI_LABELS[r.answers.hindi_comfort] || r.answers.hindi_comfort },
      { label: 'Work Setup', value: WORK_SETUP_LABELS[r.answers.work_setup] || r.answers.work_setup },
      { label: 'Availability', value: AVAILABILITY_LABELS[r.answers.availability] || r.answers.availability },
      { label: 'Education', value: EDUCATION_LABELS[r.answers.education] || r.answers.education },
      { label: 'Domain Knowledge', value: DOMAIN_LABELS[r.answers.domain_knowledge] || r.answers.domain_knowledge },
      { label: 'Business Understanding', value: BUSINESS_LABELS[r.answers.business_understanding] || r.answers.business_understanding },
      { label: 'Technical Comfort', value: TECHNICAL_LABELS[r.answers.technical_comfort] || r.answers.technical_comfort },
      { label: 'Marketing Insights', value: r.answers.marketing_insights },
    ];

    const tier = ScoringEngine.tier(r.score.percent);

    modalBody.innerHTML = `
      <h2 style="margin-bottom:0.5rem;">${r.answers.full_name || 'Candidate'}</h2>
      <p style="margin-bottom:1.5rem;">
        <span class="score-badge score-${tier}">Score: ${r.score.percent}%</span>
        <span style="color:var(--color-text-muted); margin-left:0.5rem; font-size:0.85rem;">${r.answers.city || ''} · ${EDUCATION_LABELS[r.answers.education] || ''}</span>
      </p>
      ${fields.map(f => `
        <div class="modal-field">
          <div class="modal-field-label">${f.label}</div>
          <div class="modal-field-value">${f.value || '—'}</div>
        </div>
      `).join('')}
      <hr style="border-color:var(--color-border); margin: 1.5rem 0;">
      <h3 style="font-size:0.9rem; color:var(--color-text-muted); margin-bottom:0.75rem;">Score Breakdown</h3>
      ${r.score.breakdown.map(b => {
        const crit = CRITERIA.find(c => c.questionId === b.questionId);
        const label = crit ? crit.label : b.questionId;
        return `
        <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:0.35rem;">
          <span style="color:var(--color-text-muted)">${label}</span>
          <span>${b.weighted} (raw: ${b.rawScore}, weight: ${b.weight})</span>
        </div>`;
      }).join('')}
      <div style="display:flex; justify-content:space-between; font-weight:700; margin-top:0.75rem; padding-top:0.5rem; border-top:1px solid var(--color-border);">
        <span>Total</span>
        <span>${r.score.totalScore} / ${r.score.maxPossible}</span>
      </div>
    `;

    openModal();
  }

  // --- Boot ---
  init();
})();
