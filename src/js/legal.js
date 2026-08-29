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
  var sections = {
    en: { privacyIntro: 'A clear explanation of what stays in your browser and what is sent to weather providers.', termsIntro: 'Please use duskline as a planning and exploration tool, not as a source of emergency instructions.', privacy: ['What duskline stores', 'Location and weather requests', 'Hosting and third parties', 'Changes and contact'], terms: ['Service description', 'Accuracy and safety', 'Availability and third-party data', 'Acceptable use', 'Changes'] },
    es: { privacyIntro: 'Una explicación clara de qué permanece en tu navegador y qué se envía a los proveedores meteorológicos.', termsIntro: 'Usa duskline como herramienta de planificación y exploración, no como fuente de instrucciones de emergencia.', privacy: ['Qué almacena duskline', 'Solicitudes de ubicación y meteorología', 'Alojamiento y terceros', 'Cambios y contacto'], terms: ['Descripción del servicio', 'Precisión y seguridad', 'Disponibilidad y datos de terceros', 'Uso aceptable', 'Cambios'] },
    fr: { privacyIntro: 'Une explication claire de ce qui reste dans votre navigateur et de ce qui est envoyé aux fournisseurs météo.', termsIntro: 'Utilisez duskline comme outil de planification et d’exploration, jamais comme source d’instructions d’urgence.', privacy: ['Ce que duskline stocke', 'Demandes de localisation et météo', 'Hébergement et tiers', 'Modifications et contact'], terms: ['Description du service', 'Précision et sécurité', 'Disponibilité et données de tiers', 'Utilisation acceptable', 'Modifications'] },
    de: { privacyIntro: 'Eine klare Erklärung, was in Ihrem Browser bleibt und was an Wetteranbieter gesendet wird.', termsIntro: 'Verwenden Sie duskline zur Planung und Erkundung, nicht als Quelle für Notfallanweisungen.', privacy: ['Was duskline speichert', 'Standort- und Wetteranfragen', 'Hosting und Drittanbieter', 'Änderungen und Kontakt'], terms: ['Beschreibung des Dienstes', 'Genauigkeit und Sicherheit', 'Verfügbarkeit und Daten Dritter', 'Zulässige Nutzung', 'Änderungen'] },
    it: { privacyIntro: 'Una spiegazione chiara di ciò che resta nel browser e di ciò che viene inviato ai fornitori meteo.', termsIntro: 'Usa duskline per pianificare ed esplorare, non come fonte di istruzioni di emergenza.', privacy: ['Cosa memorizza duskline', 'Richieste di posizione e meteo', 'Hosting e terze parti', 'Modifiche e contatti'], terms: ['Descrizione del servizio', 'Accuratezza e sicurezza', 'Disponibilità e dati di terze parti', 'Uso consentito', 'Modifiche'] },
    pt: { privacyIntro: 'Uma explicação clara do que permanece no navegador e do que é enviado aos provedores de previsão do tempo.', termsIntro: 'Use duskline para planejar e explorar, não como fonte de instruções de emergência.', privacy: ['O que o duskline armazena', 'Solicitações de localização e clima', 'Hospedagem e terceiros', 'Alterações e contato'], terms: ['Descrição do serviço', 'Precisão e segurança', 'Disponibilidade e dados de terceiros', 'Uso aceitável', 'Alterações'] },
    ja: { privacyIntro: 'ブラウザに保存される情報と、天気サービスへ送信される情報を明確に説明します。', termsIntro: 'duskline は計画や探索のためのツールです。緊急時の指示の情報源として使用しないでください。', privacy: ['duskline が保存する情報', '位置情報と天気のリクエスト', 'ホスティングと第三者', '変更とお問い合わせ'], terms: ['サービスの説明', '正確性と安全性', '可用性と第三者データ', '許可される利用', '変更'] },
    ko: { privacyIntro: '브라우저에 남는 정보와 날씨 제공업체로 전송되는 정보를 명확하게 설명합니다.', termsIntro: 'duskline은 계획과 탐색을 위한 도구이며 긴급 지침의 출처가 아닙니다.', privacy: ['duskline이 저장하는 정보', '위치 및 날씨 요청', '호스팅 및 제3자', '변경 및 문의'], terms: ['서비스 설명', '정확성 및 안전', '가용성 및 제3자 데이터', '허용되는 사용', '변경'] },
    zh: { privacyIntro: '清晰说明哪些信息留在浏览器中，以及哪些信息会发送给天气服务提供商。', termsIntro: '请将 duskline 用于规划和探索，不要将其作为紧急指示来源。', privacy: ['duskline 保存的信息', '位置和天气请求', '托管与第三方', '变更与联系'], terms: ['服务说明', '准确性与安全', '可用性和第三方数据', '合理使用', '变更'] },
    'zh-TW': { privacyIntro: '清楚說明哪些資訊留在瀏覽器中，以及哪些資訊會傳送給天氣服務提供者。', termsIntro: '請將 duskline 用於規劃與探索，不要將其作為緊急指示來源。', privacy: ['duskline 儲存的資訊', '位置與天氣請求', '託管與第三方', '變更與聯絡'], terms: ['服務說明', '準確性與安全', '可用性與第三方資料', '合理使用', '變更'] },
    ar: { privacyIntro: 'توضيح واضح لما يبقى في متصفحك وما يُرسل إلى مزوّدي الطقس.', termsIntro: 'استخدم duskline للتخطيط والاستكشاف، وليس كمصدر لتعليمات الطوارئ.', privacy: ['ما يخزّنه duskline', 'طلبات الموقع والطقس', 'الاستضافة والجهات الخارجية', 'التغييرات والتواصل'], terms: ['وصف الخدمة', 'الدقة والسلامة', 'التوافر وبيانات الجهات الخارجية', 'الاستخدام المقبول', 'التغييرات'] },
    he: { privacyIntro: 'הסבר ברור על מה שנשאר בדפדפן ועל מה שנשלח לספקי מזג האוויר.', termsIntro: 'יש להשתמש ב־duskline ככלי לתכנון ולחקירה, ולא כמקור להנחיות חירום.', privacy: ['מה duskline שומר', 'בקשות מיקום ומזג אוויר', 'אירוח וצדדים שלישיים', 'שינויים ויצירת קשר'], terms: ['תיאור השירות', 'דיוק ובטיחות', 'זמינות ונתוני צד שלישי', 'שימוש מותר', 'שינויים'] },
    ru: { privacyIntro: 'Понятное объяснение того, что остаётся в браузере и что отправляется поставщикам погоды.', termsIntro: 'Используйте duskline для планирования и изучения, а не как источник экстренных инструкций.', privacy: ['Что хранит duskline', 'Запросы геолокации и погоды', 'Хостинг и третьи стороны', 'Изменения и связь'], terms: ['Описание сервиса', 'Точность и безопасность', 'Доступность и данные третьих сторон', 'Допустимое использование', 'Изменения'] },
    uk: { privacyIntro: 'Зрозуміле пояснення того, що залишається у браузері, а що надсилається постачальникам погоди.', termsIntro: 'Використовуйте duskline для планування й дослідження, а не як джерело екстрених інструкцій.', privacy: ['Що зберігає duskline', 'Запити місцезнаходження та погоди', 'Хостинг і треті сторони', 'Зміни та зв’язок'], terms: ['Опис сервісу', 'Точність і безпека', 'Доступність і дані третіх сторін', 'Допустиме використання', 'Зміни'] }
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
    var S = sections[current] || sections[key] || sections.en;
    document.documentElement.lang = current;
    document.documentElement.dir = current === 'ar' || current === 'he' ? 'rtl' : 'ltr';
    document.title = 'duskline — ' + (page === 'terms' ? L.terms : L.privacy);
    document.querySelectorAll('[data-legal="back"]').forEach(function (el) { el.textContent = '‹ ' + L.back; });
    document.querySelectorAll('[data-legal="legal"]').forEach(function (el) { el.textContent = L.legal; });
    document.querySelectorAll('[data-legal="title"]').forEach(function (el) { el.textContent = page === 'terms' ? L.terms : L.privacy; });
    document.querySelectorAll('[data-legal="effective"]').forEach(function (el) { el.textContent = L.effective; });
    document.querySelectorAll('.legal-intro').forEach(function (el) { el.textContent = page === 'terms' ? S.termsIntro : S.privacyIntro; });
    var headings = Array.prototype.slice.call(document.querySelectorAll('.legal-page h2'));
    (page === 'terms' ? S.terms : S.privacy).forEach(function (value, index) { if (headings[index]) headings[index].textContent = value; });
    var label = document.querySelector('[data-legal="language-label"]'); if (label) label.textContent = L.language;
  }
  apply();
})();
