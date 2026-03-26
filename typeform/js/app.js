/**
 * app.js — Main typeform application logic.
 *
 * Responsibilities:
 *   - Renders one question at a time (Typeform-style)
 *   - Shows section headers when entering a new section
 *   - Handles next/prev navigation
 *   - Validates inputs before advancing
 *   - Collects all answers and saves via ResponseStorage
 *   - Shows progress bar and thank-you screen
 */

(() => {
  'use strict';

  // --- State ---
  let currentStep = 0;
  const answers = {};

  // --- DOM refs ---
  const questionArea = document.getElementById('question-area');
  const progressFill = document.getElementById('progress-fill');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const btnSubmit = document.getElementById('btn-submit');
  const formContainer = document.getElementById('form-container');
  const thankYouScreen = document.getElementById('thank-you-screen');

  // --- Init ---
  function init() {
    renderQuestion();
    updateNav();

    btnPrev.addEventListener('click', prevStep);
    btnNext.addEventListener('click', nextStep);
    btnSubmit.addEventListener('click', () => {
      submitForm();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        const activeEl = document.activeElement;
        // Don't intercept Enter inside textareas
        if (activeEl && activeEl.tagName === 'TEXTAREA') return;

        e.preventDefault();
        if (currentStep === QUESTIONS.length - 1) {
          submitForm();
        } else {
          nextStep();
        }
      }
    });
  }

  // --- Render ---
  function renderQuestion() {
    const q = QUESTIONS[currentStep];
    const savedValue = answers[q.id] || '';

    // Section header
    let sectionHTML = '';
    if (q.section) {
      sectionHTML = `<div class="section-label">${q.section}</div>`;
    }

    let inputHTML = '';

    switch (q.type) {
      case 'text':
      case 'email':
      case 'url':
      case 'number':
        inputHTML = `<input
          class="form-input"
          type="${q.type}"
          id="input-${q.id}"
          placeholder="${q.placeholder || ''}"
          value="${savedValue}"
          enterkeyhint="next"
          ${q.required ? 'required' : ''}
          ${q.validation && q.validation.min !== undefined ? `min="${q.validation.min}"` : ''}
          ${q.validation && q.validation.max !== undefined ? `max="${q.validation.max}"` : ''}
        >`;
        break;

      case 'textarea':
        inputHTML = `<textarea
          class="form-textarea"
          id="input-${q.id}"
          placeholder="${q.placeholder || ''}"
          enterkeyhint="done"
          ${q.required ? 'required' : ''}
        >${savedValue}</textarea>`;
        break;

      case 'select':
        inputHTML = `<select class="form-select" id="input-${q.id}">
          <option value="">Select...</option>
          ${q.options.map(o => `<option value="${o.value}" ${savedValue === o.value ? 'selected' : ''}>${o.label}</option>`).join('')}
        </select>`;
        break;

      case 'choice':
        inputHTML = `<div class="choice-list" id="input-${q.id}">
          ${q.options.map((o, i) => `
            <div class="choice-item ${savedValue === o.value ? 'selected' : ''}" data-value="${o.value}">
              <span class="choice-key">${String.fromCharCode(65 + i)}</span>
              <span class="choice-label">${o.label}</span>
            </div>
          `).join('')}
        </div>`;
        break;

      case 'multi-choice':
        const selectedValues = Array.isArray(savedValue) ? savedValue : [];
        inputHTML = `<div class="choice-list" id="input-${q.id}">
          ${q.options.map((o, i) => `
            <div class="choice-item ${selectedValues.includes(o.value) ? 'selected' : ''}" data-value="${o.value}">
              <span class="choice-key">${String.fromCharCode(65 + i)}</span>
              <span class="choice-label">${o.label}</span>
            </div>
          `).join('')}
        </div>`;
        break;
    }

    questionArea.innerHTML = `
      <div class="question-slide">
        ${sectionHTML}
        <div class="question-number">Question ${currentStep + 1} of ${QUESTIONS.length}</div>
        <h1 class="question-text">${q.text}</h1>
        ${q.description ? `<p class="question-description">${q.description}</p>` : ''}
        ${inputHTML}
        <div class="error-message" id="error-msg"></div>
      </div>
    `;

    // Bind choice clicks
    if (q.type === 'choice') {
      questionArea.querySelectorAll('.choice-item').forEach(item => {
        item.addEventListener('click', () => {
          questionArea.querySelectorAll('.choice-item').forEach(i => i.classList.remove('selected'));
          item.classList.add('selected');
        });
      });
    }

    if (q.type === 'multi-choice') {
      questionArea.querySelectorAll('.choice-item').forEach(item => {
        item.addEventListener('click', () => {
          item.classList.toggle('selected');
        });
      });
    }

    // Auto-focus text inputs
    const input = questionArea.querySelector('input, textarea, select');
    if (input) setTimeout(() => input.focus(), 300);

    updateProgress();
  }

  // --- Collect answer from current question ---
  function collectAnswer() {
    const q = QUESTIONS[currentStep];

    if (q.type === 'choice') {
      const selected = questionArea.querySelector('.choice-item.selected');
      return selected ? selected.dataset.value : '';
    }

    if (q.type === 'multi-choice') {
      const selected = questionArea.querySelectorAll('.choice-item.selected');
      return Array.from(selected).map(el => el.dataset.value);
    }

    const input = questionArea.querySelector(`#input-${q.id}`);
    return input ? input.value.trim() : '';
  }

  // --- Validation ---
  function validate() {
    const q = QUESTIONS[currentStep];
    const value = collectAnswer();
    const errorEl = document.getElementById('error-msg');

    if (q.required) {
      if (Array.isArray(value) ? value.length === 0 : !value) {
        errorEl.textContent = 'This field is required.';
        return false;
      }
    }

    if (q.validation) {
      if (q.validation.minLength && typeof value === 'string' && value.length < q.validation.minLength) {
        errorEl.textContent = `Please write at least ${q.validation.minLength} characters.`;
        return false;
      }
      if (q.type === 'number' && value) {
        const num = Number(value);
        if (q.validation.min !== undefined && num < q.validation.min) {
          errorEl.textContent = `Minimum value is ${q.validation.min}.`;
          return false;
        }
        if (q.validation.max !== undefined && num > q.validation.max) {
          errorEl.textContent = `Maximum value is ${q.validation.max}.`;
          return false;
        }
      }
    }

    if (q.type === 'email' && value) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(value)) {
        errorEl.textContent = 'Please enter a valid email address.';
        return false;
      }
    }

    errorEl.textContent = '';
    return true;
  }

  // --- Navigation ---
  function nextStep() {
    if (!validate()) return;
    answers[QUESTIONS[currentStep].id] = collectAnswer();
    if (currentStep < QUESTIONS.length - 1) {
      currentStep++;
      renderQuestion();
      updateNav();
    }
  }

  function prevStep() {
    answers[QUESTIONS[currentStep].id] = collectAnswer();
    if (currentStep > 0) {
      currentStep--;
      renderQuestion();
      updateNav();
    }
  }

  function updateNav() {
    btnPrev.disabled = currentStep === 0;
    const isLast = currentStep === QUESTIONS.length - 1;
    btnNext.style.display = isLast ? 'none' : '';
    btnSubmit.style.display = isLast ? '' : 'none';
  }

  function updateProgress() {
    const pct = ((currentStep + 1) / QUESTIONS.length) * 100;
    progressFill.style.width = pct + '%';
  }

  // --- Submit ---
  async function submitForm() {
    if (!validate()) return;
    answers[QUESTIONS[currentStep].id] = collectAnswer();
    const errorEl = document.getElementById('error-msg');
    const originalLabel = btnSubmit.textContent;

    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Submitting...';
    if (errorEl) errorEl.textContent = '';

    try {
      await ResponseStorage.save(answers);
      formContainer.style.display = 'none';
      thankYouScreen.style.display = 'flex';
    } catch (err) {
      console.error(err);
      if (errorEl) {
        errorEl.textContent = 'Submission failed. Please try again.';
      }
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.textContent = originalLabel;
    }
  }

  // --- Boot ---
  init();
})();
