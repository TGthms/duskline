'use strict';
/* Duskline locale registry + chrome/weather UI packs for all picker languages. */
(function (global) {
  var locales = [
    ['en', 'English'], ['es', 'Español'], ['fr', 'Français'], ['de', 'Deutsch'],
    ['it', 'Italiano'], ['pt-BR', 'Português (Brasil)'], ['pt-PT', 'Português (Portugal)'],
    ['nl', 'Nederlands'], ['da', 'Dansk'], ['sv', 'Svenska'], ['nb', 'Norsk bokmål'],
    ['fi', 'Suomi'], ['pl', 'Polski'], ['cs', 'Čeština'], ['hu', 'Magyar'],
    ['ro', 'Română'], ['el', 'Ελληνικά'], ['tr', 'Türkçe'], ['ru', 'Русский'],
    ['uk', 'Українська'], ['ar', 'العربية'], ['he', 'עברית'], ['hi', 'हिन्दी'],
    ['th', 'ไทย'], ['vi', 'Tiếng Việt'], ['id', 'Bahasa Indonesia'], ['ja', '日本語'],
    ['ko', '한국어'], ['zh', '简体中文'], ['zh-TW', '繁體中文']
  ];
  global.DUSKLINE_LANG_CODES = locales.map(function (item) { return item[0]; });
  global.DUSKLINE_LOCALES = locales;
  global.DUSKLINE_LOCALE_TAGS = {
    en: 'en-US', es: 'es-ES', fr: 'fr-FR', de: 'de-DE', it: 'it-IT',
    'pt-BR': 'pt-BR', 'pt-PT': 'pt-PT', nl: 'nl-NL', da: 'da-DK', sv: 'sv-SE',
    nb: 'nb-NO', fi: 'fi-FI', pl: 'pl-PL', cs: 'cs-CZ', hu: 'hu-HU', ro: 'ro-RO',
    el: 'el-GR', tr: 'tr-TR', ru: 'ru-RU', uk: 'uk-UA', ar: 'ar', he: 'he',
    hi: 'hi-IN', th: 'th-TH', vi: 'vi-VN', id: 'id-ID', ja: 'ja-JP', ko: 'ko-KR',
    zh: 'zh-CN', 'zh-TW': 'zh-TW'
  };

  var langWord = {
    en: 'Language', es: 'Idioma', fr: 'Langue', de: 'Sprache', it: 'Lingua',
    'pt-BR': 'Idioma', 'pt-PT': 'Idioma', nl: 'Taal', da: 'Sprog', sv: 'Språk',
    nb: 'Språk', fi: 'Kieli', pl: 'Język', cs: 'Jazyk', hu: 'Nyelv', ro: 'Limbă',
    el: 'Γλώσσα', tr: 'Dil', ru: 'Язык', uk: 'Мова', ar: 'اللغة', he: 'שפה',
    hi: 'भाषा', th: 'ภาษา', vi: 'Ngôn ngữ', id: 'Bahasa', ja: '言語', ko: '언어',
    zh: '语言', 'zh-TW': '語言'
  };

  /* key → { locale: string }. English is the fallback used by t(). */
  var S = {
    'tools.weatherSub': {
      en: 'Weather, wherever you are', es: 'El tiempo, estés donde estés', fr: 'La météo, où que vous soyez',
      de: 'Wetter, wo immer Sie sind', it: 'Meteo, ovunque tu sia', 'pt-BR': 'Clima, onde você estiver',
      'pt-PT': 'Meteorologia, onde estiver', nl: 'Het weer, waar je ook bent', da: 'Vejret, uanset hvor du er',
      sv: 'Vädret, var du än är', nb: 'Været, uansett hvor du er', fi: 'Sää, missä ikinä oletkin',
      pl: 'Pogoda, gdziekolwiek jesteś', cs: 'Počasí, ať jste kdekoli', hu: 'Időjárás, bárhol is jársz',
      ro: 'Vremea, oriunde te-ai afla', el: 'Ο καιρός, όπου κι αν βρίσκεστε', tr: 'Hava durumu, nerede olursanız olun',
      ru: 'Погода, где бы вы ни находились', uk: 'Погода, де б ви не були', ar: 'الطقس، أينما كنت',
      he: 'מזג האוויר, בכל מקום שבו אתם נמצאים', hi: 'मौसम, आप कहीं भी हों', th: 'สภาพอากาศ ไม่ว่าคุณจะอยู่ที่ไหน',
      vi: 'Thời tiết, ở bất cứ nơi đâu', id: 'Cuaca, di mana pun Anda berada', ja: 'どこにいても、天気を確認',
      ko: '어디서든 확인하는 날씨', zh: '无论身在何处，查看天气', 'zh-TW': '無論身在何處，查看天氣'
    },
    'tools.weatherLabel': {
      en: 'Weather', es: 'Tiempo', fr: 'Météo', de: 'Wetter', it: 'Meteo', 'pt-BR': 'Clima', 'pt-PT': 'Meteorologia',
      nl: 'Weer', da: 'Vejr', sv: 'Väder', nb: 'Vær', fi: 'Sää', pl: 'Pogoda', cs: 'Počasí', hu: 'Időjárás',
      ro: 'Vreme', el: 'Καιρός', tr: 'Hava durumu', ru: 'Погода', uk: 'Погода', ar: 'الطقس', he: 'מזג האוויר',
      hi: 'मौसम', th: 'สภาพอากาศ', vi: 'Thời tiết', id: 'Cuaca', ja: '天気', ko: '날씨', zh: '天气', 'zh-TW': '天氣'
    },
    'weather.searchPlaceholder': {
      en: 'Search any city worldwide…', es: 'Busca cualquier ciudad del mundo…', fr: 'Rechercher une ville dans le monde…',
      de: 'Weltweit nach einer Stadt suchen…', it: 'Cerca una città nel mondo…', 'pt-BR': 'Busque qualquer cidade do mundo…',
      'pt-PT': 'Pesquisar qualquer cidade do mundo…', nl: 'Zoek een stad wereldwijd…', da: 'Søg efter en by i hele verden…',
      sv: 'Sök efter en stad var som helst i världen…', nb: 'Søk etter en by hvor som helst i verden…',
      fi: 'Hae kaupunkia kaikkialta maailmasta…', pl: 'Szukaj dowolnego miasta na świecie…',
      cs: 'Hledat město kdekoli na světě…', hu: 'Keress rá bármely városra a világon…',
      ro: 'Caută orice oraș din lume…', el: 'Αναζητήστε οποιαδήποτε πόλη στον κόσμο…',
      tr: 'Dünyadaki herhangi bir şehri ara…', ru: 'Найдите любой город в мире…', uk: 'Знайдіть будь-яке місто світу…',
      ar: 'ابحث عن أي مدينة حول العالم…', he: 'חיפוש עיר מכל מקום בעולם…', hi: 'दुनिया के किसी भी शहर को खोजें…',
      th: 'ค้นหาเมืองใดก็ได้ทั่วโลก…', vi: 'Tìm kiếm bất kỳ thành phố nào trên thế giới…',
      id: 'Cari kota mana pun di seluruh dunia…', ja: '世界中の都市を検索…', ko: '전 세계 도시 검색…',
      zh: '搜索全球任意城市…', 'zh-TW': '搜尋全球任意城市…'
    },
    'weather.useLocation': {
      en: 'Use my location', es: 'Usar mi ubicación', fr: 'Utiliser ma position', de: 'Meinen Standort verwenden',
      it: 'Usa la mia posizione', 'pt-BR': 'Usar minha localização', 'pt-PT': 'Usar a minha localização',
      nl: 'Mijn locatie gebruiken', da: 'Brug min placering', sv: 'Använd min plats', nb: 'Bruk posisjonen min',
      fi: 'Käytä sijaintiani', pl: 'Użyj mojej lokalizacji', cs: 'Použít moji polohu', hu: 'Helyzetem használata',
      ro: 'Folosește locația mea', el: 'Χρήση της τοποθεσίας μου', tr: 'Konumumu kullan',
      ru: 'Использовать моё местоположение', uk: 'Використати моє місцезнаходження', ar: 'استخدام موقعي',
      he: 'שימוש במיקום שלי', hi: 'मेरा स्थान उपयोग करें', th: 'ใช้ตำแหน่งของฉัน', vi: 'Dùng vị trí của tôi',
      id: 'Gunakan lokasi saya', ja: '現在地を使う', ko: '내 위치 사용', zh: '使用我的位置', 'zh-TW': '使用我的位置'
    },
    'weather.refresh': {
      en: 'Refresh', es: 'Actualizar', fr: 'Actualiser', de: 'Aktualisieren', it: 'Aggiorna', 'pt-BR': 'Atualizar',
      'pt-PT': 'Atualizar', nl: 'Verversen', da: 'Opdater', sv: 'Uppdatera', nb: 'Oppdater', fi: 'Päivitä',
      pl: 'Odśwież', cs: 'Obnovit', hu: 'Frissítés', ro: 'Reîmprospătează', el: 'Ανανέωση', tr: 'Yenile',
      ru: 'Обновить', uk: 'Оновити', ar: 'تحديث', he: 'רענון', hi: 'रिफ्रेश', th: 'รีเฟรช', vi: 'Làm mới',
      id: 'Segarkan', ja: '更新', ko: '새로 고침', zh: '刷新', 'zh-TW': '重新整理'
    },
    'weather.units': {
      en: 'Units', es: 'Unidades', fr: 'Unités', de: 'Einheiten', it: 'Unità', 'pt-BR': 'Unidades', 'pt-PT': 'Unidades',
      nl: 'Eenheden', da: 'Enheder', sv: 'Enheter', nb: 'Enheter', fi: 'Yksiköt', pl: 'Jednostki', cs: 'Jednotky',
      hu: 'Mértékegységek', ro: 'Unități', el: 'Μονάδες', tr: 'Birimler', ru: 'Единицы', uk: 'Одиниці',
      ar: 'الوحدات', he: 'יחידות', hi: 'इकाइयाँ', th: 'หน่วย', vi: 'Đơn vị', id: 'Satuan', ja: '単位',
      ko: '단위', zh: '单位', 'zh-TW': '單位'
    },
    'weather.majorCities': {
      en: 'Featured places', es: 'Lugares destacados', fr: 'Lieux à découvrir', de: 'Ausgewählte Orte',
      it: 'Luoghi in evidenza', 'pt-BR': 'Lugares em destaque', 'pt-PT': 'Locais em destaque', nl: 'Uitgelichte plaatsen',
      da: 'Udvalgte steder', sv: 'Utvalda platser', nb: 'Utvalgte steder', fi: 'Esittelyssä olevat paikat',
      pl: 'Polecane miejsca', cs: 'Doporučená místa', hu: 'Kiemelt helyek', ro: 'Locuri recomandate',
      el: 'Προτεινόμενα μέρη', tr: 'Öne çıkan yerler', ru: 'Избранные места', uk: 'Рекомендовані місця',
      ar: 'أماكن مميزة', he: 'מקומות נבחרים', hi: 'विशेष स्थान', th: 'สถานที่แนะนำ', vi: 'Địa điểm nổi bật',
      id: 'Tempat pilihan', ja: '注目の場所', ko: '추천 장소', zh: '精选地点', 'zh-TW': '精選地點'
    },
    'weather.favorites': {
      en: 'Favorites', es: 'Favoritos', fr: 'Favoris', de: 'Favoriten', it: 'Preferiti', 'pt-BR': 'Favoritos',
      'pt-PT': 'Favoritos', nl: 'Favorieten', da: 'Favoritter', sv: 'Favoriter', nb: 'Favoritter', fi: 'Suosikit',
      pl: 'Ulubione', cs: 'Oblíbené', hu: 'Kedvencek', ro: 'Favorite', el: 'Αγαπημένα', tr: 'Favoriler',
      ru: 'Избранное', uk: 'Обране', ar: 'المفضلة', he: 'מועדפים', hi: 'पसंदीदा', th: 'รายการโปรด',
      vi: 'Yêu thích', id: 'Favorit', ja: 'お気に入り', ko: '즐겨찾기', zh: '收藏夹', 'zh-TW': '我的最愛'
    },
    'weather.myLocation': {
      en: 'My location', es: 'Mi ubicación', fr: 'Ma position', de: 'Mein Standort', it: 'La mia posizione',
      'pt-BR': 'Minha localização', 'pt-PT': 'A minha localização', nl: 'Mijn locatie', da: 'Min placering',
      sv: 'Min plats', nb: 'Min posisjon', fi: 'Oma sijainti', pl: 'Moja lokalizacja', cs: 'Moje poloha',
      hu: 'Saját helyzet', ro: 'Locația mea', el: 'Η τοποθεσία μου', tr: 'Konumum', ru: 'Моё местоположение',
      uk: 'Моє місцезнаходження', ar: 'موقعي', he: 'המיקום שלי', hi: 'मेरा स्थान', th: 'ตำแหน่งของฉัน',
      vi: 'Vị trí của tôi', id: 'Lokasi saya', ja: '現在地', ko: '내 위치', zh: '我的位置', 'zh-TW': '我的位置'
    },
    'legal.privacyLink': {
      en: 'Privacy Policy', es: 'Política de privacidad', fr: 'Politique de confidentialité', de: 'Datenschutz',
      it: 'Privacy', 'pt-BR': 'Privacidade', 'pt-PT': 'Privacidade', nl: 'Privacybeleid', da: 'Privatlivspolitik',
      sv: 'Integritetspolicy', nb: 'Personvern', fi: 'Tietosuojakäytäntö', pl: 'Polityka prywatności',
      cs: 'Zásady ochrany soukromí', hu: 'Adatvédelmi szabályzat', ro: 'Politica de confidențialitate',
      el: 'Πολιτική απορρήτου', tr: 'Gizlilik Politikası', ru: 'Политика конфиденциальности',
      uk: 'Політика конфіденційності', ar: 'سياسة الخصوصية', he: 'מדיניות פרטיות', hi: 'गोपनीयता नीति',
      th: 'นโยบายความเป็นส่วนตัว', vi: 'Chính sách quyền riêng tư', id: 'Kebijakan Privasi',
      ja: 'プライバシーポリシー', ko: '개인정보 처리방침', zh: '隐私政策', 'zh-TW': '隱私權政策'
    },
    'legal.termsLink': {
      en: 'Terms of Use', es: 'Términos de uso', fr: 'Conditions d’utilisation', de: 'Nutzungsbedingungen',
      it: 'Termini di utilizzo', 'pt-BR': 'Termos de uso', 'pt-PT': 'Termos de utilização', nl: 'Gebruiksvoorwaarden',
      da: 'Brugsvilkår', sv: 'Användarvillkor', nb: 'Bruksvilkår', fi: 'Käyttöehdot', pl: 'Warunki korzystania',
      cs: 'Podmínky použití', hu: 'Felhasználási feltételek', ro: 'Termeni de utilizare', el: 'Όροι χρήσης',
      tr: 'Kullanım Koşulları', ru: 'Условия использования', uk: 'Умови використання', ar: 'شروط الاستخدام',
      he: 'תנאי שימוש', hi: 'उपयोग की शर्तें', th: 'ข้อกำหนดการใช้งาน', vi: 'Điều khoản sử dụng',
      id: 'Ketentuan Penggunaan', ja: '利用規約', ko: '이용약관', zh: '使用条款', 'zh-TW': '使用條款'
    },
    'legal.licensesLink': {
      en: 'Open-source licenses', es: 'Licencias de código abierto', fr: 'Licences open source', de: 'Open-Source-Lizenzen',
      it: 'Licenze open source', 'pt-BR': 'Licenças de código aberto', 'pt-PT': 'Licenças de código aberto',
      nl: 'Open-sourcelicenties', da: 'Open source-licenser', sv: 'Öppen källkodslicenser', nb: 'Lisenser for åpen kildekode',
      fi: 'Avoimen lähdekoodin lisenssit', pl: 'Licencje open source', cs: 'Licence open source',
      hu: 'Nyílt forráskódú licencek', ro: 'Licențe open source', el: 'Άδειες ανοικτού κώδικα',
      tr: 'Açık kaynak lisansları', ru: 'Лицензии открытого ПО', uk: 'Ліцензії відкритого коду',
      ar: 'تراخيص المصادر المفتوحة', he: 'רישיונות קוד פתוח', hi: 'ओपन-सोर्स लाइसेंस', th: 'ใบอนุญาตโอเพนซอร์ส',
      vi: 'Giấy phép mã nguồn mở', id: 'Lisensi sumber terbuka', ja: 'オープンソースライセンス',
      ko: '오픈 소스 라이선스', zh: '开源许可', 'zh-TW': '開源授權'
    },
    'legal.licenses.title': {
      en: 'Open-source licenses', es: 'Licencias de código abierto', fr: 'Licences open source', de: 'Open-Source-Lizenzen',
      it: 'Licenze open source', 'pt-BR': 'Licenças de código aberto', 'pt-PT': 'Licenças de código aberto',
      nl: 'Open-sourcelicenties', da: 'Open source-licenser', sv: 'Öppen källkodslicenser', nb: 'Lisenser for åpen kildekode',
      fi: 'Avoimen lähdekoodin lisenssit', pl: 'Licencje open source', cs: 'Licence open source',
      hu: 'Nyílt forráskódú licencek', ro: 'Licențe open source', el: 'Άδειες ανοικτού κώδικα',
      tr: 'Açık kaynak lisansları', ru: 'Лицензии открытого ПО', uk: 'Ліцензії відкритого коду',
      ar: 'تراخيص المصادر المفتوحة', he: 'רישיונות קוד פתוח', hi: 'ओपन-सोर्स लाइसेंस', th: 'ใบอนุญาตโอเพนซอร์ส',
      vi: 'Giấy phép mã nguồn mở', id: 'Lisensi sumber terbuka', ja: 'オープンソースライセンス',
      ko: '오픈 소스 라이선스', zh: '开源许可', 'zh-TW': '開源授權'
    },
    'legal.licenses.meta': {
      en: 'Open-source software and map-data notices for duskline.', es: 'Avisos de software de código abierto y datos de mapas de duskline.',
      fr: 'Notices sur les logiciels open source et les données cartographiques de duskline.',
      de: 'Hinweise zu Open-Source-Software und Kartendaten von duskline.', it: 'Informazioni sulle licenze software e sui dati cartografici di duskline.',
      'pt-BR': 'Avisos de software de código aberto e dados de mapas do duskline.', 'pt-PT': 'Avisos de software de código aberto e dados de mapas do duskline.',
      nl: 'Open-source software- en kaartgegevensvermeldingen voor duskline.', da: 'Open source-software- og kortdataoplysninger for duskline.',
      sv: 'Meddelanden om öppen källkod och kartdata för duskline.', nb: 'Merknader om åpen kildekode og kartdata for duskline.',
      fi: 'duskline-sovelluksen avoimen lähdekoodin ohjelmisto- ja karttatiedot.', pl: 'Informacje o oprogramowaniu open source i danych mapowych duskline.',
      cs: 'Informace o open source softwaru a mapových datech duskline.', hu: 'A duskline nyílt forráskódú szoftvereire és térképadatára vonatkozó közlemények.',
      ro: 'Notificări privind software-ul open source și datele cartografice duskline.', el: 'Ειδοποιήσεις για λογισμικό ανοικτού κώδικα και δεδομένα χαρτών του duskline.',
      tr: 'duskline açık kaynak yazılımı ve harita verileri bildirimleri.', ru: 'Уведомления об открытом ПО и картографических данных duskline.',
      uk: 'Повідомлення про відкрите програмне забезпечення та картографічні дані duskline.',
      ar: 'إشعارات البرامج مفتوحة المصدر وبيانات الخرائط في duskline.', he: 'הודעות על תוכנות קוד פתוח ונתוני מפות של duskline.',
      hi: 'duskline के ओपन-सोर्स सॉफ़्टवेयर और मानचित्र डेटा संबंधी सूचनाएँ।', th: 'ประกาศเกี่ยวกับซอฟต์แวร์โอเพนซอร์สและข้อมูลแผนที่ของ duskline',
      vi: 'Thông báo về phần mềm mã nguồn mở và dữ liệu bản đồ của duskline.', id: 'Pemberitahuan perangkat lunak sumber terbuka dan data peta duskline.',
      ja: 'duskline のオープンソースソフトウェアと地図データに関する表示です。',
      ko: 'duskline의 오픈 소스 소프트웨어 및 지도 데이터 고지입니다.', zh: 'duskline 开源软件和地图数据声明。', 'zh-TW': 'duskline 開源軟體與地圖資料聲明。'
    },
    'legal.licenses.intro': {
      en: 'duskline is free, open-source software. This page identifies bundled software and map data and links to their complete license notices.',
      es: 'duskline es software gratuito y de código abierto. Esta página identifica el software y los datos de mapas incluidos y enlaza a sus avisos de licencia completos.',
      fr: 'duskline est un logiciel gratuit et open source. Cette page répertorie les logiciels et données cartographiques intégrés et renvoie à leurs licences complètes.',
      de: 'duskline ist kostenlose Open-Source-Software. Diese Seite nennt gebündelte Software und Kartendaten und verlinkt zu den vollständigen Lizenzhinweisen.',
      it: 'duskline è un software gratuito e open source. Questa pagina elenca il software e i dati cartografici inclusi e rimanda alle relative licenze complete.',
      'pt-BR': 'duskline é um software gratuito e de código aberto. Esta página identifica os softwares e dados de mapas incluídos e linka para os avisos de licença completos.',
      'pt-PT': 'duskline é um software gratuito e de código aberto. Esta página identifica o software e os dados de mapas incluídos e liga aos avisos de licença completos.',
      nl: 'duskline is gratis open-source software. Deze pagina vermeldt meegeleverde software en kaartgegevens en linkt naar de volledige licentieteksten.',
      da: 'duskline er gratis open source-software. Denne side angiver medfølgende software og kortdata og linker til de fulde licensmeddelelser.',
      sv: 'duskline är gratis programvara med öppen källkod. Här listas inkluderad programvara och kartdata med länkar till fullständiga licensmeddelanden.',
      nb: 'duskline er gratis programvare med åpen kildekode. Denne siden viser inkludert programvare og kartdata med lenker til fullstendige lisensmerknader.',
      fi: 'duskline on maksuton avoimen lähdekoodin ohjelmisto. Tällä sivulla luetellaan mukana toimitettu ohjelmisto ja karttatiedot sekä linkit niiden täydellisiin lisensseihin.',
      pl: 'duskline to bezpłatne oprogramowanie open source. Ta strona wymienia dołączone oprogramowanie i dane mapowe oraz odsyła do pełnych licencji.',
      cs: 'duskline je bezplatný software s otevřeným zdrojovým kódem. Tato stránka uvádí přiložený software a mapová data a odkazuje na úplná licenční oznámení.',
      hu: 'A duskline ingyenes, nyílt forráskódú szoftver. Ez az oldal felsorolja a mellékelt szoftvereket és térképadatokat, és hivatkozik a teljes licencszövegekre.',
      ro: 'duskline este un software gratuit și open source. Această pagină identifică software-ul și datele cartografice incluse și oferă linkuri către licențele complete.',
      el: 'Το duskline είναι δωρεάν λογισμικό ανοικτού κώδικα. Σε αυτή τη σελίδα αναφέρονται τα ενσωματωμένα προγράμματα και δεδομένα χαρτών, με συνδέσμους προς τις πλήρεις άδειες.',
      tr: 'duskline ücretsiz ve açık kaynaklı bir yazılımdır. Bu sayfa, paketlenen yazılımları ve harita verilerini listeler ve tam lisans bildirimlerine bağlantı verir.',
      ru: 'duskline — бесплатное программное обеспечение с открытым исходным кодом. На этой странице перечислены встроенные программы и картографические данные со ссылками на полные лицензии.',
      uk: 'duskline — безкоштовне програмне забезпечення з відкритим кодом. На цій сторінці перелічено вбудовані програми й картографічні дані та наведено посилання на повні ліцензійні повідомлення.',
      ar: 'duskline برنامج مجاني مفتوح المصدر. تعرض هذه الصفحة البرامج وبيانات الخرائط المضمّنة وروابط إشعارات التراخيص كاملة.',
      he: 'duskline היא תוכנה חינמית בקוד פתוח. בדף זה מפורטים התוכנות ונתוני המפות הכלולים בה, עם קישורים להודעות הרישיון המלאות.',
      hi: 'duskline मुफ़्त ओपन-सोर्स सॉफ़्टवेयर है। इस पृष्ठ पर शामिल सॉफ़्टवेयर और मानचित्र डेटा की जानकारी तथा पूर्ण लाइसेंस सूचनाओं के लिंक हैं।',
      th: 'duskline เป็นซอฟต์แวร์โอเพนซอร์สฟรี หน้านี้ระบุซอฟต์แวร์และข้อมูลแผนที่ที่รวมอยู่ พร้อมลิงก์ไปยังประกาศใบอนุญาตฉบับเต็ม',
      vi: 'duskline là phần mềm mã nguồn mở miễn phí. Trang này liệt kê phần mềm và dữ liệu bản đồ đi kèm, đồng thời liên kết đến thông báo giấy phép đầy đủ.',
      id: 'duskline adalah perangkat lunak sumber terbuka gratis. Halaman ini mencantumkan perangkat lunak dan data peta yang disertakan serta tautan ke pemberitahuan lisensi lengkap.',
      ja: 'duskline は無料のオープンソースソフトウェアです。このページでは、同梱ソフトウェアと地図データを示し、各ライセンス全文へのリンクを掲載しています。',
      ko: 'duskline은 무료 오픈 소스 소프트웨어입니다. 이 페이지에는 포함된 소프트웨어와 지도 데이터 및 전체 라이선스 고지 링크가 있습니다.',
      zh: 'duskline 是免费开源软件。本页列出随附的软件和地图数据，并提供完整许可声明的链接。',
      'zh-TW': 'duskline 是免費開源軟體。本頁列出隨附的軟體與地圖資料，並提供完整授權聲明的連結。'
    },
    'weather.error': {
      en: 'Could not load weather data.', es: 'No se pudieron cargar los datos del tiempo.',
      fr: 'Impossible de charger les données météo.', de: 'Wetterdaten konnten nicht geladen werden.',
      it: 'Impossibile caricare i dati meteo.', 'pt-BR': 'Não foi possível carregar os dados do clima.',
      'pt-PT': 'Não foi possível carregar os dados meteorológicos.', nl: 'Weergegevens konden niet worden geladen.',
      da: 'Vejrdata kunne ikke indlæses.', sv: 'Väderdata kunde inte läsas in.', nb: 'Kunne ikke laste værdata.',
      fi: 'Säätietoja ei voitu ladata.', pl: 'Nie udało się wczytać danych pogodowych.',
      cs: 'Počasí se nepodařilo načíst.', hu: 'Az időjárási adatok nem tölthetők be.',
      ro: 'Datele meteo nu au putut fi încărcate.', el: 'Δεν ήταν δυνατή η φόρτωση των δεδομένων καιρού.',
      tr: 'Hava durumu verileri yüklenemedi.', ru: 'Не удалось загрузить данные о погоде.',
      uk: 'Не вдалося завантажити дані про погоду.', ar: 'تعذر تحميل بيانات الطقس.',
      he: 'לא ניתן לטעון את נתוני מזג האוויר.', hi: 'मौसम डेटा लोड नहीं हो सका.',
      th: 'ไม่สามารถโหลดข้อมูลสภาพอากาศได้', vi: 'Không thể tải dữ liệu thời tiết.',
      id: 'Tidak dapat memuat data cuaca.', ja: '天気データを読み込めませんでした。',
      ko: '날씨 데이터를 불러올 수 없습니다.', zh: '无法加载天气数据。', 'zh-TW': '無法載入天氣資料。'
    },
    'weather.locating': {
      en: 'Getting location…', es: 'Obteniendo ubicación…', fr: 'Localisation…', de: 'Standort wird ermittelt…',
      it: 'Rilevamento posizione…', 'pt-BR': 'Obtendo localização…', 'pt-PT': 'A obter localização…',
      nl: 'Locatie ophalen…', da: 'Henter placering…', sv: 'Hämtar plats…', nb: 'Henter posisjon…',
      fi: 'Haetaan sijaintia…', pl: 'Pobieranie lokalizacji…', cs: 'Zjišťování polohy…', hu: 'Helymeghatározás…',
      ro: 'Se obține locația…', el: 'Λήψη τοποθεσίας…', tr: 'Konum alınıyor…', ru: 'Определение местоположения…',
      uk: 'Визначення місцезнаходження…', ar: 'جارٍ تحديد الموقع…', he: 'מאתר מיקום…', hi: 'स्थान प्राप्त किया जा रहा है…',
      th: 'กำลังหาตำแหน่ง…', vi: 'Đang lấy vị trí…', id: 'Mengambil lokasi…', ja: '現在地を取得中…',
      ko: '위치를 가져오는 중…', zh: '正在定位…', 'zh-TW': '正在取得位置…'
    },
    'weather.geoDenied': {
      en: 'Location permission was denied.', es: 'Se denegó el permiso de ubicación.',
      fr: 'L’autorisation de localisation a été refusée.', de: 'Standortzugriff wurde verweigert.',
      it: 'Autorizzazione alla posizione negata.', 'pt-BR': 'A permissão de localização foi recusada.',
      'pt-PT': 'A permissão de localização foi recusada.', nl: 'Locatietoestemming is geweigerd.',
      da: 'Placeringstilladelse blev afvist.', sv: 'Platsbehörighet nekades.', nb: 'Posisjonstilgang ble avslått.',
      fi: 'Sijainnin käyttöoikeus evättiin.', pl: 'Odmówiono dostępu do lokalizacji.',
      cs: 'Přístup k poloze byl odepřen.', hu: 'A helymeghatározás engedélyét elutasították.',
      ro: 'Permisiunea de locație a fost refuzată.', el: 'Η άδεια τοποθεσίας απορρίφθηκε.',
      tr: 'Konum izni reddedildi.', ru: 'В доступе к геолокации отказано.', uk: 'Доступ до геолокації відхилено.',
      ar: 'تم رفض إذن الموقع.', he: 'הרשאת המיקום נדחתה.', hi: 'स्थान अनुमति अस्वीकृत की गई.',
      th: 'สิทธิ์ตำแหน่งถูกปฏิเสธ', vi: 'Quyền vị trí đã bị từ chối.', id: 'Izin lokasi ditolak.',
      ja: '位置情報の許可が拒否されました。', ko: '위치 권한이 거부되었습니다.', zh: '已拒绝位置权限。', 'zh-TW': '已拒絕位置權限。'
    },
    'weather.geoTimeout': {
      en: 'Location request timed out.', es: 'La solicitud de ubicación expiró.',
      fr: 'La demande de localisation a expiré.', de: 'Standortanfrage ist abgelaufen.',
      it: 'Richiesta di posizione scaduta.', 'pt-BR': 'A solicitação de localização expirou.',
      'pt-PT': 'O pedido de localização expirou.', nl: 'Locatieverzoek is verlopen.',
      da: 'Placeringsanmodning udløb.', sv: 'Platsförfrågan tog för lång tid.', nb: 'Posisjonsforespørselen tidsavbrøt.',
      fi: 'Sijaintipyyntö aikakatkaistiin.', pl: 'Limit czasu żądania lokalizacji.',
      cs: 'Žádost o polohu vypršela.', hu: 'A helykérés időtúllépés miatt megszakadt.',
      ro: 'Cererea de locație a expirat.', el: 'Το αίτημα τοποθεσίας έληξε.',
      tr: 'Konum isteği zaman aşımına uğradı.', ru: 'Запрос геолокации истек.', uk: 'Запит місцезнаходження перевищив час очікування.',
      ar: 'انتهت مهلة طلب الموقع.', he: 'בקשת המיקום פגה.', hi: 'स्थान अनुरोध का समय समाप्त हो गया.',
      th: 'คำขอตำแหน่งหมดเวลา', vi: 'Yêu cầu vị trí hết thời gian.', id: 'Permintaan lokasi habis waktu.',
      ja: '位置情報の取得がタイムアウトしました。', ko: '위치 요청 시간이 초과되었습니다.', zh: '定位请求超时。', 'zh-TW': '定位請求逾時。'
    },
    'weather.geoUnsupported': {
      en: 'This browser does not support location.', es: 'Este navegador no admite la ubicación.',
      fr: 'Ce navigateur ne prend pas en charge la localisation.', de: 'Dieser Browser unterstützt keinen Standort.',
      it: 'Questo browser non supporta la posizione.', 'pt-BR': 'Este navegador não oferece localização.',
      'pt-PT': 'Este navegador não suporta localização.', nl: 'Deze browser ondersteunt geen locatie.',
      da: 'Denne browser understøtter ikke placering.', sv: 'Den här webbläsaren stöder inte plats.',
      nb: 'Denne nettleseren støtter ikke posisjon.', fi: 'Tämä selain ei tue sijaintia.',
      pl: 'Ta przeglądarka nie obsługuje lokalizacji.', cs: 'Tento prohlížeč polohu nepodporuje.',
      hu: 'Ez a böngésző nem támogatja a helymeghatározást.', ro: 'Acest browser nu acceptă locația.',
      el: 'Αυτό το πρόγραμμα περιήγησης δεν υποστηρίζει τοποθεσία.', tr: 'Bu tarayıcı konumu desteklemiyor.',
      ru: 'Браузер не поддерживает геолокацию.', uk: 'Браузер не підтримує геолокацію.',
      ar: 'هذا المتصفح لا يدعم الموقع.', he: 'הדפדפן אינו תומך במיקום.', hi: 'यह ब्राउज़र स्थान का समर्थन नहीं करता.',
      th: 'เบราว์เซอร์นี้ไม่รองรับตำแหน่ง', vi: 'Trình duyệt này không hỗ trợ vị trí.',
      id: 'Browser ini tidak mendukung lokasi.', ja: 'このブラウザは位置情報に対応していません。',
      ko: '이 브라우저는 위치를 지원하지 않습니다.', zh: '此浏览器不支持定位。', 'zh-TW': '此瀏覽器不支援定位。'
    },
    'weather.updated': {
      en: 'Updated', es: 'Actualizado', fr: 'Mis à jour', de: 'Aktualisiert', it: 'Aggiornato',
      'pt-BR': 'Atualizado', 'pt-PT': 'Atualizado', nl: 'Bijgewerkt', da: 'Opdateret', sv: 'Uppdaterad',
      nb: 'Oppdatert', fi: 'Päivitetty', pl: 'Zaktualizowano', cs: 'Aktualizováno', hu: 'Frissítve',
      ro: 'Actualizat', el: 'Ενημερώθηκε', tr: 'Güncellendi', ru: 'Обновлено', uk: 'Оновлено',
      ar: 'تم التحديث', he: 'עודכן', hi: 'अपडेट किया गया', th: 'อัปเดตแล้ว', vi: 'Đã cập nhật',
      id: 'Diperbarui', ja: '更新', ko: '업데이트됨', zh: '更新于', 'zh-TW': '更新於'
    },
    'weather.checked': {
      en: 'Checked', es: 'Consultado', fr: 'Vérifié', de: 'Abgerufen', it: 'Controllato',
      'pt-BR': 'Consultado', 'pt-PT': 'Consultado', nl: 'Gecontroleerd', da: 'Kontrolleret',
      sv: 'Kontrollerad', nb: 'Sjekket', fi: 'Tarkistettu', pl: 'Sprawdzono', cs: 'Zkontrolováno',
      hu: 'Ellenőrizve', ro: 'Verificat', el: 'Ελέγχθηκε', tr: 'Kontrol edildi', ru: 'Проверено',
      uk: 'Перевірено', ar: 'تم التحقق', he: 'נבדק', hi: 'जाँच की गई', th: 'ตรวจสอบแล้ว',
      vi: 'Đã kiểm tra', id: 'Diperiksa', ja: '確認', ko: '확인됨', zh: '查询于', 'zh-TW': '查詢於'
    },
    'weather.conditionsAt': {
      en: 'Conditions at {time}', es: 'Condiciones a las {time}', fr: 'Conditions à {time}',
      de: 'Bedingungen um {time}', it: 'Condizioni alle {time}', 'pt-BR': 'Condições às {time}',
      'pt-PT': 'Condições às {time}', nl: 'Weer om {time}', da: 'Vejret kl. {time}',
      sv: 'Vädret kl. {time}', nb: 'Været kl. {time}', fi: 'Sää klo {time}',
      pl: 'Warunki o {time}', cs: 'Podmínky v {time}', hu: 'Időjárás ekkor: {time}',
      ro: 'Condiții la {time}', el: 'Συνθήκες στις {time}', tr: '{time} koşulları',
      ru: 'Условия на {time}', uk: 'Умови на {time}', ar: 'الأحوال عند {time}',
      he: 'תנאים בשעה {time}', hi: '{time} पर मौसम', th: 'สภาพอากาศเวลา {time}',
      vi: 'Điều kiện lúc {time}', id: 'Kondisi pukul {time}', ja: '{time}の天気',
      ko: '{time} 기준 날씨', zh: '{time}的天气', 'zh-TW': '{time}的天氣'
    },
    'weather.savedForecast': {
      en: 'Saved forecast', es: 'Pronóstico guardado', fr: 'Prévision enregistrée', de: 'Gespeicherte Vorhersage',
      it: 'Previsioni salvate', 'pt-BR': 'Previsão salva', 'pt-PT': 'Previsão guardada',
      nl: 'Opgeslagen voorspelling', da: 'Gemt vejrudsigt', sv: 'Sparad prognos', nb: 'Lagret værvarsel',
      fi: 'Tallennettu ennuste', pl: 'Zapisana prognoza', cs: 'Uložená předpověď', hu: 'Mentett előrejelzés',
      ro: 'Prognoză salvată', el: 'Αποθηκευμένη πρόγνωση', tr: 'Kaydedilen tahmin', ru: 'Сохранённый прогноз',
      uk: 'Збережений прогноз', ar: 'توقعات محفوظة', he: 'תחזית שמורה', hi: 'सहेजा गया पूर्वानुमान',
      th: 'พยากรณ์ที่บันทึกไว้', vi: 'Dự báo đã lưu', id: 'Prakiraan tersimpan', ja: '保存済みの予報',
      ko: '저장된 예보', zh: '已保存的预报', 'zh-TW': '已儲存的預報'
    },
    'weather.unavailable': {
      en: 'Unavailable', es: 'No disponible', fr: 'Indisponible', de: 'Nicht verfügbar', it: 'Non disponibile',
      'pt-BR': 'Indisponível', 'pt-PT': 'Indisponível', nl: 'Niet beschikbaar', da: 'Utilgængelig', sv: 'Otillgänglig',
      nb: 'Utilgjengelig', fi: 'Ei saatavilla', pl: 'Niedostępne', cs: 'Nedostupné', hu: 'Nem érhető el',
      ro: 'Indisponibil', el: 'Μη διαθέσιμο', tr: 'Kullanılamıyor', ru: 'Недоступно', uk: 'Недоступно',
      ar: 'غير متاح', he: 'לא זמין', hi: 'अनुपलब्ध', th: 'ไม่พร้อมใช้งาน', vi: 'Không khả dụng',
      id: 'Tidak tersedia', ja: '利用できません', ko: '사용할 수 없음', zh: '暂不可用', 'zh-TW': '暫無法使用'
    },
    'weather.tapRetry': {
      en: 'Tap to retry', es: 'Toca para reintentar', fr: 'Appuyez pour réessayer', de: 'Tippen zum erneuten Versuch',
      it: 'Tocca per riprovare', 'pt-BR': 'Toque para tentar de novo', 'pt-PT': 'Toque para tentar novamente',
      nl: 'Tik om opnieuw te proberen', da: 'Tryk for at prøve igen', sv: 'Tryck för att försöka igen',
      nb: 'Trykk for å prøve på nytt', fi: 'Napauta yrittääksesi uudelleen', pl: 'Dotknij, aby spróbować ponownie',
      cs: 'Klepnutím zkuste znovu', hu: 'Koppintson az újrapróbáláshoz', ro: 'Atingeți pentru a reîncerca',
      el: 'Πατήστε για επανάληψη', tr: 'Yeniden denemek için dokunun', ru: 'Нажмите, чтобы повторить',
      uk: 'Натисніть, щоб повторити', ar: 'اضغط لإعادة المحاولة', he: 'הקישו כדי לנסות שוב',
      hi: 'पुनः प्रयास के लिए टैप करें', th: 'แตะเพื่อลองอีกครั้ง', vi: 'Nhấn để thử lại',
      id: 'Ketuk untuk mencoba lagi', ja: 'タップして再試行', ko: '다시 시도하려면 탭하세요',
      zh: '点按重试', 'zh-TW': '點一下重試'
    },
    'weather.high': {
      en: 'H', es: 'Máx.', fr: 'Max', de: 'Max.', it: 'Max', 'pt-BR': 'Máx.', 'pt-PT': 'Máx.', nl: 'Max',
      da: 'Maks.', sv: 'Max', nb: 'Maks', fi: 'Ylin', pl: 'Maks.', cs: 'Max', hu: 'Max', ro: 'Max',
      el: 'Υψ.', tr: 'Yük.', ru: 'Макс.', uk: 'Макс.', ar: 'ع', he: 'ג', hi: 'उ', th: 'สูง', vi: 'Cao',
      id: 'T', ja: '最高', ko: '최고', zh: '最高', 'zh-TW': '最高'
    },
    'weather.low': {
      en: 'L', es: 'Mín.', fr: 'Min', de: 'Min.', it: 'Min', 'pt-BR': 'Mín.', 'pt-PT': 'Mín.', nl: 'Min',
      da: 'Min.', sv: 'Min', nb: 'Min', fi: 'Alin', pl: 'Min.', cs: 'Min', hu: 'Min', ro: 'Min',
      el: 'Χαμ.', tr: 'Düş.', ru: 'Мин.', uk: 'Мін.', ar: 'ص', he: 'נ', hi: 'नि', th: 'ต่ำ', vi: 'Thấp',
      id: 'R', ja: '最低', ko: '최저', zh: '最低', 'zh-TW': '最低'
    },
    'weather.map': {
      en: 'Weather map', es: 'Mapa del tiempo', fr: 'Carte météo', de: 'Wetterkarte', it: 'Mappa meteo',
      'pt-BR': 'Mapa do tempo', 'pt-PT': 'Mapa meteorológico', nl: 'Weerkaart', da: 'Vejrkort', sv: 'Väderkarta',
      nb: 'Værkart', fi: 'Sääkartta', pl: 'Mapa pogody', cs: 'Mapa počasí', hu: 'Időjárási térkép', ro: 'Hartă meteo',
      el: 'Χάρτης καιρού', tr: 'Hava durumu haritası', ru: 'Карта погоды', uk: 'Мапа погоди', ar: 'خريطة الطقس',
      he: 'מפת מזג האוויר', hi: 'मौसम मानचित्र', th: 'แผนที่สภาพอากาศ', vi: 'Bản đồ thời tiết', id: 'Peta cuaca',
      ja: '天気マップ', ko: '날씨 지도', zh: '天气地图', 'zh-TW': '天氣地圖'
    },
    'weather.mapShort': {
      en: 'Map', es: 'Mapa', fr: 'Carte', de: 'Karte', it: 'Mappa', 'pt-BR': 'Mapa', 'pt-PT': 'Mapa', nl: 'Kaart',
      da: 'Kort', sv: 'Karta', nb: 'Kart', fi: 'Kartta', pl: 'Mapa', cs: 'Mapa', hu: 'Térkép', ro: 'Hartă',
      el: 'Χάρτης', tr: 'Harita', ru: 'Карта', uk: 'Мапа', ar: 'خريطة', he: 'מפה', hi: 'मानचित्र', th: 'แผนที่',
      vi: 'Bản đồ', id: 'Peta', ja: '地図', ko: '지도', zh: '地图', 'zh-TW': '地圖'
    },
    'weather.mapSubtitle': {
      en: 'Explore conditions around the world', es: 'Explora las condiciones en todo el mundo',
      fr: 'Explorez la météo dans le monde entier', de: 'Wetter weltweit entdecken', it: 'Esplora il meteo nel mondo',
      'pt-BR': 'Explore as condições ao redor do mundo', 'pt-PT': 'Explore as condições em todo o mundo',
      nl: 'Bekijk het weer over de hele wereld', da: 'Se vejret rundt om i verden', sv: 'Utforska vädret runt om i världen',
      nb: 'Utforsk været rundt om i verden', fi: 'Tutki säätä eri puolilla maailmaa', pl: 'Sprawdź pogodę na całym świecie',
      cs: 'Prozkoumejte počasí po celém světě', hu: 'Fedezd fel az időjárást világszerte', ro: 'Explorează vremea din întreaga lume',
      el: 'Εξερευνήστε τον καιρό σε όλο τον κόσμο', tr: 'Dünyanın dört bir yanındaki hava durumunu keşfedin',
      ru: 'Изучайте погоду по всему миру', uk: 'Переглядайте погоду в усьому світі', ar: 'استكشف الطقس حول العالم',
      he: 'גלו את תנאי מזג האוויר ברחבי העולם', hi: 'दुनिया भर के मौसम का अन्वेषण करें', th: 'สำรวจสภาพอากาศทั่วโลก',
      vi: 'Khám phá thời tiết trên khắp thế giới', id: 'Jelajahi kondisi cuaca di seluruh dunia',
      ja: '世界各地の天気を確認', ko: '전 세계 날씨를 살펴보세요', zh: '探索全球天气', 'zh-TW': '探索全球天氣'
    },
    'weather.mapLayers': {
      en: 'Weather layers', es: 'Capas meteorológicas', fr: 'Couches météo', de: 'Wetterebenen', it: 'Livelli meteo',
      'pt-BR': 'Camadas do tempo', 'pt-PT': 'Camadas meteorológicas', nl: 'Weerlagen', da: 'Vejrlag', sv: 'Väderlager',
      nb: 'Værlag', fi: 'Sääkerrokset', pl: 'Warstwy pogody', cs: 'Vrstvy počasí', hu: 'Időjárási rétegek', ro: 'Straturi meteo',
      el: 'Επίπεδα καιρού', tr: 'Hava durumu katmanları', ru: 'Слои погоды', uk: 'Шари погоди', ar: 'طبقات الطقس',
      he: 'שכבות מזג אוויר', hi: 'मौसम परतें', th: 'ชั้นข้อมูลสภาพอากาศ', vi: 'Lớp thời tiết', id: 'Lapisan cuaca',
      ja: '天気レイヤ', ko: '날씨 레이어', zh: '天气图层', 'zh-TW': '天氣圖層'
    },
    'weather.mapControls': {
      en: 'Map controls', es: 'Controles del mapa', fr: 'Commandes de la carte', de: 'Kartensteuerung', it: 'Controlli della mappa',
      'pt-BR': 'Controles do mapa', 'pt-PT': 'Controlos do mapa', nl: 'Kaartbediening', da: 'Kortkontroller',
      sv: 'Kartkontroller', nb: 'Kartkontroller', fi: 'Kartan säätimet', pl: 'Sterowanie mapą', cs: 'Ovládání mapy',
      hu: 'Térképvezérlők', ro: 'Comenzi hartă', el: 'Χειριστήρια χάρτη', tr: 'Harita kontrolleri',
      ru: 'Элементы управления картой', uk: 'Керування мапою', ar: 'عناصر التحكم بالخريطة', he: 'פקדי מפה',
      hi: 'मानचित्र नियंत्रण', th: 'ตัวควบคุมแผนที่', vi: 'Điều khiển bản đồ', id: 'Kontrol peta',
      ja: '地図コントロール', ko: '지도 컨트롤', zh: '地图控件', 'zh-TW': '地圖控制項'
    },
    'weather.zoomIn': {
      en: 'Zoom in', es: 'Acercar', fr: 'Zoom avant', de: 'Vergrößern', it: 'Ingrandisci', 'pt-BR': 'Aumentar zoom',
      'pt-PT': 'Aumentar zoom', nl: 'Inzoomen', da: 'Zoom ind', sv: 'Zooma in', nb: 'Zoom inn', fi: 'Lähennä',
      pl: 'Przybliż', cs: 'Přiblížit', hu: 'Nagyítás', ro: 'Mărește', el: 'Μεγέθυνση', tr: 'Yakınlaştır',
      ru: 'Увеличить', uk: 'Збільшити', ar: 'تكبير', he: 'התקרבות', hi: 'ज़ूम इन', th: 'ซูมเข้า',
      vi: 'Phóng to', id: 'Perbesar', ja: '拡大', ko: '확대', zh: '放大', 'zh-TW': '放大'
    },
    'weather.zoomOut': {
      en: 'Zoom out', es: 'Alejar', fr: 'Zoom arrière', de: 'Verkleinern', it: 'Riduci', 'pt-BR': 'Diminuir zoom',
      'pt-PT': 'Diminuir zoom', nl: 'Uitzoomen', da: 'Zoom ud', sv: 'Zooma ut', nb: 'Zoom ut', fi: 'Loitonna',
      pl: 'Oddal', cs: 'Oddálit', hu: 'Kicsinyítés', ro: 'Micșorează', el: 'Σμίκρυνση', tr: 'Uzaklaştır',
      ru: 'Уменьшить', uk: 'Зменшити', ar: 'تصغير', he: 'התרחקות', hi: 'ज़ूम आउट', th: 'ซูมออก',
      vi: 'Thu nhỏ', id: 'Perkecil', ja: '縮小', ko: '축소', zh: '缩小', 'zh-TW': '縮小'
    },
    'weather.mapInteractive': {
      en: 'Interactive weather map', es: 'Mapa meteorológico interactivo', fr: 'Carte météo interactive',
      de: 'Interaktive Wetterkarte', it: 'Mappa meteo interattiva', 'pt-BR': 'Mapa do tempo interativo',
      'pt-PT': 'Mapa meteorológico interativo', nl: 'Interactieve weerkaart', da: 'Interaktivt vejrkort',
      sv: 'Interaktiv väderkarta', nb: 'Interaktivt værkart', fi: 'Interaktiivinen sääkartta', pl: 'Interaktywna mapa pogody',
      cs: 'Interaktivní mapa počasí', hu: 'Interaktív időjárási térkép', ro: 'Hartă meteo interactivă',
      el: 'Διαδραστικός χάρτης καιρού', tr: 'Etkileşimli hava durumu haritası', ru: 'Интерактивная карта погоды',
      uk: 'Інтерактивна мапа погоди', ar: 'خريطة طقس تفاعلية', he: 'מפת מזג אוויר אינטראקטיבית',
      hi: 'इंटरैक्टिव मौसम मानचित्र', th: 'แผนที่สภาพอากาศแบบโต้ตอบ', vi: 'Bản đồ thời tiết tương tác',
      id: 'Peta cuaca interaktif', ja: 'インタラクティブな天気マップ', ko: '대화형 날씨 지도',
      zh: '交互式天气地图', 'zh-TW': '互動式天氣地圖'
    },
    'weather.mapForecastHour': {
      en: 'Forecast hour · UTC', es: 'Hora del pronóstico · UTC', fr: 'Heure prévue · UTC', de: 'Vorhersagestunde · UTC',
      it: 'Ora prevista · UTC', 'pt-BR': 'Hora da previsão · UTC', 'pt-PT': 'Hora da previsão · UTC',
      nl: 'Prognose-uur · UTC', da: 'Prognosetime · UTC', sv: 'Prognostimme · UTC', nb: 'Varseltime · UTC',
      fi: 'Ennustetunti · UTC', pl: 'Godzina prognozy · UTC', cs: 'Hodina předpovědi · UTC',
      hu: 'Előrejelzés órája · UTC', ro: 'Ora prognozei · UTC', el: 'Ώρα πρόγνωσης · UTC',
      tr: 'Tahmin saati · UTC', ru: 'Час прогноза · UTC', uk: 'Година прогнозу · UTC', ar: 'ساعة التوقع · UTC',
      he: 'שעת התחזית · UTC', hi: 'पूर्वानुमान का घंटा · UTC', th: 'ชั่วโมงพยากรณ์ · UTC',
      vi: 'Giờ dự báo · UTC', id: 'Jam prakiraan · UTC', ja: '予報時刻 · UTC', ko: '예보 시각 · UTC',
      zh: '预报时刻 · UTC', 'zh-TW': '預報時刻 · UTC'
    },
    'weather.mapLoading': {
      en: 'Loading map…', es: 'Cargando el mapa…', fr: 'Chargement de la carte…', de: 'Karte wird geladen…',
      it: 'Caricamento mappa…', 'pt-BR': 'Carregando o mapa…', 'pt-PT': 'A carregar o mapa…',
      nl: 'Kaart laden…', da: 'Kort indlæses…', sv: 'Kart laddas…', nb: 'Laster kart…', fi: 'Ladataan karttaa…',
      pl: 'Wczytywanie mapy…', cs: 'Načítání mapy…', hu: 'Térkép betöltése…', ro: 'Se încarcă harta…',
      el: 'Φόρτωση χάρτη…', tr: 'Harita yükleniyor…', ru: 'Загрузка карты…', uk: 'Завантаження мапи…',
      ar: 'جارٍ تحميل الخريطة…', he: 'המפה נטענת…', hi: 'मानचित्र लोड हो रहा है…', th: 'กำลังโหลดแผนที่…',
      vi: 'Đang tải bản đồ…', id: 'Memuat peta…', ja: '地図を読み込み中…', ko: '지도를 불러오는 중…',
      zh: '正在加载地图…', 'zh-TW': '正在載入地圖…'
    },
    'weather.mapLoadingWeather': {
      en: 'Loading nearby forecast…', es: 'Cargando el pronóstico cercano…', fr: 'Chargement des prévisions à proximité…',
      de: 'Vorhersage für die Umgebung wird geladen…', it: 'Caricamento delle previsioni vicine…',
      'pt-BR': 'Carregando a previsão da região…', 'pt-PT': 'A carregar a previsão local…',
      nl: 'Weerverwachting in de buurt laden…', da: 'Indlæser den lokale prognose…', sv: 'Laddar prognos i närheten…',
      nb: 'Laster varsel for nærområdet…', fi: 'Ladataan lähialueen ennustetta…', pl: 'Wczytywanie prognozy w pobliżu…',
      cs: 'Načítání předpovědi v okolí…', hu: 'Közeli előrejelzés betöltése…', ro: 'Se încarcă prognoza din apropiere…',
      el: 'Φόρτωση κοντινής πρόγνωσης…', tr: 'Yakın bölge tahmini yükleniyor…', ru: 'Загрузка местного прогноза…',
      uk: 'Завантаження прогнозу поблизу…', ar: 'جارٍ تحميل التوقعات القريبة…', he: 'התחזית באזור נטענת…',
      hi: 'आस-पास का पूर्वानुमान लोड हो रहा है…', th: 'กำลังโหลดพยากรณ์บริเวณใกล้เคียง…',
      vi: 'Đang tải dự báo khu vực lân cận…', id: 'Memuat prakiraan di sekitar…', ja: '周辺の予報を読み込み中…',
      ko: '주변 예보를 불러오는 중…', zh: '正在加载附近预报…', 'zh-TW': '正在載入附近預報…'
    },
    'weather.mapWeatherUnavailable': {
      en: 'Weather layers are unavailable right now.', es: 'Las capas meteorológicas no están disponibles ahora.',
      fr: 'Les couches météo sont indisponibles pour le moment.', de: 'Wetterebenen sind derzeit nicht verfügbar.',
      it: 'I livelli meteo non sono disponibili al momento.', 'pt-BR': 'As camadas do tempo estão indisponíveis no momento.',
      'pt-PT': 'As camadas meteorológicas estão indisponíveis neste momento.', nl: 'Weerlagen zijn momenteel niet beschikbaar.',
      da: 'Vejrlag er ikke tilgængelige lige nu.', sv: 'Väderlager är inte tillgängliga just nu.',
      nb: 'Værlag er ikke tilgjengelige akkurat nå.', fi: 'Sääkerrokset eivät ole juuri nyt saatavilla.',
      pl: 'Warstwy pogody są teraz niedostępne.', cs: 'Vrstvy počasí teď nejsou k dispozici.',
      hu: 'Az időjárási rétegek jelenleg nem érhetők el.', ro: 'Straturile meteo nu sunt disponibile acum.',
      el: 'Τα επίπεδα καιρού δεν είναι διαθέσιμα αυτή τη στιγμή.', tr: 'Hava durumu katmanları şu anda kullanılamıyor.',
      ru: 'Слои погоды сейчас недоступны.', uk: 'Шари погоди наразі недоступні.', ar: 'طبقات الطقس غير متاحة الآن.',
      he: 'שכבות מזג האוויר אינן זמינות כרגע.', hi: 'मौसम परतें अभी उपलब्ध नहीं हैं।',
      th: 'ชั้นข้อมูลสภาพอากาศยังไม่พร้อมใช้งานในขณะนี้', vi: 'Các lớp thời tiết hiện không khả dụng.',
      id: 'Lapisan cuaca sedang tidak tersedia.', ja: '現在、天気レイヤを利用できません。',
      ko: '현재 날씨 레이어를 사용할 수 없습니다.', zh: '天气图层暂时不可用。', 'zh-TW': '天氣圖層目前無法使用。'
    },
    'weather.mapTilesUnavailable': {
      en: 'Detailed map tiles are unavailable. Showing the local schematic map.',
      es: 'Los mapas detallados no están disponibles. Se muestra el mapa esquemático local.',
      fr: 'Les tuiles détaillées sont indisponibles. La carte schématique locale est affichée.',
      de: 'Detaillierte Kartenkacheln sind nicht verfügbar. Die lokale Übersichtskarte wird angezeigt.',
      it: 'Le mappe dettagliate non sono disponibili. Viene mostrata la mappa schematica locale.',
      'pt-BR': 'Os mapas detalhados estão indisponíveis. Exibindo o mapa esquemático local.',
      'pt-PT': 'Os mapas detalhados estão indisponíveis. A mostrar o mapa esquemático local.',
      nl: 'Gedetailleerde kaarttegels zijn niet beschikbaar. De lokale schematische kaart wordt getoond.',
      da: 'Detaljerede kortfelter er ikke tilgængelige. Det lokale skematiske kort vises.',
      sv: 'Detaljerade kartplattor är inte tillgängliga. Den lokala schematiska kartan visas.',
      nb: 'Detaljerte kartfliser er ikke tilgjengelige. Det lokale skjematiske kartet vises.',
      fi: 'Tarkat karttaruudut eivät ole saatavilla. Näytetään paikallinen kaaviokartta.',
      pl: 'Szczegółowe kafelki mapy są niedostępne. Wyświetlana jest lokalna mapa schematyczna.',
      cs: 'Podrobné mapové dlaždice nejsou dostupné. Zobrazuje se místní schematická mapa.',
      hu: 'A részletes térképcsempék nem érhetők el. A helyi sematikus térkép látható.',
      ro: 'Dalele detaliate ale hărții nu sunt disponibile. Se afișează harta schematică locală.',
      el: 'Τα λεπτομερή πλακίδια χάρτη δεν είναι διαθέσιμα. Εμφανίζεται ο τοπικός σχηματικός χάρτης.',
      tr: 'Ayrıntılı harita döşemeleri kullanılamıyor. Yerel şematik harita gösteriliyor.',
      ru: 'Подробные фрагменты карты недоступны. Показана локальная схема карты.',
      uk: 'Детальні фрагменти мапи недоступні. Показано локальну схематичну мапу.',
      ar: 'مربعات الخريطة التفصيلية غير متاحة. يتم عرض الخريطة التخطيطية المحلية.',
      he: 'אריחי המפה המפורטים אינם זמינים. מוצגת מפה סכמטית מקומית.',
      hi: 'विस्तृत मानचित्र टाइलें उपलब्ध नहीं हैं। स्थानीय योजनात्मक मानचित्र दिखाया जा रहा है।',
      th: 'ไทล์แผนที่แบบละเอียดไม่พร้อมใช้งาน กำลังแสดงแผนผังแผนที่ในตัว',
      vi: 'Các ô bản đồ chi tiết hiện không khả dụng. Đang hiển thị sơ đồ bản đồ cục bộ.',
      id: 'Ubin peta terperinci tidak tersedia. Menampilkan peta skematis lokal.',
      ja: '詳細な地図タイルを利用できないため、内蔵の簡易地図を表示しています。',
      ko: '상세 지도 타일을 사용할 수 없어 기본 도식 지도를 표시합니다.',
      zh: '详细地图瓦片暂不可用，正在显示本地示意地图。', 'zh-TW': '詳細地圖磚目前無法使用，正在顯示內建示意地圖。'
    },
    'weather.mapSchematicCredit': {
      en: 'Schematic map · City positions are approximate', es: 'Mapa esquemático · Ubicaciones aproximadas',
      fr: 'Carte schématique · Positions approximatives', de: 'Schematische Karte · Ungefähre Stadtpositionen',
      it: 'Mappa schematica · Posizioni approssimative', 'pt-BR': 'Mapa esquemático · Posições aproximadas',
      'pt-PT': 'Mapa esquemático · Posições aproximadas', nl: 'Schematische kaart · Steden liggen bij benadering',
      da: 'Skematisk kort · Byplaceringer er omtrentlige', sv: 'Schematisk karta · Städernas lägen är ungefärliga',
      nb: 'Skjematisk kart · Byplasseringer er omtrentlige', fi: 'Kaaviokartta · Kaupunkien sijainnit ovat suuntaa-antavia',
      pl: 'Mapa schematyczna · Przybliżone położenie miast', cs: 'Schematická mapa · Přibližná poloha měst',
      hu: 'Sematikus térkép · A városok helye hozzávetőleges', ro: 'Hartă schematică · Pozițiile orașelor sunt aproximative',
      el: 'Σχηματικός χάρτης · Οι θέσεις των πόλεων είναι κατά προσέγγιση',
      tr: 'Şematik harita · Şehir konumları yaklaşık gösterilir', ru: 'Схема карты · Положение городов приблизительное',
      uk: 'Схематична мапа · Розташування міст приблизне', ar: 'خريطة تخطيطية · مواقع المدن تقريبية',
      he: 'מפה סכמטית · מיקומי הערים משוערים', hi: 'योजनात्मक मानचित्र · शहरों की स्थिति अनुमानित है',
      th: 'แผนผังแผนที่ · ตำแหน่งเมืองเป็นค่าโดยประมาณ', vi: 'Sơ đồ bản đồ · Vị trí thành phố chỉ gần đúng',
      id: 'Peta skematis · Posisi kota hanya perkiraan', ja: '簡易地図 · 都市の位置はおおよその表示です',
      ko: '도식 지도 · 도시 위치는 대략적입니다', zh: '示意地图 · 城市位置为近似值', 'zh-TW': '示意地圖 · 城市位置為約略值'
    },
    'weather.highFull': {
      en: 'High', es: 'Máxima', fr: 'Maximum', de: 'Hoch', it: 'Massima', 'pt-BR': 'Máxima', 'pt-PT': 'Máxima',
      nl: 'Hoog', da: 'Høj', sv: 'Hög', nb: 'Høy', fi: 'Ylin', pl: 'Maksimum', cs: 'Maximum', hu: 'Maximum',
      ro: 'Maximă', el: 'Μέγιστη', tr: 'En yüksek', ru: 'Максимум', uk: 'Максимум', ar: 'العظمى', he: 'מרבית',
      hi: 'अधिकतम', th: 'สูงสุด', vi: 'Cao nhất', id: 'Tertinggi', ja: '最高', ko: '최고', zh: '最高', 'zh-TW': '最高'
    },
    'weather.lowFull': {
      en: 'Low', es: 'Mínima', fr: 'Minimum', de: 'Tief', it: 'Minima', 'pt-BR': 'Mínima', 'pt-PT': 'Mínima',
      nl: 'Laag', da: 'Lav', sv: 'Låg', nb: 'Lav', fi: 'Alin', pl: 'Minimum', cs: 'Minimum', hu: 'Minimum',
      ro: 'Minimă', el: 'Ελάχιστη', tr: 'En düşük', ru: 'Минимум', uk: 'Мінімум', ar: 'الصغرى', he: 'מזערית',
      hi: 'न्यूनतम', th: 'ต่ำสุด', vi: 'Thấp nhất', id: 'Terendah', ja: '最低', ko: '최저', zh: '最低', 'zh-TW': '最低'
    },
    'weather.hourly': {
      en: 'Hourly Forecast', es: 'Por hora', fr: 'Prévisions horaires', de: 'Stündlich', it: 'Previsione oraria',
      'pt-BR': 'Previsão por hora', 'pt-PT': 'Previsão horária', nl: 'Uurlijkse verwachting', da: 'Timeprognose',
      sv: 'Timprognos', nb: 'Timevarsel', fi: 'Tuntiennuste', pl: 'Prognoza godzinowa', cs: 'Hodinová předpověď',
      hu: 'Óránkénti előrejelzés', ro: 'Prognoză orară', el: 'Ωριαία πρόγνωση', tr: 'Saatlik tahmin',
      ru: 'Почасовой прогноз', uk: 'Погодинний прогноз', ar: 'التوقعات الساعية', he: 'תחזית שעתית',
      hi: 'घंटेवार पूर्वानुमान', th: 'พยากรณ์รายชั่วโมง', vi: 'Dự báo theo giờ', id: 'Prakiraan per jam',
      ja: '1時間ごと', ko: '시간별 예보', zh: '小时预报', 'zh-TW': '每小時預報'
    },
    'weather.daily': {
      en: '10-Day Forecast', es: 'Próximos 10 días', fr: 'Prévisions sur 10 jours', de: '10-Tage-Vorhersage',
      it: 'Previsione a 10 giorni', 'pt-BR': 'Previsão de 10 dias', 'pt-PT': 'Previsão de 10 dias',
      nl: '10-daagse verwachting', da: '10-døgnsprognose', sv: '10-dygnsprognos', nb: '10-dagersvarsel',
      fi: '10 vuorokauden ennuste', pl: 'Prognoza 10-dniowa', cs: '10denní předpověď', hu: '10 napos előrejelzés',
      ro: 'Prognoză pe 10 zile', el: 'Πρόγνωση 10 ημερών', tr: '10 günlük tahmin', ru: 'Прогноз на 10 дней',
      uk: 'Прогноз на 10 днів', ar: 'توقعات 10 أيام', he: 'תחזית ל־10 ימים', hi: '10-दिन का पूर्वानुमान',
      th: 'พยากรณ์ 10 วัน', vi: 'Dự báo 10 ngày', id: 'Prakiraan 10 hari', ja: '10日間予報',
      ko: '10일 예보', zh: '10日预报', 'zh-TW': '10 天預報'
    },
    'weather.daily7': {
      en: '7-Day Forecast', es: 'Próximos 7 días', fr: 'Prévisions sur 7 jours', de: '7-Tage-Vorhersage',
      it: 'Previsione a 7 giorni', 'pt-BR': 'Previsão de 7 dias', 'pt-PT': 'Previsão de 7 dias',
      nl: '7-daagse verwachting', da: '7-døgnsprognose', sv: '7-dygnsprognos', nb: '7-dagersvarsel',
      fi: '7 vuorokauden ennuste', pl: 'Prognoza 7-dniowa', cs: '7denní předpověď', hu: '7 napos előrejelzés',
      ro: 'Prognoză pe 7 zile', el: 'Πρόγνωση 7 ημερών', tr: '7 günlük tahmin', ru: 'Прогноз на 7 дней',
      uk: 'Прогноз на 7 днів', ar: 'توقعات 7 أيام', he: 'תחזית ל־7 ימים', hi: '7-दिन का पूर्वानुमान',
      th: 'พยากรณ์ 7 วัน', vi: 'Dự báo 7 ngày', id: 'Prakiraan 7 hari', ja: '7日間予報',
      ko: '7일 예보', zh: '7日预报', 'zh-TW': '7 天預報'
    },
    'weather.dailyN': {
      en: '{n}-Day Forecast', es: 'Próximos {n} días', fr: 'Prévisions sur {n} jours', de: '{n}-Tage-Vorhersage',
      it: 'Previsione a {n} giorni', 'pt-BR': 'Previsão de {n} dias', 'pt-PT': 'Previsão de {n} dias',
      nl: '{n}-daagse verwachting', da: '{n}-døgnsprognose', sv: '{n}-dygnsprognos', nb: '{n}-dagersvarsel',
      fi: '{n} vuorokauden ennuste', pl: 'Prognoza {n}-dniowa', cs: '{n}denní předpověď', hu: '{n} napos előrejelzés',
      ro: 'Prognoză pe {n} zile', el: 'Πρόγνωση {n} ημερών', tr: '{n} günlük tahmin', ru: 'Прогноз на {n} дней',
      uk: 'Прогноз на {n} днів', ar: 'توقعات {n} أيام', he: 'תחזית ל־{n} ימים', hi: '{n}-दिन का पूर्वानुमान',
      th: 'พยากรณ์ {n} วัน', vi: 'Dự báo {n} ngày', id: 'Prakiraan {n} hari', ja: '{n}日間予報',
      ko: '{n}일 예보', zh: '{n}日预报', 'zh-TW': '{n} 天預報'
    },
    'weather.solarNoon': {
      en: 'Solar Noon', es: 'Mediodía solar', fr: 'Midi solaire', de: 'Sonnenmittag', it: 'Mezzogiorno solare',
      'pt-BR': 'Meio-dia solar', 'pt-PT': 'Meio-dia solar', nl: 'Zonnemiddag', da: 'Solmiddag', sv: 'Solmiddag',
      nb: 'Solmiddag', fi: 'Auringon keskipäivä', pl: 'Południe słoneczne', cs: 'Sluneční poledne',
      hu: 'Napdelelés', ro: 'Amiaza solară', el: 'Ηλιακό μεσημέρι', tr: 'Güneş öğlesi',
      ru: 'Солнечный полдень', uk: 'Сонячна полудень', ar: 'الظهيرة الشمسية', he: 'צהרי שמש',
      hi: 'सौर दोपहर', th: 'เที่ยงสุริยะ', vi: 'Buổi trưa mặt trời', id: 'Tengah hari matahari',
      ja: '南中', ko: '태양 정오', zh: '太阳正午', 'zh-TW': '太陽正午'
    },
    'weather.feelsLike': {
      en: 'Feels like', es: 'Sensación', fr: 'Ressenti', de: 'Gefühlt', it: 'Percepita', 'pt-BR': 'Sensação',
      'pt-PT': 'Sensação', nl: 'Voelt als', da: 'Føles som', sv: 'Känns som', nb: 'Føles som', fi: 'Tuntuu kuin',
      pl: 'Odczuwalna', cs: 'Pocitově', hu: 'Hőérzet', ro: 'Se simte ca', el: 'Αίσθηση', tr: 'Hissedilen',
      ru: 'Ощущается', uk: 'Відчувається', ar: 'الإحساس', he: 'מרגיש כמו', hi: 'महसूस', th: 'รู้สึกเหมือน',
      vi: 'Cảm giác', id: 'Terasa', ja: '体感', ko: '체감', zh: '体感', 'zh-TW': '體感'
    },
    'weather.actual': {
      en: 'Actual', es: 'Real', fr: 'Réelle', de: 'Tatsächlich', it: 'Reale', 'pt-BR': 'Real', 'pt-PT': 'Real',
      nl: 'Werkelijk', da: 'Faktisk', sv: 'Faktisk', nb: 'Faktisk', fi: 'Todellinen', pl: 'Rzeczywista',
      cs: 'Skutečná', hu: 'Tényleges', ro: 'Reală', el: 'Πραγματική', tr: 'Gerçek', ru: 'Фактическая',
      uk: 'Фактична', ar: 'فعلي', he: 'בפועל', hi: 'वास्तविक', th: 'จริง', vi: 'Thực tế', id: 'Aktual',
      ja: '実際', ko: '실제', zh: '实际', 'zh-TW': '實際'
    },
    'weather.chanceOfPrecipitation': {
      en: 'Chance of precipitation', es: 'Probabilidad de precipitación', fr: 'Probabilité de précipitations',
      de: 'Niederschlagswahrscheinlichkeit', it: 'Probabilità di precipitazioni',
      'pt-BR': 'Probabilidade de precipitação', 'pt-PT': 'Probabilidade de precipitação', nl: 'Kans op neerslag',
      da: 'Risiko for nedbør', sv: 'Risk för nederbörd', nb: 'Sannsynlighet for nedbør', fi: 'Sateen todennäköisyys',
      pl: 'Prawdopodobieństwo opadów', cs: 'Pravděpodobnost srážek', hu: 'Csapadék valószínűsége',
      ro: 'Probabilitatea precipitațiilor', el: 'Πιθανότητα υετού', tr: 'Yağış olasılığı', ru: 'Вероятность осадков',
      uk: 'Ймовірність опадів', ar: 'احتمال هطول الأمطار', he: 'סיכוי למשקעים', hi: 'वर्षा की संभावना',
      th: 'โอกาสเกิดฝน', vi: 'Khả năng có mưa', id: 'Kemungkinan presipitasi', ja: '降水確率', ko: '강수 확률',
      zh: '降水概率', 'zh-TW': '降水機率'
    },
    'weather.actual': {
      en: 'Actual', es: 'Real', fr: 'Réelle', de: 'Tatsächlich', it: 'Reale', 'pt-BR': 'Real', 'pt-PT': 'Real',
      nl: 'Werkelijk', da: 'Faktisk', sv: 'Faktisk', nb: 'Faktisk', fi: 'Todellinen', pl: 'Rzeczywista',
      cs: 'Skutečná', hu: 'Tényleges', ro: 'Reală', el: 'Πραγματική', tr: 'Gerçek', ru: 'Фактическая',
      uk: 'Фактична', ar: 'فعلي', he: 'בפועל', hi: 'वास्तविक', th: 'จริง', vi: 'Thực tế', id: 'Aktual',
      ja: '実際', ko: '실제', zh: '实际', 'zh-TW': '實際'
    },
    'weather.chanceOfPrecipitation': {
      en: 'Chance of precipitation', es: 'Probabilidad de precipitación', fr: 'Probabilité de précipitations',
      de: 'Niederschlagswahrscheinlichkeit', it: 'Probabilità di precipitazioni',
      'pt-BR': 'Probabilidade de precipitação', 'pt-PT': 'Probabilidade de precipitação', nl: 'Kans op neerslag',
      da: 'Risiko for nedbør', sv: 'Risk för nederbörd', nb: 'Sannsynlighet for nedbør', fi: 'Sateen todennäköisyys',
      pl: 'Prawdopodobieństwo opadów', cs: 'Pravděpodobnost srážek', hu: 'Csapadék valószínűsége',
      ro: 'Probabilitatea precipitațiilor', el: 'Πιθανότητα υετού', tr: 'Yağış olasılığı', ru: 'Вероятность осадков',
      uk: 'Ймовірність опадів', ar: 'احتمال هطول الأمطار', he: 'סיכוי למשקעים', hi: 'वर्षा की संभावना',
      th: 'โอกาสเกิดฝน', vi: 'Khả năng có mưa', id: 'Kemungkinan presipitasi', ja: '降水確率', ko: '강수 확률',
      zh: '降水概率', 'zh-TW': '降水機率'
    },
    'weather.humidity': {
      en: 'Humidity', es: 'Humedad', fr: 'Humidité', de: 'Luftfeuchtigkeit', it: 'Umidità', 'pt-BR': 'Umidade',
      'pt-PT': 'Humidade', nl: 'Luchtvochtigheid', da: 'Luftfugtighed', sv: 'Luftfuktighet', nb: 'Luftfuktighet',
      fi: 'Kosteus', pl: 'Wilgotność', cs: 'Vlhkost', hu: 'Páratartalom', ro: 'Umiditate', el: 'Υγρασία',
      tr: 'Nem', ru: 'Влажность', uk: 'Вологість', ar: 'الرطوبة', he: 'לחות', hi: 'आर्द्रता', th: 'ความชื้น',
      vi: 'Độ ẩm', id: 'Kelembapan', ja: '湿度', ko: '습도', zh: '湿度', 'zh-TW': '濕度'
    },
    'weather.wind': {
      en: 'Wind', es: 'Viento', fr: 'Vent', de: 'Wind', it: 'Vento', 'pt-BR': 'Vento', 'pt-PT': 'Vento',
      nl: 'Wind', da: 'Vind', sv: 'Vind', nb: 'Vind', fi: 'Tuuli', pl: 'Wiatr', cs: 'Vítr', hu: 'Szél',
      ro: 'Vânt', el: 'Άνεμος', tr: 'Rüzgar', ru: 'Ветер', uk: 'Вітер', ar: 'الرياح', he: 'רוח', hi: 'हवा',
      th: 'ลม', vi: 'Gió', id: 'Angin', ja: '風', ko: '바람', zh: '风', 'zh-TW': '風'
    },
    'weather.uv': {
      en: 'UV Index', es: 'Índice UV', fr: 'Indice UV', de: 'UV-Index', it: 'Indice UV', 'pt-BR': 'Índice UV',
      'pt-PT': 'Índice UV', nl: 'UV-index', da: 'UV-indeks', sv: 'UV-index', nb: 'UV-indeks', fi: 'UV-indeksi',
      pl: 'Indeks UV', cs: 'UV index', hu: 'UV-index', ro: 'Index UV', el: 'Δείκτης UV', tr: 'UV indeksi',
      ru: 'УФ-индекс', uk: 'УФ-індекс', ar: 'مؤشر الأشعة فوق البنفسجية', he: 'מדד UV', hi: 'यूवी सूचकांक',
      th: 'ดัชนี UV', vi: 'Chỉ số UV', id: 'Indeks UV', ja: '紫外線', ko: '자외선', zh: '紫外线', 'zh-TW': '紫外線'
    },
    'weather.aqi': {
      en: 'Air Quality', es: 'Calidad del aire', fr: 'Qualité de l’air', de: 'Luftqualität', it: 'Qualità dell’aria',
      'pt-BR': 'Qualidade do ar', 'pt-PT': 'Qualidade do ar', nl: 'Luchtkwaliteit', da: 'Luftkvalitet',
      sv: 'Luftkvalitet', nb: 'Luftkvalitet', fi: 'Ilmanlaatu', pl: 'Jakość powietrza', cs: 'Kvalita ovzduší',
      hu: 'Levegőminőség', ro: 'Calitatea aerului', el: 'Ποιότητα αέρα', tr: 'Hava kalitesi',
      ru: 'Качество воздуха', uk: 'Якість повітря', ar: 'جودة الهواء', he: 'איכות אוויר', hi: 'वायु गुणवत्ता',
      th: 'คุณภาพอากาศ', vi: 'Chất lượng không khí', id: 'Kualitas udara', ja: '大気質', ko: '대기질',
      zh: '空气质量', 'zh-TW': '空氣品質'
    },
    'weather.visibility': {
      en: 'Visibility', es: 'Visibilidad', fr: 'Visibilité', de: 'Sichtweite', it: 'Visibilità',
      'pt-BR': 'Visibilidade', 'pt-PT': 'Visibilidade', nl: 'Zicht', da: 'Sigtbarhed', sv: 'Sikt', nb: 'Sikt',
      fi: 'Näkyvyys', pl: 'Widoczność', cs: 'Dohlednost', hu: 'Látótávolság', ro: 'Vizibilitate',
      el: 'Ορατότητα', tr: 'Görüş', ru: 'Видимость', uk: 'Видимість', ar: 'مدى الرؤية', he: 'ראות',
      hi: 'दृश्यता', th: 'ทัศนวิสัย', vi: 'Tầm nhìn', id: 'Jarak pandang', ja: '視程', ko: '가시거리',
      zh: '能见度', 'zh-TW': '能見度'
    },
    'weather.pressure': {
      en: 'Pressure', es: 'Presión', fr: 'Pression', de: 'Luftdruck', it: 'Pressione', 'pt-BR': 'Pressão',
      'pt-PT': 'Pressão', nl: 'Luchtdruk', da: 'Tryk', sv: 'Tryck', nb: 'Trykk', fi: 'Paine', pl: 'Ciśnienie',
      cs: 'Tlak', hu: 'Légnyomás', ro: 'Presiune', el: 'Πίεση', tr: 'Basınç', ru: 'Давление', uk: 'Тиск',
      ar: 'الضغط', he: 'לחץ', hi: 'दबाव', th: 'ความกดอากาศ', vi: 'Áp suất', id: 'Tekanan', ja: '気圧',
      ko: '기압', zh: '气压', 'zh-TW': '氣壓'
    },
    'weather.precip': {
      en: 'Precipitation', es: 'Precipitación', fr: 'Précipitations', de: 'Niederschlag', it: 'Precipitazioni',
      'pt-BR': 'Precipitação', 'pt-PT': 'Precipitação', nl: 'Neerslag', da: 'Nedbør', sv: 'Nederbörd',
      nb: 'Nedbør', fi: 'Sademäärä', pl: 'Opady', cs: 'Srážky', hu: 'Csapadék', ro: 'Precipitații',
      el: 'Υετός', tr: 'Yağış', ru: 'Осадки', uk: 'Опади', ar: 'هطول', he: 'משקעים', hi: 'वर्षा',
      th: 'ปริมาณฝน', vi: 'Lượng mưa', id: 'Curah hujan', ja: '降水', ko: '강수', zh: '降水', 'zh-TW': '降水'
    },
    'weather.sunrise': {
      en: 'Sunrise', es: 'Amanecer', fr: 'Lever du soleil', de: 'Sonnenaufgang', it: 'Alba', 'pt-BR': 'Nascer do sol',
      'pt-PT': 'Nascer do sol', nl: 'Zonsopkomst', da: 'Solopgang', sv: 'Soluppgång', nb: 'Soloppgang',
      fi: 'Auringonnousu', pl: 'Wschód słońca', cs: 'Východ slunce', hu: 'Napkelte', ro: 'Răsărit',
      el: 'Ανατολή', tr: 'Gün doğumu', ru: 'Восход', uk: 'Схід сонця', ar: 'الشروق', he: 'זריחה',
      hi: 'सूर्योदय', th: 'พระอาทิตย์ขึ้น', vi: 'Bình minh', id: 'Matahari terbit', ja: '日の出',
      ko: '일출', zh: '日出', 'zh-TW': '日出'
    },
    'weather.sunset': {
      en: 'Sunset', es: 'Atardecer', fr: 'Coucher du soleil', de: 'Sonnenuntergang', it: 'Tramonto',
      'pt-BR': 'Pôr do sol', 'pt-PT': 'Pôr do sol', nl: 'Zonsondergang', da: 'Solnedgang', sv: 'Solnedgång',
      nb: 'Solnedgang', fi: 'Auringonlasku', pl: 'Zachód słońca', cs: 'Západ slunce', hu: 'Napnyugta',
      ro: 'Apus', el: 'Δύση', tr: 'Gün batımı', ru: 'Закат', uk: 'Захід сонця', ar: 'الغروب', he: 'שקיעה',
      hi: 'सूर्यास्त', th: 'พระอาทิตย์ตก', vi: 'Hoàng hôn', id: 'Matahari terbenam', ja: '日の入り',
      ko: '일몰', zh: '日落', 'zh-TW': '日落'
    },
    'weather.firstLight': {
      en: 'First Light', es: 'Primeras luces', fr: 'Premières lueurs', de: 'Erstes Licht', it: 'Prime luci',
      'pt-BR': 'Primeira luz', 'pt-PT': 'Primeira luz', nl: 'Eerste licht', da: 'Første lys', sv: 'Första ljuset',
      nb: 'Første lys', fi: 'Ensimmäinen valo', pl: 'Pierwsze światło', cs: 'První světlo', hu: 'Első fény',
      ro: 'Prima lumină', el: 'Πρώτο φως', tr: 'İlk ışık', ru: 'Первый свет', uk: 'Перше світло',
      ar: 'أول ضوء', he: 'אור ראשון', hi: 'पहली रोशनी', th: 'แสงแรก', vi: 'Ánh sáng đầu',
      id: 'Cahaya pertama', ja: '薄明開始', ko: '첫빛', zh: '晨光', 'zh-TW': '晨光'
    },
    'weather.lastLight': {
      en: 'Last Light', es: 'Últimas luces', fr: 'Dernières lueurs', de: 'Letztes Licht', it: 'Ultime luci',
      'pt-BR': 'Última luz', 'pt-PT': 'Última luz', nl: 'Laatste licht', da: 'Sidste lys', sv: 'Sista ljuset',
      nb: 'Siste lys', fi: 'Viimeinen valo', pl: 'Ostatnie światło', cs: 'Poslední světlo', hu: 'Utolsó fény',
      ro: 'Ultima lumină', el: 'Τελευταίο φως', tr: 'Son ışık', ru: 'Последний свет', uk: 'Останнє світло',
      ar: 'آخر ضوء', he: 'אור אחרון', hi: 'अंतिम रोशनी', th: 'แสงสุดท้าย', vi: 'Ánh sáng cuối',
      id: 'Cahaya terakhir', ja: '薄明終了', ko: '마지막 빛', zh: '暮光', 'zh-TW': '暮光'
    },
    'weather.totalDaylight': {
      en: 'Total Daylight', es: 'Luz diurna total', fr: 'Durée du jour', de: 'Gesamte Tageslänge',
      it: 'Ore di luce', 'pt-BR': 'Luz do dia total', 'pt-PT': 'Luz do dia total', nl: 'Totale daglicht',
      da: 'Samlet dagslys', sv: 'Total dagsljus', nb: 'Total dagslys', fi: 'Kokonaispäivänvalo',
      pl: 'Całkowite światło dzienne', cs: 'Celkové denní světlo', hu: 'Teljes nappali fény',
      ro: 'Lumină diurnă totală', el: 'Συνολικό φως ημέρας', tr: 'Toplam gün ışığı',
      ru: 'Световой день', uk: 'Світловий день', ar: 'إجمالي ضوء النهار', he: 'סך אור יום',
      hi: 'कुल दिन का प्रकाश', th: 'แสงกลางวันทั้งหมด', vi: 'Tổng thời gian ban ngày',
      id: 'Total siang hari', ja: '日照時間', ko: '총 일조', zh: '日照总时长', 'zh-TW': '日照總時長'
    },
    'weather.daylightRemaining': {
      en: 'Daylight remaining', es: 'Luz diurna restante', fr: 'Jour restant', de: 'Verbleibendes Tageslicht',
      it: 'Luce rimanente', 'pt-BR': 'Luz do dia restante', 'pt-PT': 'Luz do dia restante',
      nl: 'Resterend daglicht', da: 'Resterende dagslys', sv: 'Kvarvarande dagsljus',
      nb: 'Gjenstående dagslys', fi: 'Jäljellä oleva päivänvalo', pl: 'Pozostałe światło dzienne',
      cs: 'Zbývající denní světlo', hu: 'Hátralévő nappali fény', ro: 'Lumină diurnă rămasă',
      el: 'Υπόλοιπο φως ημέρας', tr: 'Kalan gün ışığı', ru: 'Остаток светового дня',
      uk: 'Залишок світлового дня', ar: 'الضوء المتبقي', he: 'אור יום שנותר',
      hi: 'शेष दिन का प्रकाश', th: 'แสงกลางวันที่เหลือ', vi: 'Ban ngày còn lại',
      id: 'Sisa siang hari', ja: '残り日照', ko: '남은 일조', zh: '剩余日照', 'zh-TW': '剩餘日照'
    },
    'weather.untilSunrise': {
      en: 'Until sunrise', es: 'Hasta el amanecer', fr: 'Avant le lever du soleil', de: 'Bis Sonnenaufgang',
      it: 'Fino all’alba', 'pt-BR': 'Até o nascer do sol', 'pt-PT': 'Até ao nascer do sol',
      nl: 'Tot zonsopkomst', da: 'Til solopgang', sv: 'Till soluppgång', nb: 'Til soloppgang',
      fi: 'Auringonnousuun', pl: 'Do wschodu słońca', cs: 'Do východu slunce', hu: 'Napkeltéig',
      ro: 'Până la răsărit', el: 'Έως την ανατολή', tr: 'Gün doğumuna kadar', ru: 'До восхода',
      uk: 'До сходу', ar: 'حتى الشروق', he: 'עד הזריחה', hi: 'सूर्योदय तक', th: 'จนถึงพระอาทิตย์ขึ้น',
      vi: 'Đến bình minh', id: 'Hingga matahari terbit', ja: '日の出まで', ko: '일출까지',
      zh: '距日出', 'zh-TW': '距日出'
    },
    'weather.untilSunset': {
      en: 'Until sunset', es: 'Hasta el atardecer', fr: 'Avant le coucher du soleil', de: 'Bis Sonnenuntergang',
      it: 'Fino al tramonto', 'pt-BR': 'Até o pôr do sol', 'pt-PT': 'Até ao pôr do sol',
      nl: 'Tot zonsondergang', da: 'Til solnedgang', sv: 'Till solnedgång', nb: 'Til solnedgang',
      fi: 'Auringonlaskuun', pl: 'Do zachodu słońca', cs: 'Do západu slunce', hu: 'Napnyugtáig',
      ro: 'Până la apus', el: 'Έως τη δύση', tr: 'Gün batımına kadar', ru: 'До заката',
      uk: 'До заходу', ar: 'حتى الغروب', he: 'עד השקיעה', hi: 'सूर्यास्त तक', th: 'จนถึงพระอาทิตย์ตก',
      vi: 'Đến hoàng hôn', id: 'Hingga matahari terbenam', ja: '日没まで', ko: '일몰까지',
      zh: '直到日落', 'zh-TW': '直到日落'
    },
    'weather.uvMax': {
      en: 'Today’s max', es: 'Máx. de hoy', fr: 'Max. du jour', de: 'Heutiges Maximum',
      it: 'Massimo di oggi', 'pt-BR': 'Máx. de hoje', 'pt-PT': 'Máx. de hoje', nl: 'Maximum vandaag',
      da: 'Dagens maksimum', sv: 'Dagens max', nb: 'Dagens maksimum', fi: 'Tämän päivän maksimi',
      pl: 'Maks. dziś', cs: 'Dnešní maximum', hu: 'Mai maximum', ro: 'Maximul de azi',
      el: 'Μέγιστο σήμερα', tr: 'Bugünün en yükseği', ru: 'Макс. сегодня', uk: 'Макс. сьогодні',
      ar: 'أقصى اليوم', he: 'המקסימום היום', hi: 'आज का अधिकतम', th: 'สูงสุดวันนี้',
      vi: 'Tối đa hôm nay', id: 'Maks. hari ini', ja: '今日の最大', ko: '오늘의 최대',
      zh: '今日最高', 'zh-TW': '今日最高'
    },
    'weather.favorite': {
      en: 'Favorite', es: 'Favorito', fr: 'Favori', de: 'Favorit', it: 'Preferito', 'pt-BR': 'Favorito',
      'pt-PT': 'Favorito', nl: 'Favoriet', da: 'Favorit', sv: 'Favorit', nb: 'Favoritt', fi: 'Suosikki',
      pl: 'Ulubione', cs: 'Oblíbené', hu: 'Kedvenc', ro: 'Favorit', el: 'Αγαπημένο', tr: 'Favori',
      ru: 'В избранное', uk: 'В обране', ar: 'مفضلة', he: 'מועדף', hi: 'पसंदीदा', th: 'รายการโปรด',
      vi: 'Yêu thích', id: 'Favorit', ja: 'お気に入り', ko: '즐겨찾기', zh: '收藏', 'zh-TW': '加入最愛'
    },
    'weather.unfavorite': {
      en: 'Remove favorite', es: 'Quitar de favoritos', fr: 'Retirer des favoris', de: 'Favorit entfernen',
      it: 'Rimuovi dai preferiti', 'pt-BR': 'Remover dos favoritos', 'pt-PT': 'Remover dos favoritos',
      nl: 'Favoriet verwijderen', da: 'Fjern favorit', sv: 'Ta bort favorit', nb: 'Fjern favoritt',
      fi: 'Poista suosikeista', pl: 'Usuń z ulubionych', cs: 'Odebrat z oblíbených', hu: 'Eltávolítás a kedvencekből',
      ro: 'Elimină din favorite', el: 'Αφαίρεση από τα αγαπημένα', tr: 'Favorilerden kaldır',
      ru: 'Удалить из избранного', uk: 'Видалити з обраного', ar: 'إزالة من المفضلة', he: 'הסרה מהמועדפים',
      hi: 'पसंदीदा हटाएँ', th: 'ลบรายการโปรด', vi: 'Xóa khỏi yêu thích', id: 'Hapus dari favorit',
      ja: 'お気に入りを解除', ko: '즐겨찾기 해제', zh: '取消收藏', 'zh-TW': '取消最愛'
    },
    'weather.close': {
      en: 'Close', es: 'Cerrar', fr: 'Fermer', de: 'Schließen', it: 'Chiudi', 'pt-BR': 'Fechar', 'pt-PT': 'Fechar',
      nl: 'Sluiten', da: 'Luk', sv: 'Stäng', nb: 'Lukk', fi: 'Sulje', pl: 'Zamknij', cs: 'Zavřít', hu: 'Bezárás',
      ro: 'Închide', el: 'Κλείσιμο', tr: 'Kapat', ru: 'Закрыть', uk: 'Закрити', ar: 'إغلاق', he: 'סגירה',
      hi: 'बंद करें', th: 'ปิด', vi: 'Đóng', id: 'Tutup', ja: '閉じる', ko: '닫기', zh: '关闭', 'zh-TW': '關閉'
    },
    'weather.about': {
      en: 'About', es: 'Acerca de', fr: 'À propos', de: 'Info', it: 'Informazioni', 'pt-BR': 'Sobre',
      'pt-PT': 'Acerca de', nl: 'Over', da: 'Om', sv: 'Om', nb: 'Om', fi: 'Tietoja', pl: 'Informacje',
      cs: 'O aplikaci', hu: 'Névjegy', ro: 'Despre', el: 'Πληροφορίες', tr: 'Hakkında', ru: 'О разделе',
      uk: 'Про розділ', ar: 'حول', he: 'אודות', hi: 'परिचय', th: 'เกี่ยวกับ', vi: 'Giới thiệu',
      id: 'Tentang', ja: '説明', ko: '정보', zh: '关于', 'zh-TW': '關於'
    },
    'weather.emptySearch': {
      en: 'No cities found.', es: 'No se encontraron ciudades.', fr: 'Aucune ville trouvée.',
      de: 'Keine Städte gefunden.', it: 'Nessuna città trovata.', 'pt-BR': 'Nenhuma cidade encontrada.',
      'pt-PT': 'Nenhuma cidade encontrada.', nl: 'Geen steden gevonden.', da: 'Ingen byer fundet.',
      sv: 'Inga städer hittades.', nb: 'Ingen byer funnet.', fi: 'Kaupunkeja ei löytynyt.',
      pl: 'Nie znaleziono miast.', cs: 'Žádná města nenalezena.', hu: 'Nincs találat.',
      ro: 'Nu s-au găsit orașe.', el: 'Δεν βρέθηκαν πόλεις.', tr: 'Şehir bulunamadı.',
      ru: 'Города не найдены.', uk: 'Міст не знайдено.', ar: 'لم يتم العثور على مدن.',
      he: 'לא נמצאו ערים.', hi: 'कोई शहर नहीं मिला.', th: 'ไม่พบเมือง', vi: 'Không tìm thấy thành phố.',
      id: 'Kota tidak ditemukan.', ja: '都市が見つかりません。', ko: '도시를 찾을 수 없습니다.',
      zh: '未找到城市。', 'zh-TW': '找不到城市。'
    },
    'weather.attribution': {
      en: 'Data: U.S. forecasts & alerts NWS · international public alerts IFRC Alert Hub (CAP) · worldwide forecasts Open-Meteo (CC BY 4.0). Guidance only — not for emergencies.',
      es: 'Datos: previsiones y avisos de EE. UU. NWS · alertas públicas internacionales IFRC Alert Hub (CAP) · previsiones mundiales Open-Meteo (CC BY 4.0). Solo orientativo; no para emergencias.',
      fr: 'Données : prévisions et alertes aux États-Unis NWS · alertes publiques internationales IFRC Alert Hub (CAP) · prévisions mondiales Open-Meteo (CC BY 4.0). À titre indicatif, pas pour les urgences.',
      de: 'Daten: US-Vorhersagen & Warnungen NWS · internationale öffentliche Warnungen IFRC Alert Hub (CAP) · weltweite Vorhersagen Open-Meteo (CC BY 4.0). Nur zur Orientierung, nicht für Notfälle.',
      it: 'Dati: previsioni e allerte USA NWS · allerte pubbliche internazionali IFRC Alert Hub (CAP) · previsioni globali Open-Meteo (CC BY 4.0). Solo a scopo informativo, non per emergenze.',
      'pt-BR': 'Dados: previsões e alertas dos EUA NWS · alertas públicos internacionais IFRC Alert Hub (CAP) · previsões globais Open-Meteo (CC BY 4.0). Apenas orientação — não use em emergências.',
      'pt-PT': 'Dados: previsões e alertas dos EUA NWS · alertas públicos internacionais IFRC Alert Hub (CAP) · previsões globais Open-Meteo (CC BY 4.0). Apenas orientação — não use em emergências.',
      nl: 'Gegevens: Amerikaanse verwachtingen en waarschuwingen NWS · internationale openbare waarschuwingen IFRC Alert Hub (CAP) · wereldwijde verwachtingen Open-Meteo (CC BY 4.0). Alleen ter informatie, niet voor noodgevallen.',
      da: 'Data: amerikanske prognoser og varsler NWS · internationale offentlige varsler IFRC Alert Hub (CAP) · globale prognoser Open-Meteo (CC BY 4.0). Kun vejledning, ikke til nødsituationer.',
      sv: 'Data: USA-prognoser och varningar NWS · internationella offentliga varningar IFRC Alert Hub (CAP) · globala prognoser Open-Meteo (CC BY 4.0). Endast vägledning, inte för nödsituationer.',
      nb: 'Data: amerikanske varsler NWS · internasjonale offentlige varsler IFRC Alert Hub (CAP) · globale prognoser Open-Meteo (CC BY 4.0). Kun veiledning, ikke for nødsituasjoner.',
      fi: 'Tiedot: Yhdysvaltojen ennusteet ja varoitukset NWS · kansainväliset yleiset varoitukset IFRC Alert Hub (CAP) · maailmanlaajuiset ennusteet Open-Meteo (CC BY 4.0). Vain ohjeeksi, ei hätätilanteisiin.',
      pl: 'Dane: prognozy i alerty USA NWS · międzynarodowe alerty publiczne IFRC Alert Hub (CAP) · prognozy globalne Open-Meteo (CC BY 4.0). Tylko informacyjnie, nie do nagłych wypadków.',
      cs: 'Data: předpovědi a výstrahy USA NWS · mezinárodní veřejná varování IFRC Alert Hub (CAP) · globální předpovědi Open-Meteo (CC BY 4.0). Pouze informativně, ne pro nouzové situace.',
      hu: 'Adatok: amerikai előrejelzések és riasztások NWS · nemzetközi nyilvános riasztások IFRC Alert Hub (CAP) · globális előrejelzések Open-Meteo (CC BY 4.0). Tájékoztatásra, nem vészhelyzetre.',
      ro: 'Date: prognoze și alerte SUA NWS · alerte publice internaționale IFRC Alert Hub (CAP) · prognoze globale Open-Meteo (CC BY 4.0). Doar orientativ, nu pentru urgențe.',
      el: 'Δεδομένα: προγνώσεις και ειδοποιήσεις ΗΠΑ NWS · διεθνείς δημόσιες ειδοποιήσεις IFRC Alert Hub (CAP) · παγκόσμιες προγνώσεις Open-Meteo (CC BY 4.0). Μόνο για ενημέρωση, όχι για έκτακτες ανάγκες.',
      tr: 'Veri: ABD tahminleri ve uyarıları NWS · uluslararası kamu uyarıları IFRC Alert Hub (CAP) · küresel tahminler Open-Meteo (CC BY 4.0). Yalnızca bilgilendirme içindir, acil durumlar için değildir.',
      ru: 'Данные: прогнозы и предупреждения США NWS · международные публичные оповещения IFRC Alert Hub (CAP) · прогнозы по всему миру Open-Meteo (CC BY 4.0). Только для справки, не для чрезвычайных ситуаций.',
      uk: 'Дані: прогнози й попередження США NWS · міжнародні публічні сповіщення IFRC Alert Hub (CAP) · прогнози для всього світу Open-Meteo (CC BY 4.0). Лише для довідки, не для надзвичайних ситуацій.',
      ar: 'البيانات: توقعات وتنبيهات الولايات المتحدة NWS · التنبيهات العامة الدولية IFRC Alert Hub (CAP) · التوقعات العالمية Open-Meteo (CC BY 4.0). للمعلومات فقط — ليست للطوارئ.',
      he: 'נתונים: תחזיות והתרעות בארה״ב NWS · התרעות ציבוריות בינלאומיות IFRC Alert Hub (CAP) · תחזיות עולמיות Open-Meteo (CC BY 4.0). למידע בלבד — לא למצבי חירום.',
      hi: 'डेटा: अमेरिकी पूर्वानुमान और अलर्ट NWS · अंतरराष्ट्रीय सार्वजनिक अलर्ट IFRC Alert Hub (CAP) · वैश्विक पूर्वानुमान Open-Meteo (CC BY 4.0)। केवल जानकारी के लिए — आपात स्थितियों के लिए नहीं।',
      th: 'ข้อมูล: พยากรณ์และเตือนภัยสหรัฐฯ NWS · การแจ้งเตือนสาธารณะระหว่างประเทศ IFRC Alert Hub (CAP) · พยากรณ์ทั่วโลก Open-Meteo (CC BY 4.0) เพื่อเป็นข้อมูลเท่านั้น — ไม่ใช้ในเหตุฉุกเฉิน',
      vi: 'Dữ liệu: dự báo và cảnh báo Hoa Kỳ NWS · cảnh báo công cộng quốc tế IFRC Alert Hub (CAP) · dự báo toàn cầu Open-Meteo (CC BY 4.0). Chỉ để tham khảo — không dùng trong trường hợp khẩn cấp.',
      id: 'Data: prakiraan dan peringatan AS NWS · peringatan publik internasional IFRC Alert Hub (CAP) · prakiraan global Open-Meteo (CC BY 4.0). Hanya untuk panduan — bukan untuk keadaan darurat.',
      ja: 'データ：米国の予報・警報は NWS · 国際的な公的警報は IFRC Alert Hub (CAP) · 世界の予報は Open-Meteo（CC BY 4.0）。参考情報であり、緊急時には使用しないでください。',
      ko: '데이터: 미국 예보 및 경보 NWS · 국제 공공 경보 IFRC Alert Hub (CAP) · 전 세계 예보 Open-Meteo (CC BY 4.0). 참고용이며 응급 상황에는 사용하지 마세요.',
      zh: '数据：美国预报与预警 NWS · 国际公共预警 IFRC Alert Hub (CAP) · 全球预报 Open-Meteo（CC BY 4.0）。仅供参考，紧急情况请勿依赖。',
      'zh-TW': '資料：美國預報與警報 NWS · 國際公共警報 IFRC Alert Hub (CAP) · 全球預報 Open-Meteo（CC BY 4.0）。僅供參考，請勿用於緊急決策。'
    },
    'weather.alerts': {
      en: 'Public Alerts', es: 'Alertas públicas', fr: 'Alertes publiques', de: 'Öffentliche Warnmeldungen',
      it: 'Allerte pubbliche', 'pt-BR': 'Alertas públicos', 'pt-PT': 'Alertas públicos',
      nl: 'Openbare waarschuwingen', da: 'Offentlige varsler', sv: 'Offentliga varningar', nb: 'Offentlige varsler', fi: 'Julkiset varoitukset',
      pl: 'Alerty publiczne', cs: 'Veřejná upozornění', hu: 'Nyilvános riasztások', ro: 'Alerte publice',
      el: 'Δημόσιες ειδοποιήσεις', tr: 'Kamu uyarıları', ru: 'Публичные предупреждения', uk: 'Публічні попередження',
      ar: 'تنبيهات عامة', he: 'התראות ציבוריות', hi: 'सार्वजनिक अलर्ट', th: 'การแจ้งเตือนสาธารณะ',
      vi: 'Cảnh báo công cộng', id: 'Peringatan publik', ja: '公的警報', ko: '공공 경보', zh: '公共预警', 'zh-TW': '公共警報'
    },
    'weather.alertsCount': {
      en: '{count} alerts', es: '{count} alertas', fr: '{count} alertes', de: '{count} Warnungen',
      it: '{count} allerte', 'pt-BR': '{count} alertas', 'pt-PT': '{count} alertas', nl: '{count} waarschuwingen',
      da: '{count} varsler', sv: '{count} varningar', nb: '{count} varsler', fi: '{count} varoitusta',
      pl: 'Alertów: {count}', cs: '{count} upozornění', hu: '{count} riasztás', ro: '{count} alerte',
      el: '{count} ειδοποιήσεις', tr: '{count} uyarı', ru: 'Оповещения: {count}', uk: 'Сповіщення: {count}',
      ar: '{count} تنبيهات', he: 'התראות: {count}', hi: '{count} अलर्ट', th: '{count} รายการแจ้งเตือน',
      vi: '{count} cảnh báo', id: '{count} peringatan', ja: '{count}件の警報', ko: '경보 {count}건',
      zh: '{count} 条预警', 'zh-TW': '{count} 則警報'
    },
    'weather.alert': {
      en: 'Alert', es: 'Aviso', fr: 'Alerte', de: 'Warnung', it: 'Allerta', 'pt-BR': 'Alerta', 'pt-PT': 'Alerta',
      nl: 'Waarschuwing', da: 'Varsel', sv: 'Varning', nb: 'Varsel', fi: 'Varoitus', pl: 'Alert', cs: 'Výstraha',
      hu: 'Riasztás', ro: 'Alertă', el: 'Ειδοποίηση', tr: 'Uyarı', ru: 'Предупреждение', uk: 'Попередження',
      ar: 'تنبيه', he: 'התרעה', hi: 'चेतावनी', th: 'การเตือน', vi: 'Cảnh báo', id: 'Peringatan',
      ja: '警報', ko: '경보', zh: '预警', 'zh-TW': '警報'
    },
    'weather.alertUntil': {
      en: 'Until {time}', es: 'Hasta {time}', fr: 'Jusqu’à {time}', de: 'Bis {time}', it: 'Fino a {time}',
      'pt-BR': 'Até {time}', 'pt-PT': 'Até {time}', nl: 'Tot {time}', da: 'Indtil {time}', sv: 'Till {time}',
      nb: 'Til {time}', fi: 'Asti {time}', pl: 'Do {time}', cs: 'Do {time}', hu: '{time}-ig', ro: 'Până la {time}',
      el: 'Έως {time}', tr: '{time} tarihine kadar', ru: 'До {time}', uk: 'До {time}', ar: 'حتى {time}',
      he: 'עד {time}', hi: '{time} तक', th: 'จนถึง {time}', vi: 'Đến {time}', id: 'Sampai {time}',
      ja: '{time} まで', ko: '{time}까지', zh: '至 {time}', 'zh-TW': '至 {time}'
    },
    'weather.alertSource': {
      en: 'National Weather Service', es: 'National Weather Service', fr: 'National Weather Service',
      de: 'National Weather Service', it: 'National Weather Service', 'pt-BR': 'National Weather Service',
      'pt-PT': 'National Weather Service', nl: 'National Weather Service', da: 'National Weather Service',
      sv: 'National Weather Service', nb: 'National Weather Service', fi: 'National Weather Service',
      pl: 'National Weather Service', cs: 'National Weather Service', hu: 'National Weather Service',
      ro: 'National Weather Service', el: 'National Weather Service', tr: 'National Weather Service',
      ru: 'National Weather Service', uk: 'National Weather Service', ar: 'National Weather Service',
      he: 'National Weather Service', hi: 'National Weather Service', th: 'National Weather Service',
      vi: 'National Weather Service', id: 'National Weather Service', ja: 'アメリカ国立気象局',
      ko: '미국 국립기상청', zh: '美国国家气象局', 'zh-TW': '美國國家氣象局'
    },
    'weather.loadingForecast': {
      en: 'Loading forecast…', es: 'Cargando previsión…', fr: 'Chargement des prévisions…',
      de: 'Vorhersage wird geladen…', it: 'Caricamento previsione…', 'pt-BR': 'Carregando previsão…',
      'pt-PT': 'A carregar previsão…', nl: 'Verwachting laden…', da: 'Indlæser prognose…', sv: 'Läser in prognos…',
      nb: 'Laster varsel…', fi: 'Ladataan ennustetta…', pl: 'Wczytywanie prognozy…', cs: 'Načítání předpovědi…',
      hu: 'Előrejelzés betöltése…', ro: 'Se încarcă prognoza…', el: 'Φόρτωση πρόγνωσης…', tr: 'Tahmin yükleniyor…',
      ru: 'Загрузка прогноза…', uk: 'Завантаження прогнозу…', ar: 'جارٍ تحميل التوقعات…', he: 'טוען תחזית…',
      hi: 'पूर्वानुमान लोड हो रहा है…', th: 'กำลังโหลดพยากรณ์…', vi: 'Đang tải dự báo…', id: 'Memuat prakiraan…',
      ja: '予報を読み込み中…', ko: '예보를 불러오는 중…', zh: '正在加载预报…', 'zh-TW': '正在載入預報…'
    },
    'weather.loadingForecasts': {
      en: 'Loading forecasts…', es: 'Cargando previsiones…', fr: 'Chargement des prévisions…',
      de: 'Vorhersagen werden geladen…', it: 'Caricamento previsioni…', 'pt-BR': 'Carregando previsões…',
      'pt-PT': 'A carregar previsões…', nl: 'Verwachtingen laden…', da: 'Indlæser prognoser…', sv: 'Läser in prognoser…',
      nb: 'Laster varsler…', fi: 'Ladataan ennusteita…', pl: 'Wczytywanie prognoz…', cs: 'Načítání předpovědí…',
      hu: 'Előrejelzések betöltése…', ro: 'Se încarcă prognozele…', el: 'Φόρτωση προγνώσεων…', tr: 'Tahminler yükleniyor…',
      ru: 'Загрузка прогнозов…', uk: 'Завантаження прогнозів…', ar: 'جارٍ تحميل التوقعات…', he: 'טוען תחזיות…',
      hi: 'पूर्वानुमान लोड हो रहे हैं…', th: 'กำลังโหลดพยากรณ์…', vi: 'Đang tải dự báo…', id: 'Memuat prakiraan…',
      ja: '予報を読み込み中…', ko: '예보를 불러오는 중…', zh: '正在加载预报…', 'zh-TW': '正在載入預報…'
    },
    'weather.loadingHint': {
      en: 'Fetching cities & alerts…', es: 'Cargando ciudades y avisos…', fr: 'Récupération des villes et alertes…',
      de: 'Städte und Warnungen werden geladen…', it: 'Caricamento città e allerte…',
      'pt-BR': 'Buscando cidades e alertas…', 'pt-PT': 'A obter cidades e alertas…', nl: 'Steden en waarschuwingen ophalen…',
      da: 'Henter byer og varsler…', sv: 'Hämtar städer och varningar…', nb: 'Henter byer og varsler…',
      fi: 'Haetaan kaupunkeja ja varoituksia…', pl: 'Pobieranie miast i alertów…', cs: 'Načítání měst a výstrah…',
      hu: 'Városok és riasztások betöltése…', ro: 'Se preiau orașe și alerte…', el: 'Λήψη πόλεων και ειδοποιήσεων…',
      tr: 'Şehirler ve uyarılar alınıyor…', ru: 'Загрузка городов и предупреждений…',
      uk: 'Завантаження міст і попереджень…', ar: 'جارٍ جلب المدن والتنبيهات…', he: 'טוען ערים והתרעות…',
      hi: 'शहर और चेतावनियाँ लाई जा रही हैं…', th: 'กำลังดึงเมืองและการแจ้งเตือน…', vi: 'Đang tải thành phố và cảnh báo…',
      id: 'Mengambil kota dan peringatan…', ja: '都市と警報を取得中…', ko: '도시와 경보를 가져오는 중…',
      zh: '正在获取城市与预警…', 'zh-TW': '正在取得城市與警報…'
    },
    'weather.loadingAlerts': {
      en: 'Checking weather alerts…', es: 'Comprobando avisos…', fr: 'Vérification des alertes…',
      de: 'Wetterwarnungen werden geprüft…', it: 'Controllo allerte meteo…', 'pt-BR': 'Verificando alertas…',
      'pt-PT': 'A verificar alertas…', nl: 'Weerwaarschuwingen controleren…', da: 'Tjekker vejrvarsler…',
      sv: 'Kontrollerar vädervarningar…', nb: 'Sjekker værvarsler…', fi: 'Tarkistetaan säävaroituksia…',
      pl: 'Sprawdzanie alertów pogodowych…', cs: 'Kontrola výstrah…', hu: 'Riasztások ellenőrzése…',
      ro: 'Se verifică alertele meteo…', el: 'Έλεγχος ειδοποιήσεων…', tr: 'Hava uyarıları kontrol ediliyor…',
      ru: 'Проверка предупреждений…', uk: 'Перевірка попереджень…', ar: 'جارٍ التحقق من تنبيهات الطقس…',
      he: 'בודק התרעות מזג אוויר…', hi: 'मौसम चेतावनियाँ जाँची जा रही हैं…', th: 'กำลังตรวจสอบการแจ้งเตือน…',
      vi: 'Đang kiểm tra cảnh báo…', id: 'Memeriksa peringatan cuaca…', ja: '気象警報を確認中…',
      ko: '날씨 경보를 확인하는 중…', zh: '正在检查天气预警…', 'zh-TW': '正在檢查天氣警報…'
    },
    'weather.loadingDone': {
      en: 'Ready', es: 'Listo', fr: 'Prêt', de: 'Fertig', it: 'Pronto', 'pt-BR': 'Pronto', 'pt-PT': 'Pronto',
      nl: 'Klaar', da: 'Klar', sv: 'Klart', nb: 'Klar', fi: 'Valmis', pl: 'Gotowe', cs: 'Hotovo', hu: 'Kész',
      ro: 'Gata', el: 'Έτοιμο', tr: 'Hazır', ru: 'Готово', uk: 'Готово', ar: 'جاهز', he: 'מוכן',
      hi: 'तैयार', th: 'พร้อม', vi: 'Xong', id: 'Siap', ja: '完了', ko: '완료', zh: '完成', 'zh-TW': '完成'
    },
    'weather.now': {
      en: 'Now', es: 'Ahora', fr: 'Maintenant', de: 'Jetzt', it: 'Ora', 'pt-BR': 'Agora', 'pt-PT': 'Agora',
      nl: 'Nu', da: 'Nu', sv: 'Nu', nb: 'Nå', fi: 'Nyt', pl: 'Teraz', cs: 'Teď', hu: 'Most', ro: 'Acum',
      el: 'Τώρα', tr: 'Şimdi', ru: 'Сейчас', uk: 'Зараз', ar: 'الآن', he: 'עכשיו', hi: 'अब', th: 'ตอนนี้',
      vi: 'Bây giờ', id: 'Sekarang', ja: '現在', ko: '지금', zh: '现在', 'zh-TW': '現在'
    },
    'weather.locatedAt': {
      en: 'Located', es: 'Ubicación', fr: 'Localisé', de: 'Standort', it: 'Posizione', 'pt-BR': 'Localizado',
      'pt-PT': 'Localizado', nl: 'Gelokaliseerd', da: 'Lokaliseret', sv: 'Lokaliserad', nb: 'Lokalisert',
      fi: 'Paikannettu', pl: 'Zlokalizowano', cs: 'Lokalizováno', hu: 'Helymeghatározva', ro: 'Localizat',
      el: 'Εντοπίστηκε', tr: 'Konumlandı', ru: 'Определено', uk: 'Визначено', ar: 'تم تحديد الموقع',
      he: 'אותר', hi: 'स्थित', th: 'ระบุตำแหน่งแล้ว', vi: 'Đã định vị', id: 'Berada', ja: '測位',
      ko: '위치 확인', zh: '定位于', 'zh-TW': '定位於'
    },
    'weather.forLocation': {
      en: 'Weather for {place}', es: 'Tiempo para {place}', fr: 'Météo pour {place}', de: 'Wetter für {place}',
      it: 'Meteo per {place}', 'pt-BR': 'Clima para {place}', 'pt-PT': 'Meteorologia para {place}',
      nl: 'Weer voor {place}', da: 'Vejr for {place}', sv: 'Väder för {place}', nb: 'Vær for {place}',
      fi: 'Sää: {place}', pl: 'Pogoda dla {place}', cs: 'Počasí pro {place}', hu: 'Időjárás: {place}',
      ro: 'Vremea pentru {place}', el: 'Καιρός για {place}', tr: '{place} için hava', ru: 'Погода: {place}',
      uk: 'Погода: {place}', ar: 'الطقس في {place}', he: 'מזג האוויר ב{place}', hi: '{place} का मौसम',
      th: 'สภาพอากาศสำหรับ {place}', vi: 'Thời tiết tại {place}', id: 'Cuaca untuk {place}',
      ja: '{place} の天気', ko: '{place} 날씨', zh: '{place} 的天气', 'zh-TW': '{place} 的天氣'
    },
    'weather.clearLocation': {
      en: 'Remove my location', es: 'Quitar mi ubicación', fr: 'Supprimer ma position', de: 'Meinen Standort entfernen',
      it: 'Rimuovi la mia posizione', 'pt-BR': 'Remover minha localização', 'pt-PT': 'Remover a minha localização',
      nl: 'Mijn locatie verwijderen', da: 'Fjern min placering', sv: 'Ta bort min plats', nb: 'Fjern posisjonen min',
      fi: 'Poista sijaintini', pl: 'Usuń moją lokalizację', cs: 'Odebrat moji polohu', hu: 'Saját helyzet törlése',
      ro: 'Elimină locația mea', el: 'Αφαίρεση τοποθεσίας', tr: 'Konumumu kaldır', ru: 'Удалить моё местоположение',
      uk: 'Видалити моє місцезнаходження', ar: 'إزالة موقعي', he: 'הסרת המיקום שלי', hi: 'मेरा स्थान हटाएँ',
      th: 'ลบตำแหน่งของฉัน', vi: 'Xóa vị trí của tôi', id: 'Hapus lokasi saya', ja: '現在地を削除',
      ko: '내 위치 삭제', zh: '移除我的位置', 'zh-TW': '移除我的位置'
    },
    'weather.footerTagline': {
      en: 'Weather for the curious', es: 'El tiempo para los curiosos', fr: 'La météo pour les curieux',
      de: 'Wetter für Neugierige', it: 'Meteo per i curiosi', 'pt-BR': 'Clima para os curiosos',
      'pt-PT': 'Meteorologia para os curiosos', nl: 'Weer voor de nieuwsgierigen', da: 'Vejr for de nysgerrige',
      sv: 'Väder för de nyfikna', nb: 'Vær for de nysgjerrige', fi: 'Sää uteliaille', pl: 'Pogoda dla ciekawych',
      cs: 'Počasí pro zvědavé', hu: 'Időjárás kíváncsiaknak', ro: 'Vremea pentru cei curioși',
      el: 'Ο καιρός για τους περίεργους', tr: 'Meraklılar için hava durumu', ru: 'Погода для любознательных',
      uk: 'Погода для допитливих', ar: 'الطقس للفضوليين', he: 'מזג האוויר לסקרנים', hi: 'जिज्ञासुओं के लिए मौसम',
      th: 'สภาพอากาศสำหรับคนอยากรู้', vi: 'Thời tiết cho người tò mò', id: 'Cuaca untuk yang penasaran',
      ja: '知りたい人のための天気', ko: '궁금한 사람을 위한 날씨', zh: '写给好奇的人的天气', 'zh-TW': '給好奇的人看的天氣'
    },
    'weather.notice.added': {
      en: 'Added to My Sky', es: 'Añadido a Mi cielo', fr: 'Ajouté à Mon ciel', de: 'Zu Mein Himmel hinzugefügt',
      it: 'Aggiunto a Il mio cielo', 'pt-BR': 'Adicionado ao Meu Céu', 'pt-PT': 'Adicionado ao Meu Céu',
      nl: 'Toegevoegd aan Mijn lucht', da: 'Føjet til Min himmel', sv: 'Tillagd i Min himmel',
      nb: 'Lagt til i Min himmel', fi: 'Lisätty Oma taivas -näkymään', pl: 'Dodano do Mojego nieba',
      cs: 'Přidáno do Mé oblohy', hu: 'Hozzáadva a Saját égbolthoz', ro: 'Adăugat în Cerul meu',
      el: 'Προστέθηκε στον Ουρανό μου', tr: 'Gökyüzüme eklendi', ru: 'Добавлено в «Моё небо»',
      uk: 'Додано до «Мого неба»', ar: 'تمت الإضافة إلى سمائي', he: 'נוסף לשמיים שלי',
      hi: 'मेरे आसमान में जोड़ा गया', th: 'เพิ่มในท้องฟ้าของฉันแล้ว', vi: 'Đã thêm vào Bầu trời của tôi',
      id: 'Ditambahkan ke Langit Saya', ja: 'マイスカイに追加しました', ko: '내 하늘에 추가됨',
      zh: '已添加到我的天空', 'zh-TW': '已加入我的天空'
    },
    'weather.notice.removed': {
      en: 'Removed from My Sky', es: 'Quitado de Mi cielo', fr: 'Retiré de Mon ciel', de: 'Aus Mein Himmel entfernt',
      it: 'Rimosso da Il mio cielo', 'pt-BR': 'Removido do Meu Céu', 'pt-PT': 'Removido do Meu Céu',
      nl: 'Verwijderd uit Mijn lucht', da: 'Fjernet fra Min himmel', sv: 'Borttagen från Min himmel',
      nb: 'Fjernet fra Min himmel', fi: 'Poistettu Oma taivas -näkymästä', pl: 'Usunięto z Mojego nieba',
      cs: 'Odebráno z Mé oblohy', hu: 'Eltávolítva a Saját égboltból', ro: 'Eliminat din Cerul meu',
      el: 'Αφαιρέθηκε από τον Ουρανό μου', tr: 'Gökyüzümden kaldırıldı', ru: 'Удалено из «Моего неба»',
      uk: 'Видалено з «Мого неба»', ar: 'تمت الإزالة من سمائي', he: 'הוסר מהשמיים שלי',
      hi: 'मेरे आसमान से हटाया गया', th: 'นำออกจากท้องฟ้าของฉันแล้ว', vi: 'Đã xóa khỏi Bầu trời của tôi',
      id: 'Dihapus dari Langit Saya', ja: 'マイスカイから削除しました', ko: '내 하늘에서 삭제됨',
      zh: '已从我的天空移除', 'zh-TW': '已從我的天空移除'
    },
    'weather.notice.searching': {
      en: 'Searching places…', es: 'Buscando lugares…', fr: 'Recherche de lieux…', de: 'Orte werden gesucht…',
      it: 'Ricerca di luoghi…', 'pt-BR': 'Buscando lugares…', 'pt-PT': 'A procurar locais…',
      nl: 'Plaatsen zoeken…', da: 'Søger efter steder…', sv: 'Söker platser…',
      nb: 'Søker etter steder…', fi: 'Haetaan paikkoja…', pl: 'Szukam miejsc…',
      cs: 'Hledání míst…', hu: 'Helyek keresése…', ro: 'Se caută locuri…',
      el: 'Αναζήτηση τοποθεσιών…', tr: 'Yerler aranıyor…', ru: 'Поиск мест…',
      uk: 'Пошук місць…', ar: 'جارٍ البحث عن أماكن…', he: 'מחפש מקומות…',
      hi: 'स्थान खोजे जा रहे हैं…', th: 'กำลังค้นหาสถานที่…', vi: 'Đang tìm địa điểm…',
      id: 'Mencari tempat…', ja: '場所を検索中…', ko: '장소 검색 중…',
      zh: '正在搜索地点…', 'zh-TW': '正在搜尋地點…'
    },
    'weather.notice.copyManually': {
      en: 'Select this link to copy it:', es: 'Selecciona este enlace para copiarlo:', fr: 'Sélectionnez ce lien pour le copier:',
      de: 'Diesen Link zum Kopieren auswählen:', it: 'Seleziona questo link per copiarlo:',
      'pt-BR': 'Selecione este link para copiá-lo:', 'pt-PT': 'Selecione esta ligação para a copiar:',
      nl: 'Selecteer deze link om hem te kopiëren:', da: 'Vælg dette link for at kopiere det:',
      sv: 'Markera länken för att kopiera den:', nb: 'Velg denne lenken for å kopiere den:',
      fi: 'Valitse tämä linkki kopioitavaksi:', pl: 'Zaznacz ten link, aby go skopiować:',
      cs: 'Vyberte tento odkaz ke zkopírování:', hu: 'Jelölje ki ezt a hivatkozást a másoláshoz:',
      ro: 'Selectează acest link pentru a-l copia:', el: 'Επιλέξτε αυτόν τον σύνδεσμο για αντιγραφή:',
      tr: 'Kopyalamak için bu bağlantıyı seçin:', ru: 'Выделите эту ссылку, чтобы скопировать её:',
      uk: 'Виділіть це посилання, щоб скопіювати його:', ar: 'حدّد هذا الرابط لنسخه:',
      he: 'בחרו בקישור הזה כדי להעתיק אותו:', hi: 'कॉपी करने के लिए यह लिंक चुनें:',
      th: 'เลือกลิงก์นี้เพื่อคัดลอก:', vi: 'Chọn liên kết này để sao chép:',
      id: 'Pilih tautan ini untuk menyalinnya:', ja: 'このリンクを選択してコピーしてください:',
      ko: '복사하려면 이 링크를 선택하세요:', zh: '选中此链接以复制：', 'zh-TW': '選取此連結以複製：'
    },
    'weather.search': {
      en: 'Search city', es: 'Buscar ciudad', fr: 'Rechercher une ville', de: 'Stadt suchen', it: 'Cerca città',
      'pt-BR': 'Buscar cidade', 'pt-PT': 'Pesquisar cidade', nl: 'Stad zoeken', da: 'Søg by', sv: 'Sök stad',
      nb: 'Søk by', fi: 'Hae kaupunkia', pl: 'Szukaj miasta', cs: 'Hledat město', hu: 'Város keresése',
      ro: 'Caută oraș', el: 'Αναζήτηση πόλης', tr: 'Şehir ara', ru: 'Поиск города', uk: 'Пошук міста',
      ar: 'بحث عن مدينة', he: 'חיפוש עיר', hi: 'शहर खोजें', th: 'ค้นหาเมือง', vi: 'Tìm thành phố',
      id: 'Cari kota', ja: '都市を検索', ko: '도시 검색', zh: '搜索城市', 'zh-TW': '搜尋城市'
    },
    'weather.showAllPlaces': {
      en: 'Show all places', es: 'Ver todos los lugares', fr: 'Voir tous les lieux', de: 'Alle Orte anzeigen',
      it: 'Mostra tutti i luoghi', 'pt-BR': 'Mostrar todos os lugares', 'pt-PT': 'Mostrar todos os locais',
      nl: 'Alle plaatsen tonen', da: 'Vis alle steder', sv: 'Visa alla platser', nb: 'Vis alle steder',
      fi: 'Näytä kaikki paikat', pl: 'Pokaż wszystkie miejsca', cs: 'Zobrazit všechna místa',
      hu: 'Összes hely megjelenítése', ro: 'Afișează toate locurile', el: 'Εμφάνιση όλων των τοποθεσιών',
      tr: 'Tüm yerleri göster', ru: 'Показать все места', uk: 'Показати всі місця',
      ar: 'عرض جميع الأماكن', he: 'הצגת כל המקומות', hi: 'सभी स्थान दिखाएँ', th: 'แสดงสถานที่ทั้งหมด',
      vi: 'Xem tất cả địa điểm', id: 'Tampilkan semua tempat', ja: 'すべての場所を表示',
      ko: '모든 장소 보기', zh: '显示所有地点', 'zh-TW': '顯示所有地點'
    },
    'weather.recentPlaces': {
      en: 'Recent places', es: 'Lugares recientes', fr: 'Lieux récents', de: 'Letzte Orte',
      it: 'Luoghi recenti', 'pt-BR': 'Lugares recentes', 'pt-PT': 'Locais recentes', nl: 'Recente plaatsen',
      da: 'Seneste steder', sv: 'Senaste platser', nb: 'Nylige steder', fi: 'Viimeaikaiset paikat',
      pl: 'Ostatnie miejsca', cs: 'Nedávná místa', hu: 'Legutóbbi helyek', ro: 'Locuri recente',
      el: 'Πρόσφατες τοποθεσίες', tr: 'Son yerler', ru: 'Недавние места', uk: 'Нещодавні місця',
      ar: 'الأماكن الأخيرة', he: 'מקומות אחרונים', hi: 'हाल के स्थान', th: 'สถานที่ล่าสุด',
      vi: 'Địa điểm gần đây', id: 'Tempat terbaru', ja: '最近の場所', ko: '최근 장소',
      zh: '最近的地点', 'zh-TW': '最近的地點'
    },
    'weather.nextSixHours': {
      en: 'Next 6 hours', es: 'Próximas 6 horas', fr: '6 prochaines heures', de: 'Nächste 6 Stunden',
      it: 'Prossime 6 ore', 'pt-BR': 'Próximas 6 horas', 'pt-PT': 'Próximas 6 horas',
      nl: 'Komende 6 uur', da: 'Næste 6 timer', sv: 'Kommande 6 timmar', nb: 'Neste 6 timer',
      fi: 'Seuraavat 6 tuntia', pl: 'Najbliższe 6 godzin', cs: 'Příštích 6 hodin',
      hu: 'Következő 6 óra', ro: 'Următoarele 6 ore', el: 'Επόμενες 6 ώρες',
      tr: 'Önümüzdeki 6 saat', ru: 'Следующие 6 часов', uk: 'Наступні 6 годин',
      ar: 'الساعات الست القادمة', he: '6 השעות הקרובות', hi: 'अगले 6 घंटे',
      th: '6 ชั่วโมงข้างหน้า', vi: '6 giờ tới', id: '6 jam ke depan', ja: '今後6時間',
      ko: '앞으로 6시간', zh: '未来6小时', 'zh-TW': '未來6小時'
    },
    'weather.shareForecast': {
      en: 'Share forecast', es: 'Compartir pronóstico', fr: 'Partager la prévision', de: 'Vorhersage teilen',
      it: 'Condividi previsioni', 'pt-BR': 'Compartilhar previsão', 'pt-PT': 'Partilhar previsão',
      nl: 'Voorspelling delen', da: 'Del vejrudsigt', sv: 'Dela prognos', nb: 'Del værvarsel',
      fi: 'Jaa ennuste', pl: 'Udostępnij prognozę', cs: 'Sdílet předpověď', hu: 'Előrejelzés megosztása',
      ro: 'Distribuie prognoza', el: 'Κοινοποίηση πρόγνωσης', tr: 'Tahmini paylaş', ru: 'Поделиться прогнозом',
      uk: 'Поділитися прогнозом', ar: 'مشاركة التوقعات', he: 'שיתוף התחזית', hi: 'पूर्वानुमान साझा करें',
      th: 'แชร์พยากรณ์อากาศ', vi: 'Chia sẻ dự báo', id: 'Bagikan prakiraan', ja: '予報を共有',
      ko: '예보 공유', zh: '分享预报', 'zh-TW': '分享預報'
    },
    'weather.linkCopied': {
      en: 'Link copied', es: 'Enlace copiado', fr: 'Lien copié', de: 'Link kopiert', it: 'Link copiato',
      'pt-BR': 'Link copiado', 'pt-PT': 'Ligação copiada', nl: 'Link gekopieerd', da: 'Link kopieret',
      sv: 'Länk kopierad', nb: 'Lenke kopiert', fi: 'Linkki kopioitu', pl: 'Link skopiowany',
      cs: 'Odkaz zkopírován', hu: 'Hivatkozás másolva', ro: 'Link copiat', el: 'Ο σύνδεσμος αντιγράφηκε',
      tr: 'Bağlantı kopyalandı', ru: 'Ссылка скопирована', uk: 'Посилання скопійовано',
      ar: 'تم نسخ الرابط', he: 'הקישור הועתק', hi: 'लिंक कॉपी किया गया', th: 'คัดลอกลิงก์แล้ว',
      vi: 'Đã sao chép liên kết', id: 'Tautan disalin', ja: 'リンクをコピーしました',
      ko: '링크 복사됨', zh: '链接已复制', 'zh-TW': '連結已複製'
    },
    'weather.copyFailed': {
      en: 'Could not copy link', es: 'No se pudo copiar el enlace', fr: 'Impossible de copier le lien',
      de: 'Link konnte nicht kopiert werden', it: 'Impossibile copiare il link',
      'pt-BR': 'Não foi possível copiar o link', 'pt-PT': 'Não foi possível copiar a ligação',
      nl: 'Link kopiëren mislukt', da: 'Kunne ikke kopiere linket', sv: 'Kunde inte kopiera länken',
      nb: 'Kunne ikke kopiere lenken', fi: 'Linkkiä ei voitu kopioida', pl: 'Nie udało się skopiować linku',
      cs: 'Odkaz se nepodařilo zkopírovat', hu: 'Nem sikerült másolni a hivatkozást',
      ro: 'Linkul nu a putut fi copiat', el: 'Δεν ήταν δυνατή η αντιγραφή του συνδέσμου',
      tr: 'Bağlantı kopyalanamadı', ru: 'Не удалось скопировать ссылку',
      uk: 'Не вдалося скопіювати посилання', ar: 'تعذّر نسخ الرابط', he: 'לא ניתן להעתיק את הקישור',
      hi: 'लिंक कॉपी नहीं हो सका', th: 'ไม่สามารถคัดลอกลิงก์ได้', vi: 'Không thể sao chép liên kết',
      id: 'Tidak dapat menyalin tautan', ja: 'リンクをコピーできませんでした', ko: '링크를 복사할 수 없음',
      zh: '无法复制链接', 'zh-TW': '無法複製連結'
    },
    'weather.today': {
      en: 'Today', es: 'Hoy', fr: 'Aujourd’hui', de: 'Heute', it: 'Oggi', 'pt-BR': 'Hoje', 'pt-PT': 'Hoje',
      nl: 'Vandaag', da: 'I dag', sv: 'I dag', nb: 'I dag', fi: 'Tänään', pl: 'Dzisiaj', cs: 'Dnes',
      hu: 'Ma', ro: 'Azi', el: 'Σήμερα', tr: 'Bugün', ru: 'Сегодня', uk: 'Сьогодні', ar: 'اليوم',
      he: 'היום', hi: 'आज', th: 'วันนี้', vi: 'Hôm nay', id: 'Hari ini', ja: '今日', ko: '오늘', zh: '今天', 'zh-TW': '今天'
    },
    'settings.auto': {
      en: 'Auto', es: 'Auto', fr: 'Auto', de: 'Auto', it: 'Auto', 'pt-BR': 'Auto', 'pt-PT': 'Auto', nl: 'Auto',
      da: 'Auto', sv: 'Auto', nb: 'Auto', fi: 'Auto', pl: 'Auto', cs: 'Auto', hu: 'Auto', ro: 'Auto',
      el: 'Αυτόματο', tr: 'Otomatik', ru: 'Авто', uk: 'Авто', ar: 'تلقائي', he: 'אוטו', hi: 'स्वतः',
      th: 'อัตโนมัติ', vi: 'Tự động', id: 'Otomatis', ja: '自動', ko: '자동', zh: '自动', 'zh-TW': '自動'
    },
    'settings.temperature': {
      en: 'Temperature', es: 'Temperatura', fr: 'Température', de: 'Temperatur', it: 'Temperatura',
      'pt-BR': 'Temperatura', 'pt-PT': 'Temperatura', nl: 'Temperatuur', da: 'Temperatur', sv: 'Temperatur',
      nb: 'Temperatur', fi: 'Lämpötila', pl: 'Temperatura', cs: 'Teplota', hu: 'Hőmérséklet', ro: 'Temperatură',
      el: 'Θερμοκρασία', tr: 'Sıcaklık', ru: 'Температура', uk: 'Температура', ar: 'درجة الحرارة', he: 'טמפרטורה',
      hi: 'तापमान', th: 'อุณหภูมิ', vi: 'Nhiệt độ', id: 'Suhu', ja: '気温', ko: '기온', zh: '温度', 'zh-TW': '溫度'
    },
    'settings.distance': {
      en: 'Distance', es: 'Distancia', fr: 'Distance', de: 'Entfernung', it: 'Distanza', 'pt-BR': 'Distância',
      'pt-PT': 'Distância', nl: 'Afstand', da: 'Afstand', sv: 'Avstånd', nb: 'Avstand', fi: 'Etäisyys',
      pl: 'Odległość', cs: 'Vzdálenost', hu: 'Távolság', ro: 'Distanță', el: 'Απόσταση', tr: 'Mesafe',
      ru: 'Расстояние', uk: 'Відстань', ar: 'المسافة', he: 'מרחק', hi: 'दूरी', th: 'ระยะทาง', vi: 'Khoảng cách',
      id: 'Jarak', ja: '距離', ko: '거리', zh: '距离', 'zh-TW': '距離'
    },
    'settings.miles': {
      en: 'Miles', es: 'Millas', fr: 'Miles', de: 'Meilen', it: 'Miglia', 'pt-BR': 'Milhas', 'pt-PT': 'Milhas',
      nl: 'Mijl', da: 'Miles', sv: 'Miles', nb: 'Miles', fi: 'Mailia', pl: 'Mile', cs: 'Míle', hu: 'Mérföld',
      ro: 'Mile', el: 'Μίλια', tr: 'Mil', ru: 'Мили', uk: 'Мілі', ar: 'أميال', he: 'מיילים', hi: 'मील',
      th: 'ไมล์', vi: 'Dặm', id: 'Mil', ja: 'マイル', ko: '마일', zh: '英里', 'zh-TW': '英里'
    },
    'settings.km': {
      en: 'Kilometers', es: 'Kilómetros', fr: 'Kilomètres', de: 'Kilometer', it: 'Chilometri', 'pt-BR': 'Quilômetros',
      'pt-PT': 'Quilómetros', nl: 'Kilometers', da: 'Kilometer', sv: 'Kilometer', nb: 'Kilometer', fi: 'Kilometriä',
      pl: 'Kilometry', cs: 'Kilometry', hu: 'Kilométer', ro: 'Kilometri', el: 'Χιλιόμετρα', tr: 'Kilometre',
      ru: 'Километры', uk: 'Кілометри', ar: 'كيلومترات', he: 'קילומטרים', hi: 'किलोमीटर', th: 'กิโลเมตร',
      vi: 'Kilômét', id: 'Kilometer', ja: 'キロメートル', ko: '킬로미터', zh: '公里', 'zh-TW': '公里'
    },
    'aria.skipToMain': {
      en: 'Skip to main content', es: 'Saltar al contenido principal', fr: 'Aller au contenu principal',
      de: 'Zum Hauptinhalt springen', it: 'Vai al contenuto principale', 'pt-BR': 'Pular para o conteúdo principal',
      'pt-PT': 'Saltar para o conteúdo principal', nl: 'Ga naar hoofdinhoud', da: 'Spring til hovedindhold',
      sv: 'Hoppa till huvudinnehåll', nb: 'Hopp til hovedinnhold', fi: 'Siirry pääsisältöön',
      pl: 'Przejdź do treści głównej', cs: 'Přejít na hlavní obsah', hu: 'Ugrás a fő tartalomra',
      ro: 'Sari la conținutul principal', el: 'Μετάβαση στο κύριο περιεχόμενο', tr: 'Ana içeriğe geç',
      ru: 'Перейти к основному содержимому', uk: 'Перейти до основного вмісту', ar: 'التخطي إلى المحتوى الرئيسي',
      he: 'דילוג לתוכן הראשי', hi: 'मुख्य सामग्री पर जाएँ', th: 'ข้ามไปยังเนื้อหาหลัก', vi: 'Chuyển đến nội dung chính',
      id: 'Lewati ke konten utama', ja: 'メインコンテンツへスキップ', ko: '본문으로 건너뛰기',
      zh: '跳到主要内容', 'zh-TW': '跳至主要內容'
    },

    'weather.uvLow': {
      en: 'Low', es: 'Bajo', fr: 'Faible', de: 'Niedrig', it: 'Basso', 'pt-BR': 'Baixo', 'pt-PT': 'Baixo',
      nl: 'Laag', da: 'Lav', sv: 'Låg', nb: 'Lav', fi: 'Matala', pl: 'Niski', cs: 'Nízký', hu: 'Alacsony',
      ro: 'Scăzut', el: 'Χαμηλός', tr: 'Düşük', ru: 'Низкий', uk: 'Низький', ar: 'منخفض', he: 'נמוך',
      hi: 'कम', th: 'ต่ำ', vi: 'Thấp', id: 'Rendah', ja: '低い', ko: '낮음', zh: '低', 'zh-TW': '低'
    },
    'weather.uvModerate': {
      en: 'Moderate', es: 'Moderado', fr: 'Modéré', de: 'Mäßig', it: 'Moderato', 'pt-BR': 'Moderado', 'pt-PT': 'Moderado',
      nl: 'Matig', da: 'Moderat', sv: 'Måttlig', nb: 'Moderat', fi: 'Kohtalainen', pl: 'Umiarkowany', cs: 'Mírný',
      hu: 'Közepes', ro: 'Moderat', el: 'Μέτριος', tr: 'Orta', ru: 'Умеренный', uk: 'Помірний', ar: 'متوسط',
      he: 'מתון', hi: 'मध्यम', th: 'ปานกลาง', vi: 'Trung bình', id: 'Sedang', ja: '中', ko: '보통', zh: '中等', 'zh-TW': '中等'
    },
    'weather.uvHigh': {
      en: 'High', es: 'Alto', fr: 'Élevé', de: 'Hoch', it: 'Alto', 'pt-BR': 'Alto', 'pt-PT': 'Alto',
      nl: 'Hoog', da: 'Høj', sv: 'Hög', nb: 'Høy', fi: 'Korkea', pl: 'Wysoki', cs: 'Vysoký', hu: 'Magas',
      ro: 'Ridicat', el: 'Υψηλός', tr: 'Yüksek', ru: 'Высокий', uk: 'Високий', ar: 'مرتفع', he: 'גבוה',
      hi: 'उच्च', th: 'สูง', vi: 'Cao', id: 'Tinggi', ja: '高い', ko: '높음', zh: '高', 'zh-TW': '高'
    },
    'weather.uvVeryHigh': {
      en: 'Very High', es: 'Muy alto', fr: 'Très élevé', de: 'Sehr hoch', it: 'Molto alto', 'pt-BR': 'Muito alto',
      'pt-PT': 'Muito alto', nl: 'Zeer hoog', da: 'Meget høj', sv: 'Mycket hög', nb: 'Svært høy', fi: 'Erittäin korkea',
      pl: 'Bardzo wysoki', cs: 'Velmi vysoký', hu: 'Nagyon magas', ro: 'Foarte ridicat', el: 'Πολύ υψηλός',
      tr: 'Çok yüksek', ru: 'Очень высокий', uk: 'Дуже високий', ar: 'مرتفع جداً', he: 'גבוה מאוד',
      hi: 'बहुत उच्च', th: 'สูงมาก', vi: 'Rất cao', id: 'Sangat tinggi', ja: '非常に高い', ko: '매우 높음',
      zh: '很高', 'zh-TW': '很高'
    },
    'weather.uvExtreme': {
      en: 'Extreme', es: 'Extremo', fr: 'Extrême', de: 'Extrem', it: 'Estremo', 'pt-BR': 'Extremo', 'pt-PT': 'Extremo',
      nl: 'Extreem', da: 'Ekstrem', sv: 'Extrem', nb: 'Ekstrem', fi: 'Äärimmäinen', pl: 'Ekstremalny', cs: 'Extrémní',
      hu: 'Extrém', ro: 'Extrem', el: 'Ακραίος', tr: 'Aşırı', ru: 'Экстремальный', uk: 'Екстремальний',
      ar: 'متطرف', he: 'קיצוני', hi: 'अत्यधिक', th: 'รุนแรง', vi: 'Cực đoan', id: 'Ekstrem', ja: '極端',
      ko: '극심', zh: '极高', 'zh-TW': '極高'
    },
    'weather.aqiGood': {
      en: 'Good', es: 'Buena', fr: 'Bonne', de: 'Gut', it: 'Buona', 'pt-BR': 'Boa', 'pt-PT': 'Boa',
      nl: 'Goed', da: 'God', sv: 'Bra', nb: 'God', fi: 'Hyvä', pl: 'Dobra', cs: 'Dobrá', hu: 'Jó',
      ro: 'Bună', el: 'Καλή', tr: 'İyi', ru: 'Хорошо', uk: 'Добре', ar: 'جيد', he: 'טוב',
      hi: 'अच्छा', th: 'ดี', vi: 'Tốt', id: 'Baik', ja: '良好', ko: '좋음', zh: '优', 'zh-TW': '良好'
    },
    'weather.aqiModerate': {
      en: 'Moderate', es: 'Moderada', fr: 'Modérée', de: 'Mäßig', it: 'Moderata', 'pt-BR': 'Moderada', 'pt-PT': 'Moderada',
      nl: 'Matig', da: 'Moderat', sv: 'Måttlig', nb: 'Moderat', fi: 'Kohtalainen', pl: 'Umiarkowana', cs: 'Mírná',
      hu: 'Közepes', ro: 'Moderată', el: 'Μέτρια', tr: 'Orta', ru: 'Умеренно', uk: 'Помірна', ar: 'متوسط',
      he: 'מתון', hi: 'मध्यम', th: 'ปานกลาง', vi: 'Trung bình', id: 'Sedang', ja: '普通', ko: '보통', zh: '良', 'zh-TW': '普通'
    },
    'weather.aqiUnhealthySG': {
      en: 'Unhealthy (SG)', es: 'Dañina (SG)', fr: 'Malsaine (GS)', de: 'Ungesund (SG)', it: 'Nociva (GS)',
      'pt-BR': 'Insalubre (GS)', 'pt-PT': 'Insalubre (GS)', nl: 'Ongezond (RG)', da: 'Usund (SG)', sv: 'Ohälsosam (SG)',
      nb: 'Usunn (SG)', fi: 'Epäterveellinen (RH)', pl: 'Niezdrowa (WG)', cs: 'Nezdravá (CS)', hu: 'Egészségtelen (ÉC)',
      ro: 'Nesănătoasă (GS)', el: 'Ανθυγιεινή (ΟΟ)', tr: 'Sağlıksız (HG)', ru: 'Вредно (ЧГ)', uk: 'Шкідливо (ЧГ)',
      ar: 'غير صحي (فئات حساسة)', he: 'לא בריא (רגישים)', hi: 'अस्वस्थ (संवेदनशील)', th: 'ไม่ดีต่อสุขภาพ (กลุ่มเสี่ยง)',
      vi: 'Không lành (nhóm nhạy)', id: 'Tidak sehat (KS)', ja: '敏感者に有害', ko: '민감군에 나쁨', zh: '轻度污染', 'zh-TW': '對敏感族群不健康'
    },
    'weather.aqiUnhealthy': {
      en: 'Unhealthy', es: 'Dañina', fr: 'Malsaine', de: 'Ungesund', it: 'Nociva', 'pt-BR': 'Insalubre', 'pt-PT': 'Insalubre',
      nl: 'Ongezond', da: 'Usund', sv: 'Ohälsosam', nb: 'Usunn', fi: 'Epäterveellinen', pl: 'Niezdrowa', cs: 'Nezdravá',
      hu: 'Egészségtelen', ro: 'Nesănătoasă', el: 'Ανθυγιεινή', tr: 'Sağlıksız', ru: 'Вредно', uk: 'Шкідливо',
      ar: 'غير صحي', he: 'לא בריא', hi: 'अस्वस्थ', th: 'ไม่ดีต่อสุขภาพ', vi: 'Không lành', id: 'Tidak sehat',
      ja: '有害', ko: '나쁨', zh: '中度污染', 'zh-TW': '不健康'
    },
    'weather.aqiVeryUnhealthy': {
      en: 'Very unhealthy', es: 'Muy dañina', fr: 'Très malsaine', de: 'Sehr ungesund', it: 'Molto nociva',
      'pt-BR': 'Muito insalubre', 'pt-PT': 'Muito insalubre', nl: 'Zeer ongezond', da: 'Meget usund', sv: 'Mycket ohälsosam',
      nb: 'Svært usunn', fi: 'Erittäin epäterveellinen', pl: 'Bardzo niezdrowa', cs: 'Velmi nezdravá', hu: 'Nagyon egészségtelen',
      ro: 'Foarte nesănătoasă', el: 'Πολύ ανθυγιεινή', tr: 'Çok sağlıksız', ru: 'Очень вредно', uk: 'Дуже шкідливо',
      ar: 'غير صحي جداً', he: 'לא בריא מאוד', hi: 'बहुत अस्वस्थ', th: 'แย่มากต่อสุขภาพ', vi: 'Rất không lành',
      id: 'Sangat tidak sehat', ja: '非常に有害', ko: '매우 나쁨', zh: '重度污染', 'zh-TW': '非常不健康'
    },
    'weather.aqiHazardous': {
      en: 'Hazardous', es: 'Peligrosa', fr: 'Dangereuse', de: 'Gefährlich', it: 'Pericolosa', 'pt-BR': 'Perigosa',
      'pt-PT': 'Perigosa', nl: 'Gevaarlijk', da: 'Farlig', sv: 'Farlig', nb: 'Farlig', fi: 'Vaarallinen',
      pl: 'Niebezpieczna', cs: 'Nebezpečná', hu: 'Veszélyes', ro: 'Periculoasă', el: 'Επικίνδυνη', tr: 'Tehlikeli',
      ru: 'Опасно', uk: 'Небезпечно', ar: 'خطر', he: 'מסוכן', hi: 'खतरनाक', th: 'อันตราย', vi: 'Nguy hiểm',
      id: 'Berbahaya', ja: '危険', ko: '위험', zh: '严重污染', 'zh-TW': '危害'
    },
    'weather.feelsSimilar': {
      en: 'Similar to actual', es: 'Similar a la temperatura', fr: 'Proche de la température', de: 'Ähnlich der Temperatur',
      it: 'Simile alla temperatura', 'pt-BR': 'Semelhante à temperatura', 'pt-PT': 'Semelhante à temperatura',
      nl: 'Vergelijkbaar met de temperatuur', da: 'Tæt på temperaturen', sv: 'Lik den faktiska', nb: 'Lik den faktiske',
      fi: 'Lähellä lämpötilaa', pl: 'Zbliżona do temperatury', cs: 'Podobná teplotě', hu: 'Hasonló a hőmérséklethez',
      ro: 'Similară temperaturii', el: 'Κοντά στη θερμοκρασία', tr: 'Sıcaklığa yakın', ru: 'Близко к температуре',
      uk: 'Близько до температури', ar: 'قريب من درجة الحرارة', he: 'דומה לטמפרטורה', hi: 'तापमान के समान',
      th: 'ใกล้เคียงอุณหภูมิจริง', vi: 'Gần với nhiệt độ', id: 'Mirip suhu aktual', ja: '気温に近い', ko: '기온과 비슷',
      zh: '与气温相近', 'zh-TW': '與氣溫相近'
    },
    'weather.feelsWarmer': {
      en: 'Warmer by {n}°', es: 'Más cálido {n}°', fr: 'Plus chaud de {n}°', de: '{n}° wärmer', it: 'Più caldo di {n}°',
      'pt-BR': 'Mais quente {n}°', 'pt-PT': 'Mais quente {n}°', nl: '{n}° warmer', da: '{n}° varmere', sv: '{n}° varmare',
      nb: '{n}° varmere', fi: '{n}° lämpimämpi', pl: 'Cieplej o {n}°', cs: 'Tepleji o {n}°', hu: '{n}°-kal melegebb',
      ro: 'Mai cald cu {n}°', el: 'Πιο ζεστό κατά {n}°', tr: '{n}° daha sıcak', ru: 'На {n}° теплее', uk: 'На {n}° тепліше',
      ar: 'أدفأ بـ {n}°', he: 'חם ב־{n}°', hi: '{n}° अधिक गर्म', th: 'อุ่นกว่า {n}°', vi: 'Ấm hơn {n}°',
      id: 'Lebih hangat {n}°', ja: '気温より {n}°', ko: '{n}° 더 따뜻', zh: '比气温高 {n}°', 'zh-TW': '比氣溫高 {n}°'
    },
    'weather.feelsCooler': {
      en: 'Cooler by {n}°', es: 'Más fresco {n}°', fr: 'Plus frais de {n}°', de: '{n}° kühler', it: 'Più fresco di {n}°',
      'pt-BR': 'Mais fresco {n}°', 'pt-PT': 'Mais fresco {n}°', nl: '{n}° koeler', da: '{n}° køligere', sv: '{n}° svalare',
      nb: '{n}° kjøligere', fi: '{n}° viileämpi', pl: 'Chłodniej o {n}°', cs: 'Chladněji o {n}°', hu: '{n}°-kal hűvösebb',
      ro: 'Mai răcoros cu {n}°', el: 'Πιο δροσερό κατά {n}°', tr: '{n}° daha serin', ru: 'На {n}° холоднее',
      uk: 'На {n}° холодніше', ar: 'أبرد بـ {n}°', he: 'קריר ב־{n}°', hi: '{n}° अधिक ठंडा', th: 'เย็นกว่า {n}°',
      vi: 'Mát hơn {n}°', id: 'Lebih sejuk {n}°', ja: '気温より {n}°', ko: '{n}° 더 서늘', zh: '比气温低 {n}°', 'zh-TW': '比氣溫低 {n}°'
    },
    'weather.visReduced': {
      en: 'Reduced visibility', es: 'Visibilidad reducida', fr: 'Visibilité réduite', de: 'Eingeschränkte Sicht',
      it: 'Visibilità ridotta', 'pt-BR': 'Visibilidade reduzida', 'pt-PT': 'Visibilidade reduzida', nl: 'Verminderd zicht',
      da: 'Nedsat sigtbarhed', sv: 'Nedsatt sikt', nb: 'Redusert sikt', fi: 'Heikentynyt näkyvyys', pl: 'Ograniczona widoczność',
      cs: 'Snížená dohlednost', hu: 'Csökkent látótávolság', ro: 'Vizibilitate redusă', el: 'Μειωμένη ορατότητα',
      tr: 'Görüş azalmış', ru: 'Плохая видимость', uk: 'Погіршена видимість', ar: 'رؤية منخفضة', he: 'ראות מופחתת',
      hi: 'दृश्यता कम', th: 'ทัศนวิสัยต่ำ', vi: 'Tầm nhìn giảm', id: 'Jarak pandang berkurang', ja: '視程が低い',
      ko: '가시거리 낮음', zh: '能见度偏低', 'zh-TW': '能見度偏低'
    },
    'weather.pressureRising': {
      en: 'Rising', es: 'Subiendo', fr: 'En hausse', de: 'Steigend', it: 'In aumento', 'pt-BR': 'Subindo', 'pt-PT': 'A subir',
      nl: 'Stijgend', da: 'Stigende', sv: 'Stigande', nb: 'Stigende', fi: 'Nouseva', pl: 'Rosnące', cs: 'Stoupá',
      hu: 'Emelkedő', ro: 'În creștere', el: 'Ανερχόμενη', tr: 'Yükseliyor', ru: 'Растёт', uk: 'Зростає', ar: 'مرتفع',
      he: 'עולה', hi: 'बढ़ रहा', th: 'เพิ่มขึ้น', vi: 'Tăng', id: 'Naik', ja: '上昇', ko: '상승', zh: '上升', 'zh-TW': '上升'
    },
    'weather.pressureFalling': {
      en: 'Falling', es: 'Bajando', fr: 'En baisse', de: 'Fallend', it: 'In calo', 'pt-BR': 'Caindo', 'pt-PT': 'A descer',
      nl: 'Dalend', da: 'Faldende', sv: 'Fallande', nb: 'Fallende', fi: 'Laskeva', pl: 'Spadające', cs: 'Klesá',
      hu: 'Csökkenő', ro: 'În scădere', el: 'Πτωτική', tr: 'Düşüyor', ru: 'Падает', uk: 'Падає', ar: 'منخفض',
      he: 'יורד', hi: 'गिर रहा', th: 'ลดลง', vi: 'Giảm', id: 'Turun', ja: '低下', ko: '하강', zh: '下降', 'zh-TW': '下降'
    },
    'weather.pressureSteady': {
      en: 'Steady', es: 'Estable', fr: 'Stable', de: 'Stabil', it: 'Stabile', 'pt-BR': 'Estável', 'pt-PT': 'Estável',
      nl: 'Stabiel', da: 'Stabil', sv: 'Stabil', nb: 'Stabil', fi: 'Vakaa', pl: 'Stabilne', cs: 'Stabilní',
      hu: 'Stabil', ro: 'Stabilă', el: 'Σταθερή', tr: 'Sabit', ru: 'Стабильно', uk: 'Стабільно', ar: 'مستقر',
      he: 'יציב', hi: 'स्थिर', th: 'คงที่', vi: 'Ổn định', id: 'Stabil', ja: '安定', ko: '안정', zh: '稳定', 'zh-TW': '穩定'
    },
    'weather.todayPrecip': {
      en: 'Today {n}', es: 'Hoy {n}', fr: 'Aujourd’hui {n}', de: 'Heute {n}', it: 'Oggi {n}', 'pt-BR': 'Hoje {n}',
      'pt-PT': 'Hoje {n}', nl: 'Vandaag {n}', da: 'I dag {n}', sv: 'I dag {n}', nb: 'I dag {n}', fi: 'Tänään {n}',
      pl: 'Dziś {n}', cs: 'Dnes {n}', hu: 'Ma {n}', ro: 'Azi {n}', el: 'Σήμερα {n}', tr: 'Bugün {n}', ru: 'Сегодня {n}',
      uk: 'Сьогодні {n}', ar: 'اليوم {n}', he: 'היום {n}', hi: 'आज {n}', th: 'วันนี้ {n}', vi: 'Hôm nay {n}',
      id: 'Hari ini {n}', ja: '今日 {n}', ko: '오늘 {n}', zh: '今日累计 {n}', 'zh-TW': '今日累計 {n}'
    },
    'weather.usingUnits': {
      en: 'Using {hint}', es: 'Ahora: {hint}', fr: 'Actuellement : {hint}', de: 'Aktuell: {hint}', it: 'In uso: {hint}',
      'pt-BR': 'Usando {hint}', 'pt-PT': 'A usar {hint}', nl: 'Gebruikt {hint}', da: 'Bruger {hint}', sv: 'Använder {hint}',
      nb: 'Bruker {hint}', fi: 'Käytössä {hint}', pl: 'Używane: {hint}', cs: 'Používá se {hint}', hu: 'Használatban: {hint}',
      ro: 'Se folosește {hint}', el: 'Σε χρήση {hint}', tr: 'Kullanılan: {hint}', ru: 'Сейчас: {hint}', uk: 'Зараз: {hint}',
      ar: 'يُستخدم {hint}', he: 'בשימוש {hint}', hi: 'उपयोग: {hint}', th: 'ใช้ {hint}', vi: 'Đang dùng {hint}',
      id: 'Menggunakan {hint}', ja: '現在：{hint}', ko: '사용 중: {hint}', zh: '当前：{hint}', 'zh-TW': '目前：{hint}'
    },
    'weather.backToList': {
      en: 'Back to city list', es: 'Volver a la lista', fr: 'Retour à la liste', de: 'Zurück zur Liste',
      it: 'Torna all’elenco', 'pt-BR': 'Voltar à lista', 'pt-PT': 'Voltar à lista', nl: 'Terug naar de lijst',
      da: 'Tilbage til listen', sv: 'Tillbaka till listan', nb: 'Tilbake til listen', fi: 'Takaisin listaan',
      pl: 'Powrót do listy', cs: 'Zpět na seznam', hu: 'Vissza a listához', ro: 'Înapoi la listă',
      el: 'Πίσω στη λίστα', tr: 'Listeye dön', ru: 'К списку городов', uk: 'До списку міст', ar: 'العودة إلى القائمة',
      he: 'חזרה לרשימה', hi: 'सूची पर वापस', th: 'กลับไปที่รายการ', vi: 'Quay lại danh sách', id: 'Kembali ke daftar',
      ja: '都市一覧に戻る', ko: '목록으로', zh: '返回城市列表', 'zh-TW': '返回城市列表'
    },
    'weather.clearSearch': {
      en: 'Clear search', es: 'Borrar búsqueda', fr: 'Effacer la recherche', de: 'Suche löschen', it: 'Cancella ricerca',
      'pt-BR': 'Limpar busca', 'pt-PT': 'Limpar pesquisa', nl: 'Zoekopdracht wissen', da: 'Ryd søgning', sv: 'Rensa sökning',
      nb: 'Tøm søk', fi: 'Tyhjennä haku', pl: 'Wyczyść wyszukiwanie', cs: 'Vymazat hledání', hu: 'Keresés törlése',
      ro: 'Șterge căutarea', el: 'Καθαρισμός αναζήτησης', tr: 'Aramayı temizle', ru: 'Очистить поиск', uk: 'Очистити пошук',
      ar: 'مسح البحث', he: 'ניקוי החיפוש', hi: 'खोज साफ़ करें', th: 'ล้างการค้นหา', vi: 'Xóa tìm kiếm',
      id: 'Hapus pencarian', ja: '検索をクリア', ko: '검색 지우기', zh: '清除搜索', 'zh-TW': '清除搜尋'
    },
    'weather.homeAria': {
      en: 'Duskline home', es: 'Inicio de duskline', fr: 'Accueil duskline', de: 'duskline-Startseite',
      it: 'Home duskline', 'pt-BR': 'Início duskline', 'pt-PT': 'Início duskline', nl: 'duskline-start',
      da: 'duskline-start', sv: 'duskline-startsida', nb: 'duskline-hjem', fi: 'duskline-etusivu',
      pl: 'Strona główna duskline', cs: 'Domů duskline', hu: 'duskline kezdőlap', ro: 'Acasă duskline',
      el: 'Αρχική duskline', tr: 'duskline ana sayfa', ru: 'Главная duskline', uk: 'Головна duskline',
      ar: 'الرئيسية duskline', he: 'דף הבית של duskline', hi: 'duskline होम', th: 'หน้าแรก duskline',
      vi: 'Trang chủ duskline', id: 'Beranda duskline', ja: 'duskline ホーム', ko: 'duskline 홈',
      zh: 'duskline 首页', 'zh-TW': 'duskline 首頁'
    },
    'weather.countryUS': {
      en: 'United States', es: 'Estados Unidos', fr: 'États-Unis', de: 'Vereinigte Staaten', it: 'Stati Uniti',
      'pt-BR': 'Estados Unidos', 'pt-PT': 'Estados Unidos', nl: 'Verenigde Staten', da: 'USA', sv: 'USA', nb: 'USA',
      fi: 'Yhdysvallat', pl: 'Stany Zjednoczone', cs: 'Spojené státy', hu: 'Egyesült Államok', ro: 'Statele Unite',
      el: 'Ηνωμένες Πολιτείες', tr: 'Amerika Birleşik Devletleri', ru: 'США', uk: 'США', ar: 'الولايات المتحدة',
      he: 'ארצות הברית', hi: 'संयुक्त राज्य', th: 'สหรัฐอเมริกา', vi: 'Hoa Kỳ', id: 'Amerika Serikat',
      ja: 'アメリカ合衆国', ko: '미국', zh: '美国', 'zh-TW': '美國'
    },
    'weather.wmo.56': {
      en: 'Light freezing drizzle', es: 'Llovizna helada ligera', fr: 'Bruine verglaçante légère', de: 'Leichter gefrierender Nieselregen',
      it: 'Pioviggine gelata leggera', 'pt-BR': 'Garoa congelante fraca', 'pt-PT': 'Chuvisco gelado fraco',
      nl: 'Lichte onderkoelde motregen', da: 'Let underafkølet støvregn', sv: 'Lätt underkylt duggregn',
      nb: 'Lett underkjølt yr', fi: 'Heikko jäätävä tihkusade', pl: 'Lekka marznąca mżawka', cs: 'Slabé mrznoucí mrholení',
      hu: 'Enyhe ónos szitálás', ro: 'Burniță înghețată ușoară', el: 'Ελαφρύ παγωμένο ψιλόβροχο', tr: 'Hafif donan çisenti',
      ru: 'Слабая ледяная морось', uk: 'Слабка крижана мряка', ar: 'رذاذ متجمد خفيف', he: 'טפטוף קפוא קל',
      hi: 'हल्की जमने वाली फुहार', th: 'ฝนละอองเยือกแข็งเล็กน้อย', vi: 'Mưa phùn đóng băng nhẹ', id: 'Gerimis beku ringan',
      ja: '弱い着氷性の霧雨', ko: '약한 어는 이슬비', zh: '轻度冻毛毛雨', 'zh-TW': '輕度凍毛毛雨'
    },
    'weather.wmo.57': {
      en: 'Freezing drizzle', es: 'Llovizna helada', fr: 'Bruine verglaçante', de: 'Gefrierender Nieselregen',
      it: 'Pioviggine gelata', 'pt-BR': 'Garoa congelante', 'pt-PT': 'Chuvisco gelado', nl: 'Onderkoelde motregen',
      da: 'Underafkølet støvregn', sv: 'Underkylt duggregn', nb: 'Underkjølt yr', fi: 'Jäätävä tihkusade',
      pl: 'Marznąca mżawka', cs: 'Mrznoucí mrholení', hu: 'Ónos szitálás', ro: 'Burniță înghețată',
      el: 'Παγωμένο ψιλόβροχο', tr: 'Donan çisenti', ru: 'Ледяная морось', uk: 'Крижана мряка', ar: 'رذاذ متجمد',
      he: 'טפטוף קפוא', hi: 'जमने वाली फुहार', th: 'ฝนละอองเยือกแข็ง', vi: 'Mưa phùn đóng băng', id: 'Gerimis beku',
      ja: '着氷性の霧雨', ko: '어는 이슬비', zh: '冻毛毛雨', 'zh-TW': '凍毛毛雨'
    },
    'weather.wmo.77': {
      en: 'Snow grains', es: 'Granos de nieve', fr: 'Grains de neige', de: 'Schneegriesel', it: 'Neve granulosa',
      'pt-BR': 'Grãos de neve', 'pt-PT': 'Grãos de neve', nl: 'Sneeuwkorrels', da: 'Snekorn', sv: 'Snökorn',
      nb: 'Snøkorn', fi: 'Lumijyväset', pl: 'Ziarna śniegu', cs: 'Sněhová zrna', hu: 'Hókristály', ro: 'Boabe de zăpadă',
      el: 'Κόκκοι χιονιού', tr: 'Kar taneleri', ru: 'Снежные зёрна', uk: 'Снігові зерна', ar: 'حبيبات ثلج',
      he: 'גרגרי שלג', hi: 'हिम कण', th: 'เกล็ดหิมะ', vi: 'Hạt tuyết', id: 'Butir salju', ja: '雪あられ',
      ko: '싸락눈', zh: '雪粒', 'zh-TW': '雪粒'
    },
    'weather.wmo.85': {
      en: 'Snow showers', es: 'Chubascos de nieve', fr: 'Averses de neige', de: 'Schneeschauer', it: 'Rovesci di neve',
      'pt-BR': 'Pancadas de neve', 'pt-PT': 'Aguaceiros de neve', nl: 'Sneeuwbuien', da: 'Snebyger', sv: 'Snöbyar',
      nb: 'Snøbyger', fi: 'Lumikuurot', pl: 'Przelotne opady śniegu', cs: 'Sněhové přeháňky', hu: 'Hózápor',
      ro: 'Averse de zăpadă', el: 'Χιονόνερο', tr: 'Kar sağanağı', ru: 'Снегопад ливнями', uk: 'Снігові зливи',
      ar: 'زخات ثلج', he: 'ממטרי שלג', hi: 'हिम बौछारें', th: 'ฝนหิมะเป็นช่วง', vi: 'Mưa tuyết rào',
      id: 'Hujan salju', ja: 'にわか雪', ko: '소낙눈', zh: '阵雪', 'zh-TW': '陣雪'
    },
    'weather.durationHm': {
      en: '{h} hr {m} min', es: '{h} h {m} min', fr: '{h} h {m} min', de: '{h} Std. {m} Min.',
      it: '{h} h {m} min', 'pt-BR': '{h} h {m} min', 'pt-PT': '{h} h {m} min', nl: '{h} u {m} min',
      da: '{h} t {m} min', sv: '{h} t {m} min', nb: '{h} t {m} min', fi: '{h} t {m} min',
      pl: '{h} godz. {m} min', cs: '{h} h {m} min', hu: '{h} ó {m} p', ro: '{h} h {m} min',
      el: '{h} ώ {m} λ', tr: '{h} sa {m} dk', ru: '{h} ч {m} мин', uk: '{h} год {m} хв',
      ar: '{h} س {m} د', he: '{h} שע׳ {m} דק׳', hi: '{h} घं {m} मि', th: '{h} ชม. {m} น.',
      vi: '{h} giờ {m} phút', id: '{h} j {m} mnt', ja: '{h}時間{m}分', ko: '{h}시간 {m}분',
      zh: '{h} 小时 {m} 分钟', 'zh-TW': '{h} 小時 {m} 分鐘'
    },
    'weather.alertWhatToDo': {
      en: 'What to do', es: 'Instrucciones', fr: 'Que faire', de: 'Was tun', it: 'Cosa fare',
      'pt-BR': 'O que fazer', 'pt-PT': 'O que fazer', nl: 'Wat te doen', da: 'Hvad du kan gøre',
      sv: 'Vad du kan göra', nb: 'Hva du kan gjøre', fi: 'Mitä tehdä', pl: 'Co robić',
      cs: 'Co dělat', hu: 'Teendők', ro: 'Ce să faci', el: 'Τι να κάνετε', tr: 'Ne yapılmalı',
      ru: 'Что делать', uk: 'Що робити', ar: 'ماذا تفعل', he: 'מה לעשות', hi: 'क्या करें',
      th: 'ควรทำอย่างไร', vi: 'Nên làm gì', id: 'Yang harus dilakukan', ja: '対応', ko: '대처',
      zh: '应对建议', 'zh-TW': '應對建議'
    },
    'weather.wmo.86': {
      en: 'Heavy snow showers', es: 'Chubascos de nieve intensos', fr: 'Fortes averses de neige', de: 'Starke Schneeschauer',
      it: 'Forti rovesci di neve', 'pt-BR': 'Pancadas de neve intensas', 'pt-PT': 'Aguaceiros de neve fortes',
      nl: 'Zware sneeuwbuien', da: 'Kraftige snebyger', sv: 'Kraftiga snöbyar', nb: 'Kraftige snøbyger',
      fi: 'Runsaat lumikuurot', pl: 'Silne przelotne opady śniegu', cs: 'Silné sněhové přeháňky', hu: 'Erős hózápor',
      ro: 'Averse de zăpadă puternice', el: 'Ισχυρές χιονοπτώσεις', tr: 'Şiddetli kar sağanağı', ru: 'Сильный ливневый снег',
      uk: 'Сильні снігові зливи', ar: 'زخات ثلج غزيرة', he: 'ממטרי שלג כבדים', hi: 'तेज़ हिम बौछारें',
      th: 'ฝนหิมะหนักเป็นช่วง', vi: 'Mưa tuyết rào mạnh', id: 'Hujan salju lebat', ja: '激しいにわか雪',
      ko: '강한 소낙눈', zh: '强阵雪', 'zh-TW': '強陣雪'
    },

    'region.North America': {
      en: 'North America', es: 'Norteamérica', fr: 'Amérique du Nord', de: 'Nordamerika', it: 'Nord America',
      'pt-BR': 'América do Norte', 'pt-PT': 'América do Norte', nl: 'Noord-Amerika', da: 'Nordamerika',
      sv: 'Nordamerika', nb: 'Nord-Amerika', fi: 'Pohjois-Amerikka', pl: 'Ameryka Północna', cs: 'Severní Amerika',
      hu: 'Észak-Amerika', ro: 'America de Nord', el: 'Βόρεια Αμερική', tr: 'Kuzey Amerika', ru: 'Северная Америка',
      uk: 'Північна Америка', ar: 'أمريكا الشمالية', he: 'צפון אמריקה', hi: 'उत्तरी अमेरिका', th: 'อเมริกาเหนือ',
      vi: 'Bắc Mỹ', id: 'Amerika Utara', ja: '北アメリカ', ko: '북아메리카', zh: '北美洲', 'zh-TW': '北美洲'
    },
    'region.South America': {
      en: 'South America', es: 'Sudamérica', fr: 'Amérique du Sud', de: 'Südamerika', it: 'Sud America',
      'pt-BR': 'América do Sul', 'pt-PT': 'América do Sul', nl: 'Zuid-Amerika', da: 'Sydamerika',
      sv: 'Sydamerika', nb: 'Sør-Amerika', fi: 'Etelä-Amerikka', pl: 'Ameryka Południowa', cs: 'Jižní Amerika',
      hu: 'Dél-Amerika', ro: 'America de Sud', el: 'Νότια Αμερική', tr: 'Güney Amerika', ru: 'Южная Америка',
      uk: 'Південна Америка', ar: 'أمريكا الجنوبية', he: 'דרום אמריקה', hi: 'दक्षिण अमेरिका', th: 'อเมริกาใต้',
      vi: 'Nam Mỹ', id: 'Amerika Selatan', ja: '南アメリカ', ko: '남아메리카', zh: '南美洲', 'zh-TW': '南美洲'
    },
    'region.Europe': {
      en: 'Europe', es: 'Europa', fr: 'Europe', de: 'Europa', it: 'Europa', 'pt-BR': 'Europa', 'pt-PT': 'Europa',
      nl: 'Europa', da: 'Europa', sv: 'Europa', nb: 'Europa', fi: 'Eurooppa', pl: 'Europa', cs: 'Evropa',
      hu: 'Európa', ro: 'Europa', el: 'Ευρώπη', tr: 'Avrupa', ru: 'Европа', uk: 'Європа', ar: 'أوروبا',
      he: 'אירופה', hi: 'यूरोप', th: 'ยุโรป', vi: 'Châu Âu', id: 'Eropa', ja: 'ヨーロッパ', ko: '유럽',
      zh: '欧洲', 'zh-TW': '歐洲'
    },
    'region.Middle East': {
      en: 'Middle East', es: 'Oriente Medio', fr: 'Moyen-Orient', de: 'Naher Osten', it: 'Medio Oriente',
      'pt-BR': 'Oriente Médio', 'pt-PT': 'Médio Oriente', nl: 'Midden-Oosten', da: 'Mellemøsten', sv: 'Mellanöstern',
      nb: 'Midtøsten', fi: 'Lähi-itä', pl: 'Bliski Wschód', cs: 'Blízký východ', hu: 'Közel-Kelet',
      ro: 'Orientul Mijlociu', el: 'Μέση Ανατολή', tr: 'Orta Doğu', ru: 'Ближний Восток', uk: 'Близький Схід',
      ar: 'الشرق الأوسط', he: 'המזרח התיכון', hi: 'मध्य पूर्व', th: 'ตะวันออกกลาง', vi: 'Trung Đông',
      id: 'Timur Tengah', ja: '中東', ko: '중동', zh: '中东', 'zh-TW': '中東'
    },
    'region.Africa': {
      en: 'Africa', es: 'África', fr: 'Afrique', de: 'Afrika', it: 'Africa', 'pt-BR': 'África', 'pt-PT': 'África',
      nl: 'Afrika', da: 'Afrika', sv: 'Afrika', nb: 'Afrika', fi: 'Afrikka', pl: 'Afryka', cs: 'Afrika',
      hu: 'Afrika', ro: 'Africa', el: 'Αφρική', tr: 'Afrika', ru: 'Африка', uk: 'Африка', ar: 'أفريقيا',
      he: 'אפריקה', hi: 'अफ़्रीका', th: 'แอฟริกา', vi: 'Châu Phi', id: 'Afrika', ja: 'アフリカ', ko: '아프리카',
      zh: '非洲', 'zh-TW': '非洲'
    },
    'region.Asia': {
      en: 'Asia', es: 'Asia', fr: 'Asie', de: 'Asien', it: 'Asia', 'pt-BR': 'Ásia', 'pt-PT': 'Ásia', nl: 'Azië',
      da: 'Asien', sv: 'Asien', nb: 'Asia', fi: 'Aasia', pl: 'Azja', cs: 'Asie', hu: 'Ázsia', ro: 'Asia',
      el: 'Ασία', tr: 'Asya', ru: 'Азия', uk: 'Азія', ar: 'آسيا', he: 'אסיה', hi: 'एशिया', th: 'เอเชีย',
      vi: 'Châu Á', id: 'Asia', ja: 'アジア', ko: '아시아', zh: '亚洲', 'zh-TW': '亞洲'
    },
    'region.Oceania': {
      en: 'Oceania', es: 'Oceanía', fr: 'Océanie', de: 'Ozeanien', it: 'Oceania', 'pt-BR': 'Oceania',
      'pt-PT': 'Oceânia', nl: 'Oceanië', da: 'Oceanien', sv: 'Oceanien', nb: 'Oseania', fi: 'Oseania',
      pl: 'Oceania', cs: 'Oceánie', hu: 'Óceánia', ro: 'Oceania', el: 'Ωκεανία', tr: 'Okyanusya',
      ru: 'Океания', uk: 'Океанія', ar: 'أوقيانوسيا', he: 'אוקיאניה', hi: 'ओशिआनिया', th: 'โอเชียเนีย',
      vi: 'Châu Đại Dương', id: 'Oseania', ja: 'オセアニア', ko: '오세아니아', zh: '大洋洲', 'zh-TW': '大洋洲'
    }
  };

  global.I18N = global.I18N || {};
  Object.keys(S).forEach(function (key) {
    var row = S[key];
    locales.forEach(function (item) {
      var code = item[0];
      global.I18N[code] = Object.assign({}, global.I18N[code] || {});
      if (row[code]) global.I18N[code][key] = row[code];
      else if (row.en) global.I18N[code][key] = row.en;
    });
  });
  locales.forEach(function (item) {
    var code = item[0];
    global.I18N[code] = Object.assign({}, global.I18N[code] || {});
    global.I18N[code]['settings.languageLabel'] = langWord[code] || 'Language';
    global.I18N[code]['pageTitle.weather'] = (global.I18N[code]['tools.weatherLabel'] || 'Weather') + ' — duskline';
  });
})(window);
