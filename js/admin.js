(function () {
  "use strict";

  const cfg = window.HOOPFOOT_DATA_CONFIG || {};
  const setupPanel = document.getElementById("setupPanel");
  const loginPanel = document.getElementById("loginPanel");
  const dashboardPanel = document.getElementById("dashboardPanel");
  const signOutBtn = document.getElementById("signOutBtn");
  const dataMessage = document.getElementById("dataMessage");
  const recordsTable = document.getElementById("recordsTable");
  const recordsBody = document.getElementById("recordsBody");
  const detailDialog = document.getElementById("detailDialog");
  const detailContent = document.getElementById("detailContent");
  let client = null;
  let records = [];
  let filteredRecords = [];

  function configured() {
    return Boolean(window.supabase && cfg.supabaseUrl && cfg.supabasePublishableKey);
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
  }

  function roleIsAdmin(session) {
    return session?.user?.app_metadata?.role === "screening_admin";
  }

  function topResult(record) {
    return Array.isArray(record.ranking) && record.ranking.length ? record.ranking[0] : null;
  }

  function dateText(value) {
    return value ? new Date(value).toLocaleString() : "—";
  }

  function showLogin(message = "") {
    setupPanel.hidden = true;
    dashboardPanel.hidden = true;
    signOutBtn.hidden = true;
    loginPanel.hidden = false;
    const target = document.getElementById("loginMessage");
    target.textContent = message;
    target.classList.toggle("error", Boolean(message));
  }

  async function loadRecords() {
    dataMessage.textContent = "Loading records…";
    dataMessage.className = "admin-message";
    recordsTable.hidden = true;
    const { data, error } = await client
      .from(cfg.table || "screening_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) {
      dataMessage.textContent = error.message;
      dataMessage.className = "admin-message error";
      return;
    }
    records = data || [];
    applyFilters();
  }

  function renderStats() {
    const completed = records.filter((row) => row.outcome === "completed").length;
    const emergency = records.filter((row) => row.outcome === "emergency_stop").length;
    const participants = new Set(records.map((row) => row.participant_id)).size;
    document.getElementById("statsGrid").innerHTML = [
      [records.length, "Total screenings"],
      [participants, "Anonymous participants"],
      [completed, "Completed reports"],
      [emergency, "Emergency stops"],
    ].map(([value, label]) => `<div class="admin-stat"><strong>${value}</strong><span>${label}</span></div>`).join("");
  }

  function applyFilters() {
    const mode = document.getElementById("modeFilter").value;
    const outcome = document.getElementById("outcomeFilter").value;
    const search = document.getElementById("searchFilter").value.trim().toLowerCase();
    filteredRecords = records.filter((record) => {
      if (mode && record.mode !== mode) return false;
      if (outcome && record.outcome !== outcome) return false;
      if (!search) return true;
      const top = topResult(record);
      const haystack = [record.id, record.participant_id, record.primary_location, record.secondary_location, top?.key, top?.nameEn, top?.nameZh].join(" ").toLowerCase();
      return haystack.includes(search);
    });
    renderStats();
    renderTable();
  }

  function renderTable() {
    dataMessage.textContent = filteredRecords.length ? `${filteredRecords.length} record${filteredRecords.length === 1 ? "" : "s"}` : "No matching records.";
    recordsTable.hidden = filteredRecords.length === 0;
    recordsBody.innerHTML = filteredRecords.map((record) => {
      const top = topResult(record);
      const location = [record.primary_location, record.secondary_location].filter(Boolean).join(" · ") || "—";
      const score = top?.score ?? top?.scorePct ?? "—";
      return `<tr>
        <td>${escapeHtml(dateText(record.completed_at || record.created_at))}</td>
        <td>${escapeHtml(record.mode || "—")}</td>
        <td>${escapeHtml(location)}</td>
        <td><span class="admin-badge ${escapeHtml(record.outcome)}">${escapeHtml(record.outcome)}</span></td>
        <td>${escapeHtml(top?.nameEn || top?.key || "—")}</td>
        <td>${escapeHtml(score)}</td>
        <td><button class="view-record" data-id="${record.id}">View</button></td>
      </tr>`;
    }).join("");

    document.querySelectorAll(".view-record").forEach((button) => {
      button.onclick = () => showDetail(button.dataset.id);
    });
  }

  function showDetail(id) {
    const record = records.find((item) => item.id === id);
    if (!record) return;
    const top = topResult(record);
    detailContent.innerHTML = `
      <div class="detail-grid">
        <div class="detail-item"><span>Record ID</span><strong>${escapeHtml(record.id)}</strong></div>
        <div class="detail-item"><span>Completed</span><strong>${escapeHtml(dateText(record.completed_at))}</strong></div>
        <div class="detail-item"><span>Anonymous participant</span><strong>${escapeHtml(record.participant_id)}</strong></div>
        <div class="detail-item"><span>Session</span><strong>${escapeHtml(record.session_id)}</strong></div>
        <div class="detail-item"><span>Mode</span><strong>${escapeHtml(record.mode || "—")}</strong></div>
        <div class="detail-item"><span>Outcome</span><strong>${escapeHtml(record.outcome)}</strong></div>
        <div class="detail-item"><span>Location</span><strong>${escapeHtml([record.primary_location, record.secondary_location].filter(Boolean).join(" · ") || "—")}</strong></div>
        <div class="detail-item"><span>Top result</span><strong>${escapeHtml(top?.nameEn || top?.key || "—")}</strong></div>
      </div>
      ${[["All choices", record.answers], ["Special tests", record.special_tests], ["Base scores", record.base_scores], ["Final scores", record.final_scores], ["Final ranking", record.ranking]].map(([label, value], index) => `<details class="detail-json" ${index === 0 ? "open" : ""}><summary>${label}</summary><pre>${escapeHtml(JSON.stringify(value, null, 2))}</pre></details>`).join("")}`;
    detailDialog.showModal();
  }

  function exportCsv() {
    const headers = ["id", "created_at", "completed_at", "participant_id", "session_id", "mode", "primary_location", "secondary_location", "outcome", "answers", "special_tests", "base_scores", "final_scores", "ranking"];
    const quote = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const rows = filteredRecords.map((record) => headers.map((field) => quote(typeof record[field] === "object" ? JSON.stringify(record[field]) : record[field])).join(","));
    const blob = new Blob([[headers.join(","), ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `hoopfoot-screenings-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function initialize() {
    if (!configured()) {
      setupPanel.hidden = false;
      return;
    }
    client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabasePublishableKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
    const { data: { session } } = await client.auth.getSession();
    if (!session) return showLogin();
    if (!roleIsAdmin(session)) {
      await client.auth.signOut();
      return showLogin("This account is not authorized as a screening administrator.");
    }
    loginPanel.hidden = true;
    dashboardPanel.hidden = false;
    signOutBtn.hidden = false;
    await loadRecords();
  }

  document.getElementById("loginForm").onsubmit = async (event) => {
    event.preventDefault();
    const message = document.getElementById("loginMessage");
    message.textContent = "Signing in…";
    message.className = "admin-message";
    const { data, error } = await client.auth.signInWithPassword({
      email: document.getElementById("adminEmail").value.trim(),
      password: document.getElementById("adminPassword").value,
    });
    if (error) {
      message.textContent = error.message;
      message.className = "admin-message error";
      return;
    }
    if (!roleIsAdmin(data.session)) {
      await client.auth.signOut();
      message.textContent = "This account is not authorized as a screening administrator.";
      message.className = "admin-message error";
      return;
    }
    loginPanel.hidden = true;
    dashboardPanel.hidden = false;
    signOutBtn.hidden = false;
    await loadRecords();
  };

  signOutBtn.onclick = async () => { await client.auth.signOut(); showLogin(); };
  document.getElementById("refreshBtn").onclick = loadRecords;
  document.getElementById("exportBtn").onclick = exportCsv;
  document.getElementById("modeFilter").onchange = applyFilters;
  document.getElementById("outcomeFilter").onchange = applyFilters;
  document.getElementById("searchFilter").oninput = applyFilters;
  document.getElementById("closeDialogBtn").onclick = () => detailDialog.close();

  initialize();
})();
