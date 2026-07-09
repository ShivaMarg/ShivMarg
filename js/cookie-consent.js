(function () {
  'use strict';

  var STORAGE_KEY = 'sm_cookie_consent';

  if (localStorage.getItem(STORAGE_KEY) === 'accepted') return;

  var css = `
    #sm-cookie-bar {
      position: fixed; left: 0; right: 0; bottom: 0; z-index: 9998;
      display: flex; align-items: center; justify-content: space-between;
      gap: 20px; flex-wrap: wrap;
      padding: 14px 24px;
      background: #1A0C08;
      border-top: 1px solid rgba(232,184,75,0.25);
      font-family: 'Crimson Pro', 'EB Garamond', serif;
      animation: sm-cb-in 0.4s ease both;
    }
    @keyframes sm-cb-in { from { transform: translateY(100%); } to { transform: translateY(0); } }
    #sm-cookie-bar p {
      margin: 0; flex: 1; min-width: 240px;
      font-size: 0.9rem; color: rgba(255,240,220,0.75); line-height: 1.5;
    }
    #sm-cookie-bar a {
      color: #E8B84B; text-decoration: underline; text-underline-offset: 2px;
    }
    #sm-cookie-bar button {
      font-family: 'Cinzel', serif; font-size: 0.75rem; letter-spacing: 1.5px;
      text-transform: uppercase; white-space: nowrap;
      padding: 10px 22px; border: none; border-radius: 4px; cursor: pointer;
      background: linear-gradient(135deg, #FF7A1A, #C9962E);
      color: #fff; transition: opacity 0.2s;
    }
    #sm-cookie-bar button:hover { opacity: 0.88; }
    @media (max-width: 600px) {
      #sm-cookie-bar { padding: 12px 16px; }
      #sm-cookie-bar p { font-size: 0.82rem; }
    }
  `;

  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  var bar = document.createElement('div');
  bar.id = 'sm-cookie-bar';
  bar.setAttribute('role', 'dialog');
  bar.setAttribute('aria-label', 'Cookie notice');
  bar.innerHTML =
    '<p>We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies. ' +
    '<a href="/privacy-policy/#cookie-policy">Learn more</a></p>' +
    '<button id="sm-cookie-accept" type="button">Accept</button>';

  document.body.appendChild(bar);

  document.getElementById('sm-cookie-accept').addEventListener('click', function () {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    bar.remove();
  });
})();