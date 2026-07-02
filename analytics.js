(() => {
  const measurementId = 'G-6F5K9JGX39';

  if (!measurementId || window.__breezeAnalyticsLoaded) return;
  window.__breezeAnalyticsLoaded = true;

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    anonymize_ip: true,
    send_page_view: true
  });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);

  const legacyLocationPages = {
    '/siding-replacement-seattle.html': ['Seattle', 'Start with a smarter Seattle siding estimate.'],
    '/siding-replacement-tacoma.html': ['Tacoma', 'Start with a smarter Tacoma siding estimate.'],
    '/siding-replacement-bellevue.html': ['Bellevue', 'Start with a smarter Bellevue siding estimate.'],
    '/siding-replacement-kirkland.html': ['Kirkland', 'Start with a smarter Kirkland siding estimate.'],
    '/siding-replacement-redmond.html': ['Redmond', 'Start with a smarter Redmond siding estimate.'],
    '/siding-replacement-kent.html': ['Kent', 'Start with a smarter Kent siding estimate.'],
    '/siding-replacement-puyallup.html': ['Puyallup', 'Start with a smarter Puyallup siding estimate.'],
    '/siding-replacement-federal-way.html': ['Federal Way', 'Start with a smarter Federal Way siding estimate.'],
    '/siding-replacement-auburn.html': ['Auburn', 'Start with a smarter Auburn siding estimate.'],
    '/siding-replacement-spanaway.html': ['Spanaway', 'Start with a smarter Spanaway siding estimate.'],
    '/siding-replacement-gig-harbor.html': ['Gig Harbor', 'Start with a smarter Gig Harbor siding estimate.']
  };

  function loadOnce(src) {
    if ([...document.scripts].some((item) => item.src.includes(src.split('?')[0]))) return;
    const node = document.createElement('script');
    node.src = src;
    node.defer = true;
    document.body.appendChild(node);
  }

  function ensureStylesheet(href) {
    if ([...document.styleSheets].some((sheet) => sheet.href && sheet.href.includes(href.split('?')[0]))) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  function ensureCanonical() {
    const expected = `https://breezesiding.com${window.location.pathname}`;
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    if (canonical.href.includes('github.io') || canonical.href.includes('breeze-siding-preview')) {
      canonical.href = expected;
    }
  }

  function addFooterSocialLinks() {
    const footer = document.querySelector('.footer > div');
    if (!footer || footer.querySelector('.social-links')) return;

    const buttonStyle = 'width:42px;min-height:42px;padding:0;border-radius:999px;display:inline-grid;place-items:center';
    const labelStyle = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0';
    const instagramIcon = '<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"></circle></svg>';
    const facebookIcon = '<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M14.7 8.3V6.9c0-.7.5-1.1 1.2-1.1h1.4V3.2c-.7-.1-1.6-.2-2.4-.2-2.4 0-4 1.5-4 4.1v1.2H8.3v3h2.6V21h3.1v-9.7h2.7l.4-3h-3.1Z"></path></svg>';

    const social = document.createElement('nav');
    social.className = 'social-links';
    social.setAttribute('aria-label', 'Breeze Siding social media');
    social.innerHTML = `<a href="https://instagram.com/breezesiding" target="_blank" rel="me noopener" aria-label="Breeze Siding on Instagram" title="Instagram" style="${buttonStyle}">${instagramIcon}<span style="${labelStyle}">Instagram</span></a><a href="https://www.facebook.com/breezesiding" target="_blank" rel="me noopener" aria-label="Breeze Siding on Facebook" title="Facebook" style="${buttonStyle}">${facebookIcon}<span style="${labelStyle}">Facebook</span></a>`;
    footer.appendChild(social);
  }

  function addLegacyLocationForm() {
    const config = legacyLocationPages[window.location.pathname];
    if (!config) return;
    ensureCanonical();
    if (document.querySelector('[data-estimate-form]')) return;
    const [city, heading] = config;
    const target = document.querySelector('.resource-hero, .local-hero, main > section:first-child');
    if (!target) return;

    ensureStylesheet('/location-pages.css?v=order-5');

    const trust = document.createElement('section');
    trust.className = 'trust-strip';
    trust.innerHTML = '<span>Licensed and insured</span><span>James Hardie and fiber cement installs</span><span>Free on-site estimates</span><span>Seattle to Tacoma service</span>';

    const mount = document.createElement('div');
    mount.dataset.estimateForm = '';
    mount.dataset.city = city;
    mount.dataset.heading = heading;
    mount.dataset.copy = `Tell us about your ${city} home, the siding condition, and your timeline. Breeze Siding will follow up for a focused onboarding call.`;

    target.insertAdjacentElement('afterend', trust);
    trust.insertAdjacentElement('afterend', mount);

    loadOnce('/location-form.js?v=seo-2');
    loadOnce('/smart-estimate.js');
    loadOnce('/lead-submit.js?v=lead-7');
  }

  function init() {
    addFooterSocialLinks();
    addLegacyLocationForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();