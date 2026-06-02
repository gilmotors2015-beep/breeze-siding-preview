(() => {
  const styleId = 'spam-review-lane-style';

  function injectStyle() {
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .pipeline-column.stage-spam-review {
        border-color: rgba(180, 35, 24, 0.32);
        background: #fff7f6;
      }

      .pipeline-column.stage-spam-review h3 span {
        background: var(--danger, #b42318);
      }

      .pipeline-column.stage-spam-review .lead-card-button {
        border-color: rgba(180, 35, 24, 0.22);
      }

      .pipeline-column.stage-spam-review .pipeline-empty {
        border-color: rgba(180, 35, 24, 0.24);
        background: rgba(255, 255, 255, 0.76);
      }
    `;
    document.head.append(style);
  }

  function labelMetric() {
    const spamMetric = document.querySelector('#metric-spam')?.closest('article')?.querySelector('span');
    if (spamMetric && spamMetric.textContent.trim() !== 'Spam review') {
      spamMetric.textContent = 'Spam review';
    }
  }

  function labelFilter() {
    const option = document.querySelector('#stage-filter option[value="spam"]');
    if (option && option.textContent.trim() !== 'Spam Review') {
      option.textContent = 'Spam Review';
    }
  }

  function labelPipeline() {
    document.querySelectorAll('.pipeline-column').forEach((column) => {
      const heading = column.querySelector('h3');
      if (!heading) return;
      const count = heading.querySelector('span');
      const labelText = heading.textContent.replace(count?.textContent || '', '').trim();
      if (labelText !== 'Spam' && labelText !== 'Spam Review') return;

      column.classList.add('stage-spam-review');
      const labelNode = Array.from(heading.childNodes).find((node) => node.nodeType === Node.TEXT_NODE);
      if (labelNode) {
        labelNode.textContent = 'Spam Review';
      } else {
        heading.insertBefore(document.createTextNode('Spam Review'), count || null);
      }

      const empty = column.querySelector('.pipeline-empty');
      if (empty && /No spam/i.test(empty.textContent)) {
        empty.textContent = 'Suspicious submissions will collect here for a quick check.';
      }
    });
  }

  function polish() {
    injectStyle();
    labelMetric();
    labelFilter();
    labelPipeline();
  }

  polish();
  window.addEventListener('breeze-private-leads', () => window.setTimeout(polish, 0));
  window.addEventListener('breeze-private-logout', () => window.setTimeout(polish, 0));

  const board = document.querySelector('#pipeline-board');
  if (board) {
    new MutationObserver(polish).observe(board, { childList: true, subtree: true });
  }
})();
