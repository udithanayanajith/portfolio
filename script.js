const menuButton = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const themeButton = document.querySelector('.theme-toggle');

const businessCardLauncher = document.querySelector('.business-card-launcher');
const businessCardDialog = document.querySelector('#business-card-dialog');
const businessCardClose = document.querySelector('.business-card-close');

businessCardLauncher?.addEventListener('click', () => businessCardDialog?.showModal());
businessCardClose?.addEventListener('click', () => businessCardDialog?.close());
businessCardDialog?.addEventListener('click', event => {
  if (event.target === businessCardDialog) businessCardDialog.close();
});

try {
  if (localStorage.getItem('uditha-theme') === 'light') document.documentElement.dataset.theme = 'light';
} catch {}

themeButton?.addEventListener('click', () => {
  const light = document.documentElement.dataset.theme !== 'light';
  if (light) document.documentElement.dataset.theme = 'light';
  else delete document.documentElement.dataset.theme;
  themeButton.setAttribute('aria-pressed', String(light));
  themeButton.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
  try { localStorage.setItem('uditha-theme', light ? 'light' : 'dark'); } catch {}
});

menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  mobileMenu?.classList.toggle('open', open);
  mobileMenu?.setAttribute('aria-hidden', String(!open));
  document.body.classList.toggle('menu-open', open);
});

mobileMenu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menuButton?.setAttribute('aria-expanded', 'false');
  menuButton?.setAttribute('aria-label', 'Open menu');
  mobileMenu.classList.remove('open');
  mobileMenu.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('menu-open');
}));

document.querySelector('#year').textContent = new Date().getFullYear();
document.documentElement.classList.add('motion-ready');

if (matchMedia('(hover: hover) and (pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('.project-card').forEach(card => {
    const visual = card.querySelector('.project-visual');
    card.addEventListener('pointermove', event => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      visual.style.setProperty('--tilt-x', `${-y * 5}deg`);
      visual.style.setProperty('--tilt-y', `${x * 5}deg`);
    });
    card.addEventListener('pointerleave', () => {
      visual.style.removeProperty('--tilt-x');
      visual.style.removeProperty('--tilt-y');
    });
  });
}

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const signalTrack = document.querySelector('.signal-inner');
const signalGroups = signalTrack ? [...signalTrack.querySelectorAll('.signal-group')] : [];
if (signalTrack && signalGroups.length === 2) {
  const signalItems = [...signalGroups[0].children].map(item => item.cloneNode(true));
  let signalResizeTimer;

  function fitSignalLoop() {
    signalGroups.forEach((group, groupIndex) => {
      group.replaceChildren();
      const appendSet = decorative => signalItems.forEach(item => {
        const copy = item.cloneNode(true);
        if (decorative || groupIndex === 1) copy.setAttribute('aria-hidden', 'true');
        group.append(copy);
      });

      appendSet(false);
      while (group.scrollWidth < window.innerWidth + 80) appendSet(true);
    });

    const groupWidth = signalGroups[0].scrollWidth;
    signalTrack.style.setProperty('--signal-duration', `${Math.max(24, groupWidth / 48)}s`);
  }

  fitSignalLoop();
  window.addEventListener('resize', () => {
    clearTimeout(signalResizeTimer);
    signalResizeTimer = setTimeout(fitSignalLoop, 100);
  }, { passive: true });
}

const marquee = document.querySelector('.marquee');
const marqueeSkills = marquee ? [...marquee.querySelectorAll('.track span')] : [];
if (marquee && marqueeSkills.length) {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let highlightFrame = 0;

  function highlightCenteredSkill() {
    const marqueeBounds = marquee.getBoundingClientRect();
    const centerX = marqueeBounds.left + marqueeBounds.width / 2;
    let centeredSkill = null;
    let nearestDistance = Infinity;

    marqueeSkills.forEach(skill => {
      const bounds = skill.getBoundingClientRect();
      const distance = Math.abs(bounds.left + bounds.width / 2 - centerX);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        centeredSkill = skill;
      }
    });

    marqueeSkills.forEach(skill => skill.classList.toggle('is-centered', skill === centeredSkill));
  }

  if (reducedMotion) {
    highlightCenteredSkill();
  } else {
    const followMarquee = () => {
      highlightCenteredSkill();
      highlightFrame = requestAnimationFrame(followMarquee);
    };
    const marqueeVisibility = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        cancelAnimationFrame(highlightFrame);
        highlightFrame = requestAnimationFrame(followMarquee);
      } else {
        cancelAnimationFrame(highlightFrame);
      }
    });
    marqueeVisibility.observe(marquee);
  }
}

const languageColors = { TypeScript: '#5b9bd5', JavaScript: '#e2c94c', Python: '#80a76b', Java: '#de8868', HTML: '#df765b', CSS: '#8b82c6' };
const list = document.querySelector('#repo-list');
const count = document.querySelector('#github-count');
const updated = document.querySelector('#github-updated');
const featuredRepositories = [
  { name: 'AI Video Interview Evaluator', slug: 'ai-video-interview-evaluator' },
  { name: 'CoffeeBeanAI', slug: 'CoffeeBeanAI' },
  { name: 'NetsEra', slug: 'NetsEra' },
  { name: 'Human Action', slug: 'human-action' }
];

async function loadRepositories() {
  try {
    const response = await fetch('https://api.github.com/users/udithanayanajith/repos?sort=updated&per_page=100&type=owner', { headers: { Accept: 'application/vnd.github+json' } });
    if (!response.ok) throw new Error('GitHub API is temporarily unavailable');
    const availableRepos = await response.json();
    const repos = featuredRepositories.map(featured => availableRepos.find(repo => repo.name.toLowerCase() === featured.slug.toLowerCase()) || {
      ...featured,
      html_url: `https://github.com/udithanayanajith/${featured.slug}`,
      description: 'GitHub repository',
      language: '',
      stargazers_count: 0,
      forks_count: 0
    });
    count.textContent = `${repos.length} FEATURED`;
    updated.textContent = '/ @UDITHANAYANAJITH';
    if (!repos.length) {
      list.innerHTML = '<p class="repo-empty">No public projects are available to display yet. Visit GitHub to browse the profile.</p>';
      return;
    }
    list.innerHTML = repos.map(repo => `<a class="repo-item" href="${repo.html_url}" target="_blank" rel="noreferrer"><div><div class="repo-name">${escapeHTML(repo.name)}</div><div class="repo-desc">${escapeHTML(repo.description || 'A public project by Uditha Nayanajith.')}</div><div class="repo-meta"><span>${repo.language ? `<i class="repo-language" style="background:${languageColors[repo.language] || '#c6e780'}"></i>${escapeHTML(repo.language)}` : 'PROJECT'}</span><span>★ ${repo.stargazers_count}</span><span>⑂ ${repo.forks_count}</span></div></div><span class="repo-arrow">↗</span></a>`).join('');
  } catch {
    count.textContent = `${featuredRepositories.length} FEATURED`;
    updated.textContent = '/ @UDITHANAYANAJITH';
    list.innerHTML = featuredRepositories.map(repo => '<a class="repo-item" href="https://github.com/udithanayanajith/' + repo.slug + '" target="_blank" rel="noreferrer"><div><div class="repo-name">' + escapeHTML(repo.name) + '</div></div><span class="repo-arrow">↗</span></a>').join('');
  }
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

loadRepositories();

// Subtle moving particle network from the reference portfolio background.
const networkCanvas = document.querySelector('#background-network');
const networkContext = networkCanvas?.getContext('2d');
if (networkCanvas && networkContext) {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const networkMouse = { x: -999, y: -999 };
  let networkWidth = 0;
  let networkHeight = 0;
  let networkPoints = [];
  const connectionDistance = 145;

  function resizeNetwork() {
    networkWidth = networkCanvas.width = window.innerWidth;
    networkHeight = networkCanvas.height = window.innerHeight;
    const pointCount = Math.min(90, Math.floor(networkWidth * networkHeight / 16000));
    networkPoints = Array.from({ length: pointCount }, () => ({
      x: Math.random() * networkWidth,
      y: Math.random() * networkHeight,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18
    }));
  }

  window.addEventListener('resize', resizeNetwork, { passive: true });
  window.addEventListener('pointermove', event => {
    networkMouse.x = event.clientX;
    networkMouse.y = event.clientY;
    const glow = document.querySelector('#background-glow');
    if (glow) {
      glow.style.left = `${event.clientX}px`;
      glow.style.top = `${event.clientY}px`;
    }
  }, { passive: true });
  resizeNetwork();

  function drawNetwork() {
    networkContext.clearRect(0, 0, networkWidth, networkHeight);
    for (let index = 0; index < networkPoints.length; index += 1) {
      const point = networkPoints[index];
      if (!reducedMotion) {
        point.x += point.vx;
        point.y += point.vy;
      }
      if (point.x < 0 || point.x > networkWidth) point.vx *= -1;
      if (point.y < 0 || point.y > networkHeight) point.vy *= -1;

      networkContext.beginPath();
      networkContext.arc(point.x, point.y, 2.1, 0, Math.PI * 2);
      networkContext.shadowColor = 'rgba(88,230,255,.9)';
      networkContext.shadowBlur = 9;
      networkContext.fillStyle = 'rgba(88,230,255,.96)';
      networkContext.fill();
      networkContext.shadowBlur = 0;

      for (let otherIndex = index + 1; otherIndex < networkPoints.length; otherIndex += 1) {
        const other = networkPoints[otherIndex];
        const dx = other.x - point.x;
        const dy = other.y - point.y;
        const distance = Math.hypot(dx, dy);
        if (distance >= connectionDistance) continue;

        const fade = 1 - distance / connectionDistance;
        networkContext.strokeStyle = `rgba(167,139,250,${0.3 * fade})`;
        networkContext.lineWidth = 1;
        networkContext.beginPath();
        networkContext.moveTo(point.x, point.y);
        networkContext.lineTo(other.x, other.y);
        networkContext.stroke();

        if (!reducedMotion && (index * 19 + otherIndex * 31) % 13 === 0) {
          const phase = (performance.now() / 1000 + ((index * 7 + otherIndex * 11) % 23) / 23 * 7.5) % 7.5;
          if (phase < 1.15) {
            const rawProgress = phase / 1.15;
            const progress = rawProgress * rawProgress * (3 - 2 * rawProgress);
            const tipX = point.x + dx * progress;
            const tipY = point.y + dy * progress;
            const alpha = 0.96 * fade * (1 - rawProgress * 0.22);
            networkContext.strokeStyle = `rgba(88,230,255,${alpha})`;
            networkContext.lineWidth = 1.65;
            networkContext.beginPath();
            networkContext.moveTo(point.x, point.y);
            networkContext.lineTo(tipX, tipY);
            networkContext.stroke();
            networkContext.beginPath();
            networkContext.arc(tipX, tipY, 2.1, 0, Math.PI * 2);
            networkContext.fillStyle = `rgba(210,250,255,${alpha})`;
            networkContext.fill();
          }
        }
      }

      const mouseDistance = Math.hypot(point.x - networkMouse.x, point.y - networkMouse.y);
      if (!reducedMotion && mouseDistance < 170) {
        networkContext.strokeStyle = `rgba(88,230,255,${0.65 * (1 - mouseDistance / 170)})`;
        networkContext.lineWidth = 1.15;
        networkContext.beginPath();
        networkContext.moveTo(point.x, point.y);
        networkContext.lineTo(networkMouse.x, networkMouse.y);
        networkContext.stroke();
      }
    }
    requestAnimationFrame(drawNetwork);
  }

  requestAnimationFrame(drawNetwork);
}
