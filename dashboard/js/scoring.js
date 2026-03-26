/**
 * scoring.js — Scoring engine for candidate responses.
 *
 * Reads scoring_criteria.json and applies weights + scores to each response.
 * Returns a normalized score (0–100) for each candidate.
 *
 * Scoring logic:
 *   - For 'choice' questions:  match answer → get score from question options
 *   - For 'multi-choice':      sum of scores for all selected options
 *   - For 'textarea':          length-based heuristic (longer = higher, capped)
 *   - Final score = weighted sum normalized to 0–100
 */

// eslint-disable-next-line no-unused-vars
const ScoringEngine = (() => {

  /**
   * Score a single response.
   * @param {Object} response — { id, timestamp, answers }
   * @param {Array}  criteria — Array of { questionId, weight, maxScore, type, options }
   * @returns {Object} { totalScore, maxPossible, percent, breakdown }
   */
  function scoreResponse(response, criteria) {
    let totalScore = 0;
    let maxPossible = 0;
    const breakdown = [];

    criteria.forEach(c => {
      const answer = response.answers[c.questionId];
      let rawScore = 0;
      let maxForQ = c.maxScore || 10;

      if (c.type === 'choice' && c.options) {
        const match = c.options.find(o => o.value === answer);
        rawScore = match ? match.score : 0;
      } else if (c.type === 'multi-choice' && c.options) {
        if (Array.isArray(answer)) {
          answer.forEach(val => {
            const match = c.options.find(o => o.value === val);
            if (match) rawScore += match.score;
          });
        }
      } else if (c.type === 'textarea') {
        // Heuristic: score based on response length (50 chars = 2, 200+ = 10)
        const len = typeof answer === 'string' ? answer.length : 0;
        rawScore = Math.min(10, Math.round((len / 200) * 10));
      }

      const weighted = rawScore * (c.weight / 10);
      const maxWeighted = maxForQ * (c.weight / 10);

      totalScore += weighted;
      maxPossible += maxWeighted;

      breakdown.push({
        questionId: c.questionId,
        rawScore,
        weight: c.weight,
        weighted: Math.round(weighted * 10) / 10,
      });
    });

    const percent = maxPossible > 0 ? Math.round((totalScore / maxPossible) * 100) : 0;

    return { totalScore: Math.round(totalScore * 10) / 10, maxPossible: Math.round(maxPossible * 10) / 10, percent, breakdown };
  }

  /**
   * Score all responses.
   * @param {Array} responses
   * @param {Array} criteria
   * @returns {Array} Responses augmented with .score
   */
  function scoreAll(responses, criteria) {
    return responses.map(r => ({
      ...r,
      score: scoreResponse(r, criteria),
    }));
  }

  /**
   * Classify a percent score into a tier.
   */
  function tier(percent) {
    if (percent >= 70) return 'high';
    if (percent >= 40) return 'mid';
    return 'low';
  }

  return { scoreResponse, scoreAll, tier };
})();
