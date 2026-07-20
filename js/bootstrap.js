(function () {
  "use strict";

  const app = document.getElementById("app");
  const choices = {
    zh: {
      htmlLang: "zh-CN",
      logo: "足踝筛查",
      steps: ["安全", "问卷", "定位", "功能", "结果"],
      footer: "仅用于初步风险筛查，不构成医学诊断，也不能替代医生检查或影像学检查。如症状严重，请立即就医。",
      title: "篮球足踝伤病筛查系统",
    },
    en: {
      htmlLang: "en",
      logo: "Foot & Ankle Screen",
      steps: ["Safety", "Questions", "Location", "Function", "Results"],
      footer: "For preliminary screening only. This is not a diagnosis and does not replace medical examination or imaging. Seek urgent care for severe symptoms.",
      title: "Basketball Foot & Ankle Injury Screening System",
    },
  };

  function applyStaticLanguage(language) {
    const copy = choices[language];
    document.documentElement.lang = copy.htmlLang;
    document.title = copy.title;
    document.querySelector(".sb-logo span").textContent = copy.logo;
    document.querySelectorAll(".q-name").forEach((item, index) => {
      item.textContent = copy.steps[index];
    });
    document.querySelector("#appFooter p").textContent = copy.footer;
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Unable to load ${src}`));
      document.body.appendChild(script);
    });
  }

  async function start(language) {
    if (!choices[language]) return;
    window.HOOPFOOT_LANG = language;
    window.uiText = (english, chinese) => language === "zh" ? chinese : english;
    applyStaticLanguage(language);
    app.setAttribute("aria-busy", "true");
    app.innerHTML = `<div class="screen language-loading">${language === "zh" ? "正在加载筛查…" : "Loading screening…"}</div>`;
    try {
      await loadScript("js/en.js?v=20260716-language");
      await loadScript("js/glossary.js?v=20260716-language");
      await loadScript("js/dataStore.js?v=20260716-language");
      await loadScript("js/app.js?v=20260720-threshold");
    } catch (error) {
      console.error(error);
      app.innerHTML = `<div class="screen"><div class="card language-error">${language === "zh" ? "页面加载失败，请刷新后重试。" : "The page could not load. Please refresh and try again."}</div></div>`;
    } finally {
      app.removeAttribute("aria-busy");
    }
  }

  function showLanguageChoice() {
    document.documentElement.lang = "zh-CN";
    document.title = "Painmap5 · 选择语言 / Choose language";
    document.querySelector(".sb-logo span").textContent = "Painmap5";
    document.querySelectorAll(".q").forEach((item) => item.classList.remove("active", "done"));
    document.querySelectorAll(".q-name").forEach((item) => { item.textContent = "—"; });
    document.querySelector("#appFooter p").textContent = "请选择语言以开始筛查 · Choose a language to begin";
    app.innerHTML = `
      <div class="screen language-screen">
        <p class="eyebrow">Painmap5</p>
        <h1 class="title">选择语言<br><span lang="en">Choose your language</span></h1>
        <p class="subtitle">所选语言将用于整套问卷、检查指导和结果报告。<br><span lang="en">Your selection applies to the full questionnaire, test guidance, and report.</span></p>
        <div class="language-grid">
          <button class="language-choice" type="button" data-language="zh">
            <strong>中文</strong><span>使用中文开始筛查</span>
          </button>
          <button class="language-choice" type="button" data-language="en">
            <strong>English</strong><span>Start screening in English</span>
          </button>
        </div>
      </div>`;
    document.querySelectorAll(".language-choice").forEach((button) => {
      button.onclick = () => start(button.dataset.language);
    });
  }

  window.restartWithLanguageChoice = () => window.location.reload();
  showLanguageChoice();
})();
