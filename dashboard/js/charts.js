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

  function setupCanvas(canvas, ctx) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const cssWidth = Math.max(1, Math.floor(rect.width || canvas.clientWidth || 400));
    const cssHeight = Math.max(1, Math.floor(rect.height || canvas.clientHeight || 220));
    const pixelWidth = Math.max(1, Math.floor(cssWidth * dpr));
    const pixelHeight = Math.max(1, Math.floor(cssHeight * dpr));

    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }

    // Reset transform each draw so scaling does not compound.
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssWidth, cssHeight);
    return { W: cssWidth, H: cssHeight };
  }

  /**
   * Draw a horizontal bar chart.
   * @param {string} canvasId
   * @param {Array<{label: string, value: number}>} data
   */
  function barChart(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { W, H } = setupCanvas(canvas, ctx);

    if (!Array.isArray(data) || data.length === 0) {
      ctx.fillStyle = COLORS.muted;
      ctx.font = '13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('No data available', W / 2, H / 2);
      return;
    }

    const paddingLeft = Math.max(120, Math.min(180, Math.floor(W * 0.35)));
    const padding = { top: 10, right: 20, bottom: 30, left: paddingLeft };
    const barHeight = 24;
    const gap = 12;
    const maxVal = Math.max(...data.map(d => d.value), 1);
    const drawableWidth = Math.max(0, W - padding.left - padding.right);

    data.forEach((d, i) => {
      const y = padding.top + i * (barHeight + gap);
      const barWidth = (drawableWidth * d.value) / maxVal;

      // Label
      ctx.fillStyle = COLORS.text;
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(d.label, padding.left - 10, y + barHeight / 2);

      // Bar
      ctx.fillStyle = BAR_PALETTE[i % BAR_PALETTE.length];
      if (typeof ctx.roundRect === 'function') {
        ctx.beginPath();
        ctx.roundRect(padding.left, y, barWidth, barHeight, 4);
        ctx.fill();
      } else {
        ctx.fillRect(padding.left, y, barWidth, barHeight);
      }

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
