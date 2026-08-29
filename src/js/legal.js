'use strict';
(function () {
  var locales = window.DUSKLINE_LOCALES || [['en', 'English']];
  var labels = {
    en: { language: 'Language', back: 'Back to duskline', legal: 'DUSKLINE · LEGAL', privacy: 'Privacy Policy', terms: 'Terms of Use', effective: 'Effective August 27, 2026' },
    es: { language: 'Idioma', back: 'Volver a duskline', legal: 'DUSKLINE · LEGAL', privacy: 'Política de privacidad', terms: 'Términos de uso', effective: 'Vigente desde el 27 de agosto de 2026' },
    fr: { language: 'Langue', back: 'Retour à duskline', legal: 'DUSKLINE · DROIT', privacy: 'Politique de confidentialité', terms: 'Conditions d’utilisation', effective: 'En vigueur le 27 août 2026' },
    de: { language: 'Sprache', back: 'Zurück zu duskline', legal: 'DUSKLINE · RECHT', privacy: 'Datenschutz', terms: 'Nutzungsbedingungen', effective: 'Gültig ab 27. August 2026' },
    it: { language: 'Lingua', back: 'Torna a duskline', legal: 'DUSKLINE · NOTE LEGALI', privacy: 'Privacy', terms: 'Termini di utilizzo', effective: 'In vigore dal 27 agosto 2026' },
    pt: { language: 'Idioma', back: 'Voltar ao duskline', legal: 'DUSKLINE · LEGAL', privacy: 'Política de privacidade', terms: 'Termos de uso', effective: 'Vigente em 27 de agosto de 2026' },
    nl: { language: 'Taal', back: 'Terug naar duskline', legal: 'DUSKLINE · JURIDISCH', privacy: 'Privacybeleid', terms: 'Gebruiksvoorwaarden', effective: 'Geldig vanaf 27 augustus 2026' },
    ja: { language: '言語', back: 'duskline に戻る', legal: 'DUSKLINE · 法務', privacy: 'プライバシーポリシー', terms: '利用規約', effective: '2026年8月27日施行' },
    ko: { language: '언어', back: 'duskline으로 돌아가기', legal: 'DUSKLINE · 법률', privacy: '개인정보 처리방침', terms: '이용약관', effective: '2026년 8월 27일 시행' },
    zh: { language: '语言', back: '返回 duskline', legal: 'DUSKLINE · 法律', privacy: '隐私政策', terms: '使用条款', effective: '生效日期：2026年8月27日' },
    'zh-TW': { language: '語言', back: '返回 duskline', legal: 'DUSKLINE · 法律', privacy: '隱私權政策', terms: '使用條款', effective: '生效日期：2026年8月27日' },
    ar: { language: 'اللغة', back: 'العودة إلى duskline', legal: 'DUSKLINE · قانوني', privacy: 'سياسة الخصوصية', terms: 'شروط الاستخدام', effective: 'ساري من 27 أغسطس 2026' },
    he: { language: 'שפה', back: 'חזרה אל duskline', legal: 'DUSKLINE · משפטי', privacy: 'מדיניות פרטיות', terms: 'תנאי שימוש', effective: 'בתוקף מ־27 באוגוסט 2026' },
    ru: { language: 'Язык', back: 'Назад в duskline', legal: 'DUSKLINE · ПРАВОВАЯ ИНФОРМАЦИЯ', privacy: 'Политика конфиденциальности', terms: 'Условия использования', effective: 'Действует с 27 августа 2026 г.' },
    uk: { language: 'Мова', back: 'Назад до duskline', legal: 'DUSKLINE · ПРАВОВА ІНФОРМАЦІЯ', privacy: 'Політика конфіденційності', terms: 'Умови використання', effective: 'Чинна з 27 серпня 2026 року' }
  };
  var page = document.body && document.body.dataset.legalPage;
  var select = document.getElementById('dusklineLegalLanguage');
  var stored = '';
  try { stored = localStorage.getItem('duskline-lang') || ''; } catch (e) {}
  var current = locales.some(function (x) { return x[0] === stored; }) ? stored : 'en';
  if (select) {
    locales.forEach(function (item) {
      var option = document.createElement('option'); option.value = item[0]; option.textContent = item[1]; select.appendChild(option);
    });
    select.value = current;
    select.addEventListener('change', function () { current = select.value; try { localStorage.setItem('duskline-lang', current); } catch (e) {} apply(); });
  }
  function apply() {
    var key = current === 'pt-BR' || current === 'pt-PT' ? 'pt' : current;
    var L = labels[key] || labels.en;
    document.documentElement.lang = current;
    document.documentElement.dir = current === 'ar' || current === 'he' ? 'rtl' : 'ltr';
    document.title = 'duskline — ' + (page === 'terms' ? L.terms : L.privacy);
    document.querySelectorAll('[data-legal="back"]').forEach(function (el) { el.textContent = '‹ ' + L.back; });
    document.querySelectorAll('[data-legal="legal"]').forEach(function (el) { el.textContent = L.legal; });
    document.querySelectorAll('[data-legal="title"]').forEach(function (el) { el.textContent = page === 'terms' ? L.terms : L.privacy; });
    document.querySelectorAll('[data-legal="effective"]').forEach(function (el) { el.textContent = L.effective; });
    var label = document.querySelector('[data-legal="language-label"]'); if (label) label.textContent = L.language;
  }
  apply();
})();
