(function () {
  "use strict";

  const cfg = window.HOOPFOOT_DATA_CONFIG || {};
  const status = document.getElementById("resetStatus");
  const form = document.getElementById("resetForm");
  const client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabasePublishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });

  function showError(message, hideForm = true) {
    status.textContent = message;
    status.className = "admin-message error";
    if (hideForm) form.hidden = true;
  }

  async function showFormWhenReady() {
    const { data, error } = await client.auth.getSession();
    if (error || !data.session) {
      showError("This recovery link is invalid or has expired. Return to sign in and request a new email.");
      return;
    }
    status.textContent = "Enter a new password of at least 8 characters.";
    status.className = "admin-message";
    form.hidden = false;
  }

  client.auth.onAuthStateChange((event) => {
    if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") showFormWhenReady();
  });

  form.onsubmit = async (event) => {
    event.preventDefault();
    const password = document.getElementById("newPassword").value;
    const confirmation = document.getElementById("confirmPassword").value;
    if (password !== confirmation) return showError("The two passwords do not match.", false);
    status.textContent = "Saving new password…";
    status.className = "admin-message";
    const { error } = await client.auth.updateUser({ password });
    if (error) return showError(error.message, false);
    await client.auth.signOut();
    form.hidden = true;
    status.innerHTML = 'Password updated. <a href="admin.html">Sign in with the new password</a>.';
  };

  showFormWhenReady();
})();
