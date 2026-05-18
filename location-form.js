(() => {
  const mounts = document.querySelectorAll('[data-estimate-form]');
  const intro = document.querySelector('.landing-intro');
  const approvedImages = [
    { src: '/assets/images/hmx0xllvnpridzeogaix.jpeg', alt: 'Finished siding exterior with crisp window and trim details', caption: 'Finished exterior details should look tidy and protect vulnerable openings.' },
    { src: '/assets/images/Untitled%20design.jpg', alt: 'Crisp trim and shingle siding detail on a high-end exterior', caption: 'Crisp trim and balanced siding profiles for a refined exterior.' },
    { src: '/assets/images/Breeze%20Siding_-17.jpeg', alt: 'Updated residential exterior with clean siding and dark trim', caption: 'Clean siding and dark trim for a sharper street-facing finish.' },
    { src: '/assets/images/ht4uwffxakqccg7ihv6a.jpeg', alt: 'Warm cedar siding and large windows on a custom home', caption: 'Warm siding tones paired with large black window details.' },
    { src: '/assets/images/paint.jpg', alt: 'Exterior painting and siding finish detail', caption: 'Paint and siding details should work together for a durable finish.' },
    { src: '/assets/images/project-modern.jpg', alt: 'Modern Hardie panel siding detail', caption: 'Hardie panel accents can modernize the exterior without making it feel busy.' },
    { src: '/assets/images/residential-covered-entry-siding-wood-accent.webp', alt: 'Covered entry with white siding and warm wood accent', caption: 'Covered entries and transitions deserve careful siding and trim planning.' },
    { src: '/assets/images/t9vynx7bpr928viscvwl.jpeg', alt: 'Residential lap siding and trim detail on a multi-story home', caption: 'Lap siding and trim details should align cleanly across the exterior.' },
    { src: '/assets/images/wf2yhzrrt6kac8qrdxvt.jpeg', alt: 'Modern exterior with panel siding and wood accent siding', caption: 'Warm accent siding paired with modern panel detailing.' }
  ];

  const profiles = {
    Seattle: {
      region: 'Seattle', nearby: ['Ballard', 'West Seattle', 'Queen Anne', 'Magnolia', 'Capitol Hill', 'Green Lake', 'Wallingford', 'Phinney Ridge'], exposure: 'shade, mature trees, older trim details, and long wet seasons', value: 'protect older wall assemblies while keeping the exterior appropriate for the neighborhood', tone: 'city home', links: ['/seattle-siding-costs.html', '/siding-window-flashing-details.html']
    },
    Tacoma: {
      region: 'South Sound', nearby: ['North Tacoma', 'Proctor District', 'Old Town', 'Central Tacoma', 'South Tacoma', 'Fircrest', 'University Place'], exposure: 'older home details, porch transitions, wind-driven rain, and mixed remodel history', value: 'respect Tacoma character while correcting the details that lead to rot and paint failure', tone: 'South Sound home', links: ['/siding-replacement-proctor-district.html', '/dry-rot-repair-seattle.html']
    },
    'Proctor District': {
      region: 'North Tacoma', nearby: ['Proctor', 'Old Town', 'Stadium District', 'Ruston', 'University Place', 'North End Tacoma'], exposure: 'older homes, porch details, mature trees, and visible street-facing elevations', value: 'preserve neighborhood character while adding better moisture protection and cleaner trim', tone: 'North Tacoma home', links: ['/tacoma-siding-replacement-contractor/', '/siding-replacement-university-place.html']
    },
    'University Place': {
      region: 'West Tacoma', nearby: ['University Place', 'Chambers Bay', 'Fircrest', 'Lakewood', 'West Tacoma', 'Steilacoom'], exposure: 'marine air, exposed elevations, bluff weather, and homes with larger window openings', value: 'tighten the exterior with siding, trim, and window details that hold up near the Sound', tone: 'University Place home', links: ['/tacoma-siding-replacement-contractor/', '/siding-replacement-lakewood.html']
    },
    Bellevue: {
      region: 'Eastside', nearby: ['West Bellevue', 'Somerset', 'Newport Hills', 'Bridle Trails', 'Lake Hills', 'Medina', 'Clyde Hill'], exposure: 'high-visibility architecture, large windows, remodel details, and wet Eastside weather', value: 'align premium curb appeal with durable siding and window transitions', tone: 'Eastside home', links: ['/top-rated-siding-replacement-contractor-in-bellevue-wa/', '/siding-replacement-medina.html']
    },
    'Clyde Hill': {
      region: 'Eastside', nearby: ['Clyde Hill', 'Medina', 'Yarrow Point', 'Hunts Point', 'West Bellevue', 'Bellevue'], exposure: 'premium architecture, clean reveal lines, large trim surfaces, and shaded wet walls', value: 'protect the home while keeping every visible detail refined and intentional', tone: 'Clyde Hill home', links: ['/siding-replacement-medina.html', '/top-rated-siding-replacement-contractor-in-bellevue-wa/']
    },
    Medina: {
      region: 'Eastside', nearby: ['Medina', 'Evergreen Point', 'Medina Heights', 'Hunts Point', 'Yarrow Point', 'Clyde Hill'], exposure: 'waterfront-area weather, custom architecture, large windows, and high finish expectations', value: 'coordinate materials, trim, paint, and flashing around the value of the property', tone: 'Medina home', links: ['/clyde-hill-siding-replacement-contractor/', '/siding-replacement-mercer-island.html']
    },
    'Mercer Island': {
      region: 'Eastside', nearby: ['North End', 'First Hill', 'East Seattle', 'Island Crest', 'South End', 'West Mercer'], exposure: 'lake-area moisture, hillside homes, shaded elevations, and complex window details', value: 'match the level of the property while improving protection behind the siding', tone: 'Mercer Island home', links: ['/siding-replacement-bellevue.html', '/siding-window-flashing-details.html']
    },
    Issaquah: {
      region: 'Eastside', nearby: ['Issaquah Highlands', 'Squak Mountain', 'Talus', 'South Lake Sammamish', 'Mirrormont', 'Preston'], exposure: 'tree cover, hillside drainage, shaded walls, and heavy seasonal rain', value: 'solve moisture-prone details while improving curb appeal on hillside and plateau homes', tone: 'Issaquah home', links: ['/siding-replacement-sammamish.html', '/house-wrap-siding-replacement.html']
    },
    Sammamish: {
      region: 'Eastside', nearby: ['Sahalee', 'Pine Lake', 'Klahanie', 'Beaver Lake', 'Inglewood', 'Trossachs'], exposure: 'larger homes, many roofline transitions, shaded sides, and wet plateau conditions', value: 'support long-term value with premium siding, trim, and clean material transitions', tone: 'Sammamish home', links: ['/siding-replacement-issaquah.html', '/hardie-board-vs-vinyl-seattle.html']
    },
    Newcastle: {
      region: 'Eastside', nearby: ['Newcastle', 'China Creek', 'Hazelwood', 'Olympus', 'Coal Creek', 'Newport Hills'], exposure: 'hillside lots, shaded walls, wooded areas, and modern remodel expectations', value: 'pair refined curb appeal with siding details that manage moisture and movement', tone: 'Newcastle home', links: ['/siding-replacement-bellevue.html', '/siding-replacement-renton.html']
    },
    Kirkland: {
      region: 'Eastside', nearby: ['Juanita', 'Houghton', 'Finn Hill', 'Bridle Trails', 'Totem Lake', 'Rose Hill'], exposure: 'lake-area weather, remodel additions, mature trees, and high-visibility elevations', value: 'modernize the exterior while improving the wall details that protect the home', tone: 'Kirkland home', links: ['/siding-replacement-redmond.html', '/window-installation.html']
    },
    Redmond: {
      region: 'Eastside', nearby: ['Education Hill', 'Overlake', 'Grass Lawn', 'Bear Creek', 'Downtown Redmond', 'Union Hill'], exposure: 'rain, shaded suburban lots, older trim packages, and energy-conscious remodels', value: 'balance durable materials, clean design, and long-term maintenance goals', tone: 'Redmond home', links: ['/siding-replacement-kirkland.html', '/insulation-under-siding.html']
    },
    Kent: {
      region: 'South King County', nearby: ['East Hill', 'West Hill', 'Lake Meridian', 'Panther Lake', 'Covington', 'Auburn'], exposure: 'wet winters, older siding, busy family homes, and lower-wall moisture', value: 'organize practical repairs and siding choices into a clear, durable exterior scope', tone: 'Kent home', links: ['/siding-replacement-renton.html', '/siding-replacement-auburn.html']
    },
    Renton: {
      region: 'South King County', nearby: ['Renton Highlands', 'Kennydale', 'Fairwood', 'Talbot Hill', 'Maplewood', 'Newcastle'], exposure: 'hillside lots, older siding, lake-area moisture, and remodel transitions', value: 'connect siding, trim, window, and repair details so the exterior feels complete', tone: 'Renton home', links: ['/siding-replacement-newcastle.html', '/siding-replacement-kent.html']
    },
    'Des Moines': {
      region: 'South King County', nearby: ['Des Moines', 'Redondo', 'North Hill', 'Woodmont', 'Saltwater State Park area', 'Federal Way'], exposure: 'marine air, wind, rain, and homes close to Puget Sound', value: 'use siding, trim, and flashing details that help the exterior handle coastal weather', tone: 'Des Moines home', links: ['/siding-replacement-federal-way.html', '/window-leak-repair-seattle.html']
    },
    Edgewood: {
      region: 'Pierce County', nearby: ['Edgewood', 'North Hill', 'Milton', 'Sumner', 'Puyallup', 'Federal Way'], exposure: 'open lots, wind-driven rain, rural edges, and older trim details', value: 'give the home a cleaner exterior while correcting moisture-prone siding areas', tone: 'Edgewood home', links: ['/puyallup-siding-replacement-contractor/', '/siding-replacement-federal-way.html']
    },
    Lakewood: {
      region: 'South Sound', nearby: ['Lakewood', 'Steilacoom', 'University Place', 'Tillicum', 'Oakbrook', 'Tacoma'], exposure: 'lake-area moisture, shaded lots, older siding, and military-area rental wear', value: 'create a durable exterior scope that improves curb appeal and reduces repeat repairs', tone: 'Lakewood home', links: ['/siding-replacement-university-place.html', '/tacoma-siding-replacement-contractor/']
    },
    Graham: {
      region: 'Pierce County', nearby: ['Graham', 'Frederickson', 'Spanaway', 'Puyallup', 'South Hill', 'Elk Plain'], exposure: 'larger lots, exposed elevations, rain, wind, and homes with practical maintenance needs', value: 'make the exterior easier to maintain while improving protection and appearance', tone: 'Graham home', links: ['/siding-replacement-spanaway.html', '/puyallup-siding-replacement-contractor/']
    },
    Puyallup: {
      region: 'Pierce County', nearby: ['South Hill', 'Downtown Puyallup', 'Edgewood', 'Sumner', 'Bonney Lake', 'Graham'], exposure: 'wind-driven rain, lower-wall moisture, deck connections, and high-sun exposures', value: 'refresh curb appeal while addressing the details that cause siding and trim problems', tone: 'Puyallup home', links: ['/puyallup-siding-replacement-contractor/', '/siding-replacement-graham.html']
    },
    'Federal Way': {
      region: 'South King County', nearby: ['Federal Way', 'Twin Lakes', 'Dash Point', 'Lakota', 'Redondo', 'Des Moines'], exposure: 'marine air, wooded lots, wet winters, and older exterior packages', value: 'replace failing siding with practical material choices and stronger weather details', tone: 'Federal Way home', links: ['/siding-replacement-des-moines.html', '/siding-replacement-auburn.html']
    },
    Auburn: {
      region: 'South King County', nearby: ['Auburn', 'Lea Hill', 'Lakeland Hills', 'Algona', 'Pacific', 'Kent'], exposure: 'valley moisture, mixed home ages, exposed walls, and busy family use', value: 'organize siding, trim, and repair work into a clear scope that improves the whole exterior', tone: 'Auburn home', links: ['/siding-replacement-kent.html', '/siding-replacement-puyallup.html']
    },
    Spanaway: {
      region: 'Pierce County', nearby: ['Spanaway', 'Frederickson', 'Parkland', 'Graham', 'Elk Plain', 'Puyallup'], exposure: 'wet winters, exposed siding, older trim, and practical repair needs', value: 'deliver a stronger, cleaner exterior for homeowners close to Breeze Siding’s home base', tone: 'Spanaway home', links: ['/siding-replacement-graham.html', '/puyallup-siding-replacement-contractor/']
    },
    'Gig Harbor': {
      region: 'South Sound', nearby: ['Gig Harbor', 'Artondale', 'Rosedale', 'Fox Island', 'Canterwood', 'Wollochet'], exposure: 'marine air, wooded lots, custom homes, and waterfront weather', value: 'combine premium curb appeal with moisture-conscious siding and trim details', tone: 'Gig Harbor home', links: ['/siding-replacement-university-place.html', '/commercial-siding.html']
    }
  };

  const fallbackProfile = profiles.Seattle;

  function normalizeImage(value) {
    return String(value || '').split('?')[0].replace(/^https?:\/\/[^/]+/, '').replace(/^url\(["']?|["']?\)$/g, '');
  }

  function getHeroImage() {
    const hero = document.querySelector('.local-hero');
    return normalizeImage(hero?.style.getPropertyValue('--hero-image'));
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
      const replacement = approvedImages.find((candidate) => !used.has(normalizeImage(candidate.src)));
      if (!replacement) return;
      img.src = replacement.src;
      img.alt = replacement.alt;
      const caption = figure.querySelector('figcaption');
      if (caption) caption.textContent = replacement.caption;
      used.add(normalizeImage(replacement.src));
    });
  }

  function profileFor(city) {
    return profiles[city] || fallbackProfile;
  }

  function addMeta(name, content) {
    if (!content || document.querySelector(`meta[name="${name}"]`)) return;
    const meta = document.createElement('meta');
    meta.name = name;
    meta.content = content;
    document.head.appendChild(meta);
  }

  function pageUrl() {
    const canonical = document.querySelector('link[rel="canonical"]');
    return canonical?.href || window.location.href.split('#')[0];
  }

  function addLocationStructuredData(city) {
    if (document.getElementById('breeze-location-schema')) return;
    const profile = profileFor(city);
    const title = document.querySelector('h1')?.textContent?.trim() || `${city} siding replacement`;
    const description = document.querySelector('meta[name="description"]')?.content || `Siding replacement, fiber cement siding, trim repair, and exterior renovation services in ${city}, WA.`;
    const url = pageUrl();
    const areaServed = [city, ...profile.nearby].filter(Boolean).map((name) => ({ '@type': 'Place', name: `${name}, WA` }));

    addMeta('geo.region', 'US-WA');
    addMeta('geo.placename', `${city}, Washington`);
    addMeta('service-area', [city, ...profile.nearby].join(', '));

    const schema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'HomeAndConstructionBusiness',
          '@id': 'https://breezesiding.com/#business',
          name: 'Breeze Siding LLC',
          url: 'https://breezesiding.com/',
          telephone: '+1-253-228-0531',
          email: 'service@breezesiding.com',
          image: 'https://breezesiding.com/assets/images/04-30-26%20Breeze%20Siding.png',
          address: { '@type': 'PostalAddress', addressLocality: 'Spanaway', addressRegion: 'WA', addressCountry: 'US' },
          areaServed
        },
        {
          '@type': 'Service',
          '@id': `${url}#service`,
          name: `${city} siding replacement and exterior renovation`,
          serviceType: ['Siding replacement', 'Fiber cement siding', 'James Hardie siding', 'Trim repair', 'Exterior painting', 'Window coordination'],
          provider: { '@id': 'https://breezesiding.com/#business' },
          areaServed,
          url,
          description
        },
        { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: title, description, about: { '@id': `${url}#service` }, mainEntity: { '@id': `${url}#service` } }
      ]
    };

    const faqItems = [...document.querySelectorAll('.local-faq details')].slice(0, 6).map((item) => {
      const question = item.querySelector('summary')?.textContent?.trim();
      const answer = item.querySelector('p')?.textContent?.trim();
      return question && answer ? { '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } } : null;
    }).filter(Boolean);

    if (faqItems.length) schema['@graph'].push({ '@type': 'FAQPage', '@id': `${url}#faq`, mainEntity: faqItems });

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'breeze-location-schema';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
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
    if (main.firstElementChild !== hero) main.insertBefore(hero, main.firstElementChild);
    if (hero.nextElementSibling !== trust) hero.insertAdjacentElement('afterend', trust);
    if (trust.nextElementSibling !== mount) trust.insertAdjacentElement('afterend', mount);
  }

  function addBenefits(city) {
    if (!intro || document.querySelector('.homeowner-benefits')) return;
    const profile = profileFor(city);
    const benefits = document.createElement('section');
    benefits.className = 'section homeowner-benefits';
    benefits.innerHTML = `<div class="benefit-copy"><p class="eyebrow">${city} homeowner value</p><h2>A better siding project should improve protection, appearance, and confidence.</h2><p>${city} homes deal with ${profile.exposure}. Breeze Siding plans siding replacement around those local realities so the work is not just a surface refresh.</p><p>The right scope can ${profile.value}. That means coordinating siding, trim, windows, paint, repair work, and weather details before the project starts.</p></div><div class="benefit-metrics"><article><strong>Curb appeal</strong><span>Fresh siding and crisp trim can make a ${profile.tone} look cleaner, newer, and better maintained.</span></article><article><strong>Moisture control</strong><span>Flashing, clearances, and window transitions help protect the wall assembly through Northwest weather.</span></article><article><strong>Material fit</strong><span>James Hardie, fiber cement, lap siding, panels, and warm accents are matched to the home and neighborhood.</span></article><article><strong>Scope clarity</strong><span>Visible damage, optional upgrades, and must-fix details are organized into a more useful estimate.</span></article></div>`;
    intro.insertAdjacentElement('afterend', benefits);
  }

  function addProductResources(city) {
    if (document.querySelector('.product-links')) return;
    const profile = profileFor(city);
    const anchor = document.querySelector('.value-grid')?.closest('.section') || document.querySelector('.homeowner-benefits') || intro;
    if (!anchor) return;
    const links = [...new Set(['/siding-materials-seattle.html', '/hardieplank-siding-cost-seattle.html', ...profile.links])].slice(0, 4);
    const resources = document.createElement('section');
    resources.className = 'section product-links';
    resources.innerHTML = `<div><p class="eyebrow">${city} product strategy</p><h2>Material choices should support the home, the climate, and the finish details.</h2><p>For ${city} homeowners, siding choice should connect with trim, windows, weather barrier, paint, and maintenance expectations. James Hardie and fiber cement are strong options when the installation details are planned correctly.</p><p>Breeze Siding also considers panel accents, warm wood-inspired details, lap siding profiles, and repair needs so the final exterior feels complete.</p></div><ul class="resource-list" aria-label="Helpful exterior product resources"><li><a href="https://www.jameshardie.com/" target="_blank" rel="noopener">James Hardie fiber cement siding information</a></li><li><a href="https://vaproshield.com/" target="_blank" rel="noopener">VaproShield weather barrier and rainscreen resources</a></li>${links.map((href) => `<li><a href="${href}">${href.replace(/^\//, '').replace(/\.html$/, '').replace(/-/g, ' ')}</a></li>`).join('')}</ul>`;
    anchor.insertAdjacentElement('afterend', resources);
  }

  function addProcess(city) {
    if (document.querySelector('.process')) return;
    const anchor = document.querySelector('.area-copy') || document.querySelector('.product-links') || document.querySelector('.value-grid')?.closest('.section') || document.querySelector('.photo-band');
    if (!anchor) return;
    const process = document.createElement('section');
    process.className = 'section process';
    process.innerHTML = `<div class="section-heading"><p class="eyebrow">Process</p><h2>A ${city} siding process built around condition, details, and clear decisions.</h2></div><ol class="steps"><li><strong>Share the basics.</strong> Tell us the location, project type, timing, and visible concerns.</li><li><strong>Walk the exterior.</strong> We review siding, trim, windows, penetrations, and weather exposure.</li><li><strong>Confirm the scope.</strong> You get practical recommendations for siding, repairs, and related exterior work.</li><li><strong>Build with care.</strong> Our crew installs the approved scope and leaves the property ready for the final walkthrough.</li></ol>`;
    anchor.insertAdjacentElement('afterend', process);
  }

  if (!mounts.length) return;

  mounts.forEach((mount) => {
    const city = mount.dataset.city || 'Seattle';
    const heading = mount.dataset.heading || 'Start with a smarter exterior estimate.';
    const copy = mount.dataset.copy || 'Tell us what is happening with the home and Breeze Siding will follow up for a useful first conversation.';

    lockTopOrder(mount);
    removeRepeatedProjectImages();
    addBenefits(city);
    addProductResources(city);
    addProcess(city);

    mount.innerHTML = `<section class="estimate" id="estimate"><div class="estimate-shell"><div class="estimate-heading"><p class="eyebrow">Free estimate</p><h2>${heading}</h2><p>${copy}</p></div><form class="estimate-form" id="estimate-lead-form" method="POST"><input class="form-honey" type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true"><div class="smart-estimate wide" aria-label="Project type helper"><div class="assistant-options" role="group" aria-label="Choose a project type"><button type="button" class="assistant-option is-active" data-project="Siding replacement">Siding</button><button type="button" class="assistant-option" data-project="Window replacement / installation">Windows</button><button type="button" class="assistant-option" data-project="Exterior painting">Paint</button><button type="button" class="assistant-option" data-project="Deck building">Deck</button><button type="button" class="assistant-option" data-project="Commercial / multifamily">Commercial</button><button type="button" class="assistant-option" data-project="Not sure yet">Not sure</button></div><div class="assistant-panel" id="assistant-panel" aria-live="polite" hidden><span class="assistant-kicker">Recommended details</span><strong id="assistant-title">Siding replacement</strong><p id="assistant-copy">Helpful details: existing siding type, damaged areas, number of sides, photos of problem spots, and whether windows or paint should be included.</p><ul class="assistant-list" id="assistant-list"><li>Attach or mention exterior photos if available.</li><li>Share your city and ideal timing.</li><li>Note leaks, soft trim, or areas with weather damage.</li></ul></div></div><label>Name<input name="name" autocomplete="name" required></label><label>Phone (optional)<input name="phone" autocomplete="tel"></label><label>Email<input type="email" name="email" autocomplete="email" required></label><label>City (optional)<input name="city" autocomplete="address-level2" placeholder="${city}"></label><label>Project type<select name="project" required><option value="" selected disabled>Choose project type</option><option>Siding replacement</option><option>Siding installation / new construction</option><option>Window replacement / installation</option><option>Exterior painting</option><option>Deck building</option><option>Commercial / multifamily</option><option>Not sure yet</option></select></label><label>Timeline (optional)<select name="timeline"><option value="">Choose timeline</option><option>As soon as possible</option><option>Within 1-3 months</option><option>Planning ahead</option><option>Just comparing options</option></select></label><label class="wide">Project notes (optional)<textarea name="message" rows="5" placeholder="Tell us about the home, siding condition, photos you can provide, or what you want changed."></textarea></label><div class="estimate-actions wide"><button class="button primary" type="submit">Request Free Estimate</button><a class="button secondary" href="tel:12532280531">Call 253-228-0531</a></div><p class="form-status wide" id="estimate-form-status" aria-live="polite"></p></form></div></section>`;

    addLocationStructuredData(city);
  });
})();
