(function () {
  "use strict";

  const CONSENT_VERSION = "2026-07-14";
  const APP_VERSION = "painmap5-2026-07-20-evidence-threshold";
  let client = null;

  function uuid() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
      const value = Math.floor(Math.random() * 16);
      return (char === "x" ? value : (value & 0x3) | 0x8).toString(16);
    });
  }

  function config() {
    return window.HOOPFOOT_DATA_CONFIG || {};
  }

  function isConfigured() {
    const current = config();
    return Boolean(
      window.supabase &&
      current.supabaseUrl &&
      current.supabasePublishableKey &&
      !current.supabaseUrl.includes("YOUR_") &&
      !current.supabasePublishableKey.includes("YOUR_")
    );
  }

  function getClient() {
    if (!isConfigured()) return null;
    if (!client) {
      const current = config();
      client = window.supabase.createClient(current.supabaseUrl, current.supabasePublishableKey, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      });
    }
    return client;
  }

  function participantId() {
    const key = "hoopfoot_anonymous_participant_id";
    try {
      const existing = window.localStorage.getItem(key);
      if (existing) return existing;
      const created = uuid();
      window.localStorage.setItem(key, created);
      return created;
    } catch (_) {
      return uuid();
    }
  }

  function cleanJson(value) {
    return JSON.parse(JSON.stringify(value || {}));
  }

  async function submitScreening({ state, outcome, baseScores, finalScores, ranking, emergency }) {
    if (!state || !state.dataConsent) return { status: "not-consented" };
    if (state.submissionId) return { status: "already-saved", id: state.submissionId };
    const db = getClient();
    if (!db) return { status: "not-configured" };

    const id = uuid();
    const payload = {
      id,
      participant_id: participantId(),
      session_id: state.sessionId || uuid(),
      consent_version: CONSENT_VERSION,
      app_version: APP_VERSION,
      outcome,
      // The current database constraint accepts acute/chronic only. Preserve
      // uncertain onset in answers.onset_event and store a neutral SQL value.
      mode: ["acute", "chronic"].includes(state.mode) ? state.mode : null,
      primary_location: state.answers?.primary_location || null,
      secondary_location: state.answers?.secondary_location || null,
      answers: cleanJson(state.answers),
      special_tests: cleanJson(state.testResults),
      base_scores: cleanJson(baseScores),
      final_scores: cleanJson(finalScores),
      ranking: cleanJson(ranking),
      emergency: Boolean(emergency),
      completed_at: new Date().toISOString(),
    };

    const table = config().table || "screening_submissions";
    const { error } = await db.from(table).insert(payload);
    if (error) throw error;
    state.submissionId = id;
    return { status: "saved", id };
  }

  window.ScreeningDataStore = {
    CONSENT_VERSION,
    isConfigured,
    submitScreening,
    uuid,
  };
})();
