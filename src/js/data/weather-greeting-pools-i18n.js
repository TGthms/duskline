'use strict';
/* Hand-written saved-place labels and rotating weather-discovery copy. */
(function (global) {
  var COPY = {
    en: {
      labels: ['Saved places', 'Add to My Sky', 'Remove from My Sky'],
      horizon: [
        'explore the weather unfolding around the world.',
        'see how conditions change from city to city.',
        'follow the day’s skies across the globe.',
        'discover forecasts from cities near and far.',
        'from sunshine to showers, see what the day brings.',
        'take a closer look at weather around the world.'
      ]
    },
    es: {
      labels: ['Lugares guardados', 'Añadir a Mi cielo', 'Quitar de Mi cielo'],
      horizon: [
        'Explora el tiempo en distintas partes del mundo.',
        'Descubre cómo cambian las condiciones de una ciudad a otra.',
        'Sigue el cielo a medida que avanza el día por el mundo.',
        'Descubre pronósticos de ciudades cercanas y lejanas.',
        'Del sol a los chubascos, descubre lo que puede traer el día.',
        'Echa un vistazo más de cerca al tiempo en todo el mundo.'
      ]
    },
    fr: {
      labels: ['Lieux enregistrés', 'Ajouter à Mon ciel', 'Retirer de Mon ciel'],
      horizon: [
        'Explorez la météo aux quatre coins du monde.',
        'Voyez comment les conditions changent d’une ville à l’autre.',
        'Suivez les ciels du jour à travers le monde.',
        'Découvrez les prévisions de villes proches ou lointaines.',
        'Du soleil aux averses, découvrez ce que la journée réserve.',
        'Regardez de plus près la météo dans le monde entier.'
      ]
    },
    de: {
      labels: ['Gespeicherte Orte', 'Zu „Mein Himmel“ hinzufügen', 'Aus „Mein Himmel“ entfernen'],
      horizon: [
        'Entdecke das Wetter rund um die Welt.',
        'Sieh, wie sich das Wetter von Stadt zu Stadt verändert.',
        'Verfolge, wie der Taghimmel rund um den Globus aussieht.',
        'Entdecke Vorhersagen für nahe und ferne Städte.',
        'Von Sonne bis zu Schauern: Sieh, was der Tag bringt.',
        'Wirf einen genaueren Blick auf das Wetter weltweit.'
      ]
    },
    it: {
      labels: ['Luoghi salvati', 'Aggiungi al mio cielo', 'Rimuovi dal mio cielo'],
      horizon: [
        'Esplora il meteo in tante parti del mondo.',
        'Scopri come cambia il tempo da una città all’altra.',
        'Segui i cieli del giorno in tutto il mondo.',
        'Scopri le previsioni di città vicine e lontane.',
        'Dal sole agli acquazzoni, scopri cosa porta la giornata.',
        'Dai uno sguardo più da vicino al meteo nel mondo.'
      ]
    },
    'pt-BR': {
      labels: ['Lugares salvos', 'Adicionar ao Meu céu', 'Remover do Meu céu'],
      horizon: [
        'Explore o clima que acontece pelo mundo.',
        'Veja como as condições mudam de uma cidade para outra.',
        'Acompanhe o céu ao longo do dia pelo mundo.',
        'Descubra previsões de cidades próximas e distantes.',
        'Do sol às pancadas de chuva, veja o que o dia reserva.',
        'Confira mais de perto o clima ao redor do mundo.'
      ]
    },
    'pt-PT': {
      labels: ['Locais guardados', 'Adicionar ao Meu céu', 'Remover do Meu céu'],
      horizon: [
        'Explore o tempo que faz pelo mundo.',
        'Veja como as condições mudam de cidade para cidade.',
        'Acompanhe os céus do dia em todo o mundo.',
        'Descubra as previsões de cidades próximas e distantes.',
        'Do sol aos aguaceiros, descubra o que o dia reserva.',
        'Veja mais de perto o estado do tempo pelo mundo.'
      ]
    },
    nl: {
      labels: ['Opgeslagen plaatsen', 'Toevoegen aan Mijn hemel', 'Verwijderen uit Mijn hemel'],
      horizon: [
        'Ontdek het weer dat zich overal ter wereld ontwikkelt.',
        'Zie hoe het weer van stad tot stad verandert.',
        'Volg het weer over de wereld terwijl de dag vordert.',
        'Ontdek verwachtingen voor steden dichtbij en ver weg.',
        'Van zon tot buien: ontdek wat de dag brengt.',
        'Bekijk het weer over de hele wereld van dichterbij.'
      ]
    },
    da: {
      labels: ['Gemte steder', 'Føj til Min himmel', 'Fjern fra Min himmel'],
      horizon: [
        'Udforsk vejret, der udfolder sig rundt om i verden.',
        'Se, hvordan vejret ændrer sig fra by til by.',
        'Følg dagens vejr på tværs af kloden.',
        'Se vejrudsigter for byer tæt på og langt væk.',
        'Fra sol til byger: se, hvad dagen bringer.',
        'Gå på opdagelse i vejret rundt om i verden.'
      ]
    },
    sv: {
      labels: ['Sparade platser', 'Lägg till i Min himmel', 'Ta bort från Min himmel'],
      horizon: [
        'Utforska vädret som utvecklas runt om i världen.',
        'Se hur vädret förändras från stad till stad.',
        'Följ dagens väder över hela världen.',
        'Upptäck prognoser för städer nära och långt borta.',
        'Från solsken till skurar – se vad dagen bjuder på.',
        'Ta en närmare titt på vädret runt om i världen.'
      ]
    },
    nb: {
      labels: ['Lagrede steder', 'Legg til i Min himmel', 'Fjern fra Min himmel'],
      horizon: [
        'Utforsk været som utspiller seg rundt om i verden.',
        'Se hvordan været skifter fra by til by.',
        'Følg dagens vær over hele kloden.',
        'Oppdag værmeldinger for byer nær og fjern.',
        'Fra sol til regnbyger – se hva dagen bringer.',
        'Ta en nærmere titt på været rundt om i verden.'
      ]
    },
    fi: {
      labels: ['Tallennetut paikat', 'Lisää Oma taivas -näkymään', 'Poista Oma taivas -näkymästä'],
      horizon: [
        'Tutustu eri puolilla maailmaa kehittyvään säähän.',
        'Katso, miten sää vaihtelee kaupungista toiseen.',
        'Seuraa päivän säätä eri puolilla maailmaa.',
        'Löydä ennusteita läheltä ja kaukaa.',
        'Auringosta sadekuuroihin – katso, mitä päivä tuo tullessaan.',
        'Tutustu maailman säähän hieman tarkemmin.'
      ]
    },
    pl: {
      labels: ['Zapisane miejsca', 'Dodaj do Mojego nieba', 'Usuń z Mojego nieba'],
      horizon: [
        'Odkrywaj pogodę w różnych częściach świata.',
        'Zobacz, jak warunki zmieniają się w kolejnych miastach.',
        'Śledź pogodę na świecie w miarę upływu dnia.',
        'Sprawdź prognozy dla bliskich i odległych miast.',
        'Od słońca po przelotny deszcz — zobacz, co przyniesie dzień.',
        'Przyjrzyj się bliżej pogodzie na całym świecie.'
      ]
    },
    cs: {
      labels: ['Uložená místa', 'Přidat do Mé oblohy', 'Odebrat z Mé oblohy'],
      horizon: [
        'Prozkoumej počasí, které se mění po celém světě.',
        'Podívej se, jak se počasí mění město od města.',
        'Sleduj počasí napříč světem, jak den postupuje.',
        'Objev předpovědi z blízkých i vzdálených měst.',
        'Od slunce po přeháňky — zjisti, co den přinese.',
        'Podívej se na počasí ve světě zblízka.'
      ]
    },
    hu: {
      labels: ['Mentett helyek', 'Hozzáadás a saját égboltomhoz', 'Eltávolítás a saját égboltomból'],
      horizon: [
        'Fedezd fel, hogyan alakul az időjárás a világban.',
        'Nézd meg, hogyan változik az idő városról városra.',
        'Kövesd a világ időjárását a nap előrehaladtával.',
        'Fedezz fel előrejelzéseket közeli és távoli városokból.',
        'Napsütéstől záporokig — nézd meg, mit tartogat a nap.',
        'Nézz körül közelebbről a világ időjárásában.'
      ]
    },
    ro: {
      labels: ['Locuri salvate', 'Adaugă în Cerul meu', 'Elimină din Cerul meu'],
      horizon: [
        'Descoperă vremea care se schimbă în jurul lumii.',
        'Vezi cum diferă vremea de la un oraș la altul.',
        'Urmărește vremea din lume pe măsură ce ziua avansează.',
        'Descoperă prognoze din orașe apropiate și îndepărtate.',
        'De la soare la averse, vezi ce aduce ziua.',
        'Privește mai atent vremea din întreaga lume.'
      ]
    },
    el: {
      labels: ['Αποθηκευμένα μέρη', 'Προσθήκη στον δικό μου ουρανό', 'Αφαίρεση από τον δικό μου ουρανό'],
      horizon: [
        'Εξερεύνησε τον καιρό όπως εξελίσσεται σε όλο τον κόσμο.',
        'Δες πώς αλλάζουν οι συνθήκες από πόλη σε πόλη.',
        'Παρακολούθησε τον καιρό σε όλο τον κόσμο καθώς προχωρά η μέρα.',
        'Ανακάλυψε προγνώσεις για κοντινές και μακρινές πόλεις.',
        'Από λιακάδα έως μπόρες, δες τι φέρνει η μέρα.',
        'Ρίξε μια πιο προσεκτική ματιά στον καιρό σε όλο τον κόσμο.'
      ]
    },
    tr: {
      labels: ['Kaydedilen yerler', 'Gökyüzüme ekle', 'Gökyüzümden kaldır'],
      horizon: [
        'Dünyanın dört bir yanındaki hava durumunu keşfet.',
        'Havanın şehirden şehre nasıl değiştiğine bak.',
        'Gün ilerlerken dünyadaki gökyüzünü takip et.',
        'Yakın ve uzak şehirlerin tahminlerini keşfet.',
        'Güneşten sağanağa, günün neler getireceğine bak.',
        'Dünyanın dört bir yanındaki hava durumuna yakından bak.'
      ]
    },
    ru: {
      labels: ['Сохранённые места', 'Добавить в «Моё небо»', 'Удалить из «Моего неба»'],
      horizon: [
        'Изучайте погоду в разных уголках мира.',
        'Посмотрите, как меняется погода от города к городу.',
        'Следите за погодой в мире в течение дня.',
        'Откройте прогнозы для близких и далёких городов.',
        'От солнца до ливней — узнайте, что принесёт день.',
        'Посмотрите на погоду по всему миру внимательнее.'
      ]
    },
    uk: {
      labels: ['Збережені місця', 'Додати до «Мого неба»', 'Вилучити з «Мого неба»'],
      horizon: [
        'Досліджуйте погоду в різних куточках світу.',
        'Погляньте, як погода змінюється від міста до міста.',
        'Стежте за погодою у світі протягом дня.',
        'Дізнайтеся прогноз для близьких і далеких міст.',
        'Від сонця до злив — подивіться, що принесе день.',
        'Придивіться до погоди в різних куточках світу.'
      ]
    },
    ar: {
      labels: ['الأماكن المحفوظة', 'أضف إلى سمائي', 'أزل من سمائي'],
      horizon: [
        'استكشف أحوال الطقس حول العالم.',
        'تعرّف على اختلاف الطقس من مدينة إلى أخرى.',
        'تابع أحوال السماء حول العالم مع تقدم اليوم.',
        'اكتشف توقعات الطقس لمدن قريبة وبعيدة.',
        'من الشمس إلى الزخات، اكتشف ما يحمله اليوم.',
        'ألقِ نظرة أقرب على الطقس في أنحاء العالم.'
      ]
    },
    he: {
      labels: ['מקומות שמורים', 'הוספה לשמיים שלי', 'הסרה מהשמיים שלי'],
      horizon: [
        'מגלים את מזג האוויר ברחבי העולם.',
        'רואים איך התנאים משתנים מעיר לעיר.',
        'עוקבים אחרי מזג האוויר בעולם לאורך היום.',
        'מגלים תחזיות מערים קרובות ורחוקות.',
        'משמש ועד ממטרים — רואים מה היום מביא איתו.',
        'מבט מקרוב על מזג האוויר ברחבי העולם.'
      ]
    },
    hi: {
      labels: ['सेव की गई जगहें', 'मेरे आसमान में जोड़ें', 'मेरे आसमान से हटाएँ'],
      horizon: [
        'दुनिया भर में बदलते मौसम को जानें।',
        'देखें कि शहर-दर-शहर मौसम कैसे बदलता है।',
        'दिन बढ़ने के साथ दुनिया भर के आसमान का हाल देखें।',
        'पास और दूर के शहरों का पूर्वानुमान जानें।',
        'धूप से लेकर बौछारों तक, देखें कि दिन क्या लाता है।',
        'दुनिया भर के मौसम पर एक नज़र डालें।'
      ]
    },
    th: {
      labels: ['สถานที่ที่บันทึกไว้', 'เพิ่มไปยังท้องฟ้าของฉัน', 'นำออกจากท้องฟ้าของฉัน'],
      horizon: [
        'สำรวจสภาพอากาศที่กำลังเปลี่ยนแปลงทั่วโลก',
        'ดูว่าสภาพอากาศแตกต่างกันไปในแต่ละเมืองอย่างไร',
        'ติดตามท้องฟ้าทั่วโลกเมื่อวันดำเนินไป',
        'ค้นพบพยากรณ์อากาศจากเมืองใกล้และไกล',
        'ตั้งแต่แดดออกจนถึงฝนซู่ มาดูกันว่าวันนี้จะเป็นอย่างไร',
        'มองสภาพอากาศทั่วโลกให้ใกล้ขึ้น'
      ]
    },
    vi: {
      labels: ['Địa điểm đã lưu', 'Thêm vào Bầu trời của tôi', 'Xóa khỏi Bầu trời của tôi'],
      horizon: [
        'Khám phá thời tiết đang diễn biến trên khắp thế giới.',
        'Xem thời tiết thay đổi ra sao giữa các thành phố.',
        'Theo dõi bầu trời khắp thế giới khi ngày trôi qua.',
        'Khám phá dự báo ở những thành phố gần và xa.',
        'Từ nắng đến mưa rào, xem hôm nay có gì.',
        'Tìm hiểu kỹ hơn về thời tiết trên khắp thế giới.'
      ]
    },
    id: {
      labels: ['Tempat tersimpan', 'Tambahkan ke Langit Saya', 'Hapus dari Langit Saya'],
      horizon: [
        'Jelajahi cuaca yang berubah di seluruh dunia.',
        'Lihat bagaimana cuaca berbeda dari kota ke kota.',
        'Ikuti perkembangan cuaca dunia sepanjang hari.',
        'Temukan prakiraan dari kota dekat maupun jauh.',
        'Dari cerah hingga hujan, lihat apa yang akan terjadi hari ini.',
        'Lihat lebih dekat cuaca di seluruh dunia.'
      ]
    },
    ja: {
      labels: ['保存した場所', '「私の空」に追加', '「私の空」から削除'],
      horizon: [
        '世界各地の天気を見てみましょう。',
        '街ごとに変わる空模様をチェックしましょう。',
        '世界の天気を追いながら、一日の移り変わりを感じましょう。',
        '近くの街から遠くの街まで、予報を見てみましょう。',
        '晴れからにわか雨まで、今日の天気を見てみましょう。',
        '世界各地の天気をもう少し詳しく見てみましょう。'
      ]
    },
    ko: {
      labels: ['저장한 장소', '내 하늘에 추가', '내 하늘에서 삭제'],
      horizon: [
        '세계 곳곳에서 펼쳐지는 날씨를 살펴보세요.',
        '도시마다 날씨가 어떻게 다른지 확인해 보세요.',
        '하루가 흐르는 동안 세계 곳곳의 하늘을 따라가 보세요.',
        '가까운 도시와 먼 도시의 예보를 살펴보세요.',
        '맑은 날부터 소나기까지, 오늘의 날씨를 확인해 보세요.',
        '세계 곳곳의 날씨를 더 자세히 살펴보세요.'
      ]
    },
    zh: {
      labels: ['已保存地点', '添加到我的天空', '从我的天空移除'],
      horizon: [
        '探索世界各地正在变化的天气。',
        '看看不同城市的天气有何变化。',
        '随着一天展开，关注全球各地的天气。',
        '发现远近城市的天气预报。',
        '从晴天到阵雨，看看今天会有什么天气。',
        '更深入地了解世界各地的天气。'
      ]
    },
    'zh-TW': {
      labels: ['已儲存地點', '加入我的天空', '從我的天空移除'],
      horizon: [
        '探索世界各地正在變化的天氣。',
        '看看不同城市的天氣有何變化。',
        '隨著一天展開，關注全球各地的天氣。',
        '發現遠近城市的天氣預報。',
        '從晴天到陣雨，看看今天會有什麼天氣。',
        '更深入地了解世界各地的天氣。'
      ]
    }
  };

  var SPECIAL_CONDITIONS = {
    en: ['freezing precipitation', 'heavy rain', 'heavy snow', 'thunderstorms with hail', 'changeable weather'],
    es: ['precipitación engelante', 'lluvia intensa', 'nieve intensa', 'tormentas con granizo', 'tiempo cambiante'],
    fr: ['précipitations verglaçantes', 'fortes pluies', 'fortes chutes de neige', 'orages de grêle', 'temps changeant'],
    de: ['gefrierender Niederschlag', 'Starkregen', 'starker Schneefall', 'Gewitter mit Hagel', 'wechselhaftes Wetter'],
    it: ['precipitazioni gelate', 'pioggia intensa', 'neve intensa', 'temporali con grandine', 'tempo variabile'],
    'pt-BR': ['precipitação congelante', 'chuva intensa', 'neve intensa', 'temporais com granizo', 'tempo instável'],
    'pt-PT': ['precipitação gelada', 'chuva intensa', 'neve intensa', 'trovoadas com granizo', 'tempo variável'],
    nl: ['ijzel', 'zware regen', 'zware sneeuw', 'onweer met hagel', 'wisselvallig weer'],
    da: ['underafkølet nedbør', 'kraftig regn', 'kraftigt snefald', 'tordenvejr med hagl', 'omskifteligt vejr'],
    sv: ['underkyld nederbörd', 'kraftigt regn', 'kraftigt snöfall', 'åska med hagel', 'växlande väder'],
    nb: ['underkjølt nedbør', 'kraftig regn', 'kraftig snøfall', 'tordenvær med hagl', 'skiftende vær'],
    fi: ['jäätävä sade', 'rankkasade', 'runsas lumisade', 'rakeita sisältävä ukkonen', 'vaihteleva sää'],
    pl: ['opady marznące', 'ulewny deszcz', 'intensywne opady śniegu', 'burze z gradem', 'zmienna pogoda'],
    cs: ['mrznoucí srážky', 'silný déšť', 'vydatné sněžení', 'bouřky s kroupami', 'proměnlivé počasí'],
    hu: ['ónos csapadék', 'heves eső', 'erős havazás', 'jégesővel kísért zivatar', 'változékony idő'],
    ro: ['precipitații care îngheață', 'ploaie abundentă', 'ninsoare abundentă', 'furtuni cu grindină', 'vreme schimbătoare'],
    el: ['παγωμένα κατακρημνίσματα', 'ισχυρή βροχή', 'έντονη χιονόπτωση', 'καταιγίδες με χαλάζι', 'μεταβαλλόμενος καιρός'],
    tr: ['donan yağış', 'şiddetli yağmur', 'yoğun kar yağışı', 'dolu yağışlı gök gürültülü fırtına', 'değişken hava'],
    ru: ['ледяные осадки', 'сильный дождь', 'сильный снегопад', 'гроза с градом', 'переменчивая погода'],
    uk: ['ожеледні опади', 'сильний дощ', 'сильний снігопад', 'гроза з градом', 'мінлива погода'],
    ar: ['هطول متجمّد', 'أمطار غزيرة', 'تساقط كثيف للثلوج', 'عواصف رعدية مع بَرَد', 'طقس متقلّب'],
    he: ['משקעים קופאים', 'גשם כבד', 'שלג כבד', 'סופות רעמים עם ברד', 'מזג אוויר משתנה'],
    hi: ['जमने वाली वर्षा', 'भारी बारिश', 'भारी बर्फ़बारी', 'ओलों के साथ गरज-चमक', 'बदलता हुआ मौसम'],
    th: ['หยาดน้ำฟ้าที่กลายเป็นน้ำแข็ง', 'ฝนตกหนัก', 'หิมะตกหนัก', 'พายุฝนฟ้าคะนองพร้อมลูกเห็บ', 'สภาพอากาศแปรปรวน'],
    vi: ['mưa đóng băng', 'mưa lớn', 'tuyết rơi dày', 'dông kèm mưa đá', 'thời tiết thay đổi'],
    id: ['hujan yang membeku', 'hujan lebat', 'salju lebat', 'badai petir disertai hujan es', 'cuaca berubah-ubah'],
    ja: ['凍るような降水', '激しい雨', '大雪', 'ひょうを伴う雷雨', '変わりやすい天気'],
    ko: ['어는 비', '강한 비', '많은 눈', '우박을 동반한 뇌우', '변덕스러운 날씨'],
    zh: ['冻雨', '大雨', '大雪', '伴有冰雹的雷暴', '多变天气'],
    'zh-TW': ['凍雨', '大雨', '大雪', '伴有冰雹的雷暴', '多變天氣']
  };
  var UNAVAILABLE = {
    en: 'The forecast for {place} is temporarily unavailable.',
    es: 'La previsión de {place} no está disponible temporalmente.',
    fr: 'Les prévisions pour {place} sont temporairement indisponibles.',
    de: 'Die Wettervorhersage für {place} ist vorübergehend nicht verfügbar.',
    it: 'Le previsioni per {place} non sono al momento disponibili.',
    'pt-BR': 'A previsão para {place} está temporariamente indisponível.',
    'pt-PT': 'A previsão para {place} está temporariamente indisponível.',
    nl: 'De weersverwachting voor {place} is tijdelijk niet beschikbaar.',
    da: 'Vejrudsigten for {place} er midlertidigt utilgængelig.',
    sv: 'Väderprognosen för {place} är tillfälligt otillgänglig.',
    nb: 'Værmeldingen for {place} er midlertidig utilgjengelig.',
    fi: 'Paikan {place} sääennuste ei ole tilapäisesti saatavilla.',
    pl: 'Prognoza dla {place} jest tymczasowo niedostępna.',
    cs: 'Předpověď pro {place} je dočasně nedostupná.',
    hu: 'A(z) {place} előrejelzése átmenetileg nem érhető el.',
    ro: 'Prognoza pentru {place} nu este disponibilă momentan.',
    el: 'Η πρόγνωση για το {place} δεν είναι διαθέσιμη αυτήν τη στιγμή.',
    tr: '{place} için hava tahmini şu anda kullanılamıyor.',
    ru: 'Прогноз для {place} временно недоступен.',
    uk: 'Прогноз для {place} тимчасово недоступний.',
    ar: 'توقعات الطقس في {place} غير متاحة مؤقتًا.',
    he: 'תחזית מזג האוויר ל{place} אינה זמינה כרגע.',
    hi: 'अभी {place} का पूर्वानुमान उपलब्ध नहीं है।',
    th: 'พยากรณ์อากาศของ {place} ไม่พร้อมใช้งานชั่วคราว',
    vi: 'Dự báo cho {place} hiện tạm thời không khả dụng.',
    id: 'Prakiraan untuk {place} sedang tidak tersedia.',
    ja: '現在、{place}の予報を利用できません。',
    ko: '{place}의 예보를 일시적으로 확인할 수 없습니다.',
    zh: '暂时无法获取{place}的天气预报。',
    'zh-TW': '目前無法取得{place}的天氣預報。'
  };
  var SPECIAL_FORECAST = {
    en: '{greeting} — {place}: {temp}, {condition}.',
    es: '{greeting} — {place}: {temp}, {condition}.',
    fr: '{greeting} — {place} : {temp}, {condition}.',
    de: '{greeting} — {place}: {temp}, {condition}.',
    it: '{greeting} — {place}: {temp}, {condition}.',
    'pt-BR': '{greeting} — {place}: {temp}, {condition}.',
    'pt-PT': '{greeting} — {place}: {temp}, {condition}.',
    nl: '{greeting} — {place}: {temp}, {condition}.',
    da: '{greeting} — {place}: {temp}, {condition}.',
    sv: '{greeting} — {place}: {temp}, {condition}.',
    nb: '{greeting} — {place}: {temp}, {condition}.',
    fi: '{greeting} — {place}: {temp}, {condition}.',
    pl: '{greeting} — {place}: {temp}, {condition}.',
    cs: '{greeting} — {place}: {temp}, {condition}.',
    hu: '{greeting} — {place}: {temp}, {condition}.',
    ro: '{greeting} — {place}: {temp}, {condition}.',
    el: '{greeting} — {place}: {temp}, {condition}.',
    tr: '{greeting} — {place}: {temp}, {condition}.',
    ru: '{greeting} — {place}: {temp}, {condition}.',
    uk: '{greeting} — {place}: {temp}, {condition}.',
    ar: '{greeting} — {place}: {temp}، {condition}.',
    he: '{greeting} — {place}: {temp}, {condition}.',
    hi: '{greeting} — {place}: {temp}, {condition}।',
    th: '{greeting} — {place}: {temp} {condition}',
    vi: '{greeting} — {place}: {temp}, {condition}.',
    id: '{greeting} — {place}: {temp}, {condition}.',
    ja: '{greeting} — {place}：{temp}、{condition}。',
    ko: '{greeting} — {place}: {temp}, {condition}.',
    zh: '{greeting}，{place}：{temp}，{condition}。',
    'zh-TW': '{greeting}，{place}：{temp}，{condition}。'
  };

  // Additional discovery copy brings Horizon to a 15-line pool in every period.
  // Each locale is written as weather-app copy rather than translated word for word.
  var HORIZON_MORE = {
    en: [
      'a world of weather is waiting to be explored.',
      'see where clouds are gathering and skies are clearing.',
      'check in on forecasts from near and far.',
      'each city has its own forecast. See what today brings.',
      'follow the sunshine, showers, and changing skies.',
      'explore current conditions in cities around the world.',
      'look beyond the horizon to see what the forecast holds.',
      'watch the forecast shift as the day moves along.',
      'see what the weather has in store across the map.'
    ],
    es: [
      'Explora el tiempo que hace en distintos lugares del mundo.',
      'Mira dónde se forman las nubes y se despejan los cielos.',
      'Consulta previsiones de lugares cercanos y lejanos.',
      'Cada ciudad tiene su propio pronóstico. Descubre qué trae hoy.',
      'Sigue el sol, los chubascos y los cielos cambiantes.',
      'Explora las condiciones actuales de ciudades de todo el mundo.',
      'Mira más allá del horizonte y descubre qué anuncia el pronóstico.',
      'Observa cómo cambia la previsión a lo largo del día.',
      'Descubre qué tiempo se espera en distintos puntos del mapa.'
    ],
    fr: [
      'Le monde regorge de prévisions météo à découvrir.',
      'Voyez où les nuages se forment et où le ciel s’éclaircit.',
      'Consultez les prévisions d’ici et d’ailleurs.',
      'Chaque ville a ses propres prévisions. Découvrez celles du jour.',
      'Suivez le soleil, les averses et les éclaircies.',
      'Explorez les conditions météo de villes du monde entier.',
      'Regardez au-delà de l’horizon pour découvrir les prévisions.',
      'Voyez comment le temps évolue au fil de la journée.',
      'Découvrez ce que la météo réserve aux villes de la carte.'
    ],
    de: [
      'Überall auf der Welt gibt es Wetter zu entdecken.',
      'Sieh, wo Wolken aufziehen und der Himmel aufklart.',
      'Entdecke Vorhersagen aus nahen und fernen Orten.',
      'Jede Stadt hat ihre eigene Vorhersage. Sieh, was der Tag bringt.',
      'Verfolge Sonne, Schauer und wechselnde Wolken.',
      'Entdecke das aktuelle Wetter in Städten auf der ganzen Welt.',
      'Schau über den Horizont und entdecke, was die Vorhersage bringt.',
      'Sieh, wie sich das Wetter im Laufe des Tages verändert.',
      'Entdecke, welches Wetter die Orte auf der Karte erwartet.'
    ],
    it: [
      'C’è un mondo di meteo tutto da scoprire.',
      'Scopri dove si addensano le nuvole e torna il sereno.',
      'Consulta le previsioni di luoghi vicini e lontani.',
      'Ogni città ha le sue previsioni. Scopri che tempo farà oggi.',
      'Segui il sole, gli acquazzoni e i cieli che cambiano.',
      'Esplora le condizioni attuali nelle città di tutto il mondo.',
      'Guarda oltre l’orizzonte e scopri cosa prevede il meteo.',
      'Osserva come cambia il tempo nel corso della giornata.',
      'Scopri che tempo è previsto nelle città sulla mappa.'
    ],
    'pt-BR': [
      'Explore as condições do tempo em lugares do mundo todo.',
      'Veja onde as nuvens se formam e o céu começa a abrir.',
      'Confira a previsão de lugares próximos e distantes.',
      'Cada cidade tem sua própria previsão. Veja o que o dia reserva.',
      'Acompanhe o sol, as pancadas de chuva e a mudança no céu.',
      'Explore as condições atuais em cidades do mundo todo.',
      'Olhe além do horizonte e veja o que a previsão indica.',
      'Acompanhe como o tempo muda ao longo do dia.',
      'Descubra o que a previsão reserva para cada lugar no mapa.'
    ],
    'pt-PT': [
      'Descubra o tempo que faz em locais de todo o mundo.',
      'Veja onde se formam nuvens e o céu começa a limpar.',
      'Consulte previsões de locais próximos e distantes.',
      'Cada cidade tem a sua previsão. Descubra o que traz o dia.',
      'Acompanhe o sol, os aguaceiros e os céus em mudança.',
      'Explore as condições atuais em cidades de todo o mundo.',
      'Olhe para lá do horizonte e descubra o que prevê a meteorologia.',
      'Veja como o tempo muda ao longo do dia.',
      'Descubra o que o tempo reserva para os locais no mapa.'
    ],
    nl: [
      'Er valt overal ter wereld weer te ontdekken.',
      'Bekijk waar wolken ontstaan en de lucht opklaart.',
      'Bekijk verwachtingen van dichtbij en ver weg.',
      'Elke stad heeft een eigen verwachting. Ontdek wat vandaag brengt.',
      'Volg de zon, buien en veranderende luchten.',
      'Ontdek het actuele weer in steden over de hele wereld.',
      'Kijk voorbij de horizon en ontdek wat de verwachting laat zien.',
      'Zie hoe het weer in de loop van de dag verandert.',
      'Ontdek wat het weer op verschillende plekken op de kaart brengt.'
    ],
    da: [
      'Der er vejr at opdage overalt i verden.',
      'Se, hvor skyerne samler sig, og hvor himlen klarer op.',
      'Se vejrudsigter fra nær og fjern.',
      'Hver by har sin egen vejrudsigt. Se, hvad dagen bringer.',
      'Følg solen, bygerne og himlen, der skifter.',
      'Udforsk vejret lige nu i byer verden over.',
      'Se ud over horisonten, og find ud af, hvad vejrudsigten lover.',
      'Følg med i, hvordan vejret ændrer sig i løbet af dagen.',
      'Se, hvilket vejr der venter forskellige steder på kortet.'
    ],
    sv: [
      'Väder att upptäcka finns över hela världen.',
      'Se var molnen samlas och var himlen klarnar.',
      'Se prognoser från platser nära och långt bort.',
      'Varje stad har sin egen prognos. Se vad dagen bjuder på.',
      'Följ solen, skurarna och himlen som förändras.',
      'Utforska aktuellt väder i städer världen över.',
      'Se bortom horisonten och upptäck vad prognosen visar.',
      'Följ hur vädret förändras under dagen.',
      'Se vilket väder som väntar på olika platser på kartan.'
    ],
    nb: [
      'Det finnes vær å utforske over hele verden.',
      'Se hvor skyene samler seg, og hvor himmelen klarner.',
      'Sjekk værmeldinger fra nær og fjern.',
      'Hver by har sin egen værmelding. Se hva dagen bringer.',
      'Følg solen, bygene og himmelen som skifter.',
      'Utforsk været akkurat nå i byer over hele verden.',
      'Se forbi horisonten og finn ut hva værmeldingen viser.',
      'Følg med på hvordan været endrer seg utover dagen.',
      'Se hva slags vær som venter ulike steder på kartet.'
    ],
    fi: [
      'Säätä riittää tutkittavaksi kaikkialla maailmassa.',
      'Katso, missä pilvet kerääntyvät ja taivas selkenee.',
      'Tutustu lähellä ja kaukana olevien paikkojen ennusteisiin.',
      'Jokaisella kaupungilla on oma ennusteensa. Katso, mitä päivä tuo.',
      'Seuraa aurinkoa, sadekuuroja ja muuttuvaa taivasta.',
      'Tutki tämänhetkistä säätä kaupungeissa ympäri maailmaa.',
      'Katso horisontin taakse ja selvitä, mitä ennuste lupaa.',
      'Seuraa, miten sää muuttuu päivän mittaan.',
      'Katso, millaista säätä kartan eri paikkoihin ennustetaan.'
    ],
    pl: [
      'Pogoda na całym świecie czeka na odkrycie.',
      'Zobacz, gdzie zbierają się chmury, a niebo się przejaśnia.',
      'Sprawdź prognozy z bliska i z daleka.',
      'Każde miasto ma własną prognozę. Zobacz, co przyniesie dzień.',
      'Śledź słońce, przelotne opady i zmieniające się niebo.',
      'Sprawdź aktualne warunki w miastach na całym świecie.',
      'Spójrz za horyzont i zobacz, co zapowiada prognoza.',
      'Zobacz, jak zmienia się pogoda w ciągu dnia.',
      'Sprawdź, jaka pogoda czeka różne miejsca na mapie.'
    ],
    cs: [
      'Počasí po celém světě čeká na prozkoumání.',
      'Podívejte se, kde se tvoří mraky a kde se obloha vyjasňuje.',
      'Prohlédněte si předpovědi z blízkých i vzdálených míst.',
      'Každé město má vlastní předpověď. Zjistěte, co přinese dnešek.',
      'Sledujte slunce, přeháňky i proměnlivou oblohu.',
      'Prozkoumejte aktuální počasí ve městech po celém světě.',
      'Podívejte se za obzor a zjistěte, co předpovídá počasí.',
      'Sledujte, jak se počasí během dne mění.',
      'Zjistěte, jaké počasí čeká různá místa na mapě.'
    ],
    hu: [
      'A világ időjárása felfedezésre vár.',
      'Nézd meg, hol gyülekeznek a felhők, és hol tisztul az ég.',
      'Nézz körül a közeli és távoli helyek előrejelzései között.',
      'Minden városnak saját előrejelzése van. Nézd meg, mit hoz a nap.',
      'Kövesd a napsütést, a záporokat és a változó égboltot.',
      'Fedezd fel a világ városainak aktuális időjárását.',
      'Nézz a látóhatáron túlra, és tudd meg, mit jelez az előrejelzés.',
      'Kövesd, hogyan változik az időjárás a nap folyamán.',
      'Nézd meg, milyen idő vár a térkép különböző pontjain.'
    ],
    ro: [
      'Vremea din întreaga lume merită descoperită.',
      'Vezi unde se adună norii și unde se înseninează cerul.',
      'Consultă prognoze din locuri apropiate și îndepărtate.',
      'Fiecare oraș are propria prognoză. Vezi ce aduce ziua.',
      'Urmărește soarele, aversele și schimbările de pe cer.',
      'Explorează vremea de acum în orașe din întreaga lume.',
      'Privește dincolo de orizont și vezi ce anunță prognoza.',
      'Urmărește cum se schimbă vremea pe parcursul zilei.',
      'Află ce vreme este așteptată în diferite locuri de pe hartă.'
    ],
    el: [
      'Ο καιρός σε όλο τον κόσμο περιμένει να τον ανακαλύψεις.',
      'Δες πού πυκνώνουν τα σύννεφα και πού καθαρίζει ο ουρανός.',
      'Δες προγνώσεις από κοντινά και μακρινά μέρη.',
      'Κάθε πόλη έχει τη δική της πρόγνωση. Δες τι φέρνει η μέρα.',
      'Παρακολούθησε τον ήλιο, τις μπόρες και τον ουρανό που αλλάζει.',
      'Εξερεύνησε τις τρέχουσες συνθήκες σε πόλεις όλου του κόσμου.',
      'Κοίτα πέρα από τον ορίζοντα και δες τι προβλέπει ο καιρός.',
      'Δες πώς αλλάζει ο καιρός στη διάρκεια της ημέρας.',
      'Μάθε τι καιρό περιμένουν διάφορα σημεία του χάρτη.'
    ],
    tr: [
      'Haritanın her köşesinde hava koşullarını keşfet.',
      'Bulutların nerede toplandığını, gökyüzünün nerede açıldığını gör.',
      'Yakın ve uzak yerlerin tahminlerine göz at.',
      'Her şehrin tahmini farklı. Bugünün neler getireceğine bak.',
      'Güneşi, sağanakları ve değişen gökyüzünü takip et.',
      'Dünyanın farklı şehirlerindeki güncel koşulları keşfet.',
      'Ufkun ötesine bak ve tahminin neler söylediğini gör.',
      'Gün boyunca havanın nasıl değiştiğini izle.',
      'Haritadaki farklı yerleri nasıl bir havanın beklediğine bak.'
    ],
    ru: [
      'Погода в разных уголках мира ждёт вас.',
      'Посмотрите, где сгущаются облака и где проясняется небо.',
      'Изучите прогнозы для ближних и дальних мест.',
      'У каждого города свой прогноз. Узнайте, что принесёт день.',
      'Следите за солнцем, ливнями и переменами на небе.',
      'Узнайте о погоде сейчас в городах по всему миру.',
      'Загляните за горизонт и узнайте, что обещает прогноз.',
      'Посмотрите, как погода меняется в течение дня.',
      'Узнайте, какая погода ожидается в разных точках карты.'
    ],
    uk: [
      'На вас чекає погода з усього світу.',
      'Подивіться, де збираються хмари, а де небо прояснюється.',
      'Перегляньте прогнози для близьких і далеких місць.',
      'У кожного міста свій прогноз. Дізнайтеся, що принесе день.',
      'Стежте за сонцем, зливами та мінливим небом.',
      'Дізнайтеся про поточну погоду в містах усього світу.',
      'Зазирніть за обрій і дізнайтеся, що обіцяє прогноз.',
      'Подивіться, як змінюється погода протягом дня.',
      'Дізнайтеся, яка погода очікується в різних місцях на мапі.'
    ],
    ar: [
      'اكتشف أحوال الطقس في أنحاء العالم.',
      'تابع أماكن تجمع السحب وانقشاعها.',
      'اطّلع على توقعات الطقس للأماكن القريبة والبعيدة.',
      'لكل مدينة توقعاتها الخاصة. اكتشف ما يحمله اليوم.',
      'تابع الشمس والزخات وتغيّر السماء.',
      'استكشف أحوال الطقس الحالية في مدن حول العالم.',
      'انظر إلى ما وراء الأفق واكتشف ما تتوقعه النشرة.',
      'تابع تغيّر الطقس على مدار اليوم.',
      'اكتشف الطقس المتوقع في أماكن مختلفة على الخريطة.'
    ],
    he: [
      'מזג האוויר ברחבי העולם מחכה שתגלו אותו.',
      'ראו היכן עננים מתקבצים והיכן השמיים מתבהרים.',
      'בדקו תחזיות ממקומות קרובים ורחוקים.',
      'לכל עיר יש תחזית משלה. גלו מה צפוי היום.',
      'עקבו אחר השמש, הממטרים והשמיים המשתנים.',
      'גלו את תנאי מזג האוויר בערים ברחבי העולם.',
      'הביטו מעבר לאופק וגלו מה צופה התחזית.',
      'ראו כיצד מזג האוויר משתנה לאורך היום.',
      'גלו איזה מזג אוויר צפוי במקומות שונים במפה.'
    ],
    hi: [
      'दुनिया भर के मौसम का हाल जानने के लिए यहाँ देखें।',
      'देखें कहाँ बादल घिर रहे हैं और कहाँ आसमान साफ़ हो रहा है।',
      'पास और दूर के स्थानों का पूर्वानुमान देखें।',
      'हर शहर का अपना पूर्वानुमान है। जानें आज का मौसम कैसा रहेगा।',
      'धूप, बारिश और बदलते आसमान पर नज़र रखें।',
      'दुनिया भर के शहरों का मौजूदा मौसम देखें।',
      'क्षितिज के पार देखें और जानें पूर्वानुमान क्या बता रहा है।',
      'दिन भर मौसम में होने वाले बदलाव देखें।',
      'मानचित्र पर अलग-अलग जगहों का अनुमानित मौसम जानें।'
    ],
    th: [
      'ชวนออกไปสำรวจสภาพอากาศทั่วโลก',
      'ดูว่าเมฆกำลังก่อตัวที่ไหน และท้องฟ้ากำลังแจ่มใสที่ใด',
      'ตรวจดูพยากรณ์อากาศจากทั้งใกล้และไกล',
      'แต่ละเมืองมีพยากรณ์ของตัวเอง มาดูกันว่าวันนี้จะเป็นอย่างไร',
      'ติดตามแสงแดด ฝนซู่ และท้องฟ้าที่เปลี่ยนแปลง',
      'สำรวจสภาพอากาศปัจจุบันในเมืองต่าง ๆ ทั่วโลก',
      'มองเลยเส้นขอบฟ้าไปดูว่าพยากรณ์อากาศเป็นอย่างไร',
      'ติดตามว่าสภาพอากาศเปลี่ยนไปอย่างไรตลอดทั้งวัน',
      'ดูว่าแต่ละจุดบนแผนที่คาดว่าจะมีสภาพอากาศแบบใด'
    ],
    vi: [
      'Thời tiết khắp thế giới đang chờ bạn khám phá.',
      'Xem nơi nào mây đang kéo đến và bầu trời đang quang đãng.',
      'Tham khảo dự báo ở những nơi gần xa.',
      'Mỗi thành phố có dự báo riêng. Khám phá thời tiết hôm nay.',
      'Theo dõi nắng, mưa rào và bầu trời đổi thay.',
      'Khám phá thời tiết hiện tại tại các thành phố trên khắp thế giới.',
      'Nhìn ra xa đường chân trời để xem dự báo thời tiết.',
      'Theo dõi thời tiết thay đổi trong ngày.',
      'Xem thời tiết dự kiến ở nhiều địa điểm trên bản đồ.'
    ],
    id: [
      'Jelajahi cuaca di berbagai penjuru dunia.',
      'Lihat di mana awan berkumpul dan langit mulai cerah.',
      'Cek prakiraan dari tempat yang dekat maupun jauh.',
      'Setiap kota punya prakiraannya sendiri. Lihat cuaca hari ini.',
      'Ikuti sinar matahari, hujan, dan langit yang berubah.',
      'Jelajahi kondisi cuaca terkini di kota-kota seluruh dunia.',
      'Lihat melampaui cakrawala dan temukan isi prakiraan cuaca.',
      'Amati perubahan cuaca sepanjang hari.',
      'Lihat cuaca yang diperkirakan di berbagai titik pada peta.'
    ],
    ja: [
      '離れた街の空模様も確認してみましょう。',
      '雲が広がる場所や、空が晴れていく場所をチェック。',
      '近くから遠くまで、さまざまな場所の予報を見てみましょう。',
      '街ごとに異なる予報から、今日の天気をチェック。',
      '日差しやにわか雨、移り変わる空を追ってみましょう。',
      '世界各地の街の現在の天気を見てみましょう。',
      '地平線の向こうの天気予報もチェックしてみましょう。',
      '一日の中で変わる天気を追ってみましょう。',
      '地図上のさまざまな場所で予想される天気を見てみましょう。'
    ],
    ko: [
      '전 세계의 날씨를 둘러보세요.',
      '구름이 모이는 곳과 하늘이 개는 곳을 확인해 보세요.',
      '가까운 곳부터 먼 곳까지 예보를 살펴보세요.',
      '도시마다 예보가 다릅니다. 오늘 날씨를 확인해 보세요.',
      '햇살과 소나기, 변하는 하늘을 따라가 보세요.',
      '세계 여러 도시의 현재 날씨를 살펴보세요.',
      '지평선 너머의 예보에는 무엇이 있는지 확인해 보세요.',
      '하루 동안 날씨가 어떻게 바뀌는지 살펴보세요.',
      '지도 곳곳의 예상 날씨를 확인해 보세요.'
    ],
    zh: [
      '世界各地的天气，等你来探索。',
      '看看哪些地方云层聚集，哪些地方天空放晴。',
      '查看远近各地的天气预报。',
      '每座城市都有自己的天气预报，看看今天的天气如何。',
      '关注阳光、阵雨和不断变化的天空。',
      '探索世界各地城市的实时天气。',
      '看看地平线另一端的天气预报。',
      '了解天气在一天中如何变化。',
      '查看地图上不同地点的天气预报。'
    ],
    'zh-TW': [
      '世界各地的天氣，等你來探索。',
      '看看哪些地方雲層聚集，哪些地方天空放晴。',
      '查看遠近各地的天氣預報。',
      '每座城市都有自己的天氣預報，看看今天的天氣如何。',
      '關注陽光、陣雨和不斷變化的天空。',
      '探索世界各地城市的即時天氣。',
      '看看地平線另一端的天氣預報。',
      '了解天氣在一天中如何變化。',
      '查看地圖上不同地點的天氣預報。'
    ]
  };
  var HORIZON_SEPARATOR = {
    en: ' — ', ja: '。', zh: '。', 'zh-TW': '。', hi: '। ', th: ' '
  };
  var INSIGHT_SEPARATOR = { ja: '', zh: '', 'zh-TW': '' };
  var TOMORROW_OUTLOOK = {
    en: 'Tomorrow: {condition}, with a high of {high} and a low of {low}.',
    es: 'Mañana: {condition}, con una máxima de {high} y una mínima de {low}.',
    fr: 'Demain : {condition}, avec un maximum de {high} et un minimum de {low}.',
    de: 'Morgen: {condition}, mit einem Höchstwert von {high} und einem Tiefstwert von {low}.',
    it: 'Domani: {condition}, con una massima di {high} e una minima di {low}.',
    'pt-BR': 'Amanhã: {condition}, com máxima de {high} e mínima de {low}.',
    'pt-PT': 'Amanhã: {condition}, com máxima de {high} e mínima de {low}.',
    nl: 'Morgen: {condition}, met een maximum van {high} en een minimum van {low}.',
    da: 'I morgen: {condition}, højeste temperatur {high}, laveste {low}.',
    sv: 'I morgon: {condition}, högsta temperatur {high}, lägsta {low}.',
    nb: 'I morgen: {condition}, høyeste temperatur {high}, laveste {low}.',
    fi: 'Huomenna: {condition}, ylin lämpötila {high}, alin {low}.',
    pl: 'Jutro: {condition}; temperatura maksymalna {high}, minimalna {low}.',
    cs: 'Zítra: {condition}; nejvyšší teplota {high}, nejnižší {low}.',
    hu: 'Holnap: {condition}; legmagasabb hőmérséklet {high}, legalacsonyabb {low}.',
    ro: 'Mâine: {condition}, cu maxima de {high} și minima de {low}.',
    el: 'Αύριο: {condition}, με μέγιστη θερμοκρασία {high} και ελάχιστη {low}.',
    tr: 'Yarın: {condition}; en yüksek sıcaklık {high}, en düşük {low}.',
    ru: 'Завтра: {condition}, максимум {high}, минимум {low}.',
    uk: 'Завтра: {condition}, максимум {high}, мінімум {low}.',
    ar: 'غدًا: {condition}، العظمى {high} والصغرى {low}.',
    he: 'מחר: {condition}; הטמפרטורה המרבית תהיה {high}, והמינימלית {low}.',
    hi: 'कल: {condition}; अधिकतम तापमान {high}, न्यूनतम {low}।',
    th: 'พรุ่งนี้: {condition} อุณหภูมิสูงสุด {high} ต่ำสุด {low}',
    vi: 'Ngày mai: {condition}, nhiệt độ cao nhất {high}, thấp nhất {low}.',
    id: 'Besok: {condition}, suhu tertinggi {high}, terendah {low}.',
    ja: '明日は{condition}。最高気温は{high}、最低気温は{low}の予報です。',
    ko: '내일은 {condition}. 최고 기온은 {high}, 최저 기온은 {low}로 예상됩니다.',
    zh: '明天{condition}，最高{high}，最低{low}。',
    'zh-TW': '明天{condition}，最高{high}，最低{low}。'
  };
  var CONTEXT_KEYS = [
    'weather.context.humidity.low', 'weather.context.humidity.high',
    'weather.context.wind.strong', 'weather.context.sun.daylight',
    'weather.context.conditions.range'
  ];
  var CONTEXT_COPY = {
    en: ['At {value}% humidity, the air may feel dry.', 'Humidity is {value}%, which can make the air feel muggy.', 'Winds at {value} may feel blustery in exposed areas.', 'Today has about {hours} hours and {minutes} minutes of daylight.', 'Today’s temperatures range from {low} to {high}.'],
    es: ['Con una humedad del {value} %, el aire puede sentirse seco.', 'Una humedad del {value} % puede hacer que el ambiente se sienta bochornoso.', 'El viento de {value} puede sentirse más intenso en zonas expuestas.', 'Hoy hay unas {hours} horas y {minutes} minutos de luz diurna.', 'Hoy las temperaturas oscilan entre {low} y {high}.'],
    fr: ['Avec une humidité de {value} %, l’air peut sembler sec.', 'À {value} %, l’humidité peut rendre l’air lourd.', 'Un vent de {value} peut se faire davantage sentir dans les zones dégagées.', 'La durée du jour est d’environ {hours} h {minutes} min aujourd’hui.', 'Aujourd’hui, les températures vont de {low} à {high}.'],
    de: ['Bei {value} % Luftfeuchtigkeit kann sich die Luft trocken anfühlen.', 'Eine Luftfeuchtigkeit von {value} % kann die Luft schwül wirken lassen.', 'Wind mit {value} kann an offenen Orten kräftig wirken.', 'Heute gibt es etwa {hours} Stunden und {minutes} Minuten Tageslicht.', 'Die Temperaturen liegen heute zwischen {low} und {high}.'],
    it: ['Con un’umidità del {value}%, l’aria può sembrare secca.', 'Un’umidità del {value}% può far percepire l’aria come afosa.', 'Un vento di {value} può farsi sentire di più negli spazi aperti.', 'Oggi ci sono circa {hours} ore e {minutes} minuti di luce.', 'Oggi le temperature variano da {low} a {high}.'],
    'pt-BR': ['Com umidade de {value}%, o ar pode parecer seco.', 'A umidade de {value}% pode deixar o ar abafado.', 'O vento de {value} pode parecer mais forte em áreas abertas.', 'Hoje há cerca de {hours} horas e {minutes} minutos de luz do dia.', 'Hoje, as temperaturas variam de {low} a {high}.'],
    'pt-PT': ['Com uma humidade de {value}%, o ar pode parecer seco.', 'Uma humidade de {value}% pode deixar o ar abafado.', 'O vento de {value} pode sentir-se mais forte em zonas expostas.', 'Hoje há cerca de {hours} horas e {minutes} minutos de luz do dia.', 'Hoje, as temperaturas variam entre {low} e {high}.'],
    nl: ['Bij een luchtvochtigheid van {value}% kan de lucht droog aanvoelen.', 'Een luchtvochtigheid van {value}% kan de lucht benauwd laten aanvoelen.', 'Wind van {value} kan op open plekken krachtig aanvoelen.', 'Vandaag is er ongeveer {hours} uur en {minutes} minuten daglicht.', 'Vandaag liggen de temperaturen tussen {low} en {high}.'],
    da: ['Ved {value}% luftfugtighed kan luften føles tør.', 'En luftfugtighed på {value}% kan få luften til at føles klam.', 'Vind på {value} kan føles kraftig på åbne steder.', 'I dag er der cirka {hours} timer og {minutes} minutters dagslys.', 'I dag ligger temperaturen mellem {low} og {high}.'],
    sv: ['Vid {value}% luftfuktighet kan luften kännas torr.', 'En luftfuktighet på {value}% kan få luften att kännas fuktig och tung.', 'Vind på {value} kan kännas kraftig på öppna platser.', 'I dag är det ungefär {hours} timmar och {minutes} minuter dagsljus.', 'Dagens temperaturer ligger mellan {low} och {high}.'],
    nb: ['Ved {value}% luftfuktighet kan luften føles tørr.', 'En luftfuktighet på {value}% kan gjøre luften klam.', 'Vind på {value} kan føles kraftig på åpne steder.', 'I dag er det omtrent {hours} timer og {minutes} minutter med dagslys.', 'I dag ligger temperaturen mellom {low} og {high}.'],
    fi: ['Kun ilmankosteus on {value} %, ilma voi tuntua kuivalta.', '{value} %:n ilmankosteus voi saada ilman tuntumaan hiostavalta.', 'Tuuli nopeudella {value} voi tuntua voimakkaalta avoimilla paikoilla.', 'Päivänvaloa on tänään noin {hours} tuntia ja {minutes} minuuttia.', 'Tänään lämpötila vaihtelee välillä {low}–{high}.'],
    pl: ['Przy wilgotności {value}% powietrze może wydawać się suche.', 'Wilgotność {value}% może sprawiać, że powietrze jest duszne.', 'Wiatr o prędkości {value} może być odczuwalny na otwartej przestrzeni.', 'Dziś dzień potrwa około {hours} godz. i {minutes} min.', 'Temperatura wyniesie dziś od {low} do {high}.'],
    cs: ['Při vlhkosti {value} % může vzduch působit suše.', 'Vlhkost {value} % může způsobit, že vzduch působí dusně.', 'Vítr o rychlosti {value} může být na otevřených místech výraznější.', 'Dnes bude přibližně {hours} hodin a {minutes} minut denního světla.', 'Dnešní teploty se budou pohybovat mezi {low} a {high}.'],
    hu: ['{value}% páratartalom mellett a levegő száraznak érződhet.', 'A {value}%-os páratartalomtól a levegő fülledtnek érződhet.', 'A {value} sebességű szél a nyílt területeken erősebbnek érződhet.', 'Ma körülbelül {hours} óra {minutes} perc világos idő várható.', 'A mai hőmérséklet {low} és {high} között alakul.'],
    ro: ['La o umiditate de {value}%, aerul se poate simți uscat.', 'Umiditatea de {value}% poate face aerul să pară înăbușitor.', 'Vântul de {value} se poate simți mai puternic în zonele expuse.', 'Astăzi sunt aproximativ {hours} ore și {minutes} minute de lumină.', 'Astăzi, temperaturile variază între {low} și {high}.'],
    el: ['Με υγρασία {value}%, ο αέρας μπορεί να φαίνεται ξηρός.', 'Υγρασία {value}% μπορεί να κάνει τον αέρα αποπνικτικό.', 'Άνεμος {value} μπορεί να γίνεται πιο αισθητός σε εκτεθειμένα σημεία.', 'Σήμερα η ημέρα έχει περίπου {hours} ώρες και {minutes} λεπτά φωτός.', 'Σήμερα η θερμοκρασία κυμαίνεται από {low} έως {high}.'],
    tr: ['Nem {value}% olduğunda hava kuru hissedilebilir.', 'Nem oranının % {value} olması havayı bunaltıcı hissettirebilir.', '{value} hızındaki rüzgâr açık alanlarda daha sert hissedilebilir.', 'Bugün yaklaşık {hours} saat {minutes} dakika gün ışığı var.', 'Bugün sıcaklık {low} ile {high} arasında değişiyor.'],
    ru: ['При влажности {value}% воздух может казаться сухим.', 'Влажность {value}% может создавать ощущение духоты.', 'Ветер со скоростью {value} сильнее ощущается на открытых местах.', 'Сегодня световой день длится около {hours} ч {minutes} мин.', 'Сегодня температура будет от {low} до {high}.'],
    uk: ['За вологості {value}% повітря може здаватися сухим.', 'Вологість {value}% може створювати відчуття задухи.', 'Вітер зі швидкістю {value} сильніше відчувається на відкритих ділянках.', 'Сьогодні світловий день триває близько {hours} год {minutes} хв.', 'Сьогодні температура коливатиметься від {low} до {high}.'],
    ar: ['عند رطوبة تبلغ {value}% قد يبدو الهواء جافاً.', 'قد تجعل رطوبة تبلغ {value}% الهواء خانقاً.', 'قد تكون الرياح بسرعة {value} أوضح في الأماكن المكشوفة.', 'يبلغ طول النهار اليوم نحو {hours} ساعة و{minutes} دقيقة.', 'تتراوح درجات الحرارة اليوم بين {low} و{high}.'],
    he: ['בלחות של {value}% האוויר עשוי להרגיש יבש.', 'לחות של {value}% עלולה לגרום לאוויר להרגיש מחניק.', 'רוח במהירות {value} עשויה להיות מורגשת יותר במקומות חשופים.', 'היום יש בערך {hours} שעות ו־{minutes} דקות של אור יום.', 'הטמפרטורות היום נעות בין {low} ל־{high}.'],
    hi: ['{value}% नमी में हवा शुष्क महसूस हो सकती है।', '{value}% नमी से हवा उमस भरी लग सकती है।', '{value} की रफ्तार से चलती हवा खुली जगहों पर तेज़ महसूस हो सकती है।', 'आज लगभग {hours} घंटे {minutes} मिनट दिन का उजाला रहेगा।', 'आज तापमान {low} से {high} के बीच रहेगा।'],
    th: ['ความชื้น {value}% อาจทำให้อากาศรู้สึกแห้ง', 'ความชื้น {value}% อาจทำให้อากาศรู้สึกอบอ้าว', 'ลมที่ความเร็ว {value} อาจรู้สึกแรงขึ้นในพื้นที่โล่ง', 'วันนี้มีแสงสว่างประมาณ {hours} ชั่วโมง {minutes} นาที', 'วันนี้อุณหภูมิจะอยู่ระหว่าง {low} ถึง {high}'],
    vi: ['Độ ẩm {value}% có thể khiến không khí cảm thấy khô.', 'Độ ẩm {value}% có thể khiến không khí trở nên oi bức.', 'Gió ở mức {value} có thể cảm nhận rõ hơn tại nơi trống trải.', 'Hôm nay có khoảng {hours} giờ {minutes} phút ánh sáng ban ngày.', 'Hôm nay nhiệt độ dao động từ {low} đến {high}.'],
    id: ['Pada kelembapan {value}%, udara mungkin terasa kering.', 'Kelembapan {value}% dapat membuat udara terasa pengap.', 'Angin dengan kecepatan {value} mungkin terasa lebih kencang di area terbuka.', 'Hari ini ada sekitar {hours} jam {minutes} menit cahaya matahari.', 'Suhu hari ini berkisar antara {low} hingga {high}.'],
    ja: ['湿度が{value}%と低く、空気が乾燥して感じられることがあります。', '湿度が{value}%と高く、蒸し暑く感じられることがあります。', '風速{value}の風は、開けた場所で強く感じられることがあります。', '今日の日照時間はおよそ{hours}時間{minutes}分です。', '今日の気温は{low}から{high}の間で推移します。'],
    ko: ['습도가 {value}%로 낮아 공기가 건조하게 느껴질 수 있습니다.', '습도가 {value}%로 높아 공기가 후텁지근하게 느껴질 수 있습니다.', '풍속 {value}의 바람은 탁 트인 곳에서 더 강하게 느껴질 수 있습니다.', '오늘은 낮 시간이 약 {hours}시간 {minutes}분입니다.', '오늘 기온은 {low}에서 {high} 사이로 예상됩니다.'],
    zh: ['湿度为 {value}%，空气可能会让人感觉干燥。', '湿度为 {value}%，空气可能会让人感觉闷热。', '风速为 {value}，空旷处风力可能更明显。', '今天的日照时长约为 {hours} 小时 {minutes} 分钟。', '今天气温在 {low} 到 {high} 之间。'],
    'zh-TW': ['濕度為 {value}%，空氣可能會讓人感覺乾燥。', '濕度為 {value}%，空氣可能會讓人感覺悶熱。', '風速為 {value}，空曠處風力可能更明顯。', '今天的日照時間約為 {hours} 小時 {minutes} 分鐘。', '今天氣溫介於 {low} 到 {high} 之間。']
  };

  global.I18N = global.I18N || {};
  Object.keys(COPY).forEach(function (code) {
    var row = COPY[code];
    var dict = global.I18N[code] = Object.assign({}, global.I18N[code] || {});
    var horizonPool = row.horizon.concat(HORIZON_MORE[code] || HORIZON_MORE.en);
    dict['weather.savedPlaces'] = row.labels[0];
    dict['weather.addToMySky'] = row.labels[1];
    dict['weather.removeFromMySky'] = row.labels[2];
    dict['weather.greeting.separator'] = HORIZON_SEPARATOR[code] || '. ';
    dict['weather.greeting.insightSeparator'] = Object.prototype.hasOwnProperty.call(INSIGHT_SEPARATOR, code)
      ? INSIGHT_SEPARATOR[code] : ' ';
    dict['weather.context.tomorrow.outlook'] = TOMORROW_OUTLOOK[code] || TOMORROW_OUTLOOK.en;
    dict['weather.greeting.mySkySpecialForecast'] = SPECIAL_FORECAST[code] || SPECIAL_FORECAST.en;
    CONTEXT_KEYS.forEach(function (key, index) {
      dict[key] = (CONTEXT_COPY[code] || CONTEXT_COPY.en)[index];
    });
    horizonPool.forEach(function (value, index) {
      dict['weather.greeting.horizon' + index] = value;
    });
    (SPECIAL_CONDITIONS[code] || SPECIAL_CONDITIONS.en).forEach(function (value, index) {
      dict['weather.greeting.condition.special' + index] = value;
    });
    dict['weather.greeting.mySkyUnavailable'] = UNAVAILABLE[code] || UNAVAILABLE.en;
  });
})(window);
