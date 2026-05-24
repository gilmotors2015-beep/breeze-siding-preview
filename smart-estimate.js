(() => {
  const style = document.createElement("style");
  style.textContent = `
    .estimate {
      display: block;
      padding: clamp(54px, 8vw, 110px) clamp(18px, 5vw, 72px);
      content-visibility: auto;
      contain-intrinsic-size: 760px;
      background:
        linear-gradient(rgba(244, 248, 251, 0.94), rgba(244, 248, 251, 0.94)),
        url("assets/images/cedar-siding.jpg") center / cover;
    }

    .estimate-shell {
      display: grid;
      grid-template-columns: minmax(260px, 0.58fr) minmax(0, 1fr);
      gap: clamp(22px, 4vw, 44px);
      align-items: start;
      max-width: 1180px;
      margin: 0 auto;
      padding: clamp(22px, 4vw, 42px);
      border: 2px solid #9db8d8;
      border-radius: 8px;
      background:
        linear-gradient(var(--white), var(--white)) padding-box,
        linear-gradient(135deg, #1264d8, #9db8d8 52%, #e3edf8) border-box;
      box-shadow: 0 24px 60px rgba(16, 42, 73, 0.15);
    }

    .estimate-heading {
      position: sticky;
      top: 96px;
      display: grid;
      gap: 14px;
    }

    .estimate-heading p:not(.eyebrow) {
      color: var(--muted);
      font-size: 1.08rem;
    }

    .smart-estimate {
      display: grid;
      gap: 16px;
      padding: 18px;
      border: 1px solid #bdd0e6;
      border-radius: 8px;
      background:
        linear-gradient(var(--white), var(--white)) padding-box,
        linear-gradient(135deg, rgba(18, 100, 216, 0.42), rgba(75, 139, 205, 0.1)) border-box;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.92), 0 14px 32px rgba(16, 42, 73, 0.08);
    }

    .assistant-options {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .assistant-option {
      flex: 1 1 112px;
      min-height: 46px;
      min-width: max-content;
      padding: 9px 14px;
      border: 1px solid #c7d6e8;
      border-radius: 6px;
      color: var(--ink);
      font: inherit;
      font-weight: 900;
      background: var(--white);
      cursor: pointer;
    }

    .assistant-option:hover,
    .assistant-option.is-active {
      color: var(--white);
      border-color: var(--blue);
      background: var(--blue);
    }

    .assistant-panel {
      display: grid;
      gap: 9px;
      padding: 18px;
      border: 1px solid #c7d6e8;
      border-radius: 8px;
      background: var(--white);
    }

    .assistant-panel[hidden] {
      display: none;
    }

    .assistant-kicker {
      color: var(--blue);
      font-size: 0.76rem;
      font-weight: 900;
      letter-spacing: 0;
      text-transform: uppercase;
    }

    .assistant-panel strong {
      color: var(--ink);
      font-size: 1.18rem;
    }

    .assistant-panel p {
      margin: 0;
      color: var(--muted);
    }

    .assistant-list {
      display: grid;
      gap: 7px;
      margin: 0;
      padding-left: 18px;
      color: var(--muted);
    }

    .estimate .estimate-form {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      padding: 0;
      border: 0;
      box-shadow: none;
      background: transparent;
    }

    .form-honey {
      display: none;
    }

    .estimate-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
    }

    @media (max-width: 980px) {
      .estimate-shell {
        grid-template-columns: 1fr;
      }

      .estimate-heading {
        position: static;
      }
    }

    @media (max-width: 640px) {
      .estimate {
        padding: 48px 18px;
      }

      .estimate .estimate-form {
        grid-template-columns: 1fr;
      }

      .assistant-option {
        min-width: 0;
      }
    }
  `;
  document.head.appendChild(style);

  const form = document.querySelector("#estimate-lead-form");
  const panel = document.querySelector("#assistant-panel");
  const title = document.querySelector("#assistant-title");
  const copy = document.querySelector("#assistant-copy");
  const list = document.querySelector("#assistant-list");
  const buttons = [...document.querySelectorAll(".assistant-option")];

  if (!form || !panel || !title || !copy || !list || buttons.length === 0) {
    return;
  }

  const projectSelect = form.elements.project;
  const notes = form.elements.message;

  const projectGuides = {
    "Siding replacement": {
      title: "Siding replacement",
      copy: "Helpful details: existing siding type, damaged areas, number of sides, photos of problem spots, and whether windows or paint should be included.",
      items: [
        "Mention if you see soft trim, bubbling paint, leaks, or loose boards.",
        "Share whether you want James Hardie, cedar, lap siding, or panel siding.",
        "Photos of each side of the home are especially useful."
      ],
      prompt: "Siding project: existing siding type, damaged areas, number of sides, and any window, trim, or paint work to include."
    },
    "Window replacement / installation": {
      title: "Window replacement",
      copy: "Helpful details: how many windows, whether siding or trim is being touched, and any leaking, drafts, or rot around the openings.",
      items: [
        "Count the windows if you can.",
        "Note whether this is part of a siding project.",
        "Photos from outside help show trim and flashing conditions."
      ],
      prompt: "Window project: number of windows, trim condition, leaks or drafts, and whether siding should be included."
    },
    "Exterior painting": {
      title: "Exterior painting",
      copy: "Helpful details: current siding material, peeling areas, trim condition, color goals, and whether repairs are needed first.",
      items: [
        "Mention peeling, bare wood, or chalky paint.",
        "Share whether trim, fascia, or doors are included.",
        "Photos help confirm prep and access needs."
      ],
      prompt: "Paint project: siding material, peeling areas, trim or fascia needs, color goals, and any repairs needed before paint."
    },
    "Deck building": {
      title: "Deck or patio exterior work",
      copy: "Helpful details: new build or replacement, approximate size, stairs or railing, material preference, and whether it connects to siding work.",
      items: [
        "Mention the approximate deck or patio size.",
        "Include railings, stairs, cover, or repair needs.",
        "Photos of the attachment area help with planning."
      ],
      prompt: "Deck project: new or replacement, approximate size, railing or stairs, preferred material, and any siding connection details."
    },
    "Commercial / multifamily": {
      title: "Commercial or multifamily exterior",
      copy: "Helpful details: project type, bid timeline, siding system, panel or lap siding needs, rainscreen details, and whether plans are available.",
      items: [
        "Mention multifamily, commercial, HOA, or new construction.",
        "Note Hardie panel, lap siding, VaproShield, rainscreen, or trim scope.",
        "Share bid dates, plans, or site photos if available."
      ],
      prompt: "Commercial or multifamily project: building type, siding system, bid timeline, plans available, and panel, lap, rainscreen, or trim scope."
    },
    "Not sure yet": {
      title: "Not sure yet",
      copy: "No problem. A few photos and a short description are enough to start the conversation.",
      items: [
        "Describe what looks worn, damaged, or outdated.",
        "Share your city and whether timing is urgent.",
        "Mention if you want siding, windows, paint, deck work, or a combination."
      ],
      prompt: "Not sure yet: describe what looks worn or damaged, your city, ideal timeline, and any photos you can provide."
    }
  };

  function setProject(project, reveal = true) {
    const guide = projectGuides[project] || projectGuides["Not sure yet"];
    title.textContent = guide.title;
    copy.textContent = guide.copy;
    list.innerHTML = guide.items.map((item) => `<li>${item}</li>`).join("");

    if (reveal) {
      panel.hidden = false;
    }

    if (projectSelect) {
      projectSelect.value = project;
    }

    if (reveal && notes && (!notes.value || Object.values(projectGuides).some((item) => item.prompt === notes.value))) {
      notes.value = guide.prompt;
    }

    buttons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.project === project);
    });
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => setProject(button.dataset.project));
  });

  if (projectSelect) {
    projectSelect.addEventListener("change", () => setProject(projectSelect.value));
  }

  setProject("Siding replacement", false);
})();
