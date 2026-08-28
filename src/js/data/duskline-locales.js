'use strict';
/* Duskline locale registry. UI packs may grow independently of the weather runtime. */
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
    'pt-BR': 'pt-BR', 'pt-PT': 'pt-PT', nb: 'nb-NO', zh: 'zh-CN', 'zh-TW': 'zh-TW',
    he: 'he', ar: 'ar', el: 'el', uk: 'uk', ru: 'ru'
  };

  /* Duskline owns these strings. The weather runtime falls back to English for
     optional copy, while every launch language has a translated core UI. */
  var packs = {
    en: ['Weather, wherever you are', 'Weather', 'Search any city worldwide…', 'Use my location', 'Refresh', 'Units', 'Featured places', 'Favorites', 'My location', 'Privacy Policy', 'Terms of Use'],
    es: ['El tiempo, estés donde estés', 'Tiempo', 'Busca cualquier ciudad del mundo…', 'Usar mi ubicación', 'Actualizar', 'Unidades', 'Lugares destacados', 'Favoritos', 'Mi ubicación', 'Política de privacidad', 'Términos de uso'],
    fr: ['La météo, où que vous soyez', 'Météo', 'Rechercher une ville dans le monde…', 'Utiliser ma position', 'Actualiser', 'Unités', 'Lieux à découvrir', 'Favoris', 'Ma position', 'Politique de confidentialité', "Conditions d’utilisation"],
    de: ['Wetter, wo immer Sie sind', 'Wetter', 'Weltweit nach einer Stadt suchen…', 'Meinen Standort verwenden', 'Aktualisieren', 'Einheiten', 'Ausgewählte Orte', 'Favoriten', 'Mein Standort', 'Datenschutz', 'Nutzungsbedingungen'],
    it: ['Meteo, ovunque tu sia', 'Meteo', 'Cerca una città nel mondo…', 'Usa la mia posizione', 'Aggiorna', 'Unità', 'Luoghi in evidenza', 'Preferiti', 'La mia posizione', 'Privacy', 'Termini di utilizzo'],
    'pt-BR': ['Clima, onde você estiver', 'Clima', 'Busque qualquer cidade do mundo…', 'Usar minha localização', 'Atualizar', 'Unidades', 'Lugares em destaque', 'Favoritos', 'Minha localização', 'Privacidade', 'Termos de uso'],
    'pt-PT': ['Meteorologia, onde estiver', 'Meteorologia', 'Pesquisar qualquer cidade do mundo…', 'Usar a minha localização', 'Atualizar', 'Unidades', 'Locais em destaque', 'Favoritos', 'A minha localização', 'Privacidade', 'Termos de utilização'],
    nl: ['Het weer, waar je ook bent', 'Weer', 'Zoek een stad wereldwijd…', 'Mijn locatie gebruiken', 'Verversen', 'Eenheden', 'Uitgelichte plaatsen', 'Favorieten', 'Mijn locatie', 'Privacybeleid', 'Gebruiksvoorwaarden'],
    da: ['Vejret, uanset hvor du er', 'Vejr', 'Søg efter en by i hele verden…', 'Brug min placering', 'Opdater', 'Enheder', 'Udvalgte steder', 'Favoritter', 'Min placering', 'Privatlivspolitik', 'Brugsvilkår'],
    sv: ['Vädret, var du än är', 'Väder', 'Sök efter en stad var som helst i världen…', 'Använd min plats', 'Uppdatera', 'Enheter', 'Utvalda platser', 'Favoriter', 'Min plats', 'Integritetspolicy', 'Användarvillkor'],
    nb: ['Været, uansett hvor du er', 'Vær', 'Søk etter en by hvor som helst i verden…', 'Bruk posisjonen min', 'Oppdater', 'Enheter', 'Utvalgte steder', 'Favoritter', 'Min posisjon', 'Personvern', 'Bruksvilkår'],
    fi: ['Sää, missä ikinä oletkin', 'Sää', 'Hae kaupunkia kaikkialta maailmasta…', 'Käytä sijaintiani', 'Päivitä', 'Yksiköt', 'Esittelyssä olevat paikat', 'Suosikit', 'Oma sijainti', 'Tietosuojakäytäntö', 'Käyttöehdot'],
    pl: ['Pogoda, gdziekolwiek jesteś', 'Pogoda', 'Szukaj dowolnego miasta na świecie…', 'Użyj mojej lokalizacji', 'Odśwież', 'Jednostki', 'Polecane miejsca', 'Ulubione', 'Moja lokalizacja', 'Polityka prywatności', 'Warunki korzystania'],
    cs: ['Počasí, ať jste kdekoli', 'Počasí', 'Hledat město kdekoli na světě…', 'Použít moji polohu', 'Obnovit', 'Jednotky', 'Doporučená místa', 'Oblíbené', 'Moje poloha', 'Zásady ochrany soukromí', 'Podmínky použití'],
    hu: ['Időjárás, bárhol is jársz', 'Időjárás', 'Keress rá bármely városra a világon…', 'Helyzetem használata', 'Frissítés', 'Mértékegységek', 'Kiemelt helyek', 'Kedvencek', 'Saját helyzet', 'Adatvédelmi szabályzat', 'Felhasználási feltételek'],
    ro: ['Vremea, oriunde te-ai afla', 'Vreme', 'Caută orice oraș din lume…', 'Folosește locația mea', 'Reîmprospătează', 'Unități', 'Locuri recomandate', 'Favorite', 'Locația mea', 'Politica de confidențialitate', 'Termeni de utilizare'],
    el: ['Ο καιρός, όπου κι αν βρίσκεστε', 'Καιρός', 'Αναζητήστε οποιαδήποτε πόλη στον κόσμο…', 'Χρήση της τοποθεσίας μου', 'Ανανέωση', 'Μονάδες', 'Προτεινόμενα μέρη', 'Αγαπημένα', 'Η τοποθεσία μου', 'Πολιτική απορρήτου', 'Όροι χρήσης'],
    tr: ['Hava durumu, nerede olursanız olun', 'Hava durumu', 'Dünyadaki herhangi bir şehri ara…', 'Konumumu kullan', 'Yenile', 'Birimler', 'Öne çıkan yerler', 'Favoriler', 'Konumum', 'Gizlilik Politikası', 'Kullanım Koşulları'],
    ru: ['Погода, где бы вы ни находились', 'Погода', 'Найдите любой город в мире…', 'Использовать моё местоположение', 'Обновить', 'Единицы', 'Избранные места', 'Избранное', 'Моё местоположение', 'Политика конфиденциальности', 'Условия использования'],
    uk: ['Погода, де б ви не були', 'Погода', 'Знайдіть будь-яке місто світу…', 'Використати моє місцезнаходження', 'Оновити', 'Одиниці', 'Рекомендовані місця', 'Обране', 'Моє місцезнаходження', 'Політика конфіденційності', 'Умови використання'],
    ar: ['الطقس، أينما كنت', 'الطقس', 'ابحث عن أي مدينة حول العالم…', 'استخدام موقعي', 'تحديث', 'الوحدات', 'أماكن مميزة', 'المفضلة', 'موقعي', 'سياسة الخصوصية', 'شروط الاستخدام'],
    he: ['מזג האוויר, בכל מקום שבו אתם נמצאים', 'מזג האוויר', 'חיפוש עיר מכל מקום בעולם…', 'שימוש במיקום שלי', 'רענון', 'יחידות', 'מקומות נבחרים', 'מועדפים', 'המיקום שלי', 'מדיניות פרטיות', 'תנאי שימוש'],
    hi: ['मौसम, आप कहीं भी हों', 'मौसम', 'दुनिया के किसी भी शहर को खोजें…', 'मेरा स्थान उपयोग करें', 'रिफ्रेश', 'इकाइयाँ', 'विशेष स्थान', 'पसंदीदा', 'मेरा स्थान', 'गोपनीयता नीति', 'उपयोग की शर्तें'],
    th: ['สภาพอากาศ ไม่ว่าคุณจะอยู่ที่ไหน', 'สภาพอากาศ', 'ค้นหาเมืองใดก็ได้ทั่วโลก…', 'ใช้ตำแหน่งของฉัน', 'รีเฟรช', 'หน่วย', 'สถานที่แนะนำ', 'รายการโปรด', 'ตำแหน่งของฉัน', 'นโยบายความเป็นส่วนตัว', 'ข้อกำหนดการใช้งาน'],
    vi: ['Thời tiết, ở bất cứ nơi đâu', 'Thời tiết', 'Tìm kiếm bất kỳ thành phố nào trên thế giới…', 'Dùng vị trí của tôi', 'Làm mới', 'Đơn vị', 'Địa điểm nổi bật', 'Yêu thích', 'Vị trí của tôi', 'Chính sách quyền riêng tư', 'Điều khoản sử dụng'],
    id: ['Cuaca, di mana pun Anda berada', 'Cuaca', 'Cari kota mana pun di seluruh dunia…', 'Gunakan lokasi saya', 'Segarkan', 'Satuan', 'Tempat pilihan', 'Favorit', 'Lokasi saya', 'Kebijakan Privasi', 'Ketentuan Penggunaan'],
    ja: ['どこにいても、天気を確認', '天気', '世界中の都市を検索…', '現在地を使う', '更新', '単位', '注目の場所', 'お気に入り', '現在地', 'プライバシーポリシー', '利用規約'],
    ko: ['어디서든 확인하는 날씨', '날씨', '전 세계 도시 검색…', '내 위치 사용', '새로 고침', '단위', '추천 장소', '즐겨찾기', '내 위치', '개인정보 처리방침', '이용약관'],
    zh: ['无论身在何处，查看天气', '天气', '搜索全球任意城市…', '使用我的位置', '刷新', '单位', '精选地点', '收藏夹', '我的位置', '隐私政策', '使用条款'],
    'zh-TW': ['無論身在何處，查看天氣', '天氣', '搜尋全球任意城市…', '使用我的位置', '重新整理', '單位', '精選地點', '我的最愛', '我的位置', '隱私權政策', '使用條款']
  };
  var keys = ['tools.weatherSub', 'tools.weatherLabel', 'weather.searchPlaceholder', 'weather.useLocation', 'weather.refresh', 'weather.units', 'weather.majorCities', 'weather.favorites', 'weather.myLocation', 'legal.privacyLink', 'legal.termsLink'];
  global.I18N = global.I18N || {};
  Object.keys(packs).forEach(function (code) {
    global.I18N[code] = Object.assign({}, global.I18N[code] || {});
    packs[code].forEach(function (value, index) { global.I18N[code][keys[index]] = value; });
    global.I18N[code]['settings.languageLabel'] = code === 'en' ? 'Language' : locales.find(function (x) { return x[0] === code; })[1];
    global.I18N[code]['pageTitle.weather'] = global.I18N[code]['tools.weatherLabel'] + ' — Duskline';
  });
})(window);
