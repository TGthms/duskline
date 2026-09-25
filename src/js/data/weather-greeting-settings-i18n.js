'use strict';
/* Short, native-sounding labels and guidance for the My Sky greeting location picker. */
(function (global) {
  var locales = global.DUSKLINE_LANG_CODES || [];
  var D = {
    en: { button: 'Greeting location', title: 'Greeting location', help: 'Choose the place that personalizes your My Sky greeting.', empty: 'Choose a city or use your location to personalize your weather greeting.' },
    es: { button: 'Lugar del saludo', title: 'Lugar del saludo', help: 'Elige el lugar que personalizará el saludo de Mi cielo.', empty: 'Elige una ciudad o usa tu ubicación para personalizar el saludo del tiempo.' },
    fr: { button: 'Lieu du message', title: 'Lieu du message', help: 'Choisissez le lieu qui personnalisera le message de Mon ciel.', empty: 'Choisissez une ville ou utilisez votre position pour personnaliser le message météo.' },
    de: { button: 'Ort für den Wettergruß', title: 'Ort für den Wettergruß', help: 'Wähle den Ort für deinen persönlichen Wettergruß in Mein Himmel.', empty: 'Wähle eine Stadt oder nutze deinen Standort für einen persönlichen Wettergruß.' },
    it: { button: 'Luogo del saluto', title: 'Luogo del saluto', help: 'Scegli il luogo che personalizza il saluto de Il mio cielo.', empty: 'Scegli una città o usa la tua posizione per personalizzare il saluto meteo.' },
    'pt-BR': { button: 'Local da saudação', title: 'Local da saudação', help: 'Escolha o local que personaliza a saudação do Meu céu.', empty: 'Escolha uma cidade ou use sua localização para personalizar a saudação do tempo.' },
    'pt-PT': { button: 'Local da saudação', title: 'Local da saudação', help: 'Escolha o local que personaliza a saudação do Meu céu.', empty: 'Escolha uma cidade ou use a sua localização para personalizar a saudação meteorológica.' },
    nl: { button: 'Locatie voor de begroeting', title: 'Locatie voor de begroeting', help: 'Kies de locatie voor je persoonlijke weerbegroeting in Mijn hemel.', empty: 'Kies een stad of gebruik je locatie om je weerbegroeting persoonlijk te maken.' },
    da: { button: 'Sted for vejrhilsenen', title: 'Sted for vejrhilsenen', help: 'Vælg stedet for din personlige vejrhilsen i Min himmel.', empty: 'Vælg en by, eller brug din placering til at gøre vejrhilsenen personlig.' },
    sv: { button: 'Plats för väderhälsningen', title: 'Plats för väderhälsningen', help: 'Välj platsen för din personliga väderhälsning i Min himmel.', empty: 'Välj en stad eller använd din plats för att anpassa väderhälsningen.' },
    nb: { button: 'Sted for værhilsenen', title: 'Sted for værhilsenen', help: 'Velg stedet for din personlige værhilsen i Min himmel.', empty: 'Velg en by eller bruk posisjonen din for å tilpasse værhilsenen.' },
    fi: { button: 'Tervehdyksen sijainti', title: 'Tervehdyksen sijainti', help: 'Valitse paikka, jonka sää vaikuttaa henkilökohtaiseen tervehdykseesi.', empty: 'Valitse kaupunki tai käytä sijaintiasi, niin säätervehdyksestä tulee henkilökohtainen.' },
    pl: { button: 'Miejsce powitania', title: 'Miejsce powitania', help: 'Wybierz miejsce, które spersonalizuje Twoje powitanie z prognozą.', empty: 'Wybierz miasto lub użyj swojej lokalizacji, aby spersonalizować powitanie pogodowe.' },
    cs: { button: 'Místo pro pozdrav', title: 'Místo pro pozdrav', help: 'Vyberte místo, podle kterého se přizpůsobí váš osobní pozdrav s počasím.', empty: 'Vyberte město nebo použijte svou polohu a přizpůsobte si pozdrav s předpovědí počasí.' },
    hu: { button: 'A köszöntés helye', title: 'A köszöntés helye', help: 'Válaszd ki, melyik hely időjárása alakítsa a személyes köszöntésedet.', empty: 'Válassz egy várost, vagy használd a tartózkodási helyedet a személyes időjárási köszöntéshez.' },
    ro: { button: 'Locul salutului', title: 'Locul salutului', help: 'Alege locul care personalizează salutul tău cu informații meteo.', empty: 'Alege un oraș sau folosește-ți locația pentru a personaliza salutul meteo.' },
    el: { button: 'Τοποθεσία χαιρετισμού', title: 'Τοποθεσία χαιρετισμού', help: 'Επιλέξτε την τοποθεσία που θα εξατομικεύσει τον καιρικό σας χαιρετισμό.', empty: 'Επιλέξτε πόλη ή χρησιμοποιήστε την τοποθεσία σας για έναν προσωπικό καιρικό χαιρετισμό.' },
    tr: { button: 'Selamlama konumu', title: 'Selamlama konumu', help: 'Kişisel hava durumu selamlamanıza yön verecek yeri seçin.', empty: 'Hava durumu selamlamanızı kişiselleştirmek için bir şehir seçin veya konumunuzu kullanın.' },
    ru: { button: 'Место для приветствия', title: 'Место для приветствия', help: 'Выберите место, по погоде в котором будет составляться персональное приветствие.', empty: 'Выберите город или используйте своё местоположение, чтобы персонализировать приветствие о погоде.' },
    uk: { button: 'Місце для привітання', title: 'Місце для привітання', help: 'Виберіть місце, за погодою в якому складатиметься персональне привітання.', empty: 'Виберіть місто або скористайтеся своїм місцезнаходженням, щоб персоналізувати привітання про погоду.' },
    ar: { button: 'موقع التحية', title: 'موقع التحية', help: 'اختر الموقع الذي يضفي طابعاً شخصياً على تحية الطقس.', empty: 'اختر مدينة أو استخدم موقعك لتخصيص تحية الطقس.' },
    he: { button: 'מיקום ברכת מזג האוויר', title: 'מיקום ברכת מזג האוויר', help: 'בחרו את המקום שלפיו תותאם ברכת מזג האוויר האישית שלכם.', empty: 'בחרו עיר או השתמשו במיקום שלכם כדי להתאים אישית את ברכת מזג האוויר.' },
    hi: { button: 'अभिवादन का स्थान', title: 'अभिवादन का स्थान', help: 'वह जगह चुनें जिसके मौसम के अनुसार आपका निजी अभिवादन होगा।', empty: 'मौसम का अभिवादन अपने अनुसार पाने के लिए कोई शहर चुनें या अपना स्थान इस्तेमाल करें।' },
    th: { button: 'ตำแหน่งสำหรับคำทักทาย', title: 'ตำแหน่งสำหรับคำทักทาย', help: 'เลือกสถานที่ที่จะใช้ปรับคำทักทายสภาพอากาศให้เหมาะกับคุณ', empty: 'เลือกเมืองหรือใช้ตำแหน่งของคุณเพื่อปรับคำทักทายสภาพอากาศให้เหมาะกับคุณ' },
    vi: { button: 'Địa điểm cho lời chào', title: 'Địa điểm cho lời chào', help: 'Chọn địa điểm để cá nhân hóa lời chào thời tiết của bạn.', empty: 'Chọn một thành phố hoặc dùng vị trí của bạn để cá nhân hóa lời chào thời tiết.' },
    id: { button: 'Lokasi sapaan', title: 'Lokasi sapaan', help: 'Pilih lokasi untuk menyesuaikan sapaan cuaca pribadi Anda.', empty: 'Pilih kota atau gunakan lokasi Anda untuk menyesuaikan sapaan cuaca.' },
    ja: { button: 'あいさつの場所', title: 'あいさつの場所', help: '天気に合わせたあいさつに使う場所を選びます。', empty: '都市を選ぶか現在地を使うと、天気のあいさつを自分向けにできます。' },
    ko: { button: '인사말 위치', title: '인사말 위치', help: '나만의 날씨 인사말에 반영할 위치를 선택하세요.', empty: '도시를 선택하거나 내 위치를 사용해 나만의 날씨 인사말을 받아 보세요.' },
    zh: { button: '问候地点', title: '问候地点', help: '选择一个地点，让天气问候更贴合你的需求。', empty: '选择一座城市或使用你的位置，获取个性化天气问候。' },
    'zh-TW': { button: '問候地點', title: '問候地點', help: '選擇一個地點，讓天氣問候更貼近你的需求。', empty: '選擇一座城市或使用你的位置，取得個人化天氣問候。' }
  };
  var keys = {
    'weather.greetingLocationTitle': 'title',
    'weather.greetingLocationHelp': 'help',
    'weather.greetingLocationEmpty': 'empty'
  };
  global.I18N = global.I18N || {};
  locales.forEach(function (code) {
    var row = D[code] || D.en;
    global.I18N[code] = Object.assign({}, global.I18N[code] || {});
    Object.keys(keys).forEach(function (key) { global.I18N[code][key] = row[keys[key]]; });
  });
})(window);
