(() => {
  const mounts = document.querySelectorAll('[data-estimate-form]');
  const intro = document.querySelector('.landing-intro');
  const imagePool = [
    { src: '/assets/images/project-closeup.jpg', alt: 'Detailed siding and trim work around windows', caption: 'Close-up siding and trim work around vulnerable openings.' },
    { src: '/assets/images/hardie-panel-multifamily-siding-detail.jpg?v=5', alt: 'Hardie panel siding with clean reveal lines', caption: 'Hardie panel siding and clean reveal lines for modern exterior work.' },
    { src: '/assets/images/single-story-cedar-exterior-window-project.jpg?v=6', alt: 'Wood siding exterior with large black windows', caption: 'Warm siding tones paired with large black window details.' },
    { src: '/assets/images/residential-covered-entry-siding-wood-accent.webp?v=4', alt: 'Residential siding with covered entry and wood accent', caption: 'Covered entry with crisp siding, trim, and warm wood detail.' },
    { src: '/assets/images/project-home.jpg', alt: 'Two-story home with updated siding and windows', caption: 'Updated siding and window details for a clean finished exterior.' },
    { src: '/assets/images/project-modern.jpg', alt: 'Modern exterior siding and windows', caption: 'Modern siding and window combinations for refined curb appeal.' },
    { src: '/assets/images/covered-deck-patio-renovation.jpg', alt: 'Covered deck and patio exterior renovation', caption: 'Exterior updates can include siding, decks, and adjacent details.' }
  ];

  const cityContent = {
    Tacoma: {
      benefits: {
        eyebrow: 'Tacoma homeowner value',
        title: 'Siding work should respect older homes, busy streets, and South Sound weather.',
        body: [
          'Tacoma homes often have a mix of original wood details, older additions, and remodel work completed at different times. A strong siding project can clean up that history while protecting the home from rain, wind, and shaded-wall moisture.',
          'Breeze Siding helps Tacoma homeowners prioritize the details that matter most: trim condition, window transitions, paint failure, lower-wall exposure, and curb appeal that feels appropriate for the neighborhood.'
        ],
        cards: [
          ['Older-home fit', 'Exterior scopes can account for craftsman, mid-century, and updated South Sound homes without making the finish feel generic.'],
          ['Moisture control', 'We look closely at lower walls, roof returns, penetrations, and trim areas where Tacoma rain tends to show up first.'],
          ['Street presence', 'A cleaner siding and trim package can make the home feel sharper from the curb without losing local character.'],
          ['Repair clarity', 'Visible rot, loose trim, paint breakdown, and window issues can be organized into one more useful estimate conversation.']
        ]
      },
      products: {
        eyebrow: 'Tacoma siding materials',
        title: 'Durable products for older homes, remodels, and South Sound exposure.',
        body: [
          'Tacoma projects often need siding products that can handle weather while still fitting the character of established neighborhoods. James Hardie lap siding, fiber cement trim, and carefully selected panel accents can modernize the home without making it feel out of place.',
          'We pay close attention to flashing, clearances, window trim, deck connections, and paint-ready details so the exterior is more than a surface refresh.'
        ]
      },
      processTitle: 'A Tacoma siding process that starts with condition, not assumptions.'
    },
    Kent: {
      benefits: {
        eyebrow: 'Kent homeowner value',
        title: 'A better siding project protects the home through wet winters and busy everyday use.',
        body: [
          'Kent homes range from older South King County properties to newer subdivisions where siding failure can show up around trim, windows, and high-exposure elevations. A well-planned exterior can improve the look of the home while reducing maintenance surprises.',
          'Breeze Siding helps Kent homeowners compare practical material options, identify repair-prone areas, and choose a scope that fits the home instead of forcing a one-size-fits-all package.'
        ],
        cards: [
          ['Practical curb appeal', 'Fresh siding, straight trim, and clean color transitions can make a Kent home feel newer and better maintained.'],
          ['Weather resilience', 'Fiber cement, good clearances, and better detailing help protect the home through long wet stretches.'],
          ['Scope control', 'We help separate must-fix issues from optional upgrades so the estimate stays understandable.'],
          ['Connected details', 'Windows, paint, trim, and deck-adjacent siding can be reviewed together when they affect the same wall system.']
        ]
      },
      products: {
        eyebrow: 'Kent exterior systems',
        title: 'Material choices should balance durability, budget, and long-term maintenance.',
        body: [
          'For Kent homes, fiber cement and James Hardie siding are common choices because they offer a durable finish when installed with proper trim, flashing, and paint details. Panel accents can work well when the home needs a cleaner modern update.',
          'The important part is not only the product. It is how the siding ties into windows, corners, penetrations, ground clearances, and water-shedding details.'
        ]
      },
      processTitle: 'A Kent estimate process built around practical priorities.'
    },
    Bellevue: {
      benefits: {
        eyebrow: 'Bellevue homeowner value',
        title: 'Premium siding should elevate the architecture and protect the investment.',
        body: [
          'Bellevue homeowners often care about design alignment, resale confidence, and a finished exterior that feels intentional from the street. The siding scope may involve panel accents, lap siding, window trim, paint coordination, and details that need to look sharp up close.',
          'Breeze Siding helps connect product choice with curb appeal and weather protection, so the finished project supports both the look of the home and long-term exterior performance.'
        ],
        cards: [
          ['Design alignment', 'Panel placement, trim width, color contrast, and window details are reviewed as part of the overall exterior look.'],
          ['Investment protection', 'A cleaner exterior can support value when it also handles rain, shade, and wall transitions correctly.'],
          ['Modern options', 'Hardie panel, lap siding, and reveal-style details can be combined when the home calls for a more contemporary finish.'],
          ['Finish discipline', 'Straight lines, consistent transitions, and crisp trim details matter on higher-visibility Bellevue projects.']
        ]
      },
      products: {
        eyebrow: 'Bellevue product strategy',
        title: 'Modern materials need careful detailing to feel high-end.',
        body: [
          'Bellevue projects are a strong fit for James Hardie siding, Hardie panel, fiber cement trim, and modern reveal details when the design calls for cleaner lines. These products can look elevated when the proportions and transitions are planned before installation begins.',
          'We also look at weather barrier continuity, window integration, flashing, and paint coordination so the exterior is not just attractive, but built for Northwest exposure.'
        ]
      },
      processTitle: 'A Bellevue exterior process focused on design, protection, and clear decisions.'
    },
    'Clyde Hill': {
      benefits: {
        eyebrow: 'Clyde Hill homeowner value',
        title: 'High-value homes need exterior details that feel deliberate, not rushed.',
        body: [
          'Clyde Hill siding work should be planned with the same care as the rest of the home. The wrong trim profile, panel spacing, or color transition can make an expensive project feel ordinary. The right scope can sharpen the architecture and protect the structure at the same time.',
          'Breeze Siding helps homeowners think through product selection, premium finish details, moisture management, and the full exterior presentation before the work begins.'
        ],
        cards: [
          ['Architectural fit', 'The siding profile, trim package, and panel details should support the home instead of competing with it.'],
          ['Premium finish', 'Crisp lines, clean corners, and careful transitions help the finished exterior match the value of the property.'],
          ['Weather planning', 'Even high-end homes need careful flashing, clearances, and moisture-conscious exterior assemblies.'],
          ['Decision clarity', 'We help organize product and scope decisions so the estimate conversation feels focused and useful.']
        ]
      },
      products: {
        eyebrow: 'Clyde Hill material approach',
        title: 'Premium siding choices should support both architecture and performance.',
        body: [
          'Clyde Hill projects can benefit from Hardie panel, fiber cement lap siding, refined trim packages, and selective wood accents when the design calls for warmth. The best result comes from matching the material to the home rather than choosing products in isolation.',
          'We pay special attention to reveal lines, window transitions, panel layout, drainage strategy, and paint coordination so the project feels intentional from every angle.'
        ]
      },
      processTitle: 'A Clyde Hill siding process built around premium details and careful scope planning.'
    },
    Puyallup: {
      benefits: {
        eyebrow: 'Puyallup homeowner value',
        title: 'A South Sound exterior should handle weather, wear, and everyday curb appeal.',
        body: [
          'Puyallup homes can see wind-driven rain, exposed elevations, lower-wall moisture, and siding wear around decks, entries, and trim. A good siding project should make the home look better while solving the details that caused trouble in the first place.',
          'Breeze Siding helps Puyallup homeowners build practical scopes for siding replacement, dry rot repair, trim updates, windows, paint, and connected exterior work.'
        ],
        cards: [
          ['Nearby crew', 'A local South Sound contractor can respond with practical knowledge of Puyallup, South Hill, and Pierce County homes.'],
          ['Better first impression', 'Updated siding, trim, and entry details can dramatically improve how the home feels from the driveway.'],
          ['Weather-ready scope', 'We review lower walls, deck connections, window trim, and exposed elevations where moisture problems often begin.'],
          ['Project flexibility', 'Siding, paint, windows, and deck-adjacent details can be coordinated when the home needs more than one trade.']
        ]
      },
      products: {
        eyebrow: 'Puyallup material planning',
        title: 'Choose siding that fits the home, the weather, and the maintenance goal.',
        body: [
          'For Puyallup homeowners, fiber cement and James Hardie products are useful options when the goal is durability and a cleaner long-term finish. Cedar-style looks, panel accents, and warm entry details can also help the exterior feel more custom.',
          'We focus on the details that make the product perform: clearances, trim, weather barrier tie-ins, window transitions, and paint-ready installation.'
        ]
      },
      processTitle: 'A Puyallup siding process that keeps the scope practical and the finish sharp.'
    },
    Seattle: {
      benefits: {
        eyebrow: 'Seattle homeowner value',
        title: 'Seattle siding needs moisture awareness from the first estimate conversation.',
        body: [
          'Seattle homes often have shaded elevations, mature trees, older trim details, and siding that stays damp longer than homeowners expect. A strong siding project can improve curb appeal while addressing the details that keep causing rot, paint failure, and water intrusion.',
          'Breeze Siding looks at the whole exterior: siding, trim, windows, penetrations, weather barrier, decks, and roofline transitions that affect how the home performs in a wet climate.'
        ],
        cards: [
          ['Moisture diagnosis', 'We look beyond visible siding to the trim, windows, and transitions where Seattle homes often fail first.'],
          ['Curb appeal', 'Clean siding and trim can make an older Seattle exterior feel refreshed without losing neighborhood character.'],
          ['Energy comfort', 'Siding projects are a good time to review drafts, window tie-ins, and weather barrier concerns.'],
          ['Long-term value', 'A more complete exterior scope can reduce repeat repairs and support stronger resale confidence.']
        ]
      },
      products: {
        eyebrow: 'Seattle exterior systems',
        title: 'Materials need to work with rain, shade, and complex wall details.',
        body: [
          'Seattle homes benefit from siding products and weather details that account for damp walls, shaded sides, older window openings, and roofline transitions. James Hardie, fiber cement, rainscreen thinking, and better flashing details can all play a role.',
          'We help homeowners choose materials that look appropriate for the home while improving the way the exterior manages water.'
        ]
      },
      processTitle: 'A Seattle siding process built around moisture, trim, and window details.'
    }
  };

  const defaultContent = cityContent.Seattle;

  function normalizeImage(value) {
    return String(value || '').split('?')[0].replace(/^https?:\/\/[^/]+/, '').replace(/^url\(["']?|["']?\)$/g, '');
  }

  function getHeroImage() {
    const hero = document.querySelector('.local-hero');
    const inlineImage = hero?.style.getPropertyValue('--hero-image');
    return normalizeImage(inlineImage);
  }

  function removeRepeatedProjectImages() {
    const figures = document.querySelectorAll('.photo-band figure');
    if (!figures.length) return;
    const used = new Set();
    const heroImage = getHeroImage();
    if (heroImage) used.add(heroImage);

    figures.forEach((figure) => {
      const img = figure.querySelector('img');
      if (!img) return;
      const current = normalizeImage(img.getAttribute('src'));
      if (!used.has(current)) {
        used.add(current);
        return;
      }

      const replacement = imagePool.find((candidate) => !used.has(normalizeImage(candidate.src)));
      if (!replacement) return;
      img.src = replacement.src;
      img.alt = replacement.alt;
      const caption = figure.querySelector('figcaption');
      if (caption) caption.textContent = replacement.caption;
      used.add(normalizeImage(replacement.src));
    });
  }

  function contentFor(city) {
    return cityContent[city] || defaultContent;
  }

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
    const data = contentFor(city).benefits;
    const cards = data.cards.map(([title, text]) => `<article><strong>${title}</strong><span>${text}</span></article>`).join('');
    const benefits = document.createElement('section');
    benefits.className = 'section homeowner-benefits';
    benefits.innerHTML = `<div class="benefit-copy"><p class="eyebrow">${data.eyebrow}</p><h2>${data.title}</h2>${data.body.map((text) => `<p>${text}</p>`).join('')}</div><div class="benefit-metrics">${cards}</div>`;
    intro.insertAdjacentElement('afterend', benefits);
  }

  function addProductResources(city) {
    if (document.querySelector('.product-links')) return;
    const data = contentFor(city).products;
    const anchor = document.querySelector('.value-grid')?.closest('.section') || document.querySelector('.homeowner-benefits') || intro;
    if (!anchor) return;
    const resources = document.createElement('section');
    resources.className = 'section product-links';
    resources.innerHTML = `<div><p class="eyebrow">${data.eyebrow}</p><h2>${data.title}</h2>${data.body.map((text) => `<p>${text}</p>`).join('')}</div><ul class="resource-list" aria-label="Helpful exterior product resources"><li><a href="https://www.jameshardie.com/" target="_blank" rel="noopener">James Hardie fiber cement siding information</a></li><li><a href="https://vaproshield.com/" target="_blank" rel="noopener">VaproShield weather-resistive barrier and rainscreen resources</a></li><li><a href="https://www.energystar.gov/products/windows_doors_skylights" target="_blank" rel="noopener">ENERGY STAR window and exterior efficiency guidance</a></li></ul>`;
    anchor.insertAdjacentElement('afterend', resources);
  }

  function addProcess(city) {
    if (document.querySelector('.process')) return;
    const data = contentFor(city);
    const anchor = document.querySelector('.area-copy') || document.querySelector('.product-links') || document.querySelector('.value-grid')?.closest('.section') || document.querySelector('.photo-band');
    if (!anchor) return;
    const process = document.createElement('section');
    process.className = 'section process';
    process.innerHTML = `<div class="section-heading"><p class="eyebrow">Process</p><h2>${data.processTitle}</h2></div><ol class="steps"><li><strong>Share the basics.</strong> Tell us the location, project type, timing, and visible concerns.</li><li><strong>Walk the exterior.</strong> We review siding, trim, windows, penetrations, and weather exposure.</li><li><strong>Confirm the scope.</strong> You get practical recommendations for siding, repairs, and related exterior work.</li><li><strong>Build with care.</strong> Our crew installs the approved scope and leaves the property ready for the final walkthrough.</li></ol>`;
    anchor.insertAdjacentElement('afterend', process);
  }

  if (!mounts.length) return;

  mounts.forEach((mount) => {
    const city = mount.dataset.city || 'Seattle';
    const heading = mount.dataset.heading || 'Start with a smarter exterior estimate.';
    const copy = mount.dataset.copy || 'Tell us what is happening with the home and the form will organize the details Breeze Siding needs for a useful first call.';

    lockTopOrder(mount);
    removeRepeatedProjectImages();
    addBenefits(city);
    addProductResources(city);
    addProcess(city);

    mount.innerHTML = `<section class="estimate" id="estimate"><div class="estimate-shell"><div class="estimate-heading"><p class="eyebrow">Free estimate</p><h2>${heading}</h2><p>${copy}</p></div><form class="estimate-form" id="estimate-lead-form" method="POST"><input class="form-honey" type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true"><div class="smart-estimate wide" aria-label="Project type helper"><div class="assistant-options" role="group" aria-label="Choose a project type"><button type="button" class="assistant-option is-active" data-project="Siding replacement">Siding</button><button type="button" class="assistant-option" data-project="Window replacement / installation">Windows</button><button type="button" class="assistant-option" data-project="Exterior painting">Paint</button><button type="button" class="assistant-option" data-project="Deck building">Deck</button><button type="button" class="assistant-option" data-project="Commercial / multifamily">Commercial</button><button type="button" class="assistant-option" data-project="Not sure yet">Not sure</button></div><div class="assistant-panel" id="assistant-panel" aria-live="polite" hidden><span class="assistant-kicker">Recommended details</span><strong id="assistant-title">Siding replacement</strong><p id="assistant-copy">Helpful details: existing siding type, damaged areas, number of sides, photos of problem spots, and whether windows or paint should be included.</p><ul class="assistant-list" id="assistant-list"><li>Attach or mention exterior photos if available.</li><li>Share your city and ideal timing.</li><li>Note leaks, soft trim, or areas with weather damage.</li></ul></div></div><label>Name<input name="name" autocomplete="name" required></label><label>Phone (optional)<input name="phone" autocomplete="tel"></label><label>Email<input type="email" name="email" autocomplete="email" required></label><label>City (optional)<input name="city" autocomplete="address-level2" placeholder="${city}"></label><label>Project type<select name="project" required><option value="" selected disabled>Choose project type</option><option>Siding replacement</option><option>Siding installation / new construction</option><option>Window replacement / installation</option><option>Exterior painting</option><option>Deck building</option><option>Commercial / multifamily</option><option>Not sure yet</option></select></label><label>Timeline (optional)<select name="timeline"><option value="">Choose timeline</option><option>As soon as possible</option><option>Within 1-3 months</option><option>Planning ahead</option><option>Just comparing options</option></select></label><label class="wide">Project notes (optional)<textarea name="message" rows="5" placeholder="Tell us about the home, siding condition, photos you can provide, or what you want changed."></textarea></label><div class="estimate-actions wide"><button class="button primary" type="submit">Request Free Estimate</button><a class="button secondary" href="tel:12532280531">Call 253-228-0531</a></div><p class="form-status wide" id="estimate-form-status" aria-live="polite"></p></form></div></section>`;
  });
})();