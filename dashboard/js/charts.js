/**
 * charts.js — Simple canvas-based chart helpers for the dashboard.
 *
 * No external dependencies — draws bar charts on <canvas> elements.
 * Replace with Chart.js or similar if you need more complex visualizations.
 */

// eslint-disable-next-line no-unused-vars
const Charts = (() => {

  const COLORS = {
    primary: '#6c5ce7',
    accent: '#00cec9',
    success: '#00b894',
    warning: '#fdcb6e',
    error: '#ff6b6b',
    muted: '#7b7b9e',
    border: '#2a2a42',
    text: '#eeeef5',
  };

  const BAR_PALETTE = [COLORS.primary, COLORS.accent, COLORS.success, COLORS.warning, COLORS.error, '#a29bfe'];

  /**
   * Draw a horizontal bar chart.
   * @param {string} canvasId
   * @param {Array<{label: string, value: number}>} data
   */
  function barChart(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // HiDPI support
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);

    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    const padding = { top: 10, right: 20, bottom: 30, left: 180 };
    const barHeight = 24;
    const gap = 12;
    const maxVal = Math.max(...data.map(d => d.value), 1);

    ctx.clearRect(0, 0, W, H);

    data.forEach((d, i) => {
      const y = padding.top + i * (barHeight + gap);
      const barWidth = ((W - padding.left - padding.right) * d.value) / maxVal;

      // Label
      ctx.fillStyle = COLORS.text;
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(d.label, padding.left - 10, y + barHeight / 2);

      // Bar
      ctx.fillStyle = BAR_PALETTE[i % BAR_PALETTE.length];
      ctx.beginPath();
      ctx.roundRect(padding.left, y, barWidth, barHeight, 4);
      ctx.fill();

      // Value
      ctx.fillStyle = COLORS.text;
      ctx.textAlign = 'left';
      ctx.fillText(d.value, padding.left + barWidth + 8, y + barHeight / 2);
    });
  }

  /**
   * Draw a simple score distribution (3 bars: High, Mid, Low).
   * @param {string} canvasId
   * @param {{high: number, mid: number, low: number}} counts
   */
  function scoreDistribution(canvasId, counts) {
    barChart(canvasId, [
      { label: 'High (70%+)', value: counts.high },
      { label: 'Mid (40–69%)', value: counts.mid },
      { label: 'Low (<40%)', value: counts.low },
    ]);
  }

  return { barChart, scoreDistribution };
})();
