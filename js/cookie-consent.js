/* ==========================================================================
   KeepCounsel — Cookie consent / GA4 gate
   --------------------------------------------------------------------------
   Google Analytics is NOT loaded until the visitor clicks "Accept" here.
   Choice is stored in localStorage and can be changed at any time via the
   "Cookie preferences" link this script injects into the footer.

   SETUP: replace GA_MEASUREMENT_ID below with your real GA4 property ID
   (looks like "G-XXXXXXXXXX") once you've created one at analytics.google.com.
   Until then this file is inert — no script loads either way.
   ========================================================================== */

(function () {
  "use strict";

  var GA_MEASUREMENT_ID = "G-XXXXXXXXXX"; // TODO: replace with your real GA4 ID
  var STORAGE_KEY = "kc_analytics_consent"; // "granted" | "denied"
  var gaLoaded = false;

  function getConsent() {
    try { return window.localStorage.getItem(STORAGE_KEY); }
    catch (e) { return null; }
  }

  function setConsent(value) {
    try { window.localStorage.setItem(STORAGE_KEY, value); }
    catch (e) { /* localStorage unavailable (private mode etc.) — consent just won't persist */ }
  }

  function loadGA() {
    if (gaLoaded || !GA_MEASUREMENT_ID || GA_MEASUREMENT_ID.indexOf("XXXX") !== -1) return;
    gaLoaded = true;
    window["ga-disable-" + GA_MEASUREMENT_ID] = false;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_MEASUREMENT_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", GA_MEASUREMENT_ID, { anonymize_ip: true });
  }

  function disableGA() {
    if (GA_MEASUREMENT_ID) window["ga-disable-" + GA_MEASUREMENT_ID] = true;
    // Best-effort cleanup of any GA cookies already set on a prior visit.
    var names = ["_ga", "_gid", "_gat"];
    if (GA_MEASUREMENT_ID) names.push("_ga_" + GA_MEASUREMENT_ID.replace(/^G-/, ""));
    var host = window.location.hostname;
    var domains = [host, "." + host, host.replace(/^www\./, ""), "." + host.replace(/^www\./, "")];
    names.forEach(function (name) {
      domains.forEach(function (domain) {
        document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=" + domain;
      });
      document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    });
  }

  function buildBanner() {
    var wrap = document.createElement("div");
    wrap.id = "kc-cookie-banner";
    wrap.className = "cookie-banner";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-live", "polite");
    wrap.setAttribute("aria-label", "Cookie preferences");
    wrap.innerHTML =
      '<div class="cookie-banner-inner">' +
        '<p>We use Google Analytics to understand how visitors use this site — nothing more. ' +
        'Accept if that\'s fine with you, or reject and we won\'t track you. ' +
        '<a href="' + (location.pathname.indexOf("/insights/") !== -1 ? "../privacy.html" : "privacy.html") + '#cookies">Read more</a>.</p>' +
        '<div class="cookie-banner-actions">' +
          '<button type="button" class="btn btn-ghost btn-sm" data-cookie-action="reject">Reject</button>' +
          '<button type="button" class="btn btn-gold btn-sm" data-cookie-action="accept">Accept</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(wrap);
    return wrap;
  }

  function showBanner(banner) {
    // Force reflow so the transition runs even on a re-open.
    banner.classList.remove("is-visible");
    void banner.offsetWidth;
    banner.classList.add("is-visible");
  }

  function hideBanner(banner) {
    banner.classList.remove("is-visible");
  }

  function injectFooterLink(onOpen) {
    var footerBottom = document.querySelector(".footer-bottom");
    if (!footerBottom) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cookie-prefs-link";
    btn.textContent = "Cookie preferences";
    btn.addEventListener("click", onOpen);
    footerBottom.appendChild(btn);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var banner = buildBanner();

    injectFooterLink(function () { showBanner(banner); });

    banner.addEventListener("click", function (e) {
      var action = e.target && e.target.getAttribute("data-cookie-action");
      if (!action) return;
      if (action === "accept") { setConsent("granted"); loadGA(); }
      if (action === "reject") { setConsent("denied"); disableGA(); }
      hideBanner(banner);
    });

    var consent = getConsent();
    if (consent === "granted") {
      loadGA();
    } else if (consent === "denied") {
      disableGA();
    } else {
      showBanner(banner);
    }
  });
})();
