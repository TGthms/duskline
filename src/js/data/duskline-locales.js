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
      en: '10-Day Forecast', es: 'Próximos días', fr: 'Prévisions sur 10 jours', de: '10-Tage-Vorhersage',
      it: 'Previsione a 10 giorni', 'pt-BR': 'Previsão de 10 dias', 'pt-PT': 'Previsão de 10 dias',
      nl: '10-daagse verwachting', da: '10-døgnsprognose', sv: '10-dygnsprognos', nb: '10-dagersvarsel',
      fi: '10 vuorokauden ennuste', pl: 'Prognoza 10-dniowa', cs: '10denní předpověď', hu: '10 napos előrejelzés',
      ro: 'Prognoză pe 10 zile', el: 'Πρόγνωση 10 ημερών', tr: '10 günlük tahmin', ru: 'Прогноз на 10 дней',
      uk: 'Прогноз на 10 днів', ar: 'توقعات 10 أيام', he: 'תחזית ל־10 ימים', hi: '10-दिन का पूर्वानुमान',
      th: 'พยากรณ์ 10 วัน', vi: 'Dự báo 10 ngày', id: 'Prakiraan 10 hari', ja: '10日間予報',
      ko: '10일 예보', zh: '10日预报', 'zh-TW': '10 天預報'
    },
    'weather.feelsLike': {
      en: 'Feels like', es: 'Sensación', fr: 'Ressenti', de: 'Gefühlt', it: 'Percepita', 'pt-BR': 'Sensação',
      'pt-PT': 'Sensação', nl: 'Voelt als', da: 'Føles som', sv: 'Känns som', nb: 'Føles som', fi: 'Tuntuu kuin',
      pl: 'Odczuwalna', cs: 'Pocitově', hu: 'Hőérzet', ro: 'Se simte ca', el: 'Αίσθηση', tr: 'Hissedilen',
      ru: 'Ощущается', uk: 'Відчувається', ar: 'الإحساس', he: 'מרגיש כמו', hi: 'महसूस', th: 'รู้สึกเหมือน',
      vi: 'Cảm giác', id: 'Terasa', ja: '体感', ko: '체감', zh: '体感', 'zh-TW': '體感'
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
      en: 'Data: U.S. forecasts & alerts NWS · world & extras Open-Meteo (CC BY 4.0). For guidance only — not for emergencies.',
      es: 'Datos: previsiones y avisos de EE. UU. NWS · mundo y extras Open-Meteo (CC BY 4.0). Solo orientativo; no uses esto en emergencias.',
      fr: 'Données : prévisions et alertes U.S. NWS · monde et extras Open-Meteo (CC BY 4.0). À titre indicatif — pas pour les urgences.',
      de: 'Daten: US-Vorhersagen & Warnungen NWS · Welt & Zusatz Open-Meteo (CC BY 4.0). Nur zur Orientierung — nicht für Notfälle.',
      it: 'Dati: previsioni e allerte U.S. NWS · mondo ed extra Open-Meteo (CC BY 4.0). Solo orientativo — non per le emergenze.',
      'pt-BR': 'Dados: previsões e alertas dos EUA NWS · mundo e extras Open-Meteo (CC BY 4.0). Apenas orientação — não use em emergências.',
      'pt-PT': 'Dados: previsões e alertas dos EUA NWS · mundo e extras Open-Meteo (CC BY 4.0). Apenas orientação — não use em emergências.',
      nl: 'Gegevens: VS-verwachtingen & waarschuwingen NWS · wereld & extra’s Open-Meteo (CC BY 4.0). Alleen ter informatie — niet voor noodgevallen.',
      da: 'Data: amerikanske varsler NWS · verden og ekstra Open-Meteo (CC BY 4.0). Kun vejledning — ikke til nødsituationer.',
      sv: 'Data: USA-prognoser och varningar NWS · världen och tillägg Open-Meteo (CC BY 4.0). Endast vägledning — inte för nödsituationer.',
      nb: 'Data: amerikanske varsler NWS · verden og tillegg Open-Meteo (CC BY 4.0). Kun veiledning — ikke for nødsituasjoner.',
      fi: 'Data: Yhdysvaltojen ennusteet ja varoitukset NWS · maailma ja lisät Open-Meteo (CC BY 4.0). Vain ohjeeksi — ei hätätilanteisiin.',
      pl: 'Dane: prognozy i alerty USA NWS · świat i dodatki Open-Meteo (CC BY 4.0). Tylko orientacyjnie — nie do nagłych wypadków.',
      cs: 'Data: předpovědi a výstrahy USA NWS · svět a doplňky Open-Meteo (CC BY 4.0). Pouze orientačně — ne pro nouzové situace.',
      hu: 'Adatok: amerikai előrejelzések és riasztások NWS · világ és kiegészítők Open-Meteo (CC BY 4.0). Csak tájékoztatás — nem vészhelyzetre.',
      ro: 'Date: prognoze și alerte SUA NWS · lume și extra Open-Meteo (CC BY 4.0). Doar orientativ — nu pentru urgențe.',
      el: 'Δεδομένα: προγνώσεις και ειδοποιήσεις ΗΠΑ NWS · κόσμος και επιπλέον Open-Meteo (CC BY 4.0). Μόνο καθοδήγηση — όχι για έκτακτες ανάγκες.',
      tr: 'Veri: ABD tahminleri ve uyarıları NWS · dünya ve ekler Open-Meteo (CC BY 4.0). Yalnızca rehberlik — acil durumlar için değil.',
      ru: 'Данные: прогнозы и предупреждения США NWS · мир и доп. Open-Meteo (CC BY 4.0). Только ориентир — не для чрезвычайных ситуаций.',
      uk: 'Дані: прогнози й попередження США NWS · світ і додатки Open-Meteo (CC BY 4.0). Лише орієнтир — не для надзвичайних ситуацій.',
      ar: 'البيانات: توقعات وتنبيهات الولايات المتحدة NWS · العالم والإضافات Open-Meteo (CC BY 4.0). للإرشاد فقط — ليست للطوارئ.',
      he: 'נתונים: תחזיות והתרעות ארה״ב NWS · עולם ותוספות Open-Meteo (CC BY 4.0). להכוונה בלבד — לא למקרי חירום.',
      hi: 'डेटा: अमेरिकी पूर्वानुमान और अलर्ट NWS · विश्व और अतिरिक्त Open-Meteo (CC BY 4.0)। केवल मार्गदर्शन — आपात स्थिति के लिए नहीं।',
      th: 'ข้อมูล: พยากรณ์และเตือนภัยสหรัฐฯ NWS · ทั่วโลกและส่วนเสริม Open-Meteo (CC BY 4.0) เพื่อแนวทางเท่านั้น — ไม่ใช้ในเหตุฉุกเฉิน',
      vi: 'Dữ liệu: dự báo và cảnh báo Hoa Kỳ NWS · thế giới và bổ sung Open-Meteo (CC BY 4.0). Chỉ mang tính tham khảo — không dùng trong trường hợp khẩn cấp.',
      id: 'Data: prakiraan & peringatan AS NWS · dunia & tambahan Open-Meteo (CC BY 4.0). Hanya panduan — bukan untuk darurat.',
      ja: 'データ：米国の予報と警報は NWS · 世界と補足は Open-Meteo（CC BY 4.0）。参考情報であり、緊急時の判断には使わないでください。',
      ko: '데이터: 미국 예보 및 경보 NWS · 전 세계 및 부가 정보 Open-Meteo(CC BY 4.0). 참고용이며 응급 상황에는 사용하지 마세요.',
      zh: '数据：美国预报与预警 NWS · 全球与补充 Open-Meteo（CC BY 4.0）。仅供参考，紧急情况请勿依赖。',
      'zh-TW': '資料：美國預報與警報 NWS · 全球與補充 Open-Meteo（CC BY 4.0）。僅供參考，請勿用於緊急決策。'
    },
    'weather.alerts': {
      en: 'Weather Alerts', es: 'Avisos meteorológicos', fr: 'Alertes météo', de: 'Wetterwarnungen',
      it: 'Allerte meteo', 'pt-BR': 'Alertas meteorológicos', 'pt-PT': 'Alertas meteorológicos',
      nl: 'Weerwaarschuwingen', da: 'Vejrvarsler', sv: 'Vädervarningar', nb: 'Værvarsler', fi: 'Säävaroitukset',
      pl: 'Alerty pogodowe', cs: 'Výstrahy', hu: 'Időjárási riasztások', ro: 'Alerte meteo',
      el: 'Ειδοποιήσεις καιρού', tr: 'Hava uyarıları', ru: 'Погодные предупреждения', uk: 'Погодні попередження',
      ar: 'تنبيهات الطقس', he: 'התרעות מזג אוויר', hi: 'मौसम चेतावनियाँ', th: 'การแจ้งเตือนสภาพอากาศ',
      vi: 'Cảnh báo thời tiết', id: 'Peringatan cuaca', ja: '気象警報', ko: '날씨 경보', zh: '天气预警', 'zh-TW': '天氣警報'
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
    'weather.alertsUnavailable': {
      en: 'Weather alerts could not be loaded.', es: 'No se pudieron cargar los avisos meteorológicos.',
      fr: 'Impossible de charger les alertes météo.', de: 'Wetterwarnungen konnten nicht geladen werden.',
      it: 'Impossibile caricare le allerte meteo.', 'pt-BR': 'Não foi possível carregar os alertas.',
      'pt-PT': 'Não foi possível carregar os alertas.', nl: 'Weerwaarschuwingen konden niet worden geladen.',
      da: 'Vejrvarsler kunne ikke indlæses.', sv: 'Vädervarningar kunde inte läsas in.',
      nb: 'Kunne ikke laste værvarsler.', fi: 'Säävaroituksia ei voitu ladata.',
      pl: 'Nie udało się wczytać alertów pogodowych.', cs: 'Výstrahy se nepodařilo načíst.',
      hu: 'Az időjárási riasztások nem tölthetők be.', ro: 'Alertele meteo nu au putut fi încărcate.',
      el: 'Δεν ήταν δυνατή η φόρτωση των ειδοποιήσεων.', tr: 'Hava uyarıları yüklenemedi.',
      ru: 'Не удалось загрузить предупреждения.', uk: 'Не вдалося завантажити попередження.',
      ar: 'تعذر تحميل تنبيهات الطقس.', he: 'לא ניתן לטעון התרעות מזג אוויר.', hi: 'मौसम चेतावनियाँ लोड नहीं हो सकीं.',
      th: 'ไม่สามารถโหลดการแจ้งเตือนสภาพอากาศได้', vi: 'Không thể tải cảnh báo thời tiết.',
      id: 'Tidak dapat memuat peringatan cuaca.', ja: '気象警報を読み込めませんでした。',
      ko: '날씨 경보를 불러올 수 없습니다.', zh: '无法加载天气预警。', 'zh-TW': '無法載入天氣警報。'
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
    'weather.search': {
      en: 'Search city', es: 'Buscar ciudad', fr: 'Rechercher une ville', de: 'Stadt suchen', it: 'Cerca città',
      'pt-BR': 'Buscar cidade', 'pt-PT': 'Pesquisar cidade', nl: 'Stad zoeken', da: 'Søg by', sv: 'Sök stad',
      nb: 'Søk by', fi: 'Hae kaupunkia', pl: 'Szukaj miasta', cs: 'Hledat město', hu: 'Város keresése',
      ro: 'Caută oraș', el: 'Αναζήτηση πόλης', tr: 'Şehir ara', ru: 'Поиск города', uk: 'Пошук міста',
      ar: 'بحث عن مدينة', he: 'חיפוש עיר', hi: 'शहर खोजें', th: 'ค้นหาเมือง', vi: 'Tìm thành phố',
      id: 'Cari kota', ja: '都市を検索', ko: '도시 검색', zh: '搜索城市', 'zh-TW': '搜尋城市'
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
    'weather.legalEnglishNote': {
      en: 'The full legal text is provided in English.', es: 'El texto legal completo está en inglés.',
      fr: 'Le texte juridique intégral est fourni en anglais.', de: 'Der vollständige Rechtstext liegt auf Englisch vor.',
      it: 'Il testo legale completo è in inglese.', 'pt-BR': 'O texto legal completo está em inglês.',
      'pt-PT': 'O texto legal completo está em inglês.', nl: 'De volledige juridische tekst staat in het Engels.',
      da: 'Den fulde juridiske tekst er på engelsk.', sv: 'Den fullständiga juridiska texten är på engelska.',
      nb: 'Den fullstendige juridiske teksten er på engelsk.', fi: 'Täydellinen oikeudellinen teksti on englanniksi.',
      pl: 'Pełny tekst prawny jest po angielsku.', cs: 'Úplný právní text je v angličtině.',
      hu: 'A teljes jogi szöveg angolul érhető el.', ro: 'Textul juridic complet este în engleză.',
      el: 'Το πλήρες νομικό κείμενο είναι στα αγγλικά.', tr: 'Tam yasal metin İngilizcedir.',
      ru: 'Полный юридический текст приведён на английском.', uk: 'Повний юридичний текст подано англійською.',
      ar: 'النص القانوني الكامل متوفر بالإنجليزية.', he: 'הטקסט המשפטי המלא מופיע באנגלית.',
      hi: 'पूर्ण कानूनी पाठ अंग्रेज़ी में है।', th: 'ข้อความทางกฎหมายฉบับเต็มเป็นภาษาอังกฤษ',
      vi: 'Toàn bộ văn bản pháp lý được cung cấp bằng tiếng Anh.', id: 'Teks hukum lengkap disediakan dalam bahasa Inggris.',
      ja: '全文の法的文書は英語です。', ko: '전체 법률 문구는 영어로 제공됩니다.', zh: '完整法律文本以英文提供。',
      'zh-TW': '完整法律文本以英文提供。'
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
