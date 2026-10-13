(function () {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Scroll progress bar
    var bar = document.createElement('div');
    bar.className = 'ent-progress';
    document.body.appendChild(bar);

    // Back to top
    var top = document.createElement('button');
    top.className = 'ent-top';
    top.setAttribute('aria-label', 'Retour en haut');
    top.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    document.body.appendChild(top);
    top.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });

    var header = document.querySelector('.ent-header');
    function onScroll() {
        var y = window.pageYOffset || document.documentElement.scrollTop;
        var h = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = (h > 0 ? (y / h * 100) : 0) + '%';
        if (header) header.classList.toggle('scrolled', y > 40);
        top.classList.toggle('show', y > 600);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Animated counters
    var stats = document.querySelectorAll('.ent-stat .big');
    if (stats.length && 'IntersectionObserver' in window) {
        var co = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (!e.isIntersecting) return;
                co.unobserve(e.target);
                var el = e.target, m = el.textContent.trim().match(/^(\D*)(\d+)(.*)$/);
                if (!m) return;
                var pre = m[1], target = parseInt(m[2], 10), suf = m[3];
                if (reduce || target === 0) { el.textContent = pre + target + suf; return; }
                var start = null, dur = 1200;
                function step(ts) {
                    if (!start) start = ts;
                    var p = Math.min((ts - start) / dur, 1);
                    var val = Math.floor((1 - Math.pow(1 - p, 3)) * target);
                    el.textContent = pre + val + suf;
                    if (p < 1) requestAnimationFrame(step); else el.textContent = pre + target + suf;
                }
                requestAnimationFrame(step);
            });
        }, { threshold: 0.4 });
        stats.forEach(function (s) { co.observe(s); });
    }

    // Sectors marquee
    var sectors = document.querySelector('.ent-sectors');
    if (sectors && !reduce) {
        var track = document.createElement('div');
        track.className = 'ent-marquee-track';
        track.innerHTML = sectors.innerHTML + sectors.innerHTML;
        sectors.innerHTML = '';
        sectors.appendChild(track);
        sectors.classList.add('is-marquee');
    }

    // Magnetic primary CTAs (prominent ones, fine pointer only)
    if (!reduce && window.matchMedia('(pointer:fine)').matches) {
        document.querySelectorAll('.ent-hero .btn-primary, .ent-actions .btn-primary, .ent-cta .btn-primary').forEach(function (b) {
            b.addEventListener('mousemove', function (e) {
                var r = b.getBoundingClientRect();
                var x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
                b.style.transform = 'translate(' + (x * 0.15) + 'px,' + (y * 0.28) + 'px)';
            });
            b.addEventListener('mouseleave', function () { b.style.transform = ''; });
        });
    }

    // Margin simulator
    var range = document.getElementById('simRange');
    if (range) {
        var per = 171;
        function fmt(n) { return n.toLocaleString('fr-FR'); }
        function updSim() {
            var n = +range.value;
            document.getElementById('simClients').textContent = n;
            document.getElementById('simMargin').innerHTML = '+' + fmt(n * per) + '€<small> /mois</small>';
            document.getElementById('simYear').textContent = fmt(n * per * 12) + '€';
        }
        range.addEventListener('input', updSim);
        updSim();
    }
})();

(function () {
    var zone = document.querySelector('.dn-visuel[data-modes]');
    if (!zone) return;
    var modes;
    try { modes = JSON.parse(zone.getAttribute('data-modes')); } catch (e) { return; }
    var images = zone.querySelectorAll('.dn-robot-img');
    var notices = zone.querySelectorAll('.dn-notice');
    var label = zone.querySelector('.dn-mode-pilule b');
    var points = zone.querySelectorAll('.dn-point');
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var actuel = 0, minuteur = null;

    function affiche(n) {
        if (n === actuel) return;
        actuel = n;
        images.forEach(function (img, i) { img.classList.toggle('actif', i === n); });
        points.forEach(function (pt, i) { pt.classList.toggle('actif', i === n); });
        label.textContent = modes[n].label;
        notices.forEach(function (el) { el.classList.add('dn-change'); });
        setTimeout(function () {
            notices.forEach(function (el, i) {
                var c = modes[n].cartes[i];
                if (!c) return;
                el.querySelector('strong').textContent = c[0];
                el.querySelector('small').textContent = c[1];
                el.classList.remove('dn-change');
            });
        }, 250);
    }
    function lance() {
        if (reduce || minuteur) return;
        minuteur = setInterval(function () { affiche((actuel + 1) % modes.length); }, 4000);
    }
    function arrete() { clearInterval(minuteur); minuteur = null; }

    zone.style.pointerEvents = 'auto';
    points.forEach(function (pt, i) {
        pt.addEventListener('click', function () { arrete(); affiche(i); lance(); });
    });
    zone.addEventListener('mouseenter', arrete);
    zone.addEventListener('mouseleave', lance);
    document.addEventListener('visibilitychange', function () { document.hidden ? arrete() : lance(); });
    lance();
})();

(function () {
    var forms = document.querySelectorAll('form.dn-form');
    if (!forms.length) return;

    function telValide(v) {
        var t = v.replace(/[\s.\-()]/g, '');
        return /^((\+|00)33|0)[1-9]\d{8}$/.test(t) || /^(\+|00)[1-9]\d{7,14}$/.test(t);
    }

    forms.forEach(function (form) {
        function valeur(nom) {
            var el = form.querySelector('[name="' + nom + '"]');
            return el ? el.value.trim() : '';
        }
        function valide() {
            var ok = true;
            form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea').forEach(function (el) {
                var groupe = el.closest('.form-group');
                if (!groupe) return;
                var v = el.value.trim();
                var bon = true;
                if (el.required && v === '') bon = false;
                if (bon && v !== '' && el.type === 'email') bon = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
                if (bon && v !== '' && el.type === 'tel') bon = telValide(v);
                groupe.classList.toggle('error', !bon);
                if (!bon) ok = false;
            });
            return ok;
        }
        form.querySelectorAll('input, textarea, select').forEach(function (el) {
            el.addEventListener('input', function () {
                var groupe = el.closest('.form-group');
                if (groupe) groupe.classList.remove('error');
            });
        });

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var honeyField = form.querySelector('[name="_honey"]');
            if (honeyField && honeyField.value) return false;
            if (!valide()) {
                var premier = form.querySelector('.form-group.error');
                if (premier) premier.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return false;
            }
            var btn = form.querySelector('.btn-submit');
            btn.textContent = 'Envoi en cours...';
            btn.disabled = true;

            var nom = valeur('nom');
            var entreprise = valeur('entreprise');
            var email = valeur('email');
            var tel = valeur('telephone');
            var service = form.getAttribute('data-service') || valeur('service');
            var lignes = ['Service demande : ' + service,
                          'Entreprise : ' + (entreprise || 'non renseignee'),
                          'Telephone : ' + (tel || 'non renseigne')];
            form.querySelectorAll('.form-group[data-label]').forEach(function (groupe) {
                var cases = groupe.querySelectorAll('input[type="checkbox"]');
                var v;
                if (cases.length) {
                    v = Array.prototype.filter.call(cases, function (c) { return c.checked; })
                        .map(function (c) { return c.value; }).join(', ');
                } else {
                    var champ = groupe.querySelector('select, input, textarea');
                    v = champ ? champ.value.trim() : '';
                }
                if (v) lignes.push(groupe.getAttribute('data-label') + ' : ' + v);
            });
            var message = valeur('message');

            var webhookData = new FormData();
            webhookData.append('name', nom);
            webhookData.append('email', email);
            webhookData.append('tel', tel);
            webhookData.append('service', service);
            webhookData.append('subject', 'Dina Studio - ' + service);
            webhookData.append('message', lignes.join('\n') + (message ? '\n\n' + message : ''));
            var p1 = fetch(form.getAttribute('action'), {
                method: 'POST',
                body: webhookData,
                keepalive: true
            }).catch(function () {});
            var shown = false;
            var showThanks = function () {
                if (shown) return;
                shown = true;
                window.location.href = 'merci.html';
            };
            Promise.allSettled([p1]).then(showThanks);
            setTimeout(showThanks, 3000);
            return false;
        });
    });
})();
