(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  $('#year').textContent = new Date().getFullYear();

  /* ---------- typing effect ---------- */
  const roles = ['Full Stack Developer', 'AI / ML Engineer', 'Backend & Microservices', 'Data Reconciliation Engineer', 'Generative AI Explorer'];
  const typed = $('#typed');
  let ri = 0, ci = 0, del = false;
  (function type() {
    const w = roles[ri];
    typed.textContent = w.slice(0, ci);
    if (!del && ci === w.length) { del = true; return setTimeout(type, 1500); }
    if (del && ci === 0) { del = false; ri = (ri + 1) % roles.length; }
    ci += del ? -1 : 1;
    setTimeout(type, del ? 35 : 75);
  })();

  /* ---------- nav ---------- */
  const nav = $('#nav'), menu = $('#menu'), prog = $('#progress');
  $('#burger').onclick = () => menu.classList.toggle('open');
  $$('#menu a').forEach(a => a.addEventListener('click', () => menu.classList.remove('open')));
  const sections = $$('main section[id]');
  addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', scrollY > 30);
    const h = document.documentElement;
    prog.style.width = (scrollY / (h.scrollHeight - h.clientHeight) * 100) + '%';
    let cur = '';
    sections.forEach(s => { if (scrollY >= s.offsetTop - 160) cur = s.id; });
    $$('#menu a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
  }, { passive: true });

  /* ---------- reveal + counters ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    $$('[data-count]', e.target).forEach(count);
    io.unobserve(e.target);
  }), { threshold: .12 });
  $$('.reveal').forEach(el => io.observe(el));
  function count(el) {
    const end = +el.dataset.count, suf = el.dataset.suffix || '';
    const t0 = performance.now(), dur = 1400;
    (function f(t) {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;
      if (p < 1) requestAnimationFrame(f);
    })(t0);
  }

  /* ---------- card spotlight + 3D tilt ---------- */
  $$('.card').forEach(c => {
    c.addEventListener('mousemove', e => {
      const r = c.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      c.style.setProperty('--mx', x + 'px'); c.style.setProperty('--my', y + 'px');
      if (c.classList.contains('tilt') && !reduce) {
        const rx = ((y / r.height) - .5) * -6, ry = ((x / r.width) - .5) * 6;
        c.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-3px)`;
      }
    });
    c.addEventListener('mouseleave', () => c.style.transform = '');
  });

  /* ---------- avatar: eyes follow cursor + parallax ---------- */
  addEventListener('mousemove', e => {
    const g = $('#glow'); g.style.left = e.clientX + 'px'; g.style.top = e.clientY + 'px';
  });

  /* ---------- project filters ---------- */
  $$('#filters button').forEach(b => b.onclick = () => {
    $$('#filters button').forEach(x => x.classList.remove('on')); b.classList.add('on');
    const f = b.dataset.f;
    $$('.proj').forEach(p => p.classList.toggle('hide', f !== 'all' && !p.dataset.cat.split(' ').includes(f)));
  });

  /* ---------- contact form (opens email client) ---------- */
  $('#form').addEventListener('submit', e => {
    e.preventDefault();
    const n = $('#fn').value, em = $('#fe').value, m = $('#fm').value;
    location.href = 'mailto:udithanayanajith97@gmail.com?subject=' + encodeURIComponent('Portfolio enquiry from ' + n) +
      '&body=' + encodeURIComponent(m + '\n\n— ' + n + ' (' + em + ')');
  });

  /* ---------- neural network particle background ---------- */
  const cv = $('#bg'), ctx = cv.getContext('2d');
  let W, H, pts = [], mouse = { x: -999, y: -999 };
  const linkRadius = 145, traceCycle = 7.5, traceDuration = 1.15;
  function size() {
    W = cv.width = innerWidth; H = cv.height = innerHeight;
    const n = Math.min(90, Math.floor(W * H / 16000));
    pts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .18, vy: (Math.random() - .5) * .18 }));
  }
  addEventListener('resize', size); size();
  addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  (function draw() {
    ctx.clearRect(0, 0, W, H);
    const now = performance.now() / 1000;
    for (const p of pts) {
      if (!reduce) { p.x += p.vx; p.y += p.vy; }
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, 7); ctx.fillStyle = 'rgba(34,211,238,.7)'; ctx.fill();
    }
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i], b = pts[j], dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.hypot(dx, dy);
        if (d < linkRadius) {
          const fade = 1 - d / linkRadius;
          ctx.strokeStyle = `rgba(167,139,250,${.16 * fade})`;
          ctx.lineWidth = .8;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();

          // A few links trace themselves in sequence, then settle back into the soft network.
          if (!reduce && (i * 19 + j * 31) % 13 === 0) {
            const offset = ((i * 7 + j * 11) % 23) / 23 * traceCycle;
            const phase = (now + offset) % traceCycle;
            if (phase < traceDuration) {
              const raw = phase / traceDuration;
              const progress = raw * raw * (3 - 2 * raw);
              const tipX = a.x + dx * progress, tipY = a.y + dy * progress;
              const alpha = .72 * fade * (1 - raw * .22);
              ctx.strokeStyle = `rgba(34,211,238,${alpha})`;
              ctx.lineWidth = 1.35;
              ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(tipX, tipY); ctx.stroke();
              ctx.beginPath(); ctx.arc(tipX, tipY, 2.1, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(210,250,255,${alpha})`; ctx.fill();
            }
          }
        }
      }
      const dm = Math.hypot(pts[i].x - mouse.x, pts[i].y - mouse.y);
      if (!reduce && dm < 170) { ctx.strokeStyle = `rgba(34,211,238,${.35 * (1 - dm / 170)})`; ctx.lineWidth = .9; ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
    }
    requestAnimationFrame(draw);
  })();
})();
