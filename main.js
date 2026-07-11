// Flag JS as available so CSS can safely gate the hidden reveal state
// (without JS, .reveal content stays fully visible).
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', function() {
  // Mobile Nav Logic
  var ham = document.getElementById('navHam'), mob = document.getElementById('navMob');
  if (ham && mob) { ham.addEventListener('click', function() { var isOpen = mob.classList.toggle('open'); ham.classList.toggle('open', isOpen); document.body.style.overflow = isOpen ? 'hidden' : ''; }); }

  // Condense the nav once the user scrolls
  var navEl = document.querySelector('nav');
  if (navEl) {
    var onScroll = function() { navEl.classList.toggle('scrolled', window.scrollY > 12); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Intersection Observer for Scroll Reveal Animations
  var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealElements = document.querySelectorAll('.reveal');
  if (prefersReduced || typeof IntersectionObserver === 'undefined') {
    // Show everything immediately, no motion
    revealElements.forEach(function(el) { el.classList.add('active'); });
  } else {
    var observerOptions = { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.15 };
    var observer = new IntersectionObserver(function(entries, obs) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          obs.unobserve(entry.target); // Only animate once
        }
      });
    }, observerOptions);
    revealElements.forEach(function(el) { observer.observe(el); });
  }

  // Scanner Animation Logic
  var fill = document.getElementById('spFill'), countEl = document.getElementById('spCount'), actionEl = document.getElementById('spAction');
  if (fill && countEl && actionEl) {
    var activeThreats = 0;
    function updateCount(val) { activeThreats += val; countEl.textContent = activeThreats; if(activeThreats > 0) { actionEl.textContent = 'Expert Analysts Engaged'; actionEl.style.color = 'var(--warn)'; } else { actionEl.textContent = 'All Threats Mitigated ✓'; actionEl.style.color = 'var(--success)'; } }
    function animateRow(idNum, tName, d) {
      var r = document.getElementById('sr'+idNum), n = document.getElementById('sn'+idNum), t = document.getElementById('st'+idNum); if(!r||!n||!t) return;
      r.className = 'sp-row'; 
      setTimeout(function(){ r.classList.add('vis'); n.textContent='Scanning ecosystem...'; n.style.color='var(--text)'; t.className='sp-tag tag-scan'; t.textContent='Intelligence Active'; }, d[0]);
      setTimeout(function(){ n.textContent=tName; t.className='sp-tag tag-bad'; t.textContent='Risk Identified'; updateCount(1); }, d[1]);
      setTimeout(function(){ t.className='sp-tag tag-assess'; t.textContent='Expert Guidance'; }, d[2]);
      setTimeout(function(){ t.className='sp-tag tag-init'; t.textContent='Executing Enforcement'; }, d[3]);
      setTimeout(function(){ n.textContent=tName+' (Mitigated)'; n.style.color='var(--muted)'; t.className='sp-tag tag-ok'; t.textContent='Threat Mitigated ✓'; updateCount(-1); }, d[4]);
    }
    function runScanner() {
      activeThreats = 0; countEl.textContent = '0'; actionEl.textContent = 'System Active'; actionEl.style.color = 'var(--cyan)';
      fill.style.transition = 'none'; fill.style.width = '0%';
      setTimeout(function() { fill.style.transition = 'width 20s linear'; fill.style.width = '100%'; }, 400);
      animateRow(1, 'Copycat App (App Store)',       [400, 2800, 6000, 9200, 12600]);
      animateRow(2, 'Phishing Domain (Web)',         [1600, 4400, 7600, 10800, 14200]);
      animateRow(3, 'Impersonator (Instagram)',      [2800, 6000, 9200, 12400, 15800]);
      animateRow(4, 'Lookalike App (Google Play)',   [4000, 7600, 10800, 14000, 17400]);
      setTimeout(runScanner, 22000);
    }
    runScanner();
  }

  // Form Logic
  var phoneInput = document.getElementById('f-phone'); if (phoneInput) { phoneInput.addEventListener('input', function(){ fmtPhone(phoneInput); }); }
  var firstAppInput = document.getElementById('f-app-0'); if (firstAppInput) { firstAppInput.addEventListener('input', function(){ validateAppURL(firstAppInput); }); }
  var addBtn = document.getElementById('fAddBtn'); if (addBtn) { addBtn.addEventListener('click', addAppLink); }
  var submitBtn = document.getElementById('fsubmit'); if (submitBtn) { submitBtn.addEventListener('click', submitForm); }
});

function fmtPhone(el){ var raw = el.value.replace(/[^0-9]/g, ''); if (raw.length === 0) { el.value = ''; return; } if (raw.charAt(0) === '1' && raw.length >= 2) { var d = raw.slice(1, 11); var out = '+1 '; if (d.length <= 3) { out += d.length ? '(' + d : ''; } else if (d.length <= 6) { out += '(' + d.slice(0,3) + ') ' + d.slice(3); } else { out += '(' + d.slice(0,3) + ') ' + d.slice(3,6) + '-' + d.slice(6,10); } el.value = out; return; } if (raw.length <= 10) { var d2 = raw; var out2 = '+1 '; if (d2.length <= 3) { out2 += d2.length ? '(' + d2 : ''; } else if (d2.length <= 6) { out2 += '(' + d2.slice(0,3) + ') ' + d2.slice(3); } else { out2 += '(' + d2.slice(0,3) + ') ' + d2.slice(3,6) + '-' + d2.slice(6,10); } el.value = out2; return; } el.value = '+' + raw.slice(0,3) + ' ' + raw.slice(3); }
function isValidEmail(email){ var v = (email || '').trim(); if (v.length < 5) return false; return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function validateAppURL(input){ var url = (input.value || '').trim(); var pid = input.id.replace('f-app-', ''); var prev = document.getElementById('ap-' + pid); if (!prev) return; if (url.length < 10) { prev.innerHTML = ''; return; } var iosMatch = url.match(/(?:apps\.apple\.com|itunes\.apple\.com)\/.*\/id(\d+)/); if (iosMatch) { var appId = iosMatch[1]; prev.innerHTML = '<span class="ap-loading">Validating App Store listing...</span>'; fetch('https://itunes.apple.com/lookup?id=' + appId).then(function(r){ return r.json(); }).then(function(data){ if (data && data.resultCount > 0) { var a = data.results[0]; prev.innerHTML = '<div class="ap-valid"><img class="ap-icon" src="'+(a.artworkUrl60||'')+'" onerror="this.style.display=\'none\'"><div class="ap-info"><span class="ap-name">'+(a.trackName||'App')+'</span><span class="ap-store">App Store</span></div><span class="ap-ok">✓ Verified</span></div>'; } else { prev.innerHTML = '<span class="ap-invalid">App not found — double-check this URL</span>'; } }).catch(function(){ prev.innerHTML = '<span class="ap-invalid">Unable to verify right now — link may still be valid</span>'; }); return; } var gpMatch = url.match(/play\.google\.com\/store\/apps\/details\?id=([a-zA-Z0-9_.]+)/); if (gpMatch) { prev.innerHTML = '<div class="ap-valid"><div class="ap-play-icon">▶</div><div class="ap-info"><span class="ap-name">'+gpMatch[1]+'</span><span class="ap-store">Google Play Store</span></div><span class="ap-ok">✓ Valid URL</span></div>'; return; } if (url.length > 20) { prev.innerHTML = '<span class="ap-invalid">Enter a valid App Store or Google Play URL</span>'; } else { prev.innerHTML = ''; } }
var appLinkCount = 1; function addAppLink(){ var wrap = document.getElementById('appLinks'); if (!wrap) return; var div = document.createElement('div'); div.className = 'fg fapp-extra'; var inputId = 'f-app-' + appLinkCount, prevId = 'ap-' + appLinkCount; div.innerHTML = '<input id="'+inputId+'" type="url" class="fi app-url-input" placeholder="https://play.google.com/store/apps/details?id=your.app"><button type="button" class="fremove" aria-label="Remove">×</button>'; wrap.appendChild(div); var newInput = document.getElementById(inputId); newInput.addEventListener('input', function(){ validateAppURL(newInput); }); div.querySelector('.fremove').addEventListener('click', function(){ div.parentNode.removeChild(div); }); var previewDiv = document.createElement('div'); previewDiv.className = 'app-preview'; previewDiv.id = prevId; div.appendChild(previewDiv); newInput.focus(); appLinkCount++; }
var SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwdgNaSADZi8IKP_MQr3dyX9WZXMoh6itu7eEfwGfT8TML4Zg5u9oQKByHfk_odapMRjw/exec';
function showFError(msg){ var el = document.getElementById('f-error'); if (!el) return; el.textContent = msg; el.style.display = 'block'; }
function submitForm(){ var errEl = document.getElementById('f-error'); if (errEl) errEl.style.display = 'none'; var fnameEl = document.getElementById('f-fname'), lnameEl = document.getElementById('f-lname'), companyEl = document.getElementById('f-company'), emailEl = document.getElementById('f-email'), phoneEl = document.getElementById('f-phone'), situationEl = document.getElementById('f-situation'), btn = document.getElementById('fsubmit'); var appInputs = document.querySelectorAll('.app-url-input'), appUrls = []; for (var i = 0; i < appInputs.length; i++) { if (appInputs[i].value.trim()) appUrls.push(appInputs[i].value.trim()); } if (!fnameEl.value.trim()) return showFError('Please enter your first name.'); if (!lnameEl.value.trim()) return showFError('Please enter your last name.'); if (!companyEl.value.trim()) return showFError('Please enter your company name.'); if (!isValidEmail(emailEl.value)) return showFError('Please enter a valid work email.'); if (appUrls.length === 0) return showFError('Please add at least one App Store or Google Play URL.'); if (!situationEl.value.trim()) return showFError('Please tell us about your situation.'); var origLabel = btn.innerHTML; btn.disabled = true; btn.innerHTML = '<span class="f-spin"></span>Sending...'; var payload = { firstName: fnameEl.value.trim(), lastName: lnameEl.value.trim(), company: companyEl.value.trim(), email: emailEl.value.trim(), phone: (phoneEl ? phoneEl.value.trim() : ''), appUrls: appUrls, situation: situationEl.value.trim() }; fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify(payload) }).then(function(r){ return r.json(); }).then(function(res){ if (res && res.success) { btn.innerHTML = '\u2713 Sent \u2014 we\u2019ll reply within 1\u20132 business days'; btn.style.background = 'var(--success)'; var note = document.getElementById('f-note'); if (note) { note.style.display = 'block'; } } else { throw new Error('server'); } }).catch(function(){ btn.disabled = false; btn.innerHTML = origLabel; btn.style.background = ''; showFError('Something went wrong sending your request. Please email hello@ipdefense.ai and we\u2019ll reply right away.'); var note = document.getElementById('f-note'); if (note) { note.style.display = 'block'; } }); }
