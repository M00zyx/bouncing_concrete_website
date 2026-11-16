export function setupSignupStudy() {
  const requested = new URLSearchParams(location.search).get('signup');
  const option = requested || 'combined';
  if (!['seismic', 'notice', 'combined'].includes(option)) return;
  const section = document.querySelector('.mailing-list');
  section.classList.add('signup-study', `signup-${option}`);
  const closing = section.closest('.closing');
  if (option === 'combined') { section.classList.add('signup-notice'); closing.classList.add('closing-combined'); }
  const title = section.querySelector('h3');
  title.textContent = 'A track that will never be publicly released.';
  const trace = document.createElement('div');
  trace.className = 'signup-trace';
  trace.setAttribute('aria-hidden', 'true');
  trace.innerHTML = '<svg viewBox="0 0 520 52" preserveAspectRatio="none"><path class="trace-base" d="M0 27H520"/><path class="trace-signal" pathLength="1" d="M0 27H115l8 -3 7 6 6 -9 5 17 5 -29 5 36 5 -42 5 46 5 -33 6 20 6 -14 8 5H290l5 -7 5 14 5 -25 5 32 5 -37 5 40 5 -30 5 20 5 -12 7 6H520"/></svg>';
  section.querySelector('form').before(trace);
  const stamp = document.createElement('p');
  stamp.className = 'signup-stamp';
  stamp.textContent = 'Check your inbox';
  stamp.hidden = true;
  section.append(stamp);
  const controls = document.createElement('nav');
  controls.className = 'signup-comparison';
  controls.setAttribute('aria-label', 'Signup design comparison');
  controls.innerHTML = '<span>Signup study</span><a href="?signup=seismic#about">1 · Seismic</a><a href="?signup=notice#about">2 · Notice</a><a href="?#about">Original</a>';
  if (option !== 'combined') {
    controls.querySelector(`[href="?signup=${option}#about"]`).setAttribute('aria-current', 'page');
    controls.querySelector('a:last-child').href='?signup=original#about';
    document.body.append(controls);
  }
  const slab = closing.querySelector('.grounded-fragment');
  const slabImage = slab.querySelector('img');
  function joltSlab() {
    const running = slabImage.getAnimations().find(animation => animation.animationName === 'stone-impulse');
    if (running) { running.currentTime = 0; running.play(); }
    else slab.classList.add('slab-impact');
  }
  slabImage.addEventListener('animationend', event => {
    if (event.animationName === 'stone-impulse') slab.classList.remove('slab-impact');
  });
  // Observe the fixed figure box, so the animation never triggers itself.
  let slabArmed = true;
  if (option === 'combined') {
    new IntersectionObserver(entries => {
      for (const { intersectionRatio } of entries) {
        if (intersectionRatio <= .1) slabArmed = true;
        if (intersectionRatio >= .35 && slabArmed) {
          slabArmed = false;
          joltSlab();
        }
      }
    }, { threshold: [.1, .35] }).observe(slab);
  }
  function impact({ stone = true } = {}) {
    if (stone) joltSlab();
    closing.classList.add('signup-impact');
    setTimeout(() => { closing.classList.remove('signup-impact'); section.classList.add('is-settled'); }, 1100);
  }
  function pulse() {
    if (section.classList.contains('is-pulsing')) return;
    section.classList.add('is-pulsing');
    setTimeout(() => section.classList.remove('is-pulsing'), 1000);
  }
  section.addEventListener('pointerenter', pulse);
  section.addEventListener('focusin', pulse);
  // Keep the signup notice's entrance separate from the repeating slab impulse.
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) { if (option === 'combined') impact({ stone: false }); else pulse(); observer.disconnect(); }
  }, { threshold: .5 });
  observer.observe(section);
  // Local-only design previews never submit data or claim a real subscription.
  const previewState = ['localhost', '127.0.0.1'].includes(location.hostname)
    ? new URLSearchParams(location.search).get('signup-state') : null;
  if (['active', 'sending', 'confirmed', 'error', 'motion'].includes(previewState)) {
    const form = section.querySelector('form');
    form.removeAttribute('data-sv-form');
    form.removeAttribute('action');
    form.addEventListener('submit', event => event.preventDefault());
    section.classList.add('is-settled', 'state-preview');
    const label = document.createElement('p');
    label.className = 'signup-preview-label';
    label.textContent = `Design preview: ${previewState} — no subscription submitted`;
    section.prepend(label);
    const input = section.querySelector('input');
    input.value = 'you@example.com';
    if (previewState === 'active') section.classList.add('preview-active');
    if (previewState === 'sending') {
      section.querySelector('button').setAttribute('data-active', 'true');
      section.querySelector('button').disabled = true;
      input.disabled = true;
    }
    if (previewState === 'confirmed') {
      section.querySelector('[data-element="fields"]').hidden = true;
      const success = document.createElement('div');
      success.className = 'formkit-alert-success';
      section.querySelector('[data-element="fields"]').after(success);
    }
    if (previewState === 'error') {
      section.querySelector('[data-element="errors"]').textContent = 'Something went wrong. Please try again.';
    }
  }
  // Kit owns submission. Decorate only a genuine provider success message.
  const showConfirmation = () => {
    const success = section.querySelector('.formkit-alert-success');
    if (success) {
      successObserver.disconnect();
      section.classList.add('is-confirmed');
      if (option === 'notice' || option === 'combined') {
        stamp.hidden = false;
        success.replaceChildren(stamp);
        const detail = document.createElement('p');
        detail.textContent = 'Confirm your subscription using the link in your email.';
        success.append(detail);
        success.setAttribute('role', 'status');
      }
      if (option === 'combined') impact();
      pulse();
    }
  };
  const successObserver = new MutationObserver(showConfirmation);
  successObserver.observe(section, {childList:true, subtree:true});
  if (previewState === 'confirmed') showConfirmation();
  if (previewState === 'motion') {
    document.body.classList.add('signup-motion-page');
    const replay = document.createElement('button');
    replay.className = 'motion-replay';
    replay.textContent = 'Play motion preview';
    document.body.append(replay);
    replay.addEventListener('click', () => {
      replay.hidden = true;
      const label = section.querySelector('.signup-preview-label');
      label.textContent = 'Motion preview — no subscription submitted';
      impact();
      setTimeout(() => {section.classList.add('preview-active'); pulse();}, 2000);
      setTimeout(() => {
        section.classList.remove('preview-active');
        section.querySelector('button').setAttribute('data-active', 'true');
      }, 3800);
      setTimeout(() => {
        const fields = section.querySelector('[data-element="fields"]');
        fields.hidden = true;
        const success = document.createElement('div');
        success.className = 'formkit-alert-success';
        fields.after(success);
      }, 5400);
    }, {once:true});
  }
}
