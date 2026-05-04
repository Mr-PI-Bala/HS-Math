(function (global) {
  'use strict';

  var DESMOS_URL = 'https://www.desmos.com/calculator';
  var TI84_EMULATOR_URL = 'https://ti84calc.com/ti84calc/';
  var INTERVIEW_GOTCHAS = [
    'Common High School Teacher Interview Gotchas',
    '',
    '1) Classroom management specifics',
    '- Be ready with exact routines for entry, transitions, group work, and reset.',
    '',
    '2) Data-informed instruction',
    '- Explain how you use formative checks and what you do the next day if data is weak.',
    '',
    '3) Differentiation under time pressure',
    '- Give one concrete strategy for multilingual learners and one for IEP accommodations.',
    '',
    '4) Parent communication',
    '- Share your cadence, tone, and escalation path for difficult conversations.',
    '',
    '5) Equity and belonging',
    '- Show how you design participation so all students are seen and supported.',
    '',
    '6) Assessment philosophy',
    '- Clarify retakes, partial credit, and how you protect rigor with fairness.',
    '',
    '7) Technology use',
    '- Mention when you use Desmos/TI tools and when you require non-calculator reasoning.',
    '',
    '8) Why this school/district',
    '- Tie your answer to their student profile and existing initiatives.',
    '',
    '9) Demo-lesson readiness',
    '- Have a 10-15 minute mini-lesson with objective, check for understanding, and closure.',
    '',
    '10) Reflective practice',
    '- Give a real example of a lesson that failed and what you changed afterward.'
  ].join('\n');

  function openUtilityPopout(url, name, showToast) {
    var popup = window.open(url, name, 'popup=yes,width=1280,height=820');
    if (popup && !popup.closed) {
      try {
        popup.opener = null;
        popup.focus();
      } catch {
        // Cross-origin popouts can restrict focus/opener access.
      }
      return true;
    }

    var fallback = window.open(url, '_blank');
    if (fallback && !fallback.closed) {
      showToast('Opened in a new tab. Enable popups for popout windows.');
      return true;
    }

    showToast('Popup blocked. Allow popups for this site and try again.');
    return false;
  }

  function openTextPopout(title, bodyText, name, deps) {
    var popup = window.open('', name, 'popup=yes,width=980,height=760');
    if (!popup || popup.closed) {
      deps.openExpandPanel(title, bodyText);
      deps.showToast('Popup blocked. Showing details in-page instead.');
      return;
    }

    var escapedTitle = deps.escapeHtml(title);
    var escapedBody = deps.escapeHtml(bodyText);
    popup.document.open();
    popup.document.write('<!doctype html>' +
      '<html lang="en">' +
      '<head>' +
      '  <meta charset="utf-8" />' +
      '  <meta name="viewport" content="width=device-width,initial-scale=1" />' +
      '  <title>' + escapedTitle + '</title>' +
      '  <style>' +
      '    :root { color-scheme: light; }' +
      '    body { margin: 0; padding: 18px 20px 22px; font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; line-height: 1.5; color: #1f2330; background: #f7f9ff; }' +
      '    h1 { margin: 0 0 12px; font-size: 1.2rem; color: #2f3f9b; }' +
      '    pre { margin: 0; white-space: pre-wrap; word-wrap: break-word; background: #ffffff; border: 1px solid #dbe3ff; border-radius: 12px; padding: 14px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; font-size: 0.92rem; }' +
      '  </style>' +
      '</head>' +
      '<body>' +
      '  <h1>' + escapedTitle + '</h1>' +
      '  <pre>' + escapedBody + '</pre>' +
      '</body>' +
      '</html>');
    popup.document.close();
    try {
      popup.opener = null;
      popup.focus();
    } catch {
      // Focus may fail in restricted popup contexts.
    }
  }

  function attach(deps) {
    var getById = deps.getById;
    var showToast = deps.showToast;

    var btnDesmos = getById('btn-desmos');
    var btnTi84 = getById('btn-ti84');
    var btnInterview = getById('btn-interview-gotchas');

    if (!btnDesmos || !btnTi84 || !btnInterview) {
      return;
    }

    btnDesmos.addEventListener('click', function (e) {
      e.preventDefault();
      openUtilityPopout(DESMOS_URL, 'desmosCalculator', showToast);
    });

    btnTi84.addEventListener('click', function (e) {
      e.preventDefault();
      openUtilityPopout(TI84_EMULATOR_URL, 'ti84Emulator', showToast);
    });

    btnInterview.addEventListener('click', function (e) {
      e.preventDefault();
      openTextPopout('Teacher Interview Gotchas', INTERVIEW_GOTCHAS, 'teacherInterviewGotchas', deps);
    });
  }

  global.HSMathTopUtilityTools = {
    attach: attach
  };
})(window);
