(function () {
  var PIPELINE_URL = window.SOLENS_PIPELINE_URL || '/api/pipeline';

  function extractEmail(form) {
    var candidates = form.querySelectorAll(
      'input[type="email"], input[name*="email" i], input[id*="email" i], input[placeholder*="email" i]'
    );
    for (var i = 0; i < candidates.length; i++) {
      var val = candidates[i].value.trim();
      if (val && /@/.test(val)) return val;
    }
    return null;
  }

  function extractName(form) {
    var candidates = form.querySelectorAll(
      'input[name="name"], input[name="full_name"], input[name="fullname"], ' +
      'input[placeholder*="name" i], input[id*="name" i]'
    );
    for (var i = 0; i < candidates.length; i++) {
      var val = candidates[i].value.trim();
      if (val) return val;
    }
    return '';
  }

  document.addEventListener('submit', function (e) {
    var email = extractEmail(e.target);
    if (!email) return;
    var payload = JSON.stringify({ email: email, name: extractName(e.target), source: 'embed' });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(PIPELINE_URL, new Blob([payload], { type: 'application/json' }));
    } else {
      fetch(PIPELINE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true
      });
    }
  }, true);
})();
