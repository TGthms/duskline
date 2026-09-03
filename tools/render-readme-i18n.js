'use strict';
/**
 * Writes docs/i18n/README.<locale>.md and docs/i18n/README.md from the catalog below.
 * English README.md at the repo root is authored separately and linked from every copy.
 * Run: node tools/render-readme-i18n.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'docs/i18n');
const APP = 'https://duskline.pages.dev/';

const LOCALES = [
  ['en', 'English'], ['es', 'Español'], ['fr', 'Français'], ['de', 'Deutsch'],
  ['it', 'Italiano'], ['pt-BR', 'Português (Brasil)'], ['pt-PT', 'Português (Portugal)'],
  ['nl', 'Nederlands'], ['da', 'Dansk'], ['sv', 'Svenska'], ['nb', 'Norsk bokmål'],
  ['fi', 'Suomi'], ['pl', 'Polski'], ['cs', 'Čeština'], ['hu', 'Magyar'],
  ['ro', 'Română'], ['el', 'Ελληνικά'], ['tr', 'Türkçe'], ['ru', 'Русский'],
  ['uk', 'Українська'], ['ar', 'العربية'], ['he', 'עברית'], ['hi', 'हिन्दी'],
  ['th', 'ไทย'], ['vi', 'Tiếng Việt'], ['id', 'Bahasa Indonesia'], ['ja', '日本語'],
  ['ko', '한국어'], ['zh', '简体中文'], ['zh-TW', '繁體中文']
];

function bar(current, where) {
  return LOCALES.map(function (item) {
    const code = item[0];
    const name = item[1];
    if (code === current) return '**' + name + '**';
    if (code === 'en') {
      return '[' + name + '](' + (where === 'root' ? 'README.md' : '../../README.md') + ')';
    }
    const href = where === 'root'
      ? 'docs/i18n/README.' + code + '.md'
      : 'README.' + code + '.md';
    return '[' + name + '](' + href + ')';
  }).join(' · ');
}

function hrefs(where) {
  if (where === 'root') return { privacy: 'privacy.html', terms: 'terms.html', i18nIndex: 'docs/i18n/README.md' };
  return { privacy: '../../privacy.html', terms: '../../terms.html', i18nIndex: 'README.md' };
}

function render(code, S, where) {
  const h = hrefs(where);
  const rtl = code === 'ar' || code === 'he';
  const open = [
    '**' + S.readIn + ':** ' + bar(code, where),
    '',
    '# Duskline',
    '',
    S.tagline,
    '',
    '[' + S.openApp + '](' + APP + ') · [' + S.privacy + '](' + h.privacy + ') · [' + S.terms + '](' + h.terms + ')',
    '',
    S.intro,
    '',
    '## ' + S.featuresH,
    '',
    S.features.map(function (f) { return '- ' + f; }).join('\n'),
    '',
    '## ' + S.privacyH,
    '',
    S.privacyBody,
    '',
    '## ' + S.languagesH,
    '',
    S.languagesBody.replace('{i18n}', h.i18nIndex),
    '',
    '## ' + S.devH,
    '',
    S.devIntro,
    '',
    '```bash',
    'npm run serve',
    '# http://127.0.0.1:8000/',
    '```',
    '',
    '- ' + S.check,
    '- ' + S.unit,
    '- ' + S.e2e,
    '',
    '## ' + S.deployH,
    '',
    S.deployBody,
    '',
    '## ' + S.licenseH,
    '',
    S.licenseBody,
    ''
  ].join('\n');
  if (!rtl) return open;
  return '<div dir="rtl" lang="' + code + '">\n\n' + open + '\n</div>\n';
}

const C = {};

C.es = {
  readIn: 'Leer en',
  tagline: 'Una app del tiempo gratuita, solo en el navegador, para consultar y explorar el clima: búsqueda mundial de ciudades, vistas horarias y a 10 días, calidad del aire, condiciones animadas y previsiones y alertas mejoradas del Servicio Meteorológico Nacional de EE. UU.',
  openApp: 'Abrir duskline', privacy: 'Política de privacidad', terms: 'Términos de uso',
  intro: 'No hay cuenta, no hay un backend propio ni identificador publicitario. El idioma, las unidades, los favoritos y una ubicación guardada deliberadamente aproximada permanecen en tu navegador.',
  featuresH: 'Funciones',
  features: [
    'Busca cualquier ciudad del mundo, con sugerencias usables con teclado',
    'Guarda favoritos y, si quieres, usa tu ubicación (las coordenadas se redondean antes de guardarse o enviarse)',
    'Condiciones actuales, previsión horaria y panorama a 10 días',
    'Calidad del aire',
    'En lugares de EE. UU. elegibles, previsiones y alertas públicas del National Weather Service',
    'Cielo y precipitación animados en la vista detallada',
    'Unidades de temperatura, distancia, viento, precipitación y presión',
    '30 idiomas de interfaz, incluidos árabe y hebreo (derecha a izquierda)'
  ],
  privacyH: 'Privacidad y datos',
  privacyBody: 'Las solicitudes meteorológicas salen de tu navegador hacia [Open-Meteo](https://open-meteo.com/) y, en ubicaciones de EE. UU., el [National Weather Service](https://www.weather.gov/). Si usas la ubicación, la geocodificación inversa va a BigDataCloud y puede recurrir a OpenStreetMap Nominatim. El alojamiento y Google Fonts pueden ver datos técnicos habituales de la solicitud.\n\nduskline no vende esa información. Las previsiones son para planificar y explorar, no para decisiones de emergencia. Detalles: [Política de privacidad](PRIVACY) y [Términos de uso](TERMS).',
  languagesH: 'Idiomas',
  languagesBody: 'El selector de la app y las páginas legales comparten los mismos 30 idiomas y la preferencia `duskline-lang`. El texto legal está en `src/js/data/legal/packs/`. Estas traducciones del README están en [`docs/i18n/`]({i18n}).',
  devH: 'Desarrollo',
  devIntro: 'La app es HTML, CSS y scripts clásicos estáticos: no hay empaquetador.',
  check: 'Comprobar la sintaxis de cada JS propio: `npm run check`',
  unit: 'Pruebas unitarias: `npm run test:unit`',
  e2e: 'Las pruebas Playwright simulan las APIs meteorológicas y no consumen cuotas reales: `npm test`',
  deployH: 'Despliegue',
  deployBody: 'La raíz del repositorio es el sitio. [Cloudflare Pages](https://duskline.pages.dev/) es el alojamiento principal previsto; GitHub Pages es la copia de seguridad. Ambos publican los archivos estáticos tal cual.',
  licenseH: 'Licencia',
  licenseBody: 'El código es [MIT](../../LICENSE). Los datos meteorológicos pertenecen a los proveedores anteriores y siguen sus términos. No sirve para seguridad vital ni emergencias.'
};

C.fr = {
  readIn: 'Lire en',
  tagline: 'Une appli météo gratuite, uniquement dans le navigateur, pour consulter et explorer le temps : recherche mondiale de villes, prévisions horaires et à 10 jours, qualité de l’air, conditions animées, et prévisions et alertes enrichies du U.S. National Weather Service.',
  openApp: 'Ouvrir duskline', privacy: 'Politique de confidentialité', terms: 'Conditions d’utilisation',
  intro: 'Pas de compte, pas de backend à nous, pas d’identifiant publicitaire. La langue, les unités, les favoris et une position enregistrée volontairement approximative restent dans votre navigateur.',
  featuresH: 'Fonctionnalités',
  features: [
    'Recherchez n’importe quelle ville dans le monde, avec des suggestions au clavier',
    'Enregistrez des favoris et, si vous le souhaitez, utilisez votre position (les coordonnées sont arrondies avant stockage ou envoi)',
    'Conditions actuelles, prévision horaire et horizon à 10 jours',
    'Qualité de l’air',
    'Pour les lieux américains éligibles, prévisions et alertes publiques du National Weather Service',
    'Ciel et précipitations animés dans la vue détaillée',
    'Unités de température, distance, vent, précipitations et pression',
    '30 langues d’interface, dont l’arabe et l’hébreu (droite à gauche)'
  ],
  privacyH: 'Confidentialité et données',
  privacyBody: 'Les requêtes météo quittent votre navigateur vers [Open-Meteo](https://open-meteo.com/) et, pour les lieux américains, le [National Weather Service](https://www.weather.gov/). Si vous utilisez la localisation, le géocodage inverse va vers BigDataCloud et peut basculer vers OpenStreetMap Nominatim. L’hébergement et Google Fonts peuvent voir des données techniques ordinaires de requête.\n\nduskline ne vend pas ces informations. Les prévisions servent à planifier et explorer, pas à prendre des décisions d’urgence. Détails : [Politique de confidentialité](PRIVACY) et [Conditions d’utilisation](TERMS).',
  languagesH: 'Langues',
  languagesBody: 'Le sélecteur de l’appli et les pages juridiques partagent les 30 mêmes locales et la préférence `duskline-lang`. Les textes juridiques sont dans `src/js/data/legal/packs/`. Ces traductions du README sont dans [`docs/i18n/`]({i18n}).',
  devH: 'Développement',
  devIntro: 'L’appli est du HTML, CSS et des scripts classiques statiques — pas d’empaqueteur.',
  check: 'Vérifier la syntaxe de chaque JS interne : `npm run check`',
  unit: 'Tests unitaires : `npm run test:unit`',
  e2e: 'Les smokes Playwright simulent les API météo et ne consomment pas les quotas réels : `npm test`',
  deployH: 'Déploiement',
  deployBody: 'La racine du dépôt est le site. [Cloudflare Pages](https://duskline.pages.dev/) est l’hébergeur principal prévu ; GitHub Pages est la sauvegarde. Les deux publient les fichiers statiques tels quels.',
  licenseH: 'Licence',
  licenseBody: 'Le code est sous [MIT](../../LICENSE). Les données météo appartiennent aux fournisseurs ci-dessus et restent soumises à leurs conditions. Pas pour la sécurité des personnes ni les urgences.'
};

C.de = {
  readIn: 'Lesen auf',
  tagline: 'Eine kostenlose, rein browserbasierte Wetter-App zum Nachschlagen und Erkunden: weltweite Städtesuche, stündliche und 10-Tage-Aussichten, Luftqualität, animierte Bedingungen sowie erweiterte Vorhersagen und Warnungen des U.S. National Weather Service.',
  openApp: 'duskline öffnen', privacy: 'Datenschutz', terms: 'Nutzungsbedingungen',
  intro: 'Kein Konto, kein eigenes Backend, keine Werbekennung. Sprache, Einheiten, Favoriten und ein bewusst ungefährer gespeicherter Standort bleiben in Ihrem Browser.',
  featuresH: 'Funktionen',
  features: [
    'Suche nach jeder Stadt weltweit, mit tastaturfreundlichen Vorschlägen',
    'Favoriten speichern und optional den Standort nutzen (Koordinaten werden vor dem Speichern oder Senden gerundet)',
    'Aktuelle Bedingungen, stündliche Vorhersage und 10-Tage-Ausblick',
    'Luftqualität',
    'Für berechtigte US-Orte Vorhersagen und öffentliche Warnungen des National Weather Service',
    'Animierter Himmel und Niederschlag in der Detailansicht',
    'Einheiten für Temperatur, Distanz, Wind, Niederschlag und Druck',
    '30 Oberflächensprachen, einschließlich Arabisch und Hebräisch (rechts nach links)'
  ],
  privacyH: 'Datenschutz und Daten',
  privacyBody: 'Wetteranfragen gehen direkt aus Ihrem Browser an [Open-Meteo](https://open-meteo.com/) und für US-Standorte an den [National Weather Service](https://www.weather.gov/). Reverse Geocoding bei Standortnutzung geht an BigDataCloud und kann auf OpenStreetMap Nominatim zurückfallen. Hosting und Google Fonts können gewöhnliche technische Anfragedaten sehen.\n\nduskline verkauft diese Informationen nicht. Vorhersagen dienen der Planung und Erkundung, nicht Notfallentscheidungen. Details: [Datenschutz](PRIVACY) und [Nutzungsbedingungen](TERMS).',
  languagesH: 'Sprachen',
  languagesBody: 'Der In-App-Wähler und die Rechtstexte teilen dieselben 30 Locales und die Einstellung `duskline-lang`. Rechtstexte liegen in `src/js/data/legal/packs/`. Diese README-Übersetzungen liegen in [`docs/i18n/`]({i18n}).',
  devH: 'Entwicklung',
  devIntro: 'Die App ist statisches HTML, CSS und klassische Skripte — kein Bundler.',
  check: 'Syntaxprüfung jeder eigenen JS-Datei: `npm run check`',
  unit: 'Unit-Tests: `npm run test:unit`',
  e2e: 'Playwright-Smokes mocken Wetter-APIs und verbrauchen keine Live-Kontingente: `npm test`',
  deployH: 'Bereitstellung',
  deployBody: 'Die Repository-Wurzel ist die Website. [Cloudflare Pages](https://duskline.pages.dev/) ist der vorgesehene Haupthost; GitHub Pages die Absicherung. Beide veröffentlichen die statischen Dateien unverändert.',
  licenseH: 'Lizenz',
  licenseBody: 'Der Code steht unter [MIT](../../LICENSE). Wetterdaten gehören den genannten Drittanbietern und unterliegen deren Bedingungen. Nicht für Lebenssicherheit oder Notfälle.'
};

function fillLinks(S, where) {
  const h = hrefs(where);
  const out = Object.assign({}, S);
  out.privacyBody = S.privacyBody.replace('PRIVACY', h.privacy).replace('TERMS', h.terms);
  return out;
}

C.it = {
  readIn: 'Leggi in',
  tagline: 'Un’app meteo gratuita, solo nel browser, per consultare ed esplorare il tempo: ricerca mondiale di città, previsioni orarie e a 10 giorni, qualità dell’aria, condizioni animate e previsioni e allerte potenziate del U.S. National Weather Service.',
  openApp: 'Apri duskline', privacy: 'Privacy', terms: 'Termini di utilizzo',
  intro: 'Nessun account, nessun backend nostro, nessun identificatore pubblicitario. Lingua, unità, preferiti e una posizione salvata volutamente approssimativa restano nel browser.',
  featuresH: 'Funzioni',
  features: [
    'Cerca qualsiasi città nel mondo, con suggerimenti usabili da tastiera',
    'Salva i preferiti e, se vuoi, usa la posizione (le coordinate vengono arrotondate prima di essere salvate o inviate)',
    'Condizioni attuali, previsione oraria e panorama a 10 giorni',
    'Qualità dell’aria',
    'Per i luoghi USA ammissibili, previsioni e allerte pubbliche del National Weather Service',
    'Cielo e precipitazioni animati nella vista dettagliata',
    'Unità di temperatura, distanza, vento, precipitazioni e pressione',
    '30 lingue dell’interfaccia, tra cui arabo ed ebraico (destra-sinistra)'
  ],
  privacyH: 'Privacy e dati',
  privacyBody: 'Le richieste meteo escono dal browser verso [Open-Meteo](https://open-meteo.com/) e, per le località USA, il [National Weather Service](https://www.weather.gov/). Se usi la posizione, il geocoding inverso va a BigDataCloud e può passare a OpenStreetMap Nominatim. Hosting e Google Fonts possono vedere dati tecnici ordinari della richiesta.\n\nduskline non vende queste informazioni. Le previsioni servono a pianificare ed esplorare, non a decisioni di emergenza. Dettagli: [Privacy](PRIVACY) e [Termini di utilizzo](TERMS).',
  languagesH: 'Lingue',
  languagesBody: 'Il selettore nell’app e le pagine legali condividono le stesse 30 lingue e la preferenza `duskline-lang`. I testi legali sono in `src/js/data/legal/packs/`. Queste traduzioni del README sono in [`docs/i18n/`]({i18n}).',
  devH: 'Sviluppo',
  devIntro: 'L’app è HTML, CSS e script classici statici — nessun bundler.',
  check: 'Controllo sintassi di ogni JS di prima parte: `npm run check`',
  unit: 'Test unitari: `npm run test:unit`',
  e2e: 'Gli smoke Playwright simulano le API meteo e non consumano quote reali: `npm test`',
  deployH: 'Pubblicazione',
  deployBody: 'La radice del repository è il sito. [Cloudflare Pages](https://duskline.pages.dev/) è l’host principale previsto; GitHub Pages è il backup. Entrambi pubblicano i file statici così come sono.',
  licenseH: 'Licenza',
  licenseBody: 'Il codice è [MIT](../../LICENSE). I dati meteo appartengono ai fornitori sopra e restano soggetti ai loro termini. Non per sicurezza della vita o emergenze.'
};

C['pt-BR'] = {
  readIn: 'Ler em',
  tagline: 'Um app de clima gratuito, só no navegador, para consultar e explorar o tempo: busca mundial de cidades, visões horárias e de 10 dias, qualidade do ar, condições animadas e previsões e alertas aprimorados do U.S. National Weather Service.',
  openApp: 'Abrir o duskline', privacy: 'Política de privacidade', terms: 'Termos de uso',
  intro: 'Não há conta, backend próprio nem identificador de publicidade. Idioma, unidades, favoritos e uma localização salva de propósito aproximada ficam no seu navegador.',
  featuresH: 'Recursos',
  features: [
    'Pesquise qualquer cidade do mundo, com sugestões usáveis pelo teclado',
    'Salve favoritos e, se quiser, use sua localização (as coordenadas são arredondadas antes de serem salvas ou enviadas)',
    'Condições atuais, previsão horária e panorama de 10 dias',
    'Qualidade do ar',
    'Para lugares dos EUA elegíveis, previsões e alertas públicos do National Weather Service',
    'Céu e precipitação animados na vista detalhada',
    'Unidades de temperatura, distância, vento, precipitação e pressão',
    '30 idiomas de interface, incluindo árabe e hebraico (direita para a esquerda)'
  ],
  privacyH: 'Privacidade e dados',
  privacyBody: 'Os pedidos de clima saem do navegador para o [Open-Meteo](https://open-meteo.com/) e, em locais dos EUA, o [National Weather Service](https://www.weather.gov/). Se você usar a localização, a geocodificação inversa vai para o BigDataCloud e pode recorrer ao OpenStreetMap Nominatim. Hospedagem e Google Fonts podem ver dados técnicos comuns do pedido.\n\nO duskline não vende essas informações. As previsões são para planejar e explorar, não para decisões de emergência. Detalhes: [Política de privacidade](PRIVACY) e [Termos de uso](TERMS).',
  languagesH: 'Idiomas',
  languagesBody: 'O seletor do app e as páginas legais compartilham os mesmos 30 idiomas e a preferência `duskline-lang`. Os textos legais estão em `src/js/data/legal/packs/`. Estas traduções do README estão em [`docs/i18n/`]({i18n}).',
  devH: 'Desenvolvimento',
  devIntro: 'O app é HTML, CSS e scripts clássicos estáticos — sem empacotador.',
  check: 'Checar a sintaxe de cada JS próprio: `npm run check`',
  unit: 'Testes unitários: `npm run test:unit`',
  e2e: 'Os smokes do Playwright simulam as APIs de clima e não consomem cotas reais: `npm test`',
  deployH: 'Publicação',
  deployBody: 'A raiz do repositório é o site. [Cloudflare Pages](https://duskline.pages.dev/) é o host principal previsto; GitHub Pages é o backup. Ambos publicam os arquivos estáticos como estão.',
  licenseH: 'Licença',
  licenseBody: 'O código é [MIT](../../LICENSE). Os dados de clima pertencem aos provedores acima e seguem os termos deles. Não serve para segurança da vida nem emergências.'
};

C['pt-PT'] = {
  readIn: 'Ler em',
  tagline: 'Uma aplicação meteorológica gratuita, só no browser, para consultar e explorar o tempo: pesquisa mundial de cidades, perspetivas horárias e a 10 dias, qualidade do ar, condições animadas e previsões e alertas melhorados do U.S. National Weather Service.',
  openApp: 'Abrir o duskline', privacy: 'Política de privacidade', terms: 'Termos de utilização',
  intro: 'Não há conta, backend próprio nem identificador publicitário. O idioma, as unidades, os favoritos e uma localização guardada de propósito aproximada ficam no browser.',
  featuresH: 'Funcionalidades',
  features: [
    'Pesquise qualquer cidade do mundo, com sugestões utilizáveis pelo teclado',
    'Guarde favoritos e, se quiser, use a localização (as coordenadas são arredondadas antes de serem guardadas ou enviadas)',
    'Condições atuais, previsão horária e panorama a 10 dias',
    'Qualidade do ar',
    'Para lugares dos EUA elegíveis, previsões e alertas públicos do National Weather Service',
    'Céu e precipitação animados na vista detalhada',
    'Unidades de temperatura, distância, vento, precipitação e pressão',
    '30 idiomas de interface, incluindo árabe e hebraico (direita para a esquerda)'
  ],
  privacyH: 'Privacidade e dados',
  privacyBody: 'Os pedidos meteorológicos saem do browser para o [Open-Meteo](https://open-meteo.com/) e, em localizações dos EUA, o [National Weather Service](https://www.weather.gov/). Se usar a localização, a geocodificação inversa vai para o BigDataCloud e pode recorrer ao OpenStreetMap Nominatim. O alojamento e o Google Fonts podem ver dados técnicos habituais do pedido.\n\nO duskline não vende essas informações. As previsões servem para planear e explorar, não para decisões de emergência. Detalhes: [Política de privacidade](PRIVACY) e [Termos de utilização](TERMS).',
  languagesH: 'Idiomas',
  languagesBody: 'O seletor da aplicação e as páginas legais partilham os mesmos 30 idiomas e a preferência `duskline-lang`. Os textos legais estão em `src/js/data/legal/packs/`. Estas traduções do README estão em [`docs/i18n/`]({i18n}).',
  devH: 'Desenvolvimento',
  devIntro: 'A aplicação é HTML, CSS e scripts clássicos estáticos — sem empacotador.',
  check: 'Verificar a sintaxe de cada JS próprio: `npm run check`',
  unit: 'Testes unitários: `npm run test:unit`',
  e2e: 'Os smokes do Playwright simulam as API meteorológicas e não consomem quotas reais: `npm test`',
  deployH: 'Publicação',
  deployBody: 'A raiz do repositório é o sítio. [Cloudflare Pages](https://duskline.pages.dev/) é o anfitrião principal previsto; o GitHub Pages é a cópia de segurança. Ambos publicam os ficheiros estáticos tal como estão.',
  licenseH: 'Licença',
  licenseBody: 'O código é [MIT](../../LICENSE). Os dados meteorológicos pertencem aos fornecedores acima e continuam sujeitos aos respetivos termos. Não se destina a segurança de vida nem a emergências.'
};

C.nl = {
  readIn: 'Lezen in',
  tagline: 'Een gratis, alleen-in-de-browser weer-app om het weer te checken en te verkennen: wereldwijde stedenzoek, uur- en 10-daagse verwachtingen, luchtkwaliteit, geanimeerde omstandigheden en uitgebreide Amerikaanse National Weather Service-verwachtingen en -waarschuwingen.',
  openApp: 'duskline openen', privacy: 'Privacybeleid', terms: 'Gebruiksvoorwaarden',
  intro: 'Geen account, geen eigen backend, geen advertentie-identificatie. Taal, eenheden, favorieten en een expres benaderde opgeslagen locatie blijven in je browser.',
  featuresH: 'Functies',
  features: [
    'Zoek elke stad ter wereld, met toetsenbordvriendelijke suggesties',
    'Bewaar favorieten en gebruik optioneel je locatie (coördinaten worden afgerond voordat ze worden opgeslagen of verzonden)',
    'Actuele omstandigheden, uurverwachting en 10-daags overzicht',
    'Luchtkwaliteit',
    'Voor in aanmerking komende Amerikaanse plaatsen, verwachtingen en openbare waarschuwingen van de National Weather Service',
    'Geanimeerde hemel en neerslag in de detailweergave',
    'Eenheden voor temperatuur, afstand, wind, neerslag en luchtdruk',
    '30 interfacetalen, waaronder Arabisch en Hebreeuws (rechts-naar-links)'
  ],
  privacyH: 'Privacy en gegevens',
  privacyBody: 'Weerverzoeken gaan vanuit je browser naar [Open-Meteo](https://open-meteo.com/) en, voor Amerikaanse locaties, de [National Weather Service](https://www.weather.gov/). Reverse geocoding bij locatiegebruik gaat naar BigDataCloud en kan terugvallen op OpenStreetMap Nominatim. Hosting en Google Fonts kunnen gewone technische verzoekgegevens zien.\n\nduskline verkoopt die informatie niet. Verwachtingen zijn voor planning en verkenning, niet voor noodbeslissingen. Details: [Privacybeleid](PRIVACY) en [Gebruiksvoorwaarden](TERMS).',
  languagesH: 'Talen',
  languagesBody: 'De kiezer in de app en de juridische pagina’s delen dezelfde 30 locales en de voorkeur `duskline-lang`. Juridische teksten staan in `src/js/data/legal/packs/`. Deze README-vertalingen staan in [`docs/i18n/`]({i18n}).',
  devH: 'Ontwikkeling',
  devIntro: 'De app is statische HTML, CSS en klassieke scripts — geen bundler.',
  check: 'Syntaxcontrole van elk eigen JS-bestand: `npm run check`',
  unit: 'Unittests: `npm run test:unit`',
  e2e: 'Playwright-smokes mocken weer-API’s en verbruiken geen live quota: `npm test`',
  deployH: 'Publicatie',
  deployBody: 'De repositorywortel is de site. [Cloudflare Pages](https://duskline.pages.dev/) is de beoogde primaire host; GitHub Pages de back-up. Beide publiceren de statische bestanden ongewijzigd.',
  licenseH: 'Licentie',
  licenseBody: 'De code is [MIT](../../LICENSE). Weergegevens horen bij de genoemde derden en vallen onder hun voorwaarden. Niet voor levensveiligheid of noodgevallen.'
};

C.ja = {
  readIn: '言語',
  tagline: '無料のブラウザ専用天気アプリ。世界の都市検索、1時間ごとと10日の見通し、大気質、アニメーションの空、そして米国 National Weather Service の強化された予報と警報。',
  openApp: 'duskline を開く', privacy: 'プライバシーポリシー', terms: '利用規約',
  intro: 'アカウントも独自バックエンドも広告識別子もありません。言語、単位、お気に入り、意図的に粗くした保存位置はブラウザ内に残ります。',
  featuresH: '機能',
  features: [
    '世界中の都市を検索。キーボードで使える候補',
    'お気に入りの保存と、任意の現在地（座標は保存・送信前に丸めます）',
    '現在の状況、時間予報、10日見通し',
    '大気質',
    '対象となる米国の地点では National Weather Service の予報と公開警報',
    '詳細ビューのアニメーションの空と降水',
    '気温・距離・風・降水・気圧の単位',
    'アラビア語とヘブライ語（右から左）を含む 30 のインターフェース言語'
  ],
  privacyH: 'プライバシーとデータ',
  privacyBody: '天気リクエストはブラウザから [Open-Meteo](https://open-meteo.com/) へ、米国の地点では [National Weather Service](https://www.weather.gov/) へ直接送られます。位置情報を使う場合の逆ジオコーディングは BigDataCloud、失敗時は OpenStreetMap Nominatim です。ホスティングと Google Fonts は通常の技術的リクエストデータを見ることがあります。\n\nduskline はこの情報を販売しません。予報は計画と探索のためであり、緊急判断用ではありません。詳細は [プライバシーポリシー](PRIVACY) と [利用規約](TERMS)。',
  languagesH: '言語',
  languagesBody: 'アプリ内の言語選択と法務ページは同じ 30 ロケールと `duskline-lang` 設定を共有します。法務文面は `src/js/data/legal/packs/` にあります。これらの README 翻訳は [`docs/i18n/`]({i18n}) にあります。',
  devH: '開発',
  devIntro: '静的な HTML・CSS・クラシックスクリプトで、バンドラはありません。',
  check: '自前 JS の構文チェック: `npm run check`',
  unit: 'ユニットテスト: `npm run test:unit`',
  e2e: 'Playwright のスモークは天気 API をモックし、本番枠を消費しません: `npm test`',
  deployH: '公開',
  deployBody: 'リポジトリのルートがサイトです。想定の主ホストは [Cloudflare Pages](https://duskline.pages.dev/)、GitHub Pages は予備です。どちらも静的ファイルをそのまま公開します。',
  licenseH: 'ライセンス',
  licenseBody: 'コードは [MIT](../../LICENSE) です。天気データは上記の第三者に帰属し、各規約に従います。生命の安全や緊急用途ではありません。'
};

C.ko = {
  readIn: '언어',
  tagline: '무료 브라우저 전용 날씨 앱. 전 세계 도시 검색, 시간별 및 10일 전망, 대기질, 애니메이션 하늘, 미국 National Weather Service 예보와 경보.',
  openApp: 'duskline 열기', privacy: '개인정보 처리방침', terms: '이용약관',
  intro: '계정, 자체 백엔드, 광고 식별자가 없습니다. 언어, 단위, 즐겨찾기, 의도적으로 대략적인 저장 위치는 브라우저에 남습니다.',
  featuresH: '기능',
  features: [
    '전 세계 도시 검색, 키보드로 쓸 수 있는 제안',
    '즐겨찾기 저장과 선택적 위치 사용(좌표는 저장·전송 전에 반올림)',
    '현재 상태, 시간별 예보, 10일 전망',
    '대기질',
    '해당하는 미국 장소의 National Weather Service 예보와 공개 경보',
    '상세 보기의 애니메이션 하늘과 강수',
    '기온, 거리, 바람, 강수, 기압 단위',
    '아랍어와 히브리어(오른쪽에서 왼쪽)를 포함한 30개 인터페이스 언어'
  ],
  privacyH: '개인정보와 데이터',
  privacyBody: '날씨 요청은 브라우저에서 [Open-Meteo](https://open-meteo.com/)로, 미국 위치는 [National Weather Service](https://www.weather.gov/)로 바로 갑니다. 위치를 쓰면 역지오코딩은 BigDataCloud, 실패 시 OpenStreetMap Nominatim입니다. 호스팅과 Google Fonts는 일반적인 기술 요청 데이터를 볼 수 있습니다.\n\nduskline은 그 정보를 판매하지 않습니다. 예보는 계획과 탐색용이며 긴급 결정용이 아닙니다. 자세한 내용: [개인정보 처리방침](PRIVACY), [이용약관](TERMS).',
  languagesH: '언어',
  languagesBody: '앱의 언어 선택과 법률 페이지는 같은 30개 로케일과 `duskline-lang` 설정을 공유합니다. 법률 문구는 `src/js/data/legal/packs/`에 있습니다. 이 README 번역은 [`docs/i18n/`]({i18n})에 있습니다.',
  devH: '개발',
  devIntro: '정적 HTML, CSS, 클래식 스크립트이며 번들러가 없습니다.',
  check: '자체 JS 구문 검사: `npm run check`',
  unit: '단위 테스트: `npm run test:unit`',
  e2e: 'Playwright 스모크는 날씨 API를 모의하며 실제 할당량을 쓰지 않습니다: `npm test`',
  deployH: '배포',
  deployBody: '저장소 루트가 사이트입니다. 주 호스트는 [Cloudflare Pages](https://duskline.pages.dev/), GitHub Pages는 백업입니다. 둘 다 정적 파일을 그대로 게시합니다.',
  licenseH: '라이선스',
  licenseBody: '코드는 [MIT](../../LICENSE)입니다. 날씨 데이터는 위 제공업체의 것이며 해당 약관을 따릅니다. 생명 안전이나 긴급 용도가 아닙니다.'
};

C.zh = {
  readIn: '阅读语言',
  tagline: '免费的纯浏览器天气应用，用于日常查看与探索：全球城市搜索、逐小时与 10 日展望、空气质量、动态天空，以及增强的美国国家气象局预报与警报。',
  openApp: '打开 duskline', privacy: '隐私政策', terms: '使用条款',
  intro: '没有账户、没有自有后端、没有广告标识符。语言、单位、收藏以及有意降低精度的保存位置都留在浏览器中。',
  featuresH: '功能',
  features: [
    '搜索全球任意城市，支持键盘操作的建议',
    '保存收藏，可选使用位置（坐标在存储或发送前会取整）',
    '当前状况、逐小时预报与 10 日展望',
    '空气质量',
    '符合条件的美国地点可使用国家气象局预报与公共警报',
    '详细视图中的动态天空与降水',
    '温度、距离、风、降水与气压单位',
    '30 种界面语言，包括阿拉伯语和希伯来语（从右到左）'
  ],
  privacyH: '隐私与数据',
  privacyBody: '天气请求由浏览器直接发往 [Open-Meteo](https://open-meteo.com/)；美国地点发往 [国家气象局](https://www.weather.gov/)。若使用位置，反向地理编码发往 BigDataCloud，失败时回退到 OpenStreetMap Nominatim。托管与 Google Fonts 可能看到常规技术请求数据。\n\nduskline 不出售这些信息。预报用于规划与探索，不用于紧急决策。详情见 [隐私政策](PRIVACY) 与 [使用条款](TERMS)。',
  languagesH: '语言',
  languagesBody: '应用内选择器与法律页面共享同一套 30 种语言和 `duskline-lang` 偏好。法律文案在 `src/js/data/legal/packs/`。这些 README 译文在 [`docs/i18n/`]({i18n})。',
  devH: '开发',
  devIntro: '静态 HTML、CSS 与传统脚本，没有打包器。',
  check: '检查每个自有 JS 文件的语法：`npm run check`',
  unit: '单元测试：`npm run test:unit`',
  e2e: 'Playwright 冒烟测试会模拟天气 API，不消耗线上配额：`npm test`',
  deployH: '部署',
  deployBody: '仓库根目录就是站点。预定的主托管是 [Cloudflare Pages](https://duskline.pages.dev/)；GitHub Pages 为备份。两者都按原样发布静态文件。',
  licenseH: '许可',
  licenseBody: '代码为 [MIT](../../LICENSE)。天气数据属于上述第三方，并受其条款约束。不用于生命安全或紧急用途。'
};

C['zh-TW'] = {
  readIn: '閱讀語言',
  tagline: '免費的純瀏覽器天氣應用程式，用於日常查看與探索：全球城市搜尋、逐小時與 10 日展望、空氣品質、動態天空，以及強化的美國國家氣象局預報與警報。',
  openApp: '開啟 duskline', privacy: '隱私權政策', terms: '使用條款',
  intro: '沒有帳戶、沒有自有後端、沒有廣告識別碼。語言、單位、收藏以及刻意降低精度的儲存位置都留在瀏覽器中。',
  featuresH: '功能',
  features: [
    '搜尋全球任意城市，支援鍵盤操作的建議',
    '儲存收藏，可選擇使用位置（座標在儲存或傳送前會取整）',
    '目前狀況、逐小時預報與 10 日展望',
    '空氣品質',
    '符合條件的美國地點可使用國家氣象局預報與公開警報',
    '詳細檢視中的動態天空與降水',
    '溫度、距離、風、降水與氣壓單位',
    '30 種介面語言，包括阿拉伯文與希伯來文（從右到左）'
  ],
  privacyH: '隱私與資料',
  privacyBody: '天氣請求由瀏覽器直接發往 [Open-Meteo](https://open-meteo.com/)；美國地點發往 [國家氣象局](https://www.weather.gov/)。若使用位置，反向地理編碼發往 BigDataCloud，失敗時回退到 OpenStreetMap Nominatim。託管與 Google Fonts 可能看到一般技術請求資料。\n\nduskline 不出售這些資訊。預報用於規劃與探索，不用於緊急決策。詳情見 [隱私權政策](PRIVACY) 與 [使用條款](TERMS)。',
  languagesH: '語言',
  languagesBody: '應用程式內選擇器與法律頁面共享同一套 30 種語言和 `duskline-lang` 偏好。法律文案在 `src/js/data/legal/packs/`。這些 README 譯文在 [`docs/i18n/`]({i18n})。',
  devH: '開發',
  devIntro: '靜態 HTML、CSS 與傳統指令碼，沒有打包器。',
  check: '檢查每個自有 JS 檔的語法：`npm run check`',
  unit: '單元測試：`npm run test:unit`',
  e2e: 'Playwright 煙霧測試會模擬天氣 API，不消耗線上配額：`npm test`',
  deployH: '部署',
  deployBody: '儲存庫根目錄就是網站。預定的主要託管是 [Cloudflare Pages](https://duskline.pages.dev/)；GitHub Pages 為備份。兩者都按原樣發布靜態檔案。',
  licenseH: '授權',
  licenseBody: '程式碼為 [MIT](../../LICENSE)。天氣資料屬於上述第三方，並受其條款約束。不用於生命安全或緊急用途。'
};

function cloneFrom(src, over) {
  const base = C[src];
  const out = Object.assign({}, base, over);
  if (over.features) out.features = over.features;
  return out;
}

C.da = cloneFrom('nl', {
  readIn: 'Læs på',
  tagline: 'En gratis, browser-only vejrapp til at tjekke og udforske vejret: global bysøgning, time- og 10-dages udsigter, luftkvalitet, animerede forhold og forbedrede U.S. National Weather Service-udsigter og -advarsler.',
  openApp: 'Åbn duskline', privacy: 'Privatlivspolitik', terms: 'Brugsvilkår',
  intro: 'Ingen konto, intet eget backend og intet reklame-id. Sprog, enheder, favoritter og en bevidst omtrentlig gemt placering bliver i din browser.',
  featuresH: 'Funktioner',
  privacyH: 'Privatliv og data',
  languagesH: 'Sprog',
  devH: 'Udvikling',
  deployH: 'Udgivelse',
  licenseH: 'Licens',
  features: [
    'Søg efter en hvilken som helst by i verden, med tastaturvenlige forslag',
    'Gem favoritter og brug eventuelt din placering (koordinater afrundes før de gemmes eller sendes)',
    'Aktuelle forhold, timeudsigt og 10-dages overblik',
    'Luftkvalitet',
    'For berettigede amerikanske steder, udsigter og offentlige advarsler fra National Weather Service',
    'Animeret himmel og nedbør i detaljevisningen',
    'Enheder for temperatur, afstand, vind, nedbør og tryk',
    '30 grænsefladesprog, herunder arabisk og hebraisk (højre-til-venstre)'
  ],
  privacyBody: 'Vejrforespørgsler går fra din browser til [Open-Meteo](https://open-meteo.com/) og, for amerikanske steder, [National Weather Service](https://www.weather.gov/). Hvis du bruger placering, går omvendt geokodning til BigDataCloud og kan falde tilbage til OpenStreetMap Nominatim. Hosting og Google Fonts kan se almindelige tekniske forespørgselsdata.\n\nduskline sælger ikke de oplysninger. Udsigter er til planlægning og udforskning, ikke nødbeslutninger. Detaljer: [Privatlivspolitik](PRIVACY) og [Brugsvilkår](TERMS).',
  languagesBody: 'Vælgeren i appen og de juridiske sider deler de samme 30 sprog og indstillingen `duskline-lang`. Juridisk tekst ligger i `src/js/data/legal/packs/`. Disse README-oversættelser ligger i [`docs/i18n/`]({i18n}).',
  devIntro: 'Appen er statisk HTML, CSS og klassiske scripts — ingen bundler.',
  check: 'Syntakstjek af hver egen JS-fil: `npm run check`',
  unit: 'Enhedstest: `npm run test:unit`',
  e2e: 'Playwright-smokes mocker vejr-API’er og bruger ikke live-kvoter: `npm test`',
  deployBody: 'Lagerets rod er sitet. [Cloudflare Pages](https://duskline.pages.dev/) er den tilsigtede primære vært; GitHub Pages er backup. Begge udgiver de statiske filer som de er.',
  licenseBody: 'Koden er [MIT](../../LICENSE). Vejrdata tilhører tredjepartsudbyderne ovenfor og er underlagt deres vilkår. Ikke til livssikkerhed eller nødsituationer.'
});

C.sv = cloneFrom('da', {
  readIn: 'Läs på',
  tagline: 'En gratis väderapp som bara körs i webbläsaren, för att kolla och utforska vädret: global stadssökning, tim- och 10-dygnsutsikter, luftkvalitet, animerade förhållanden och utökade U.S. National Weather Service-prognoser och varningar.',
  openApp: 'Öppna duskline', privacy: 'Integritetspolicy', terms: 'Användarvillkor',
  intro: 'Inget konto, ingen egen backend, ingen reklamidentifierare. Språk, enheter, favoriter och en avsiktligt ungefärlig sparad plats stannar i webbläsaren.',
  featuresH: 'Funktioner',
  privacyH: 'Integritet och data',
  languagesH: 'Språk',
  devH: 'Utveckling',
  deployH: 'Publicering',
  licenseH: 'Licens',
  features: [
    'Sök vilken stad som helst i världen, med tangentbordsvänliga förslag',
    'Spara favoriter och använd valfritt din plats (koordinater avrundas innan de sparas eller skickas)',
    'Aktuella förhållanden, timprognos och 10-dygnsöversikt',
    'Luftkvalitet',
    'För berättigade amerikanska platser, prognoser och offentliga varningar från National Weather Service',
    'Animerad himmel och nederbörd i detaljvyn',
    'Enheter för temperatur, avstånd, vind, nederbörd och tryck',
    '30 gränssnittsspråk, inklusive arabiska och hebreiska (höger till vänster)'
  ],
  privacyBody: 'Väderförfrågningar går från webbläsaren till [Open-Meteo](https://open-meteo.com/) och, för amerikanska platser, [National Weather Service](https://www.weather.gov/). Om du använder plats går omvänd geokodning till BigDataCloud och kan falla tillbaka till OpenStreetMap Nominatim. Hosting och Google Fonts kan se vanliga tekniska förfrågningsdata.\n\nduskline säljer inte den informationen. Prognoser är till för planering och utforskning, inte nödlägesbeslut. Detaljer: [Integritetspolicy](PRIVACY) och [Användarvillkor](TERMS).',
  languagesBody: 'Väljaren i appen och de juridiska sidorna delar samma 30 språk och inställningen `duskline-lang`. Juridisk text finns i `src/js/data/legal/packs/`. Dessa README-översättningar finns i [`docs/i18n/`]({i18n}).',
  devIntro: 'Appen är statisk HTML, CSS och klassiska skript — ingen bundler.',
  check: 'Syntaxkontroll av varje egen JS-fil: `npm run check`',
  unit: 'Enhetstester: `npm run test:unit`',
  e2e: 'Playwright-smokes mockar väder-API:er och förbrukar inte livekvoter: `npm test`',
  deployBody: 'Förrådets rot är webbplatsen. [Cloudflare Pages](https://duskline.pages.dev/) är den avsedda primära värden; GitHub Pages är backup. Båda publicerar de statiska filerna som de är.',
  licenseBody: 'Koden är [MIT](../../LICENSE). Väderdata tillhör tredjepartsleverantörerna ovan och följer deras villkor. Inte för livssäkerhet eller nödsituationer.'
});

C.nb = cloneFrom('da', {
  readIn: 'Les på',
  tagline: 'En gratis værapp som bare kjører i nettleseren, for å sjekke og utforske været: globalt bysøk, time- og 10-dagersutsikter, luftkvalitet, animerte forhold og utvidede U.S. National Weather Service-varsler og advarsler.',
  openApp: 'Åpne duskline', privacy: 'Personvern', terms: 'Bruksvilkår',
  intro: 'Ingen konto, ingen egen backend, ingen reklameidentifikator. Språk, enheter, favoritter og en bevisst omtrentlig lagret posisjon blir i nettleseren.',
  featuresH: 'Funksjoner',
  privacyH: 'Personvern og data',
  languagesH: 'Språk',
  devH: 'Utvikling',
  deployH: 'Publisering',
  licenseH: 'Lisens',
  features: [
    'Søk etter hvilken som helst by i verden, med tastaturvennlige forslag',
    'Lagre favoritter og bruk eventuelt posisjonen (koordinater avrundes før de lagres eller sendes)',
    'Aktuelle forhold, timevarsel og 10-dagers oversikt',
    'Luftkvalitet',
    'For kvalifiserte amerikanske steder, varsler og offentlige advarsler fra National Weather Service',
    'Animert himmel og nedbør i detaljvisningen',
    'Enheter for temperatur, avstand, vind, nedbør og trykk',
    '30 grensesnittspråk, inkludert arabisk og hebraisk (høyre mot venstre)'
  ],
  privacyBody: 'Værforespørsler går fra nettleseren til [Open-Meteo](https://open-meteo.com/) og, for amerikanske steder, [National Weather Service](https://www.weather.gov/). Hvis du bruker posisjon, går omvendt geokoding til BigDataCloud og kan falle tilbake til OpenStreetMap Nominatim. Hosting og Google Fonts kan se vanlige tekniske forespørselsdata.\n\nduskline selger ikke den informasjonen. Varsler er til planlegging og utforskning, ikke nødavgjørelser. Detaljer: [Personvern](PRIVACY) og [Bruksvilkår](TERMS).',
  languagesBody: 'Velgeren i appen og de juridiske sidene deler de samme 30 språkene og innstillingen `duskline-lang`. Juridisk tekst ligger i `src/js/data/legal/packs/`. Disse README-oversettelsene ligger i [`docs/i18n/`]({i18n}).',
  devIntro: 'Appen er statisk HTML, CSS og klassiske skript — ingen bundler.',
  check: 'Syntakssjekk av hver egen JS-fil: `npm run check`',
  unit: 'Enhetstester: `npm run test:unit`',
  e2e: 'Playwright-smokes mocker vær-API-er og bruker ikke livekvoter: `npm test`',
  deployBody: 'Lagerets rot er nettstedet. [Cloudflare Pages](https://duskline.pages.dev/) er den tiltenkte primære verten; GitHub Pages er sikkerhetskopi. Begge publiserer de statiske filene som de er.',
  licenseBody: 'Koden er [MIT](../../LICENSE). Værdata tilhører tredjepartsleverandørene over og er underlagt vilkårene deres. Ikke for livssikkerhet eller nødsituasjoner.'
});

C.fi = cloneFrom('nl', {
  readIn: 'Lue kielellä',
  tagline: 'Ilmainen, vain selaimessa toimiva sääsovellus säätilan tarkistamiseen ja tutkimiseen: maailmanlaajuinen kaupunkihaku, tunti- ja 10 päivän näkymät, ilmanlaatu, animoidut olosuhteet sekä täydennetyt U.S. National Weather Service -ennusteet ja -varoitukset.',
  openApp: 'Avaa duskline', privacy: 'Tietosuojakäytäntö', terms: 'Käyttöehdot',
  intro: 'Ei tiliä, ei omaa taustajärjestelmää, ei mainostunnistetta. Kieli, yksiköt, suosikit ja tahallaan karkea tallennettu sijainti jäävät selaimeen.',
  featuresH: 'Ominaisuudet',
  privacyH: 'Tietosuoja ja tiedot',
  languagesH: 'Kielet',
  devH: 'Kehitys',
  deployH: 'Julkaisu',
  licenseH: 'Lisenssi',
  features: [
    'Hae mitä tahansa kaupunkia maailmassa, näppäimistöystävällisillä ehdotuksilla',
    'Tallenna suosikkeja ja käytä halutessasi sijaintia (koordinaatit pyöristetään ennen tallennusta tai lähetystä)',
    'Nykyiset olosuhteet, tunti-ennuste ja 10 päivän näkymä',
    'Ilmanlaatu',
    'Kelpoisissa Yhdysvaltain paikoissa National Weather Servicen ennusteet ja julkiset varoitukset',
    'Animoitu taivas ja sade yksityiskohtanäkymässä',
    'Lämpötilan, etäisyyden, tuulen, sateen ja paineen yksiköt',
    '30 käyttöliittymäkieltä, mukaan lukien arabia ja heprea (oikealta vasemmalle)'
  ],
  privacyBody: 'Sääpyynnöt lähtevät selaimesta [Open-Meteoon](https://open-meteo.com/) ja Yhdysvaltain sijainneissa [National Weather Serviceen](https://www.weather.gov/). Jos käytät sijaintia, käänteinen geokoodaus menee BigDataCloudille ja voi siirtyä OpenStreetMap Nominatimiin. Isännöinti ja Google Fonts voivat nähdä tavanomaisia teknisiä pyyntötietoja.\n\nduskline ei myy näitä tietoja. Ennusteet ovat suunnittelua ja tutkimista varten, eivät hätäpäätöksiä. Tiedot: [Tietosuojakäytäntö](PRIVACY) ja [Käyttöehdot](TERMS).',
  languagesBody: 'Sovelluksen valitsin ja oikeudelliset sivut jakavat samat 30 kieltä ja `duskline-lang`-asetuksen. Oikeudelliset tekstit ovat kansiossa `src/js/data/legal/packs/`. Nämä README-käännökset ovat kansiossa [`docs/i18n/`]({i18n}).',
  devIntro: 'Sovellus on staattista HTML:ää, CSS:ää ja klassisia skriptejä — ei bundleria.',
  check: 'Jokaisen oman JS-tiedoston syntaksin tarkistus: `npm run check`',
  unit: 'Yksikkötestit: `npm run test:unit`',
  e2e: 'Playwright-savutestit simuloivat säärajapintoja eivätkä kuluta live-kiintiöitä: `npm test`',
  deployBody: 'Tietovaraston juuri on sivusto. [Cloudflare Pages](https://duskline.pages.dev/) on tarkoitettu pääisäntä; GitHub Pages on varmuuskopio. Molemmat julkaisevat staattiset tiedostot sellaisinaan.',
  licenseBody: 'Koodi on [MIT](../../LICENSE). Säätiedot kuuluvat yllä oleville kolmansille osapuolille ja noudattavat heidän ehtojaan. Ei henkeä uhkaaviin tai hätätilanteisiin.'
});

C.pl = cloneFrom('es', {
  readIn: 'Czytaj po',
  tagline: 'Darmowa, wyłącznie przeglądarkowa aplikacja pogodowa do sprawdzania i odkrywania pogody: światowe wyszukiwanie miast, widoki godzinowe i 10-dniowe, jakość powietrza, animowane warunki oraz rozszerzone prognozy i alerty U.S. National Weather Service.',
  openApp: 'Otwórz duskline', privacy: 'Polityka prywatności', terms: 'Warunki korzystania',
  intro: 'Bez konta, bez własnego backendu, bez identyfikatora reklamowego. Język, jednostki, ulubione i celowo przybliżona zapisana lokalizacja zostają w przeglądarce.',
  featuresH: 'Funkcje',
  privacyH: 'Prywatność i dane',
  languagesH: 'Języki',
  devH: 'Rozwój',
  deployH: 'Wdrożenie',
  licenseH: 'Licencja',
  features: [
    'Szukaj dowolnego miasta na świecie, z podpowiedziami wygodnymi z klawiatury',
    'Zapisuj ulubione i opcjonalnie używaj lokalizacji (współrzędne są zaokrąglane przed zapisem lub wysłaniem)',
    'Aktualne warunki, prognoza godzinowa i perspektywa 10-dniowa',
    'Jakość powietrza',
    'Dla kwalifikujących się miejsc w USA prognozy i publiczne alerty National Weather Service',
    'Animowane niebo i opady w widoku szczegółowym',
    'Jednostki temperatury, odległości, wiatru, opadów i ciśnienia',
    '30 języków interfejsu, w tym arabski i hebrajski (od prawej do lewej)'
  ],
  privacyBody: 'Żądania pogodowe wychodzą z przeglądarki do [Open-Meteo](https://open-meteo.com/) oraz, dla lokalizacji w USA, do [National Weather Service](https://www.weather.gov/). Jeśli używasz lokalizacji, odwrotne geokodowanie idzie do BigDataCloud i może wrócić do OpenStreetMap Nominatim. Hosting i Google Fonts mogą widzieć zwykłe techniczne dane żądania.\n\nduskline nie sprzedaje tych informacji. Prognozy służą planowaniu i eksploracji, nie decyzjom awaryjnym. Szczegóły: [Polityka prywatności](PRIVACY) i [Warunki korzystania](TERMS).',
  languagesBody: 'Selektor w aplikacji i strony prawne współdzielą te same 30 języków i preferencję `duskline-lang`. Teksty prawne są w `src/js/data/legal/packs/`. Te tłumaczenia README są w [`docs/i18n/`]({i18n}).',
  devIntro: 'Aplikacja to statyczny HTML, CSS i klasyczne skrypty — bez bundlera.',
  check: 'Sprawdzenie składni każdego własnego JS: `npm run check`',
  unit: 'Testy jednostkowe: `npm run test:unit`',
  e2e: 'Smoke Playwright mockuje API pogodowe i nie zużywa żywych limitów: `npm test`',
  deployBody: 'Korzeń repozytorium jest witryną. [Cloudflare Pages](https://duskline.pages.dev/) to planowany główny host; GitHub Pages to kopia zapasowa. Oba publikują pliki statyczne bez zmian.',
  licenseBody: 'Kod jest na licencji [MIT](../../LICENSE). Dane pogodowe należą do wymienionych dostawców i podlegają ich warunkom. Nie do bezpieczeństwa życia ani sytuacji awaryjnych.'
});

C.cs = cloneFrom('pl', {
  readIn: 'Číst v jazyce',
  tagline: 'Bezplatná, pouze prohlížečová meteorologická aplikace ke kontrole a zkoumání počasí: celosvětové hledání měst, hodinové a 10denní výhledy, kvalita ovzduší, animované podmínky a rozšířené předpovědi a výstrahy U.S. National Weather Service.',
  openApp: 'Otevřít duskline', privacy: 'Zásady ochrany soukromí', terms: 'Podmínky použití',
  intro: 'Žádný účet, žádný vlastní backend, žádný reklamní identifikátor. Jazyk, jednotky, oblíbené položky a záměrně přibližná uložená poloha zůstanou v prohlížeči.',
  featuresH: 'Funkce',
  privacyH: 'Soukromí a data',
  languagesH: 'Jazyky',
  devH: 'Vývoj',
  deployH: 'Nasazení',
  licenseH: 'Licence',
  features: [
    'Hledejte libovolné město na světě, s návrhy ovladatelnými z klávesnice',
    'Ukládejte oblíbené a volitelně použijte polohu (souřadnice se zaokrouhlují před uložením nebo odesláním)',
    'Aktuální podmínky, hodinová předpověď a 10denní výhled',
    'Kvalita ovzduší',
    'Pro způsobilá americká místa předpovědi a veřejné výstrahy National Weather Service',
    'Animovaná obloha a srážky v podrobném zobrazení',
    'Jednotky teploty, vzdálenosti, větru, srážek a tlaku',
    '30 jazyků rozhraní včetně arabštiny a hebrejštiny (zprava doleva)'
  ],
  privacyBody: 'Požadavky na počasí odcházejí z prohlížeče na [Open-Meteo](https://open-meteo.com/) a u amerických míst na [National Weather Service](https://www.weather.gov/). Pokud použijete polohu, reverzní geokódování jde na BigDataCloud a může spadnout na OpenStreetMap Nominatim. Hosting a Google Fonts mohou vidět běžná technická data požadavku.\n\nduskline tyto informace neprodává. Předpovědi slouží k plánování a zkoumání, ne k nouzovým rozhodnutím. Podrobnosti: [Zásady ochrany soukromí](PRIVACY) a [Podmínky použití](TERMS).',
  languagesBody: 'Přepínač v aplikaci a právní stránky sdílejí stejných 30 jazyků a předvolbu `duskline-lang`. Právní texty jsou v `src/js/data/legal/packs/`. Tyto překlady README jsou v [`docs/i18n/`]({i18n}).',
  devIntro: 'Aplikace je statické HTML, CSS a klasické skripty — bez bundleru.',
  check: 'Kontrola syntaxe každého vlastního JS: `npm run check`',
  unit: 'Jednotkové testy: `npm run test:unit`',
  e2e: 'Playwright smoke testy mockují meteorologická API a nespotřebovávají živé kvóty: `npm test`',
  deployBody: 'Kořen repozitáře je web. [Cloudflare Pages](https://duskline.pages.dev/) je zamýšlený hlavní hostitel; GitHub Pages je záloha. Oba publikují statické soubory beze změny.',
  licenseBody: 'Kód je [MIT](../../LICENSE). Data o počasí patří výše uvedeným poskytovatelům a podléhají jejich podmínkám. Ne pro životní bezpečnost ani nouzové použití.'
});

C.hu = cloneFrom('pl', {
  readIn: 'Olvasás nyelve',
  tagline: 'Ingyenes, csak böngészős időjárás-alkalmazás a mindennapi ellenőrzéshez és felfedezéshez: világszintű városkeresés, óránkénti és 10 napos kilátás, levegőminőség, animált viszonyok, valamint bővített U.S. National Weather Service előrejelzések és riasztások.',
  openApp: 'duskline megnyitása', privacy: 'Adatvédelmi szabályzat', terms: 'Felhasználási feltételek',
  intro: 'Nincs fiók, nincs saját háttérrendszer, nincs hirdetési azonosító. A nyelv, az egységek, a kedvencek és egy szándékosan hozzávetőleges mentett hely a böngészőben marad.',
  featuresH: 'Funkciók',
  privacyH: 'Adatvédelem és adatok',
  languagesH: 'Nyelvek',
  devH: 'Fejlesztés',
  deployH: 'Közzététel',
  licenseH: 'Licenc',
  features: [
    'Keressen bármely várost a világon, billentyűzettel használható javaslatokkal',
    'Mentse a kedvenceket, és opcionálisan használja a helyzetét (a koordinátákat mentés vagy küldés előtt kerekítjük)',
    'Jelenlegi viszonyok, óránkénti előrejelzés és 10 napos kilátás',
    'Levegőminőség',
    'Jogosult amerikai helyeken a National Weather Service előrejelzései és nyilvános riasztásai',
    'Animált ég és csapadék a részletes nézetben',
    'Hőmérséklet, távolság, szél, csapadék és nyomás egységei',
    '30 felületi nyelv, köztük az arab és a héber (jobbról balra)'
  ],
  privacyBody: 'Az időjárási kérések a böngészőből mennek az [Open-Meteo](https://open-meteo.com/) felé, amerikai helyeken a [National Weather Service](https://www.weather.gov/) felé. Ha helyzetet használ, a fordított geokódolás a BigDataCloudhoz megy, és visszaeshet az OpenStreetMap Nominatimre. A tárhely és a Google Fonts láthatja a szokásos technikai kérésadatokat.\n\nA duskline nem adja el ezeket az információkat. Az előrejelzések tervezésre és felfedezésre valók, nem vészhelyzeti döntésekre. Részletek: [Adatvédelmi szabályzat](PRIVACY) és [Felhasználási feltételek](TERMS).',
  languagesBody: 'Az alkalmazás választója és a jogi oldalak ugyanazt a 30 nyelvet és a `duskline-lang` beállítást használják. A jogi szövegek a `src/js/data/legal/packs/` mappában vannak. Ezek a README-fordítások a [`docs/i18n/`]({i18n}) mappában vannak.',
  devIntro: 'Az alkalmazás statikus HTML, CSS és klasszikus scriptek — nincs bundler.',
  check: 'Minden saját JS szintaxisellenőrzése: `npm run check`',
  unit: 'Egységtesztek: `npm run test:unit`',
  e2e: 'A Playwright füsttesztek mockolják az időjárási API-kat, és nem fogyasztanak élő kvótát: `npm test`',
  deployBody: 'A tároló gyökere a webhely. A [Cloudflare Pages](https://duskline.pages.dev/) a tervezett elsődleges host; a GitHub Pages a biztonsági másolat. Mindkettő változatlanul közzéteszi a statikus fájlokat.',
  licenseBody: 'A kód [MIT](../../LICENSE). Az időjárási adatok a fenti harmadik feleké, és az ő feltételeik vonatkoznak rájuk. Nem életbiztonsági vagy vészhelyzeti használatra.'
});

C.ro = cloneFrom('es', {
  readIn: 'Citește în',
  tagline: 'O aplicație meteo gratuită, doar în browser, pentru verificarea și explorarea vremii: căutare mondială de orașe, perspective orare și pe 10 zile, calitatea aerului, condiții animate și prognoze și alerte îmbunătățite de la U.S. National Weather Service.',
  openApp: 'Deschide duskline', privacy: 'Politica de confidențialitate', terms: 'Termeni de utilizare',
  intro: 'Fără cont, fără backend propriu, fără identificator publicitar. Limba, unitățile, favoritele și o locație salvată intenționat aproximativă rămân în browser.',
  featuresH: 'Funcții',
  privacyH: 'Confidențialitate și date',
  languagesH: 'Limbi',
  devH: 'Dezvoltare',
  deployH: 'Publicare',
  licenseH: 'Licență',
  features: [
    'Căutați orice oraș din lume, cu sugestii ușor de folosit de la tastatură',
    'Salvați favorite și, opțional, folosiți locația (coordonatele sunt rotunjite înainte de a fi stocate sau trimise)',
    'Condiții actuale, prognoză orară și perspectivă pe 10 zile',
    'Calitatea aerului',
    'Pentru locuri din SUA eligibile, prognoze și alerte publice de la National Weather Service',
    'Cer și precipitații animate în vederea detaliată',
    'Unități de temperatură, distanță, vânt, precipitații și presiune',
    '30 de limbi de interfață, inclusiv arabă și ebraică (de la dreapta la stânga)'
  ],
  privacyBody: 'Cererile meteo pleacă din browser către [Open-Meteo](https://open-meteo.com/) și, pentru locații din SUA, [National Weather Service](https://www.weather.gov/). Dacă folosiți locația, geocodarea inversă merge la BigDataCloud și poate trece la OpenStreetMap Nominatim. Găzduirea și Google Fonts pot vedea date tehnice obișnuite ale cererii.\n\nduskline nu vinde aceste informații. Prognozele sunt pentru planificare și explorare, nu pentru decizii de urgență. Detalii: [Politica de confidențialitate](PRIVACY) și [Termeni de utilizare](TERMS).',
  languagesBody: 'Selectorul din aplicație și paginile legale împart aceleași 30 de limbi și preferința `duskline-lang`. Textele legale sunt în `src/js/data/legal/packs/`. Aceste traduceri ale README sunt în [`docs/i18n/`]({i18n}).',
  devIntro: 'Aplicația este HTML, CSS și scripturi clasice statice — fără bundler.',
  check: 'Verificarea sintaxei fiecărui JS propriu: `npm run check`',
  unit: 'Teste unitare: `npm run test:unit`',
  e2e: 'Smoke-urile Playwright simulează API-urile meteo și nu consumă cote reale: `npm test`',
  deployBody: 'Rădăcina depozitului este situl. [Cloudflare Pages](https://duskline.pages.dev/) este gazda principală prevăzută; GitHub Pages este copia de rezervă. Ambele publică fișierele statice ca atare.',
  licenseBody: 'Codul este [MIT](../../LICENSE). Datele meteo aparțin furnizorilor de mai sus și rămân supuse termenilor lor. Nu pentru siguranța vieții sau urgențe.'
});

C.el = cloneFrom('es', {
  readIn: 'Διαβάστε στα',
  tagline: 'Μια δωρεάν εφαρμογή καιρού μόνο στο πρόγραμμα περιήγησης, για καθημερινό έλεγχο και εξερεύνηση: παγκόσμια αναζήτηση πόλεων, ωριαίες και 10ήμερες προοπτικές, ποιότητα αέρα, κινούμενες συνθήκες και ενισχυμένες προγνώσεις και ειδοποιήσεις του U.S. National Weather Service.',
  openApp: 'Άνοιγμα duskline', privacy: 'Πολιτική απορρήτου', terms: 'Όροι χρήσης',
  intro: 'Χωρίς λογαριασμό, χωρίς δικό μας backend, χωρίς αναγνωριστικό διαφήμισης. Η γλώσσα, οι μονάδες, τα αγαπημένα και μια σκόπιμα προσεγγιστική αποθηκευμένη τοποθεσία μένουν στο πρόγραμμα περιήγησης.',
  featuresH: 'Δυνατότητες',
  privacyH: 'Απόρρητο και δεδομένα',
  languagesH: 'Γλώσσες',
  devH: 'Ανάπτυξη',
  deployH: 'Δημοσίευση',
  licenseH: 'Άδεια',
  features: [
    'Αναζητήστε οποιαδήποτε πόλη στον κόσμο, με προτάσεις φιλικές προς το πληκτρολόγιο',
    'Αποθηκεύστε αγαπημένα και προαιρετικά χρησιμοποιήστε την τοποθεσία (οι συντεταγμένες στρογγυλοποιούνται πριν αποθηκευτούν ή σταλούν)',
    'Τρέχουσες συνθήκες, ωριαία πρόγνωση και ορίζοντας 10 ημερών',
    'Ποιότητα αέρα',
    'Για επιλέξιμα μέρη των ΗΠΑ, προγνώσεις και δημόσιες ειδοποιήσεις του National Weather Service',
    'Κινούμενος ουρανός και υετός στην αναλυτική προβολή',
    'Μονάδες θερμοκρασίας, απόστασης, ανέμου, υετού και πίεσης',
    '30 γλώσσες διεπαφής, συμπεριλαμβανομένων αραβικών και εβραϊκών (δεξιά προς τα αριστερά)'
  ],
  privacyBody: 'Τα αιτήματα καιρού φεύγουν από το πρόγραμμα περιήγησης προς το [Open-Meteo](https://open-meteo.com/) και, για τοποθεσίες στις ΗΠΑ, το [National Weather Service](https://www.weather.gov/). Αν χρησιμοποιείτε τοποθεσία, η αντίστροφη γεωκωδικοποίηση πηγαίνει στο BigDataCloud και μπορεί να καταλήξει στο OpenStreetMap Nominatim. Η φιλοξενία και το Google Fonts μπορεί να βλέπουν συνήθη τεχνικά δεδομένα αιτήματος.\n\nΤο duskline δεν πουλά αυτές τις πληροφορίες. Οι προγνώσεις είναι για σχεδιασμό και εξερεύνηση, όχι για αποφάσεις έκτακτης ανάγκης. Λεπτομέρειες: [Πολιτική απορρήτου](PRIVACY) και [Όροι χρήσης](TERMS).',
  languagesBody: 'Ο επιλογέας στην εφαρμογή και οι νομικές σελίδες μοιράζονται τις ίδιες 30 γλώσσες και την προτίμηση `duskline-lang`. Τα νομικά κείμενα είναι στο `src/js/data/legal/packs/`. Αυτές οι μεταφράσεις README είναι στο [`docs/i18n/`]({i18n}).',
  devIntro: 'Η εφαρμογή είναι στατικό HTML, CSS και κλασικά σενάρια — χωρίς bundler.',
  check: 'Έλεγχος σύνταξης κάθε δικού μας JS: `npm run check`',
  unit: 'Μοναδιαίες δοκιμές: `npm run test:unit`',
  e2e: 'Τα smoke του Playwright προσομοιώνουν τα API καιρού και δεν καταναλώνουν ζωντανές ποσοστώσεις: `npm test`',
  deployBody: 'Η ρίζα του αποθετηρίου είναι ο ιστότοπος. Το [Cloudflare Pages](https://duskline.pages.dev/) είναι ο προβλεπόμενος κύριος οικοδεσπότης· το GitHub Pages είναι το αντίγραφο ασφαλείας. Και τα δύο δημοσιεύουν τα στατικά αρχεία ως έχουν.',
  licenseBody: 'Ο κώδικας είναι [MIT](../../LICENSE). Τα δεδομένα καιρού ανήκουν στους παραπάνω τρίτους και υπόκεινται στους όρους τους. Όχι για ασφάλεια ζωής ή έκτακτη ανάγκη.'
});

C.tr = cloneFrom('es', {
  readIn: 'Dil',
  tagline: 'Ücretsiz, yalnızca tarayıcıda çalışan bir hava durumu uygulaması: dünya çapında şehir araması, saatlik ve 10 günlük görünüm, hava kalitesi, animasyonlu koşullar ve geliştirilmiş U.S. National Weather Service tahminleri ile uyarıları.',
  openApp: 'duskline’ı aç', privacy: 'Gizlilik Politikası', terms: 'Kullanım Koşulları',
  intro: 'Hesap yok, kendi arka ucumuz yok, reklam tanımlayıcısı yok. Dil, birimler, favoriler ve kasıtlı olarak yaklaşık kaydedilmiş konum tarayıcınızda kalır.',
  featuresH: 'Özellikler',
  privacyH: 'Gizlilik ve veriler',
  languagesH: 'Diller',
  devH: 'Geliştirme',
  deployH: 'Yayımlama',
  licenseH: 'Lisans',
  features: [
    'Dünyadaki herhangi bir şehri arayın, klavyeyle kullanılabilir önerilerle',
    'Favorileri kaydedin ve isteğe bağlı konum kullanın (koordinatlar saklanmadan veya gönderilmeden önce yuvarlanır)',
    'Güncel koşullar, saatlik tahmin ve 10 günlük görünüm',
    'Hava kalitesi',
    'Uygun ABD yerleri için National Weather Service tahminleri ve kamuya açık uyarılar',
    'Ayrıntılı görünümde animasyonlu gökyüzü ve yağış',
    'Sıcaklık, mesafe, rüzgar, yağış ve basınç birimleri',
    'Arapça ve İbranice (sağdan sola) dahil 30 arayüz dili'
  ],
  privacyBody: 'Hava istekleri tarayıcınızdan [Open-Meteo](https://open-meteo.com/)’ya ve ABD konumları için [National Weather Service](https://www.weather.gov/)’e gider. Konum kullanırsanız ters jeokodlama BigDataCloud’a gider, başarısız olursa OpenStreetMap Nominatim’e düşebilir. Barındırma ve Google Fonts olağan teknik istek verilerini görebilir.\n\nduskline bu bilgileri satmaz. Tahminler planlama ve keşif içindir, acil durum kararları için değil. Ayrıntılar: [Gizlilik Politikası](PRIVACY) ve [Kullanım Koşulları](TERMS).',
  languagesH: 'Diller',
  languagesBody: 'Uygulamadaki seçici ve yasal sayfalar aynı 30 dili ve `duskline-lang` tercihini paylaşır. Yasal metinler `src/js/data/legal/packs/` altındadır. Bu README çevirileri [`docs/i18n/`]({i18n}) altındadır.',
  devIntro: 'Uygulama statik HTML, CSS ve klasik betiklerdir — paketleyici yoktur.',
  check: 'Her birinci taraf JS dosyasının sözdizimi denetimi: `npm run check`',
  unit: 'Birim testleri: `npm run test:unit`',
  e2e: 'Playwright duman testleri hava API’lerini sahteleyerek canlı kotayı tüketmez: `npm test`',
  deployBody: 'Depo kökü sitedir. [Cloudflare Pages](https://duskline.pages.dev/) amaçlanan birincil barındırıcıdır; GitHub Pages yedektir. İkisi de statik dosyaları olduğu gibi yayımlar.',
  licenseBody: 'Kod [MIT](../../LICENSE) lisanslıdır. Hava verileri yukarıdaki üçüncü taraflara aittir ve onların koşullarına tabidir. Can güvenliği veya acil kullanım için değildir.'
});

C.ru = cloneFrom('es', {
  readIn: 'Читать на',
  tagline: 'Бесплатное погодное приложение только в браузере: поиск городов по всему миру, почасовой и 10-дневный обзор, качество воздуха, анимированные условия и расширенные прогнозы и предупреждения U.S. National Weather Service.',
  openApp: 'Открыть duskline', privacy: 'Политика конфиденциальности', terms: 'Условия использования',
  intro: 'Нет аккаунта, нет своего бэкенда, нет рекламного идентификатора. Язык, единицы, избранное и намеренно приблизительное сохранённое местоположение остаются в браузере.',
  featuresH: 'Возможности',
  privacyH: 'Конфиденциальность и данные',
  languagesH: 'Языки',
  devH: 'Разработка',
  deployH: 'Публикация',
  licenseH: 'Лицензия',
  features: [
    'Ищите любой город мира, с удобными для клавиатуры подсказками',
    'Сохраняйте избранное и при желании используйте местоположение (координаты округляются до сохранения или отправки)',
    'Текущие условия, почасовой прогноз и 10-дневный обзор',
    'Качество воздуха',
    'Для подходящих мест в США — прогнозы и публичные предупреждения National Weather Service',
    'Анимированное небо и осадки в подробном виде',
    'Единицы температуры, расстояния, ветра, осадков и давления',
    '30 языков интерфейса, включая арабский и иврит (справа налево)'
  ],
  privacyBody: 'Погодные запросы уходят из браузера в [Open-Meteo](https://open-meteo.com/) и для мест в США — в [National Weather Service](https://www.weather.gov/). Если вы используете местоположение, обратное геокодирование идёт в BigDataCloud и может перейти к OpenStreetMap Nominatim. Хостинг и Google Fonts могут видеть обычные технические данные запроса.\n\nduskline не продаёт эту информацию. Прогнозы нужны для планирования и изучения, а не для экстренных решений. Подробности: [Политика конфиденциальности](PRIVACY) и [Условия использования](TERMS).',
  languagesBody: 'Выбор языка в приложении и юридические страницы используют те же 30 локалей и настройку `duskline-lang`. Юридические тексты лежат в `src/js/data/legal/packs/`. Эти переводы README — в [`docs/i18n/`]({i18n}).',
  devIntro: 'Приложение — статичные HTML, CSS и классические скрипты, без сборщика.',
  check: 'Проверка синтаксиса каждого своего JS: `npm run check`',
  unit: 'Модульные тесты: `npm run test:unit`',
  e2e: 'Smoke Playwright подменяют погодные API и не расходуют живые квоты: `npm test`',
  deployBody: 'Корень репозитория и есть сайт. [Cloudflare Pages](https://duskline.pages.dev/) — основной хост; GitHub Pages — запасной. Оба публикуют статические файлы как есть.',
  licenseBody: 'Код под [MIT](../../LICENSE). Погодные данные принадлежат указанным поставщикам и подчиняются их условиям. Не для безопасности жизни и не для чрезвычайных ситуаций.'
});

C.uk = cloneFrom('ru', {
  readIn: 'Читати мовою',
  tagline: 'Безкоштовний погодний застосунок лише в браузері: пошук міст у всьому світі, погодинний і 10-денний огляд, якість повітря, анімовані умови та розширені прогнози й попередження U.S. National Weather Service.',
  openApp: 'Відкрити duskline', privacy: 'Політика конфіденційності', terms: 'Умови використання',
  intro: 'Немає облікового запису, власного бекенду чи рекламного ідентифікатора. Мова, одиниці, обране та навмисно наближене збережене місцезнаходження лишаються в браузері.',
  featuresH: 'Можливості',
  privacyH: 'Конфіденційність і дані',
  languagesH: 'Мови',
  devH: 'Розробка',
  deployH: 'Публікація',
  licenseH: 'Ліцензія',
  features: [
    'Шукайте будь-яке місто світу, з підказками зручними для клавіатури',
    'Зберігайте обране й за бажанням використовуйте місцезнаходження (координати округлюються перед збереженням або надсиланням)',
    'Поточні умови, погодинний прогноз і 10-денний огляд',
    'Якість повітря',
    'Для відповідних місць у США — прогнози й публічні попередження National Weather Service',
    'Анімоване небо й опади в докладному вигляді',
    'Одиниці температури, відстані, вітру, опадів і тиску',
    '30 мов інтерфейсу, зокрема арабська та іврит (справа наліво)'
  ],
  privacyBody: 'Погодні запити виходять із браузера до [Open-Meteo](https://open-meteo.com/) і для місць у США — до [National Weather Service](https://www.weather.gov/). Якщо ви використовуєте місцезнаходження, зворотне геокодування йде до BigDataCloud і може перейти до OpenStreetMap Nominatim. Хостинг і Google Fonts можуть бачити звичайні технічні дані запиту.\n\nduskline не продає цю інформацію. Прогнози потрібні для планування й дослідження, а не для екстрених рішень. Подробиці: [Політика конфіденційності](PRIVACY) і [Умови використання](TERMS).',
  languagesBody: 'Вибір мови в застосунку та юридичні сторінки використовують ті самі 30 локалей і налаштування `duskline-lang`. Юридичні тексти лежать у `src/js/data/legal/packs/`. Ці переклади README — у [`docs/i18n/`]({i18n}).',
  devIntro: 'Застосунок — статичні HTML, CSS і класичні скрипти, без збирача.',
  check: 'Перевірка синтаксису кожного власного JS: `npm run check`',
  unit: 'Модульні тести: `npm run test:unit`',
  e2e: 'Smoke Playwright підміняють погодні API й не витрачають живі квоти: `npm test`',
  deployBody: 'Корінь репозиторію і є сайт. [Cloudflare Pages](https://duskline.pages.dev/) — основний хост; GitHub Pages — запасний. Обидва публікують статичні файли як є.',
  licenseBody: 'Код під [MIT](../../LICENSE). Погодні дані належать зазначеним постачальникам і підлягають їхнім умовам. Не для безпеки життя й не для надзвичайних ситуацій.'
});

C.ar = cloneFrom('es', {
  readIn: 'اقرأ باللغة',
  tagline: 'تطبيق طقس مجاني يعمل في المتصفح فقط للاطلاع والاستكشاف: بحث عالمي عن المدن، توقعات ساعية ولعشرة أيام، جودة الهواء، أحوال متحركة، وتوقعات وتنبيهات محسّنة من U.S. National Weather Service.',
  openApp: 'فتح duskline', privacy: 'سياسة الخصوصية', terms: 'شروط الاستخدام',
  intro: 'لا حساب ولا خلفية خاصة بنا ولا معرّف إعلاني. تبقى اللغة والوحدات والمفضّلات وموقع محفوظ تقريبًا عن قصد في متصفحك.',
  featuresH: 'الميزات',
  privacyH: 'الخصوصية والبيانات',
  languagesH: 'اللغات',
  devH: 'التطوير',
  deployH: 'النشر',
  licenseH: 'الترخيص',
  features: [
    'ابحث عن أي مدينة في العالم، مع اقتراحات سهلة للوحة المفاتيح',
    'احفظ المفضّلات واستخدم موقعك اختياريًا (تُقرَّب الإحداثيات قبل الحفظ أو الإرسال)',
    'الظروف الحالية والتوقع الساعي والأفق لعشرة أيام',
    'جودة الهواء',
    'للأماكن الأمريكية المؤهّلة، توقعات وتنبيهات عامة من National Weather Service',
    'سماء وهطول متحركان في العرض التفصيلي',
    'وحدات الحرارة والمسافة والرياح والهطول والضغط',
    '30 لغة للواجهة، منها العربية والعبرية (من اليمين إلى اليسار)'
  ],
  privacyBody: 'تغادر طلبات الطقس متصفحك إلى [Open-Meteo](https://open-meteo.com/) وإلى [National Weather Service](https://www.weather.gov/) للمواقع الأمريكية. إن استخدمت الموقع، يذهب الترميز الجغرافي العكسي إلى BigDataCloud وقد يعود إلى OpenStreetMap Nominatim. قد ترى الاستضافة وGoogle Fonts بيانات تقنية معتادة للطلب.\n\nلا يبيع duskline هذه المعلومات. التوقعات للتخطيط والاستكشاف لا لقرارات الطوارئ. التفاصيل: [سياسة الخصوصية](PRIVACY) و[شروط الاستخدام](TERMS).',
  languagesBody: 'منتقي التطبيق والصفحات القانونية يشتركان في اللغات الثلاثين نفسها وتفضيل `duskline-lang`. النصوص القانونية في `src/js/data/legal/packs/`. ترجمات README هذه في [`docs/i18n/`]({i18n}).',
  devIntro: 'التطبيق HTML وCSS ونصوص تقليدية ثابتة — بلا حزمة بناء.',
  check: 'فحص صياغة كل ملف JS خاص: `npm run check`',
  unit: 'اختبارات الوحدة: `npm run test:unit`',
  e2e: 'اختبارات Playwright تحاكي واجهات الطقس ولا تستهلك الحصص الحيّة: `npm test`',
  deployBody: 'جذر المستودع هو الموقع. [Cloudflare Pages](https://duskline.pages.dev/) هو المضيف الأساسي المقصود؛ GitHub Pages للنسخ الاحتياطي. كلاهما ينشر الملفات الثابتة كما هي.',
  licenseBody: 'الرمز مرخّص [MIT](../../LICENSE). بيانات الطقس تخصّ المزوّدين أعلاه وتخضع لشروطهم. ليست لسلامة الأرواح أو الطوارئ.'
});

C.he = cloneFrom('es', {
  readIn: 'קראו ב',
  tagline: 'יישום מזג אוויר חינמי שרץ רק בדפדפן, לבדיקה ולחקירה: חיפוש ערים עולמי, תחזיות שעתיות ו־10 ימים, איכות אוויר, תנאים מונפשים ותחזיות והתראות משופרות של U.S. National Weather Service.',
  openApp: 'פתיחת duskline', privacy: 'מדיניות פרטיות', terms: 'תנאי שימוש',
  intro: 'אין חשבון, אין שרת אחורי משלנו ואין מזהה פרסום. השפה, היחידות, המועדפים ומיקום שמור במכוון מקורב נשארים בדפדפן.',
  featuresH: 'יכולות',
  privacyH: 'פרטיות ונתונים',
  languagesH: 'שפות',
  devH: 'פיתוח',
  deployH: 'פרסום',
  licenseH: 'רישיון',
  features: [
    'חפשו כל עיר בעולם, עם הצעות נוחות למקלדת',
    'שמרו מועדפים והשתמשו במיקום לפי בחירה (הקואורדינטות מעוגלות לפני שמירה או שליחה)',
    'תנאים נוכחיים, תחזית שעתית ואופק של 10 ימים',
    'איכות אוויר',
    'למקומות בארה״ב הזכאים, תחזיות והתראות ציבוריות של National Weather Service',
    'שמים ומשקעים מונפשים בתצוגה המפורטת',
    'יחידות טמפרטורה, מרחק, רוח, משקעים ולחץ',
    '30 שפות ממשק, כולל ערבית ועברית (מימין לשמאל)'
  ],
  privacyBody: 'בקשות מזג האוויר יוצאות מהדפדפן אל [Open-Meteo](https://open-meteo.com/) ואל [National Weather Service](https://www.weather.gov/) למקומות בארה״ב. אם משתמשים במיקום, geocoding הפוך הולך ל־BigDataCloud ועשוי ליפול ל־OpenStreetMap Nominatim. אירוח ו־Google Fonts עשויים לראות נתוני בקשה טכניים רגילים.\n\nduskline אינו מוכר מידע זה. התחזיות הן לתכנון ולחקירה, לא להחלטות חירום. פרטים: [מדיניות פרטיות](PRIVACY) ו[תנאי שימוש](TERMS).',
  languagesBody: 'בורר השפה באפליקציה והדפים המשפטיים חולקים את אותן 30 שפות ואת ההעדפה `duskline-lang`. הטקסטים המשפטיים נמצאים ב־`src/js/data/legal/packs/`. תרגומי README אלה נמצאים ב־[`docs/i18n/`]({i18n}).',
  devIntro: 'האפליקציה היא HTML, CSS וסקריפטים קלאסיים סטטיים — בלי bundler.',
  check: 'בדיקת תחביר לכל JS פנימי: `npm run check`',
  unit: 'בדיקות יחידה: `npm run test:unit`',
  e2e: 'בדיקות Playwright מדמות את ממשקי מזג האוויר ואינן צורכות מכסות חיות: `npm test`',
  deployBody: 'שורש המאגר הוא האתר. [Cloudflare Pages](https://duskline.pages.dev/) הוא המארח העיקרי המיועד; GitHub Pages הוא הגיבוי. שניהם מפרסמים את הקבצים הסטטיים כפי שהם.',
  licenseBody: 'הקוד ברישיון [MIT](../../LICENSE). נתוני מזג האוויר שייכים לספקים שלמעלה וכפופים לתנאיהם. לא לבטיחות חיים ולא לחירום.'
});

C.hi = cloneFrom('es', {
  readIn: 'इस भाषा में पढ़ें',
  tagline: 'मुफ़्त, केवल ब्राउज़र वाला मौसम ऐप: विश्वव्यापी शहर खोज, घंटेवार और 10-दिन का दृष्टिकोण, वायु गुणवत्ता, एनिमेटेड स्थितियाँ, और बेहतर U.S. National Weather Service पूर्वानुमान व अलर्ट।',
  openApp: 'duskline खोलें', privacy: 'गोपनीयता नीति', terms: 'उपयोग की शर्तें',
  intro: 'कोई खाता नहीं, कोई अपना बैकएंड नहीं, कोई विज्ञापन पहचानकर्ता नहीं। भाषा, इकाइयाँ, पसंदीदा और जानबूझकर अनुमानित सहेजा गया स्थान आपके ब्राउज़र में रहता है।',
  featuresH: 'सुविधाएँ',
  privacyH: 'गोपनीयता और डेटा',
  languagesH: 'भाषाएँ',
  devH: 'विकास',
  deployH: 'प्रकाशन',
  licenseH: 'लाइसेंस',
  features: [
    'दुनिया के किसी भी शहर को खोजें, कीबोर्ड-अनुकूल सुझावों के साथ',
    'पसंदीदा सहेजें और वैकल्पिक रूप से अपना स्थान उपयोग करें (निर्देशांक सहेजने या भेजने से पहले पूर्णांकित होते हैं)',
    'वर्तमान स्थितियाँ, घंटेवार पूर्वानुमान और 10-दिन का दृष्टिकोण',
    'वायु गुणवत्ता',
    'पात्र अमेरिकी स्थानों के लिए National Weather Service पूर्वानुमान और सार्वजनिक अलर्ट',
    'विस्तृत दृश्य में एनिमेटेड आकाश और वर्षा',
    'तापमान, दूरी, हवा, वर्षा और दबाव की इकाइयाँ',
    '30 इंटरफ़ेस भाषाएँ, जिनमें अरबी और हिब्रू (दाएँ से बाएँ) शामिल हैं'
  ],
  privacyBody: 'मौसम अनुरोध आपके ब्राउज़र से [Open-Meteo](https://open-meteo.com/) और अमेरिकी स्थानों के लिए [National Weather Service](https://www.weather.gov/) को जाते हैं। यदि आप स्थान उपयोग करते हैं, रिवर्स जियोकोडिंग BigDataCloud को जाती है और OpenStreetMap Nominatim पर लौट सकती है। होस्टिंग और Google Fonts सामान्य तकनीकी अनुरोध डेटा देख सकते हैं।\n\nduskline उस जानकारी को नहीं बेचता। पूर्वानुमान योजना और अन्वेषण के लिए हैं, आपातकालीन निर्णयों के लिए नहीं। विवरण: [गोपनीयता नीति](PRIVACY) और [उपयोग की शर्तें](TERMS)।',
  languagesBody: 'ऐप का चयनकर्ता और कानूनी पृष्ठ वही 30 भाषाएँ और `duskline-lang` वरीयता साझा करते हैं। कानूनी पाठ `src/js/data/legal/packs/` में है। ये README अनुवाद [`docs/i18n/`]({i18n}) में हैं।',
  devIntro: 'ऐप स्थैतिक HTML, CSS और क्लासिक स्क्रिप्ट है — कोई बंडलर नहीं।',
  check: 'प्रत्येक अपने JS की सिंटैक्स जाँच: `npm run check`',
  unit: 'यूनिट परीक्षण: `npm run test:unit`',
  e2e: 'Playwright स्मोक मौसम API का मॉक करते हैं और लाइव कोटा नहीं खर्च करते: `npm test`',
  deployBody: 'रिपॉज़िटरी रूट ही साइट है। [Cloudflare Pages](https://duskline.pages.dev/) मुख्य होस्ट है; GitHub Pages बैकअप है। दोनों स्थैतिक फ़ाइलें ज्यों की त्यों प्रकाशित करते हैं।',
  licenseBody: 'कोड [MIT](../../LICENSE) है। मौसम डेटा उपरोक्त तृतीय पक्षों का है और उनकी शर्तों के अधीन है। जीवन-सुरक्षा या आपातकाल के लिए नहीं।'
});

C.th = cloneFrom('es', {
  readIn: 'อ่านเป็น',
  tagline: 'แอปสภาพอากาศฟรีที่ทำงานในเบราว์เซอร์เท่านั้น สำหรับตรวจและสำรวจอากาศ: ค้นหาเมืองทั่วโลก รายชั่วโมงและ 10 วัน คุณภาพอากาศ สภาพเคลื่อนไหว และพยากรณ์กับคำเตือนเสริมจาก U.S. National Weather Service',
  openApp: 'เปิด duskline', privacy: 'นโยบายความเป็นส่วนตัว', terms: 'ข้อกำหนดการใช้งาน',
  intro: 'ไม่มีบัญชี ไม่มีแบ็กเอนด์ของเราเอง ไม่มีตัวระบุโฆษณา ภาษา หน่วย รายการโปรด และตำแหน่งที่บันทึกแบบประมาณโดยตั้งใจอยู่ในเบราว์เซอร์ของคุณ',
  featuresH: 'คุณสมบัติ',
  privacyH: 'ความเป็นส่วนตัวและข้อมูล',
  languagesH: 'ภาษา',
  devH: 'การพัฒนา',
  deployH: 'การเผยแพร่',
  licenseH: 'สัญญาอนุญาต',
  features: [
    'ค้นหาเมืองใดก็ได้ทั่วโลก พร้อมคำแนะนำที่ใช้คีย์บอร์ดได้',
    'บันทึกรายการโปรด และใช้ตำแหน่งได้ตามต้องการ (พิกัดจะถูกปัดก่อนบันทึกหรือส่ง)',
    'สภาพปัจจุบัน พยากรณ์รายชั่วโมง และมุมมอง 10 วัน',
    'คุณภาพอากาศ',
    'สำหรับสถานที่ในสหรัฐฯ ที่เข้าเกณฑ์ พยากรณ์และคำเตือนสาธารณะจาก National Weather Service',
    'ท้องฟ้าและหยาดน้ำฟ้าเคลื่อนไหวในมุมมองรายละเอียด',
    'หน่วยอุณหภูมิ ระยะทาง ลม หยาดน้ำฟ้า และความกดอากาศ',
    '30 ภาษาของส่วนติดต่อ รวมอาหรับและฮีบรู (ขวาไปซ้าย)'
  ],
  privacyBody: 'คำขอสภาพอากาศออกจากเบราว์เซอร์ไปยัง [Open-Meteo](https://open-meteo.com/) และสำหรับสถานที่ในสหรัฐฯ ไปยัง [National Weather Service](https://www.weather.gov/) หากใช้ตำแหน่ง การถอดรหัสพิกัดย้อนกลับไปที่ BigDataCloud และอาจถอยไป OpenStreetMap Nominatim การโฮสต์และ Google Fonts อาจเห็นข้อมูลคำขอทางเทคนิคทั่วไป\n\nduskline ไม่ขายข้อมูลนั้น พยากรณ์มีไว้เพื่อวางแผนและสำรวจ ไม่ใช่การตัดสินใจฉุกเฉิน รายละเอียด: [นโยบายความเป็นส่วนตัว](PRIVACY) และ [ข้อกำหนดการใช้งาน](TERMS)',
  languagesBody: 'ตัวเลือกในแอปและหน้ากฎหมายใช้ 30 ภาษาเดียวกันและการตั้งค่า `duskline-lang` ข้อความกฎหมายอยู่ที่ `src/js/data/legal/packs/` คำแปล README เหล่านี้อยู่ที่ [`docs/i18n/`]({i18n})',
  devIntro: 'แอปเป็น HTML, CSS และสคริปต์คลาสสิกแบบคงที่ — ไม่มีตัวรวมไฟล์',
  check: 'ตรวจไวยากรณ์ JS ของเราทุกไฟล์: `npm run check`',
  unit: 'การทดสอบหน่วย: `npm run test:unit`',
  e2e: 'ควันทดสอบ Playwright จำลอง API สภาพอากาศและไม่ใช้โควตาจริง: `npm test`',
  deployBody: 'รากของที่เก็บคือเว็บไซต์ [Cloudflare Pages](https://duskline.pages.dev/) เป็นโฮสต์หลักที่ตั้งใจไว้ GitHub Pages เป็นสำรอง ทั้งคู่เผยแพร่ไฟล์สถิตตามเดิม',
  licenseBody: 'โค้ดเป็น [MIT](../../LICENSE) ข้อมูลสภาพอากาศเป็นของผู้ให้บริการข้างต้นและอยู่ภายใต้ข้อกำหนดของพวกเขา ไม่สำหรับความปลอดภัยของชีวิตหรือเหตุฉุกเฉิน'
});

C.vi = cloneFrom('es', {
  readIn: 'Đọc bằng',
  tagline: 'Ứng dụng thời tiết miễn phí, chỉ chạy trên trình duyệt, để kiểm tra và khám phá: tìm thành phố toàn cầu, triển vọng theo giờ và 10 ngày, chất lượng không khí, điều kiện chuyển động, cùng dự báo và cảnh báo tăng cường từ U.S. National Weather Service.',
  openApp: 'Mở duskline', privacy: 'Chính sách quyền riêng tư', terms: 'Điều khoản sử dụng',
  intro: 'Không tài khoản, không backend riêng, không mã nhận dạng quảng cáo. Ngôn ngữ, đơn vị, mục yêu thích và vị trí đã lưu được làm tròn có chủ đích ở lại trình duyệt.',
  featuresH: 'Tính năng',
  privacyH: 'Quyền riêng tư và dữ liệu',
  languagesH: 'Ngôn ngữ',
  devH: 'Phát triển',
  deployH: 'Triển khai',
  licenseH: 'Giấy phép',
  features: [
    'Tìm bất kỳ thành phố nào trên thế giới, với gợi ý dùng được bằng bàn phím',
    'Lưu mục yêu thích và tùy chọn dùng vị trí (tọa độ được làm tròn trước khi lưu hoặc gửi)',
    'Điều kiện hiện tại, dự báo theo giờ và tầm nhìn 10 ngày',
    'Chất lượng không khí',
    'Với địa điểm Hoa Kỳ đủ điều kiện, dự báo và cảnh báo công cộng từ National Weather Service',
    'Bầu trời và mưa chuyển động trong chế độ chi tiết',
    'Đơn vị nhiệt độ, khoảng cách, gió, mưa và áp suất',
    '30 ngôn ngữ giao diện, gồm Ả Rập và Do Thái (phải sang trái)'
  ],
  privacyBody: 'Yêu cầu thời tiết rời trình duyệt tới [Open-Meteo](https://open-meteo.com/) và, với vị trí Hoa Kỳ, [National Weather Service](https://www.weather.gov/). Nếu dùng vị trí, geocoding ngược tới BigDataCloud và có thể về OpenStreetMap Nominatim. Hosting và Google Fonts có thể thấy dữ liệu kỹ thuật thông thường của yêu cầu.\n\nduskline không bán thông tin đó. Dự báo dành cho lập kế hoạch và khám phá, không phải quyết định khẩn cấp. Chi tiết: [Chính sách quyền riêng tư](PRIVACY) và [Điều khoản sử dụng](TERMS).',
  languagesBody: 'Bộ chọn trong ứng dụng và các trang pháp lý dùng chung 30 ngôn ngữ và tùy chọn `duskline-lang`. Văn bản pháp lý nằm ở `src/js/data/legal/packs/`. Các bản dịch README này nằm ở [`docs/i18n/`]({i18n}).',
  devIntro: 'Ứng dụng là HTML, CSS và script cổ điển tĩnh — không có bundler.',
  check: 'Kiểm tra cú pháp từng JS nội bộ: `npm run check`',
  unit: 'Kiểm thử đơn vị: `npm run test:unit`',
  e2e: 'Smoke Playwright giả lập API thời tiết và không dùng hạn ngạch thật: `npm test`',
  deployBody: 'Thư mục gốc kho chứa là trang web. [Cloudflare Pages](https://duskline.pages.dev/) là máy chủ chính dự kiến; GitHub Pages là bản sao lưu. Cả hai xuất bản tệp tĩnh nguyên trạng.',
  licenseBody: 'Mã nguồn là [MIT](../../LICENSE). Dữ liệu thời tiết thuộc các nhà cung cấp trên và tuân theo điều khoản của họ. Không dùng cho an toàn tính mạng hay khẩn cấp.'
});

C.id = cloneFrom('es', {
  readIn: 'Baca dalam',
  tagline: 'Aplikasi cuaca gratis yang hanya berjalan di peramban, untuk memeriksa dan menjelajahi cuaca: pencarian kota di seluruh dunia, pandangan per jam dan 10 hari, kualitas udara, kondisi beranimasi, serta prakiraan dan peringatan U.S. National Weather Service yang diperkaya.',
  openApp: 'Buka duskline', privacy: 'Kebijakan Privasi', terms: 'Ketentuan Penggunaan',
  intro: 'Tidak ada akun, backend sendiri, atau pengenal iklan. Bahasa, satuan, favorit, dan lokasi tersimpan yang sengaja didekati tetap di peramban Anda.',
  featuresH: 'Fitur',
  privacyH: 'Privasi dan data',
  languagesH: 'Bahasa',
  devH: 'Pengembangan',
  deployH: 'Penerbitan',
  licenseH: 'Lisensi',
  features: [
    'Cari kota mana pun di dunia, dengan saran yang ramah papan ketik',
    'Simpan favorit dan gunakan lokasi secara opsional (koordinat dibulatkan sebelum disimpan atau dikirim)',
    'Kondisi saat ini, prakiraan per jam, dan pandangan 10 hari',
    'Kualitas udara',
    'Untuk tempat AS yang memenuhi syarat, prakiraan dan peringatan publik National Weather Service',
    'Langit dan curah hujan beranimasi di tampilan terperinci',
    'Satuan suhu, jarak, angin, curah hujan, dan tekanan',
    '30 bahasa antarmuka, termasuk Arab dan Ibrani (kanan ke kiri)'
  ],
  privacyBody: 'Permintaan cuaca keluar dari peramban ke [Open-Meteo](https://open-meteo.com/) dan, untuk lokasi AS, [National Weather Service](https://www.weather.gov/). Jika Anda memakai lokasi, geocoding terbalik ke BigDataCloud dan dapat jatuh ke OpenStreetMap Nominatim. Hosting dan Google Fonts dapat melihat data permintaan teknis biasa.\n\nduskline tidak menjual informasi itu. Prakiraan untuk perencanaan dan penjelajahan, bukan keputusan darurat. Rincian: [Kebijakan Privasi](PRIVACY) dan [Ketentuan Penggunaan](TERMS).',
  languagesBody: 'Pemilih di aplikasi dan halaman hukum berbagi 30 bahasa yang sama dan preferensi `duskline-lang`. Teks hukum ada di `src/js/data/legal/packs/`. Terjemahan README ini ada di [`docs/i18n/`]({i18n}).',
  devIntro: 'Aplikasi ini HTML, CSS, dan skrip klasik statis — tanpa bundler.',
  check: 'Periksa sintaksis setiap JS pihak pertama: `npm run check`',
  unit: 'Uji unit: `npm run test:unit`',
  e2e: 'Smoke Playwright meniru API cuaca dan tidak memakai kuota langsung: `npm test`',
  deployBody: 'Akar repositori adalah situsnya. [Cloudflare Pages](https://duskline.pages.dev/) adalah host utama yang dimaksud; GitHub Pages cadangan. Keduanya menerbitkan berkas statis apa adanya.',
  licenseBody: 'Kode berlisensi [MIT](../../LICENSE). Data cuaca milik penyedia di atas dan tunduk pada ketentuan mereka. Bukan untuk keselamatan jiwa atau darurat.'
});

function writeAll() {
  fs.mkdirSync(OUT, { recursive: true });
  const missing = LOCALES.filter(function (item) { return item[0] !== 'en' && !C[item[0]]; }).map(function (item) { return item[0]; });
  if (missing.length) {
    throw new Error('missing README catalog for: ' + missing.join(', '));
  }
  LOCALES.forEach(function (item) {
    const code = item[0];
    if (code === 'en') return;
    const md = render(code, fillLinks(C[code], 'i18n'), 'i18n');
    fs.writeFileSync(path.join(OUT, 'README.' + code + '.md'), md);
  });
  const index = [
    '# Duskline README translations',
    '',
    'The canonical English README is [`README.md`](../../README.md) at the repository root (what GitHub shows by default). Every other locale lives in this folder so the root stays uncluttered.',
    '',
    'In the app, the same 30 locales power the language picker and the [privacy](../../privacy.html) / [terms](../../terms.html) pages. Policy strings are JSON packs in `src/js/data/legal/packs/`.',
    '',
    '| Language | File |',
    '| --- | --- |',
    '| English | [`README.md`](../../README.md) |'
  ];
  LOCALES.forEach(function (item) {
    if (item[0] === 'en') return;
    index.push('| ' + item[1] + ' | [`README.' + item[0] + '.md`](README.' + item[0] + '.md) |');
  });
  index.push('');
  index.push('Regenerate the locale files with `node tools/render-readme-i18n.js` after editing the catalog in that script.');
  index.push('');
  fs.writeFileSync(path.join(OUT, 'README.md'), index.join('\n'));
  process.stdout.write('wrote ' + (LOCALES.length - 1) + ' locale READMEs + index\n');
}

module.exports = { LOCALES, C, bar, render, fillLinks, OUT, ROOT, writeAll };

if (require.main === module) writeAll();

