document.querySelectorAll('form[action^="https://formsubmit.co/"]').forEach((form) => {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton ? submitButton.textContent : '';
    const nextPage = form.querySelector('input[name="_next"]')?.value || 'thank-you-feedback.html';
    const endpoint = form.action.replace('https://formsubmit.co/', 'https://formsubmit.co/ajax/');

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Form submission failed');
      }

      window.location.href = nextPage;
    } catch (error) {
      alert('The form did not send. Please call 253-228-0531 or email service@breezesiding.com.');
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    }
  });
});
