(() => {
  const mounts = document.querySelectorAll('[data-estimate-form]');
  const intro = document.querySelector('.landing-intro');

  function lockTopOrder(mount) {
    const main = document.querySelector('main');
    const hero = document.querySelector('.local-hero');
    const trust = document.querySelector('.trust-strip');
    if (!main || !hero || !trust || !mount) return;

    main.style.display = 'flex';
    main.style.flexDirection = 'column';
    hero.style.order = '1';
    trust.style.order = '2';
    mount.style.order = '3';

    if (main.firstElementChild !== hero) {
      main.insertBefore(hero, main.firstElementChild);
    }
    if (hero.nextElementSibling !== trust) {
      hero.insertAdjacentElement('afterend', trust);
    }
    if (trust.nextElementSibling !== mount) {
      trust.insertAdjacentElement('afterend', mount);
    }
  }

  function addBenefits(city) {
    if (!intro || document.querySelector('.homeowner-benefits')) return;
    const benefits = document.createElement('section');
    benefits.className = 'section homeowner-benefits';
    benefits.innerHTML = `<div class="benefit-copy"><p class="eyebrow">Homeowner value</p><h2>New siding can change how your home looks, performs, and holds value.</h2><p>For ${city} homeowners, siding replacement is not just a cosmetic update. A well-planned exterior can improve curb appeal, help the home feel tighter and more comfortable, reduce ongoing maintenance, and protect the structure from moisture damage.</p><p>Breeze Siding looks at the whole exterior so the finished project feels high-end: clean trim lines, balanced material choices, better weather details, and a result that makes the home look a heck of a lot better from the street.</p></div><div class="benefit-metrics"><article><strong>Curb appeal</strong><span>Fresh siding and crisp trim can quickly modernize an older exterior and make the home feel cared for.</span></article><article><strong>Energy comfort</strong><span>Siding projects are a good time to review weather barrier, insulation opportunities, and draft-prone exterior details.</span></article><article><strong>Home value</strong><span>A cleaner, lower-maintenance exterior can support resale confidence and stronger first impressions.</span></article><article><strong>Moisture protection</strong><span>Better flashing, trim, clearances, and siding details help protect against Northwest rain and rot.</span></article></div>`;
    intro.insertAdjacentElement('afterend', benefits);
  }

  function addProductResources() {
    if (document.querySelector('.product-links')) return;
    const anchor = document.querySelector('.value-grid')?.closest('.section') || document.querySelector('.homeowner-benefits') || intro;
    if (!anchor) return;
    const resources = document.createElement('section');
    resources.className = 'section product-links';
    resources.innerHTML = `<div><p class="eyebrow">Products and PNW exterior systems</p><h2>Materials should be chosen for Northwest weather, not just color.</h2><p>Breeze Siding helps homeowners compare James Hardie fiber cement, lap siding, panel accents, trim packages, weather barriers, rainscreen details, and window integration. The right combination can reduce maintenance, improve exterior performance, and create a sharper finished look.</p><p>On homes with heavy rain exposure, shaded walls, or complex transitions, we pay special attention to water management: clearances, flashing, trim joints, penetrations, and how the siding connects around windows, decks, doors, and rooflines.</p></div><ul class="resource-list" aria-label="Helpful exterior product resources"><li><a href="https://www.jameshardie.com/" target="_blank" rel="noopener">James Hardie fiber cement siding information</a></li><li><a href="https://vaproshield.com/" target="_blank" rel="noopener">VaproShield weather-resistive barrier and rainscreen resources</a></li><li><a href="https://www.energystar.gov/products/windows_doors_skylights" target="_blank" rel="noopener">ENERGY STAR window and exterior efficiency guidance</a></li></ul>`;
    anchor.insertAdjacentElement('afterend', resources);
  }

  function addProcess(city) {
    if (document.querySelector('.process')) return;
    const anchor = document.querySelector('.area-copy') || document.querySelector('.product-links') || document.querySelector('.value-grid')?.closest('.section') || document.querySelector('.photo-band');
    if (!anchor) return;
    const process = document.createElement('section');
    process.className = 'section process';
    process.innerHTML = `<div class="section-heading"><p class="eyebrow">Process</p><h2>A clear path from first call to a finished ${city} exterior.</h2></div><ol class="steps"><li><strong>Share the basics.</strong> Tell us the location, project type, timing, and visible concerns.</li><li><strong>Walk the exterior.</strong> We review siding, trim, windows, penetrations, and weather exposure.</li><li><strong>Confirm the scope.</strong> You get practical recommendations for siding, repairs, and related exterior work.</li><li><strong>Build with care.</strong> Our crew installs the approved scope and leaves the property ready for the final walkthrough.</li></ol>`;
    anchor.insertAdjacentElement('afterend', process);
  }

  if (!mounts.length) return;

  mounts.forEach((mount) => {
    const city = mount.dataset.city || 'Seattle, Tacoma, Spanaway...';
    const heading = mount.dataset.heading || 'Start with a smarter exterior estimate.';
    const copy = mount.dataset.copy || 'Tell us what is happening with the home and the form will organize the details Breeze Siding needs for a useful first call.';

    lockTopOrder(mount);
    addBenefits(city);
    addProductResources();
    addProcess(city);

    mount.innerHTML = `<section class="estimate" id="estimate"><div class="estimate-shell"><div class="estimate-heading"><p class="eyebrow">Free estimate</p><h2>${heading}</h2><p>${copy}</p></div><form class="estimate-form" id="estimate-lead-form" method="POST"><input class="form-honey" type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true"><div class="smart-estimate wide" aria-label="Project type helper"><div class="assistant-options" role="group" aria-label="Choose a project type"><button type="button" class="assistant-option is-active" data-project="Siding replacement">Siding</button><button type="button" class="assistant-option" data-project="Window replacement / installation">Windows</button><button type="button" class="assistant-option" data-project="Exterior painting">Paint</button><button type="button" class="assistant-option" data-project="Deck building">Deck</button><button type="button" class="assistant-option" data-project="Commercial / multifamily">Commercial</button><button type="button" class="assistant-option" data-project="Not sure yet">Not sure</button></div><div class="assistant-panel" id="assistant-panel" aria-live="polite" hidden><span class="assistant-kicker">Recommended details</span><strong id="assistant-title">Siding replacement</strong><p id="assistant-copy">Helpful details: existing siding type, damaged areas, number of sides, photos of problem spots, and whether windows or paint should be included.</p><ul class="assistant-list" id="assistant-list"><li>Attach or mention exterior photos if available.</li><li>Share your city and ideal timing.</li><li>Note leaks, soft trim, or areas with weather damage.</li></ul></div></div><label>Name<input name="name" autocomplete="name" required></label><label>Phone (optional)<input name="phone" autocomplete="tel"></label><label>Email<input type="email" name="email" autocomplete="email" required></label><label>City (optional)<input name="city" autocomplete="address-level2" placeholder="${city}"></label><label>Project type<select name="project" required><option value="" selected disabled>Choose project type</option><option>Siding replacement</option><option>Siding installation / new construction</option><option>Window replacement / installation</option><option>Exterior painting</option><option>Deck building</option><option>Commercial / multifamily</option><option>Not sure yet</option></select></label><label>Timeline (optional)<select name="timeline"><option value="">Choose timeline</option><option>As soon as possible</option><option>Within 1-3 months</option><option>Planning ahead</option><option>Just comparing options</option></select></label><label class="wide">Project notes (optional)<textarea name="message" rows="5" placeholder="Tell us about the home, siding condition, photos you can provide, or what you want changed."></textarea></label><div class="estimate-actions wide"><button class="button primary" type="submit">Request Free Estimate</button><a class="button secondary" href="tel:12532280531">Call 253-228-0531</a></div><p class="form-status wide" id="estimate-form-status" aria-live="polite"></p></form></div></section>`;
  });
})();