/**
 * storage.js - Dashboard-side response storage.
 *
 * Modes:
 *   - Supabase REST (when BACKEND_CONFIG has URL + anon key)
 *   - localStorage fallback (when not configured)
 */

// eslint-disable-next-line no-unused-vars
const ResponseStorage = (() => {
  const STORAGE_KEY = 'typeform_responses';

  function getConfig() {
    const cfg = window.BACKEND_CONFIG || {};
    const supabaseUrl = String(cfg.supabaseUrl || '').replace(/\/+$/, '');
    const supabaseAnonKey = String(cfg.supabaseAnonKey || '').trim();
    const responsesTable = String(cfg.responsesTable || 'responses').trim();

    return {
      supabaseUrl,
      supabaseAnonKey,
      responsesTable,
      enabled: Boolean(supabaseUrl && supabaseAnonKey),
    };
  }

  function buildAuthHeaders(apiKey) {
    const headers = { apikey: apiKey };
    // Legacy anon keys are JWTs and can be reused as bearer tokens.
    if (apiKey && apiKey.includes('.') && apiKey.startsWith('eyJ')) {
      headers.Authorization = `Bearer ${apiKey}`;
    }
    return headers;
  }

  function getAllLocal() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Failed to read local responses:', e);
      return [];
    }
  }

  function setAllLocal(responses) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(responses));
  }

  async function getAll() {
    const cfg = getConfig();
    if (!cfg.enabled) {
      return getAllLocal();
    }

    const query = 'select=id,created_at,answers&order=created_at.desc';
    const url = `${cfg.supabaseUrl}/rest/v1/${encodeURIComponent(cfg.responsesTable)}?${query}`;
    const authHeaders = buildAuthHeaders(cfg.supabaseAnonKey);

    const res = await fetch(url, {
      method: 'GET',
      headers: authHeaders,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Supabase read failed (${res.status}): ${errText}`);
    }

    const rows = await res.json();
    const mapped = rows.map(row => ({
      id: row.id,
      timestamp: row.created_at,
      answers: row.answers || {},
    }));

    // Keep local cache to allow offline inspection.
    setAllLocal(mapped);
    return mapped;
  }

  async function importJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          if (!Array.isArray(imported)) {
            throw new Error('Imported JSON must be an array of responses.');
          }

          const cfg = getConfig();
          if (!cfg.enabled) {
            const existing = getAllLocal();
            const existingIds = new Set(existing.map(r => r.id));
            const newResponses = imported.filter(r => !existingIds.has(r.id));
            const merged = [...existing, ...newResponses];
            setAllLocal(merged);
            resolve(newResponses.length);
            return;
          }

          const payload = imported
            .map(r => ({
              answers: r.answers || {},
              created_at: r.timestamp || undefined,
            }))
            .filter(r => r.answers && typeof r.answers === 'object');

          if (payload.length === 0) {
            resolve(0);
            return;
          }

          const url = `${cfg.supabaseUrl}/rest/v1/${encodeURIComponent(cfg.responsesTable)}`;
          const authHeaders = buildAuthHeaders(cfg.supabaseAnonKey);
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              ...authHeaders,
              'Content-Type': 'application/json',
              Prefer: 'return=minimal',
            },
            body: JSON.stringify(payload),
          });

          if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Supabase import failed (${res.status}): ${errText}`);
          }

          resolve(payload.length);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  function exportCSV(responses, headers) {
    const safeResponses = Array.isArray(responses) ? responses : [];
    const safeHeaders = Array.isArray(headers) ? headers : [];
    if (safeHeaders.length === 0) return;

    const csvRows = [safeHeaders.join(',')];
    safeResponses.forEach((response) => {
      const row = safeHeaders.map((header) => {
        let value = '';
        if (response && response[header] !== undefined && response[header] !== null) {
          value = response[header];
        } else if (
          response &&
          response.answers &&
          response.answers[header] !== undefined &&
          response.answers[header] !== null
        ) {
          value = response.answers[header];
        }

        if (Array.isArray(value)) value = value.join('; ');
        value = String(value).replace(/"/g, '""');
        return `"${value}"`;
      });
      csvRows.push(row.join(','));
    });

    // Add UTF-8 BOM for Excel compatibility.
    const csvContent = `\uFEFF${csvRows.join('\n')}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `responses_${new Date().toISOString().slice(0, 10)}.csv`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Delay revocation to avoid canceling the download in some browsers.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return { getAll, importJSON, exportCSV };
})();
