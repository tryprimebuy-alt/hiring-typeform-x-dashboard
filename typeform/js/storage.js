/**
 * storage.js - Handles saving and retrieving form responses.
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

  function getAll() {
    return getAllLocal();
  }

  async function save(answers) {
    const response = {
      id: _generateId(),
      timestamp: new Date().toISOString(),
      answers,
    };

    const cfg = getConfig();
    if (!cfg.enabled) {
      const all = getAllLocal();
      all.push(response);
      setAllLocal(all);
      return response;
    }

    const url = `${cfg.supabaseUrl}/rest/v1/${encodeURIComponent(cfg.responsesTable)}`;
    const authHeaders = buildAuthHeaders(cfg.supabaseAnonKey);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify([{ answers }]),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Supabase insert failed (${res.status}): ${errText}`);
    }

    const rows = await res.json();
    const row = rows[0] || {};

    // Keep a local backup copy for debugging/recovery.
    const all = getAllLocal();
    all.push({
      id: row.id || response.id,
      timestamp: row.created_at || response.timestamp,
      answers: row.answers || answers,
    });
    setAllLocal(all);

    return {
      id: row.id || response.id,
      timestamp: row.created_at || response.timestamp,
      answers: row.answers || answers,
    };
  }

  function exportJSON() {
    const data = JSON.stringify(getAllLocal(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'responses.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          const existing = getAllLocal();
          const existingIds = new Set(existing.map(r => r.id));
          const newResponses = imported.filter(r => !existingIds.has(r.id));
          const merged = [...existing, ...newResponses];
          setAllLocal(merged);
          resolve(newResponses.length);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  function clearAll() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function _generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  return { getAll, save, exportJSON, importJSON, clearAll };
})();
