'use strict';
/* Weather greetings and value-aware context copy, written for each supported locale. */
(function (global) {
  var D = {
    en: {
      mode: ['Horizon', 'My Sky'], time: ['Good morning', 'Good afternoon', 'Good evening', 'Good night'],
      horizon: ['{greeting} — see what the weather is doing around the world.', '{greeting} — explore the weather unfolding around the world.'],
      prompt: '{greeting} — choose a city to see your local forecast.', checking: '{greeting} — checking the weather in {place}.',
      forecast: '{greeting} — {temp} and {condition} in {place}.',
      condition: ['clear', 'mostly clear', 'partly cloudy', 'overcast', 'foggy', 'drizzly', 'rainy', 'snowy', 'stormy'],
      uv: [
        'The UV Index is low today, so sun exposure is less intense for most people.',
        'UV is moderate at its peak today. Shade and sun protection can make time outside more comfortable.',
        'UV reaches a high level today. Shade and sun protection can make time outside more comfortable.',
        'UV is very high around midday. Shade and sun protection can make time outside more comfortable.',
        'Today’s peak UV is extreme. Seek shade and use sun protection when outdoors.'
      ],
      precip: [
        'No precipitation is expected in the next few hours.',
        'Rain may arrive in the next few hours, so it may help to keep an umbrella nearby.',
        'Showers are likely in the next few hours, so an umbrella may come in handy.',
        'Snow may arrive in the next few hours; check the forecast before heading out.',
        'Snow is likely in the next few hours, so allow extra time if you’re going out.'
      ],
      aqiSensitive: 'Unhealthy for Sensitive Groups'
    },
    es: {
      mode: ['Horizonte', 'Mi cielo'], time: ['Buenos días', 'Buenas tardes', 'Buenas tardes', 'Buenas noches'],
      horizon: ['{greeting}. Descubre qué tiempo hace en todo el mundo.', '{greeting}. Explora la meteorología de distintos lugares del mundo.'],
      prompt: '{greeting}. Elige una ciudad para ver la previsión local.', checking: '{greeting}. Consultando el tiempo en {place}.',
      forecast: '{greeting}: {temp} y {condition} en {place}.',
      condition: ['despejado', 'casi despejado', 'parcialmente nublado', 'cubierto', 'con niebla', 'con llovizna', 'lluvioso', 'nevado', 'tormentoso'],
      uv: [
        'El índice UV es bajo hoy, así que la exposición al sol será menos intensa para la mayoría.',
        'El UV alcanza un nivel moderado hoy. La sombra y la protección solar pueden hacer más agradable estar al aire libre.',
        'El UV alcanza un nivel alto hoy. La sombra y la protección solar pueden hacer más agradable estar al aire libre.',
        'El UV será muy alto hacia el mediodía. La sombra y la protección solar pueden hacer más agradable estar al aire libre.',
        'El UV máximo de hoy es extremo. Busca la sombra y protégete del sol cuando estés al aire libre.'
      ],
      precip: [
        'No se esperan precipitaciones durante las próximas horas.',
        'Podría llover durante las próximas horas; quizá te convenga tener un paraguas a mano.',
        'Es probable que haya chubascos durante las próximas horas, así que un paraguas puede venir bien.',
        'Podría nevar durante las próximas horas; consulta la previsión antes de salir.',
        'Es probable que nieve durante las próximas horas. Si vas a salir, quizá necesites algo más de tiempo.'
      ],
      aqiSensitive: 'Insalubre para grupos sensibles'
    },
    fr: {
      mode: ['Horizon', 'Mon ciel'], time: ['Bonjour', 'Bon après-midi', 'Bonsoir', 'Bonne nuit'],
      horizon: ['{greeting}. Découvrez le temps qu’il fait dans le monde.', '{greeting}. Explorez les conditions météo aux quatre coins du monde.'],
      prompt: '{greeting}. Choisissez une ville pour consulter la météo locale.', checking: '{greeting} — météo en cours de chargement pour {place}.',
      forecast: '{greeting} — {temp} et un temps {condition} à {place}.',
      condition: ['dégagé', 'plutôt dégagé', 'partiellement nuageux', 'couvert', 'brumeux', 'bruineux', 'pluvieux', 'neigeux', 'orageux'],
      uv: [
        'L’indice UV est bas aujourd’hui : l’exposition au soleil est moins intense pour la plupart des personnes.',
        'L’UV atteint un niveau modéré aujourd’hui. L’ombre et une protection solaire peuvent rendre les sorties plus agréables.',
        'L’UV atteint un niveau élevé aujourd’hui. L’ombre et une protection solaire peuvent rendre les sorties plus agréables.',
        'L’UV sera très élevé autour de midi. L’ombre et une protection solaire peuvent rendre les sorties plus agréables.',
        'Le pic UV est extrême aujourd’hui. Cherchez l’ombre et protégez-vous du soleil à l’extérieur.'
      ],
      precip: [
        'Aucune précipitation n’est prévue dans les prochaines heures.',
        'De la pluie pourrait arriver dans les prochaines heures ; garder un parapluie à portée de main peut être utile.',
        'Des averses sont probables dans les prochaines heures : un parapluie pourrait être utile.',
        'De la neige pourrait arriver dans les prochaines heures ; consultez les prévisions avant de sortir.',
        'Des chutes de neige sont probables dans les prochaines heures. Prévoyez un peu plus de temps si vous sortez.'
      ],
      aqiSensitive: 'Mauvais pour les groupes sensibles'
    },
    de: {
      mode: ['Horizont', 'Mein Himmel'], time: ['Guten Morgen', 'Guten Tag', 'Guten Abend', 'Gute Nacht'],
      horizon: ['{greeting}. Entdecke das Wetter rund um die Welt.', '{greeting}. Erkunde das Wetter an vielen Orten der Welt.'],
      prompt: '{greeting} — wähle eine Stadt für deine lokale Vorhersage.', checking: '{greeting} — das Wetter in {place} wird geladen.',
      forecast: '{greeting} — {temp} und {condition} in {place}.',
      condition: ['klar', 'überwiegend klar', 'wolkig mit Auflockerungen', 'bedeckt', 'neblig', 'nieselig', 'regnerisch', 'verschneit', 'stürmisch'],
      uv: [
        'Der UV-Index ist heute niedrig; für die meisten ist die Sonneneinstrahlung weniger intensiv.',
        'Der UV-Index erreicht heute höchstens einen mäßigen Wert. Schatten und Sonnenschutz können die Zeit im Freien angenehmer machen.',
        'Der UV-Index erreicht heute einen hohen Wert. Schatten und Sonnenschutz können die Zeit im Freien angenehmer machen.',
        'Der UV-Index ist um die Mittagszeit sehr hoch. Schatten und Sonnenschutz können die Zeit im Freien angenehmer machen.',
        'Der UV-Höchstwert ist heute extrem. Suche draußen Schatten und schütze dich vor der Sonne.'
      ],
      precip: [
        'In den nächsten Stunden ist kein Niederschlag zu erwarten.',
        'In den nächsten Stunden kann Regen aufziehen. Ein Regenschirm in Reichweite kann hilfreich sein.',
        'In den nächsten Stunden sind Schauer wahrscheinlich; ein Regenschirm kann sich lohnen.',
        'In den nächsten Stunden kann Schnee einsetzen. Sieh vor dem Aufbruch noch einmal in die Vorhersage.',
        'In den nächsten Stunden ist Schnee wahrscheinlich. Plane für unterwegs etwas mehr Zeit ein.'
      ],
      aqiSensitive: 'Ungesund für empfindliche Gruppen'
    },
    it: {
      mode: ['Orizzonte', 'Il mio cielo'], time: ['Buongiorno', 'Buon pomeriggio', 'Buonasera', 'Buonanotte'],
      horizon: ['{greeting}. Scopri che tempo fa nel mondo.', '{greeting}. Esplora il meteo in tante parti del mondo.'],
      prompt: '{greeting}. Scegli una città per vedere le previsioni locali.', checking: '{greeting} — controllo del meteo a {place}.',
      forecast: '{greeting} — {temp} e tempo {condition} a {place}.',
      condition: ['sereno', 'quasi sereno', 'parzialmente nuvoloso', 'coperto', 'nebbioso', 'con pioviggine', 'piovoso', 'nevoso', 'temporalesco'],
      uv: [
        'L’indice UV è basso oggi, quindi l’esposizione al sole è meno intensa per la maggior parte delle persone.',
        'Oggi l’UV raggiunge un livello moderato. Ombra e protezione solare possono rendere più piacevole stare all’aperto.',
        'Oggi l’UV raggiunge un livello alto. Ombra e protezione solare possono rendere più piacevole stare all’aperto.',
        'L’UV sarà molto alto intorno a mezzogiorno. Ombra e protezione solare possono rendere più piacevole stare all’aperto.',
        'Il picco UV di oggi è estremo. Cerca l’ombra e proteggiti dal sole quando sei all’aperto.'
      ],
      precip: [
        'Non sono previste precipitazioni nelle prossime ore.',
        'Potrebbe piovere nelle prossime ore; tenere un ombrello a portata di mano può essere utile.',
        'Sono probabili rovesci nelle prossime ore: un ombrello potrebbe tornare utile.',
        'Potrebbe nevicare nelle prossime ore; controlla le previsioni prima di uscire.',
        'La neve è probabile nelle prossime ore. Se esci, considera di prenderti un po’ più di tempo.'
      ],
      aqiSensitive: 'Insalubre per i gruppi sensibili'
    },
    'pt-BR': {
      mode: ['Horizonte', 'Meu céu'], time: ['Bom dia', 'Boa tarde', 'Boa tarde', 'Boa noite'],
      horizon: ['{greeting}. Veja como está o tempo pelo mundo.', '{greeting}. Explore o clima em diferentes partes do mundo.'],
      prompt: '{greeting}. Escolha uma cidade para ver a previsão local.', checking: '{greeting} — verificando o tempo em {place}.',
      forecast: '{greeting} — {temp} e tempo {condition} em {place}.',
      condition: ['aberto', 'quase sem nuvens', 'parcialmente nublado', 'encoberto', 'com neblina', 'com garoa', 'chuvoso', 'nevado', 'tempestuoso'],
      uv: [
        'O índice UV está baixo hoje, então a exposição ao sol é menos intensa para a maioria das pessoas.',
        'O UV chega a um nível moderado hoje. Sombra e proteção solar podem deixar o tempo ao ar livre mais confortável.',
        'O UV chega a um nível alto hoje. Sombra e proteção solar podem deixar o tempo ao ar livre mais confortável.',
        'O UV fica muito alto perto do meio-dia. Sombra e proteção solar podem deixar o tempo ao ar livre mais confortável.',
        'O pico de UV de hoje é extremo. Procure sombra e proteja-se do sol quando estiver ao ar livre.'
      ],
      precip: [
        'Não há previsão de precipitação nas próximas horas.',
        'Pode chover nas próximas horas; deixar um guarda-chuva por perto pode ajudar.',
        'Há previsão de pancadas nas próximas horas, então um guarda-chuva pode ser útil.',
        'Pode nevar nas próximas horas; confira a previsão antes de sair.',
        'Há previsão de neve nas próximas horas. Se for sair, considere reservar um pouco mais de tempo.'
      ],
      aqiSensitive: 'Insalubre para grupos sensíveis'
    },
    'pt-PT': {
      mode: ['Horizonte', 'O meu céu'], time: ['Bom dia', 'Boa tarde', 'Boa tarde', 'Boa noite'],
      horizon: ['{greeting}. Veja como está o tempo pelo mundo.', '{greeting}. Explore a meteorologia em vários pontos do mundo.'],
      prompt: '{greeting}. Escolha uma cidade para consultar a previsão local.', checking: '{greeting} — a consultar o tempo em {place}.',
      forecast: '{greeting} — {temp} e tempo {condition} em {place}.',
      condition: ['limpo', 'pouco nublado', 'parcialmente nublado', 'encoberto', 'com nevoeiro', 'com chuviscos', 'chuvoso', 'com neve', 'tempestuoso'],
      uv: [
        'O índice UV está baixo hoje, pelo que a exposição solar é menos intensa para a maioria das pessoas.',
        'O UV atinge um nível moderado hoje. A sombra e a proteção solar podem tornar o tempo ao ar livre mais confortável.',
        'O UV atinge um nível elevado hoje. A sombra e a proteção solar podem tornar o tempo ao ar livre mais confortável.',
        'O UV será muito elevado por volta do meio-dia. A sombra e a proteção solar podem tornar o tempo ao ar livre mais confortável.',
        'O pico de UV de hoje é extremo. Procure sombra e proteja-se do sol quando estiver no exterior.'
      ],
      precip: [
        'Não se prevê precipitação nas próximas horas.',
        'Pode chover nas próximas horas; ter um guarda-chuva por perto pode ser útil.',
        'São prováveis aguaceiros nas próximas horas, por isso um guarda-chuva pode dar jeito.',
        'Pode nevar nas próximas horas; consulte a previsão antes de sair.',
        'É provável que neve nas próximas horas. Se sair, reserve um pouco mais de tempo.'
      ],
      aqiSensitive: 'Insalubre para grupos sensíveis'
    },
    nl: {
      mode: ['Horizon', 'Mijn hemel'], time: ['Goedemorgen', 'Goedemiddag', 'Goedenavond', 'Goedenacht'],
      horizon: ['{greeting}. Ontdek wat voor weer het is over de hele wereld.', '{greeting}. Verken het weer op allerlei plekken wereldwijd.'],
      prompt: '{greeting}. Kies een stad voor de lokale weersverwachting.', checking: '{greeting} — het weer in {place} wordt opgehaald.',
      forecast: '{greeting} — {temp} en {condition} in {place}.',
      condition: ['helder', 'vrijwel helder', 'half bewolkt', 'bewolkt', 'mistig', 'motregen', 'regenachtig', 'sneeuwachtig', 'stormachtig'],
      uv: [
        'De UV-index is vandaag laag; voor de meeste mensen is de zon minder krachtig.',
        'De UV-index is vandaag op zijn hoogst matig. Schaduw en zonbescherming kunnen buiten prettiger maken.',
        'De UV-index is vandaag hoog. Schaduw en zonbescherming kunnen buiten prettiger maken.',
        'De UV-index is rond het middaguur zeer hoog. Schaduw en zonbescherming kunnen buiten prettiger maken.',
        'De hoogste UV-index is vandaag extreem. Zoek buiten de schaduw op en bescherm je tegen de zon.'
      ],
      precip: [
        'De komende uren wordt geen neerslag verwacht.',
        'De komende uren kan regen vallen; een paraplu bij de hand houden kan handig zijn.',
        'De komende uren zijn buien waarschijnlijk, dus een paraplu kan van pas komen.',
        'De komende uren kan sneeuw vallen; bekijk de verwachting voordat je op pad gaat.',
        'De komende uren is sneeuw waarschijnlijk. Trek wat extra tijd uit als je op pad gaat.'
      ],
      aqiSensitive: 'Ongezond voor gevoelige groepen'
    },
    da: {
      mode: ['Horisont', 'Min himmel'], time: ['Godmorgen', 'God eftermiddag', 'God aften', 'Godnat'],
      horizon: ['{greeting}. Se, hvordan vejret er rundt om i verden.', '{greeting}. Gå på opdagelse i vejret verden over.'],
      prompt: '{greeting}. Vælg en by for at se den lokale vejrudsigt.', checking: '{greeting} — vejret i {place} hentes.',
      forecast: '{greeting} — {temp} og {condition} i {place}.',
      condition: ['klart', 'mest klart', 'delvist skyet', 'overskyet', 'tåget', 'støvregn', 'regnfuldt', 'snefuldt', 'stormfuldt'],
      uv: [
        'UV-indekset er lavt i dag, så solen er mindre intens for de fleste.',
        'UV-indekset er moderat på sit højeste i dag. Skygge og solbeskyttelse kan gøre tiden ude mere behagelig.',
        'UV-indekset når et højt niveau i dag. Skygge og solbeskyttelse kan gøre tiden ude mere behagelig.',
        'UV-indekset er meget højt omkring middag. Skygge og solbeskyttelse kan gøre tiden ude mere behagelig.',
        'Dagens højeste UV-indeks er ekstremt. Søg skygge, og beskyt dig mod solen udendørs.'
      ],
      precip: [
        'Der ventes ingen nedbør de næste par timer.',
        'Der kan komme regn de næste par timer; det kan være rart at have en paraply i nærheden.',
        'Der er sandsynligvis byger de næste par timer, så en paraply kan være nyttig.',
        'Der kan komme sne de næste par timer; tjek vejrudsigten, før du tager af sted.',
        'Der ventes sandsynligvis sne de næste par timer. Sæt lidt ekstra tid af, hvis du skal ud.'
      ],
      aqiSensitive: 'Usundt for følsomme grupper'
    },
    sv: {
      mode: ['Horisont', 'Min himmel'], time: ['God morgon', 'God eftermiddag', 'God kväll', 'God natt'],
      horizon: ['{greeting}. Se hur vädret är runt om i världen.', '{greeting}. Utforska vädret på olika platser i världen.'],
      prompt: '{greeting}. Välj en stad för att se den lokala prognosen.', checking: '{greeting} — hämtar vädret för {place}.',
      forecast: '{greeting} — {temp} och {condition} i {place}.',
      condition: ['klart', 'mestadels klart', 'växlande molnighet', 'mulet', 'dimmigt', 'duggregn', 'regnigt', 'snöigt', 'stormigt'],
      uv: [
        'UV-indexet är lågt i dag, så solen är mindre intensiv för de flesta.',
        'UV-indexet når en måttlig nivå som högst i dag. Skugga och solskydd kan göra tiden utomhus behagligare.',
        'UV-indexet når en hög nivå i dag. Skugga och solskydd kan göra tiden utomhus behagligare.',
        'UV-indexet är mycket högt mitt på dagen. Skugga och solskydd kan göra tiden utomhus behagligare.',
        'Dagens högsta UV-index är extremt. Sök skugga och skydda dig mot solen utomhus.'
      ],
      precip: [
        'Ingen nederbörd väntas de närmaste timmarna.',
        'Det kan komma regn de närmaste timmarna; det kan vara bra att ha ett paraply nära till hands.',
        'Skurar är sannolika de närmaste timmarna, så ett paraply kan vara bra att ha.',
        'Det kan komma snö de närmaste timmarna; kolla prognosen innan du går ut.',
        'Snö är sannolik de närmaste timmarna. Räkna med lite extra tid om du ska ut.'
      ],
      aqiSensitive: 'Ohälsosamt för känsliga grupper'
    },
    nb: {
      mode: ['Horisont', 'Min himmel'], time: ['God morgen', 'God ettermiddag', 'God kveld', 'God natt'],
      horizon: ['{greeting}. Se hvordan været er rundt om i verden.', '{greeting}. Utforsk været på steder over hele verden.'],
      prompt: '{greeting}. Velg en by for å se det lokale været.', checking: '{greeting} — henter været i {place}.',
      forecast: '{greeting} — {temp} og {condition} i {place}.',
      condition: ['klart', 'stort sett klart', 'delvis skyet', 'overskyet', 'tåkete', 'yr', 'regnfullt', 'snørikt', 'stormfullt'],
      uv: [
        'UV-indeksen er lav i dag, så solen er mindre intens for de fleste.',
        'UV-indeksen er moderat på sitt høyeste i dag. Skygge og solbeskyttelse kan gjøre det mer behagelig å være ute.',
        'UV-indeksen blir høy i dag. Skygge og solbeskyttelse kan gjøre det mer behagelig å være ute.',
        'UV-indeksen er svært høy rundt middagstid. Skygge og solbeskyttelse kan gjøre det mer behagelig å være ute.',
        'Dagens høyeste UV-indeks er ekstrem. Søk skygge og beskytt deg mot solen utendørs.'
      ],
      precip: [
        'Det er ikke ventet nedbør de neste timene.',
        'Det kan komme regn de neste timene; det kan være lurt å ha en paraply i nærheten.',
        'Det er sannsynlig med byger de neste timene, så en paraply kan være nyttig.',
        'Det kan komme snø de neste timene; sjekk værmeldingen før du drar.',
        'Det er sannsynlig med snø de neste timene. Beregn litt ekstra tid hvis du skal ut.'
      ],
      aqiSensitive: 'Usunt for følsomme grupper'
    },
    fi: {
      mode: ['Horisontti', 'Oma taivas'], time: ['Hyvää huomenta', 'Hyvää iltapäivää', 'Hyvää iltaa', 'Hyvää yötä'],
      horizon: ['{greeting}. Katso, millainen sää on eri puolilla maailmaa.', '{greeting}. Tutustu säähän eri puolilla maailmaa.'],
      prompt: '{greeting}. Valitse kaupunki nähdäksesi paikallisen ennusteen.', checking: '{greeting} — haetaan kohteen {place} säätä.',
      forecast: '{greeting} — {place}: {temp}, {condition}.',
      condition: ['selkeää', 'enimmäkseen selkeää', 'osittain pilvistä', 'pilvistä', 'sumuista', 'tihkusadetta', 'sateista', 'lumista', 'myrskyistä'],
      uv: [
        'UV-indeksi on tänään matala, joten auringon säteily on useimmille vähemmän voimakasta.',
        'UV-indeksi on päivän huipussaan kohtalainen. Varjo ja aurinkosuoja voivat tehdä ulkoilusta mukavampaa.',
        'UV-indeksi nousee tänään korkeaksi. Varjo ja aurinkosuoja voivat tehdä ulkoilusta mukavampaa.',
        'UV-indeksi on keskipäivän tienoilla hyvin korkea. Varjo ja aurinkosuoja voivat tehdä ulkoilusta mukavampaa.',
        'Päivän korkein UV-indeksi on äärimmäinen. Hakeudu varjoon ja suojaudu auringolta ulkona.'
      ],
      precip: [
        'Seuraavien tuntien aikana ei odoteta sateita.',
        'Seuraavien tuntien aikana voi sataa; sateenvarjo kannattaa ehkä pitää lähellä.',
        'Seuraavien tuntien aikana tulee todennäköisesti sadekuuroja, joten sateenvarjo voi olla tarpeen.',
        'Seuraavien tuntien aikana voi sataa lunta; tarkista ennuste ennen lähtöä.',
        'Seuraavien tuntien aikana sataa todennäköisesti lunta. Varaa hieman lisäaikaa, jos lähdet ulos.'
      ],
      aqiSensitive: 'Epäterveellistä herkille ryhmille'
    },
    pl: {
      mode: ['Horyzont', 'Moje niebo'], time: ['Dzień dobry', 'Dzień dobry', 'Dobry wieczór', 'Dobranoc'],
      horizon: ['{greeting}. Sprawdź, jaka pogoda panuje w różnych częściach świata.', '{greeting}. Odkrywaj pogodę w różnych zakątkach świata.'],
      prompt: '{greeting}. Wybierz miasto, aby zobaczyć lokalną prognozę.', checking: '{greeting} — sprawdzamy pogodę w miejscu: {place}.',
      forecast: '{greeting} — {temp}, {condition} w mieście {place}.',
      condition: ['bezchmurnie', 'przeważnie bezchmurnie', 'częściowe zachmurzenie', 'pochmurno', 'mgliście', 'mżawka', 'deszczowo', 'śnieżnie', 'burzowo'],
      uv: [
        'Indeks UV jest dziś niski, więc dla większości osób słońce jest mniej intensywne.',
        'Maksymalny indeks UV będzie dziś umiarkowany. Cień i ochrona przeciwsłoneczna mogą uprzyjemnić czas na zewnątrz.',
        'Indeks UV osiągnie dziś wysoki poziom. Cień i ochrona przeciwsłoneczna mogą uprzyjemnić czas na zewnątrz.',
        'W południe indeks UV będzie bardzo wysoki. Cień i ochrona przeciwsłoneczna mogą uprzyjemnić czas na zewnątrz.',
        'Dzisiejszy maksymalny indeks UV jest ekstremalny. Na zewnątrz szukaj cienia i chroń się przed słońcem.'
      ],
      precip: [
        'W ciągu najbliższych kilku godzin nie są spodziewane opady.',
        'W ciągu najbliższych kilku godzin może padać; warto mieć pod ręką parasol.',
        'W ciągu najbliższych kilku godzin prawdopodobne są przelotne opady, więc parasol może się przydać.',
        'W ciągu najbliższych kilku godzin może padać śnieg; przed wyjściem sprawdź prognozę.',
        'W ciągu najbliższych kilku godzin prawdopodobnie spadnie śnieg. Jeśli wychodzisz, zarezerwuj sobie więcej czasu.'
      ],
      aqiSensitive: 'Niezdrowe dla wrażliwych grup'
    },
    cs: {
      mode: ['Obzor', 'Moje nebe'], time: ['Dobré ráno', 'Dobré odpoledne', 'Dobrý večer', 'Dobrou noc'],
      horizon: ['{greeting}. Podívejte se, jaké je počasí ve světě.', '{greeting}. Prozkoumejte počasí na různých místech světa.'],
      prompt: '{greeting}. Vyberte město a zobrazte místní předpověď.', checking: '{greeting} — načítá se počasí pro {place}.',
      forecast: '{greeting} — {temp}, {condition} ve městě {place}.',
      condition: ['jasno', 'převážně jasno', 'polojasno', 'zataženo', 'mlhavo', 'mrholení', 'deštivo', 'sněžení', 'bouřky'],
      uv: [
        'UV index je dnes nízký, sluneční záření je tak pro většinu lidí méně intenzivní.',
        'UV index dnes dosáhne mírné úrovně. Stín a ochrana před sluncem mohou pobyt venku zpříjemnit.',
        'UV index dnes dosáhne vysoké úrovně. Stín a ochrana před sluncem mohou pobyt venku zpříjemnit.',
        'UV index bude kolem poledne velmi vysoký. Stín a ochrana před sluncem mohou pobyt venku zpříjemnit.',
        'Dnešní maximum UV indexu je extrémní. Venku vyhledejte stín a chraňte se před sluncem.'
      ],
      precip: [
        'V příštích několika hodinách se neočekávají srážky.',
        'V příštích několika hodinách může začít pršet; hodí se mít po ruce deštník.',
        'V příštích několika hodinách jsou pravděpodobné přeháňky, takže se může hodit deštník.',
        'V příštích několika hodinách může sněžit; před odchodem zkontrolujte předpověď.',
        'V příštích několika hodinách pravděpodobně napadne sníh. Pokud vyrážíte ven, počítejte s větší časovou rezervou.'
      ],
      aqiSensitive: 'Nezdravé pro citlivé skupiny'
    },
    hu: {
      mode: ['Horizont', 'Saját égbolt'], time: ['Jó reggelt', 'Jó napot', 'Jó estét', 'Jó éjszakát'],
      horizon: ['{greeting}. Nézd meg, milyen az idő a világ különböző pontjain.', '{greeting}. Fedezd fel a világ időjárását.'],
      prompt: '{greeting}. Válassz egy várost a helyi előrejelzés megtekintéséhez.', checking: '{greeting} — az időjárás lekérése {place} helyszínére.',
      forecast: '{greeting} — {place}: {temp}, {condition}.',
      condition: ['derült', 'többnyire derült', 'részben felhős', 'borult', 'ködös', 'szitáló eső', 'esős', 'havas', 'viharos'],
      uv: [
        'Az UV-index ma alacsony, ezért a napsugárzás a legtöbb ember számára kevésbé intenzív.',
        'Az UV-index ma legfeljebb mérsékelt lesz. Az árnyék és a napvédelem kényelmesebbé teheti a szabadtéri időtöltést.',
        'Az UV-index ma magas szintet ér el. Az árnyék és a napvédelem kényelmesebbé teheti a szabadtéri időtöltést.',
        'Az UV-index dél körül nagyon magas lesz. Az árnyék és a napvédelem kényelmesebbé teheti a szabadtéri időtöltést.',
        'A mai legmagasabb UV-index szélsőséges. A szabadban keress árnyékot, és védd magad a naptól.'
      ],
      precip: [
        'A következő néhány órában nem várható csapadék.',
        'A következő néhány órában eső érkezhet; érdemes esernyőt tartani a közelben.',
        'A következő néhány órában valószínűek a záporok, ezért jól jöhet egy esernyő.',
        'A következő néhány órában havazhat; indulás előtt nézd meg az előrejelzést.',
        'A következő néhány órában valószínű a havazás. Ha elindulsz, számolj egy kis többletidővel.'
      ],
      aqiSensitive: 'Egészségtelen az érzékeny csoportok számára'
    },
    ro: {
      mode: ['Orizont', 'Cerul meu'], time: ['Bună dimineața', 'Bună ziua', 'Bună seara', 'Noapte bună'],
      horizon: ['{greeting}. Descoperă cum e vremea în toată lumea.', '{greeting}. Explorează vremea din diferite locuri ale lumii.'],
      prompt: '{greeting}. Alege un oraș pentru a vedea prognoza locală.', checking: '{greeting} — verificăm vremea în {place}.',
      forecast: '{greeting} — {place}: {temp}, {condition}.',
      condition: ['cer senin', 'cer aproape senin', 'cer parțial înnorat', 'cer înnorat', 'ceață', 'burniță', 'ploaie', 'ninsoare', 'furtuni'],
      uv: [
        'Indicele UV este scăzut astăzi, așa că expunerea la soare este mai puțin intensă pentru majoritatea oamenilor.',
        'Indicele UV ajunge astăzi la un nivel moderat. Umbra și protecția solară pot face timpul petrecut afară mai plăcut.',
        'Indicele UV ajunge astăzi la un nivel ridicat. Umbra și protecția solară pot face timpul petrecut afară mai plăcut.',
        'Indicele UV va fi foarte ridicat în jurul prânzului. Umbra și protecția solară pot face timpul petrecut afară mai plăcut.',
        'Vârful UV de astăzi este extrem. Caută umbra și protejează-te de soare când ești afară.'
      ],
      precip: [
        'Nu sunt așteptate precipitații în următoarele câteva ore.',
        'Este posibil să plouă în următoarele câteva ore; poate fi util să ai o umbrelă la îndemână.',
        'Sunt probabile averse în următoarele câteva ore, așa că o umbrelă poate fi de folos.',
        'Este posibil să ningă în următoarele câteva ore; verifică prognoza înainte să pleci.',
        'Este probabil să ningă în următoarele câteva ore. Dacă ieși, ia în calcul puțin timp în plus.'
      ],
      aqiSensitive: 'Nesănătos pentru grupurile sensibile'
    },
    el: {
      mode: ['Ορίζοντας', 'Ο ουρανός μου'], time: ['Καλημέρα', 'Καλό απόγευμα', 'Καλησπέρα', 'Καληνύχτα'],
      horizon: ['{greeting}. Δείτε τι καιρό κάνει σε όλο τον κόσμο.', '{greeting}. Εξερευνήστε τον καιρό σε κάθε γωνιά του κόσμου.'],
      prompt: '{greeting}. Επιλέξτε μια πόλη για να δείτε την τοπική πρόγνωση.', checking: '{greeting} — γίνεται έλεγχος του καιρού για την {place}.',
      forecast: '{greeting} — {temp} και {condition} στην {place}.',
      condition: ['αίθριος', 'κυρίως αίθριος', 'μερική συννεφιά', 'συννεφιά', 'ομίχλη', 'ψιχάλα', 'βροχερός', 'χιονισμένος', 'καταιγίδα'],
      uv: [
        'Ο δείκτης UV είναι χαμηλός σήμερα, οπότε η έκθεση στον ήλιο είναι λιγότερο έντονη για τους περισσότερους.',
        'Ο δείκτης UV φτάνει σήμερα σε μέτριο επίπεδο. Η σκιά και η αντηλιακή προστασία μπορούν να κάνουν πιο ευχάριστη την παραμονή έξω.',
        'Ο δείκτης UV φτάνει σήμερα σε υψηλό επίπεδο. Η σκιά και η αντηλιακή προστασία μπορούν να κάνουν πιο ευχάριστη την παραμονή έξω.',
        'Ο δείκτης UV θα είναι πολύ υψηλός γύρω στο μεσημέρι. Η σκιά και η αντηλιακή προστασία μπορούν να κάνουν πιο ευχάριστη την παραμονή έξω.',
        'Η μέγιστη UV σήμερα είναι ακραία. Αναζητήστε σκιά και προστατευτείτε από τον ήλιο όταν βρίσκεστε έξω.'
      ],
      precip: [
        'Δεν αναμένονται βροχοπτώσεις τις επόμενες ώρες.',
        'Μπορεί να βρέξει τις επόμενες ώρες· ίσως είναι χρήσιμο να έχετε μια ομπρέλα κοντά σας.',
        'Οι μπόρες είναι πιθανές τις επόμενες ώρες, οπότε μια ομπρέλα μπορεί να φανεί χρήσιμη.',
        'Μπορεί να χιονίσει τις επόμενες ώρες· ελέγξτε την πρόγνωση πριν φύγετε.',
        'Το χιόνι είναι πιθανό τις επόμενες ώρες. Αν βγείτε, υπολογίστε λίγο περισσότερο χρόνο.'
      ],
      aqiSensitive: 'Ανθυγιεινό για ευαίσθητες ομάδες'
    },
    tr: {
      mode: ['Ufuk', 'Gökyüzüm'], time: ['Günaydın', 'İyi günler', 'İyi akşamlar', 'İyi geceler'],
      horizon: ['{greeting}. Dünyanın dört bir yanında havanın nasıl olduğuna göz at.', '{greeting}. Dünyanın farklı yerlerindeki hava durumunu keşfet.'],
      prompt: '{greeting}. Yerel hava tahminini görmek için bir şehir seç.', checking: '{greeting} — {place} için hava durumu kontrol ediliyor.',
      forecast: '{greeting} — {place} için {temp} ve hava {condition}.',
      condition: ['açık', 'çoğunlukla açık', 'parçalı bulutlu', 'kapalı', 'sisli', 'çiseleyen', 'yağmurlu', 'karlı', 'fırtınalı'],
      uv: [
        'UV indeksi bugün düşük; güneş ışınları çoğu kişi için daha az yoğun.',
        'UV indeksi bugün en yüksek seviyesinde orta düzeyde. Gölge ve güneş koruması dışarıda geçirilen zamanı daha rahat kılabilir.',
        'UV indeksi bugün yüksek seviyeye ulaşıyor. Gölge ve güneş koruması dışarıda geçirilen zamanı daha rahat kılabilir.',
        'UV indeksi öğle saatlerinde çok yüksek. Gölge ve güneş koruması dışarıda geçirilen zamanı daha rahat kılabilir.',
        'Bugünün en yüksek UV indeksi aşırı düzeyde. Dışarıdayken gölgeye geç ve güneşten korun.'
      ],
      precip: [
        'Önümüzdeki birkaç saat içinde yağış beklenmiyor.',
        'Önümüzdeki birkaç saat içinde yağmur başlayabilir; şemsiyeyi yakınında bulundurmak işe yarayabilir.',
        'Önümüzdeki birkaç saat içinde sağanak bekleniyor; şemsiye işine yarayabilir.',
        'Önümüzdeki birkaç saat içinde kar yağabilir; yola çıkmadan önce tahmini kontrol et.',
        'Önümüzdeki birkaç saat içinde kar yağması olası. Dışarı çıkacaksan biraz daha fazla zaman ayır.'
      ],
      aqiSensitive: 'Hassas gruplar için sağlıksız'
    },
    ru: {
      mode: ['Горизонт', 'Моё небо'], time: ['Доброе утро', 'Добрый день', 'Добрый вечер', 'Доброй ночи'],
      horizon: ['{greeting}. Узнайте, какая погода в разных уголках мира.', '{greeting}. Исследуйте погоду по всему миру.'],
      prompt: '{greeting}. Выберите город, чтобы посмотреть местный прогноз.', checking: '{greeting} — загружаем погоду для города {place}.',
      forecast: '{greeting} — {place}: {temp}, {condition}.',
      condition: ['ясно', 'преимущественно ясно', 'переменная облачность', 'пасмурно', 'туманно', 'морось', 'дождливо', 'снег', 'грозы'],
      uv: [
        'Сегодня низкий УФ-индекс, поэтому для большинства людей солнечное излучение менее интенсивно.',
        'Сегодня максимальный УФ-индекс будет умеренным. Тень и защита от солнца сделают время на улице комфортнее.',
        'Сегодня УФ-индекс достигнет высокого уровня. Тень и защита от солнца сделают время на улице комфортнее.',
        'Около полудня УФ-индекс будет очень высоким. Тень и защита от солнца сделают время на улице комфортнее.',
        'Сегодня максимальный УФ-индекс будет экстремальным. На улице ищите тень и защищайтесь от солнца.'
      ],
      precip: [
        'В ближайшие несколько часов осадков не ожидается.',
        'В ближайшие несколько часов возможен дождь; стоит держать зонт под рукой.',
        'В ближайшие несколько часов вероятны ливни, поэтому может пригодиться зонт.',
        'В ближайшие несколько часов возможен снег; проверьте прогноз перед выходом.',
        'В ближайшие несколько часов вероятен снег. Если собираетесь выйти, заложите дополнительное время.'
      ],
      aqiSensitive: 'Вредно для чувствительных групп'
    },
    uk: {
      mode: ['Горизонт', 'Моє небо'], time: ['Доброго ранку', 'Добрий день', 'Добрий вечір', 'На добраніч'],
      horizon: ['{greeting}. Дізнайтеся, яка погода в різних куточках світу.', '{greeting}. Досліджуйте погоду в різних частинах світу.'],
      prompt: '{greeting}. Виберіть місто, щоб переглянути місцевий прогноз.', checking: '{greeting} — завантажуємо погоду для міста {place}.',
      forecast: '{greeting} — {place}: {temp}, {condition}.',
      condition: ['ясно', 'переважно ясно', 'мінлива хмарність', 'хмарно', 'туманно', 'мряка', 'дощить', 'сніжно', 'грози'],
      uv: [
        'Сьогодні низький УФ-індекс, тож сонячне випромінювання менш інтенсивне для більшості людей.',
        'Сьогодні максимальний УФ-індекс буде помірним. Тінь і захист від сонця зроблять перебування надворі комфортнішим.',
        'Сьогодні УФ-індекс сягне високого рівня. Тінь і захист від сонця зроблять перебування надворі комфортнішим.',
        'Близько полудня УФ-індекс буде дуже високим. Тінь і захист від сонця зроблять перебування надворі комфортнішим.',
        'Сьогодні максимальний УФ-індекс буде екстремальним. Надворі шукайте тінь і захищайтеся від сонця.'
      ],
      precip: [
        'У найближчі кілька годин опадів не очікується.',
        'У найближчі кілька годин можливий дощ; парасольку краще тримати під рукою.',
        'У найближчі кілька годин імовірні зливи, тож парасолька може стати в пригоді.',
        'У найближчі кілька годин можливий сніг; перевірте прогноз перед виходом.',
        'У найближчі кілька годин імовірний сніг. Якщо виходите, закладіть трохи більше часу.'
      ],
      aqiSensitive: 'Шкідливо для чутливих груп'
    },
    ar: {
      mode: ['الأفق', 'سمائي'], time: ['صباح الخير', 'طاب يومك', 'مساء الخير', 'ليلة سعيدة'],
      horizon: ['{greeting}. اكتشف حالة الطقس في أنحاء العالم.', '{greeting}. استكشف الطقس في أماكن مختلفة حول العالم.'],
      prompt: '{greeting} — اختر مدينة للاطلاع على توقعات الطقس المحلية.', checking: '{greeting} — جارٍ التحقق من الطقس في {place}.',
      forecast: '{greeting} — الطقس في {place}: {temp} و{condition}.',
      condition: ['صافٍ', 'صافٍ غالبًا', 'غائم جزئيًا', 'غائم', 'ضبابي', 'رذاذ', 'ممطر', 'ثلجي', 'عاصف'],
      uv: [
        'مؤشر الأشعة فوق البنفسجية منخفض اليوم، لذا يكون التعرض للشمس أقل شدة لدى معظم الناس.',
        'يصل مؤشر الأشعة فوق البنفسجية إلى مستوى متوسط اليوم. قد يجعل الظل والوقاية من الشمس الوقت في الخارج أكثر راحة.',
        'يصل مؤشر الأشعة فوق البنفسجية إلى مستوى مرتفع اليوم. قد يجعل الظل والوقاية من الشمس الوقت في الخارج أكثر راحة.',
        'يكون مؤشر الأشعة فوق البنفسجية مرتفعًا جدًا قرب الظهيرة. قد يجعل الظل والوقاية من الشمس الوقت في الخارج أكثر راحة.',
        'تبلغ ذروة الأشعة فوق البنفسجية اليوم مستوى شديدًا. ابحث عن الظل واحمِ نفسك من الشمس في الخارج.'
      ],
      precip: [
        'لا يُتوقع هطول أمطار خلال الساعات القليلة المقبلة.',
        'قد تهطل الأمطار خلال الساعات القليلة المقبلة؛ وقد يفيد إبقاء مظلة في متناول اليد.',
        'يُرجّح هطول زخات خلال الساعات القليلة المقبلة، لذا قد تكون المظلة مفيدة.',
        'قد تتساقط الثلوج خلال الساعات القليلة المقبلة؛ تحقّق من التوقعات قبل الخروج.',
        'يُرجّح تساقط الثلوج خلال الساعات القليلة المقبلة. خصص وقتًا إضافيًا إذا كنت ستخرج.'
      ],
      aqiSensitive: 'غير صحي للفئات الحساسة'
    },
    he: {
      mode: ['אופק', 'השמיים שלי'], time: ['בוקר טוב', 'צהריים טובים', 'ערב טוב', 'לילה טוב'],
      horizon: ['{greeting}. אפשר לגלות מה מזג האוויר עושה ברחבי העולם.', '{greeting}. כדאי להכיר את מזג האוויר במקומות שונים בעולם.'],
      prompt: '{greeting} — בחירת עיר תציג את התחזית המקומית שלה.', checking: '{greeting} — התחזית של {place} נטענת כעת.',
      forecast: '{greeting} — {place}: {temp}, {condition}.',
      condition: ['בהיר', 'בהיר לרוב', 'מעונן חלקית', 'מעונן', 'ערפילי', 'טפטוף', 'גשום', 'מושלג', 'סוער'],
      uv: [
        'מדד הקרינה האולטרה־סגולה נמוך היום, ולכן החשיפה לשמש מתונה יותר עבור רוב האנשים.',
        'מדד הקרינה האולטרה־סגולה מגיע היום לרמה בינונית. צל והגנה מהשמש יכולים להפוך את השהייה בחוץ לנעימה יותר.',
        'מדד הקרינה האולטרה־סגולה מגיע היום לרמה גבוהה. צל והגנה מהשמש יכולים להפוך את השהייה בחוץ לנעימה יותר.',
        'מדד הקרינה האולטרה־סגולה גבוה מאוד סביב הצהריים. צל והגנה מהשמש יכולים להפוך את השהייה בחוץ לנעימה יותר.',
        'שיא הקרינה האולטרה־סגולה היום קיצוני. כדאי לחפש צל ולהגן על העור כשנמצאים בחוץ.'
      ],
      precip: [
        'לא צפויים משקעים בשעות הקרובות.',
        'ייתכן גשם בשעות הקרובות; כדאי לשמור מטרייה בהישג יד.',
        'ממטרים צפויים בשעות הקרובות, ולכן מטרייה עשויה לעזור.',
        'ייתכן שלג בשעות הקרובות; כדאי לבדוק את התחזית לפני שיוצאים.',
        'שלג צפוי בשעות הקרובות. אם יוצאים, כדאי להקצות זמן נוסף.'
      ],
      aqiSensitive: 'לא בריא לקבוצות רגישות'
    },
    hi: {
      mode: ['क्षितिज', 'मेरा आसमान'], time: ['सुप्रभात', 'नमस्कार', 'शुभ संध्या', 'शुभ रात्रि'],
      horizon: ['{greeting}। दुनिया भर के मौसम को जानें।', '{greeting}। दुनिया के अलग-अलग हिस्सों का मौसम देखें।'],
      prompt: '{greeting} — स्थानीय पूर्वानुमान देखने के लिए कोई शहर चुनें।', checking: '{greeting} — {place} का मौसम देखा जा रहा है।',
      forecast: '{greeting} — {place}: {temp}, {condition}।',
      condition: ['आसमान साफ़ है', 'आसमान ज़्यादातर साफ़ है', 'आंशिक रूप से बादल छाए हैं', 'घने बादल छाए हैं', 'कोहरा है', 'बूंदाबांदी हो रही है', 'बारिश हो रही है', 'बर्फ़बारी हो रही है', 'आंधी-तूफ़ान है'],
      uv: [
        'आज UV सूचकांक कम है, इसलिए ज़्यादातर लोगों के लिए धूप कम तेज़ है।',
        'आज UV अपने चरम पर मध्यम रहेगा। छाया और धूप से बचाव बाहर समय बिताना अधिक आरामदायक बना सकते हैं।',
        'आज UV का स्तर ऊँचा रहेगा। छाया और धूप से बचाव बाहर समय बिताना अधिक आरामदायक बना सकते हैं।',
        'दोपहर के आसपास UV बहुत ऊँचा रहेगा। छाया और धूप से बचाव बाहर समय बिताना अधिक आरामदायक बना सकते हैं।',
        'आज UV का अधिकतम स्तर अत्यधिक है। बाहर हों तो छाया लें और धूप से बचाव करें।'
      ],
      precip: [
        'अगले कुछ घंटों में बारिश की उम्मीद नहीं है।',
        'अगले कुछ घंटों में बारिश हो सकती है; छाता पास रखना मददगार हो सकता है।',
        'अगले कुछ घंटों में बौछारें पड़ने की संभावना है, इसलिए छाता काम आ सकता है।',
        'अगले कुछ घंटों में बर्फ़ गिर सकती है; बाहर निकलने से पहले पूर्वानुमान देखें।',
        'अगले कुछ घंटों में बर्फ़बारी की संभावना है। बाहर जाना हो तो थोड़ा अतिरिक्त समय रखें।'
      ],
      aqiSensitive: 'संवेदनशील समूहों के लिए अस्वास्थ्यकर'
    },
    th: {
      mode: ['ขอบฟ้า', 'ท้องฟ้าของฉัน'], time: ['อรุณสวัสดิ์', 'สวัสดีตอนบ่าย', 'สวัสดีตอนเย็น', 'ราตรีสวัสดิ์'],
      horizon: ['{greeting} ดูสภาพอากาศจากทั่วโลกได้ที่นี่', '{greeting} ออกสำรวจสภาพอากาศในหลายพื้นที่ทั่วโลก'],
      prompt: '{greeting} เลือกเมืองเพื่อดูพยากรณ์อากาศในพื้นที่', checking: '{greeting} กำลังตรวจสอบสภาพอากาศที่ {place}',
      forecast: '{greeting} — {place}: {temp}, {condition}',
      condition: ['ท้องฟ้าแจ่มใส', 'ท้องฟ้าแจ่มใสเป็นส่วนใหญ่', 'มีเมฆบางส่วน', 'มีเมฆมาก', 'มีหมอก', 'มีฝนปรอย', 'มีฝน', 'มีหิมะ', 'มีพายุ'],
      uv: [
        'ดัชนี UV อยู่ในระดับต่ำวันนี้ แสงแดดจึงไม่เข้มมากสำหรับคนส่วนใหญ่',
        'UV สูงสุดวันนี้อยู่ในระดับปานกลาง ร่มเงาและการป้องกันแสงแดดช่วยให้ทำกิจกรรมกลางแจ้งสบายขึ้นได้',
        'UV วันนี้อยู่ในระดับสูง ร่มเงาและการป้องกันแสงแดดช่วยให้ทำกิจกรรมกลางแจ้งสบายขึ้นได้',
        'UV สูงมากในช่วงเที่ยงวัน ร่มเงาและการป้องกันแสงแดดช่วยให้ทำกิจกรรมกลางแจ้งสบายขึ้นได้',
        'UV สูงสุดวันนี้อยู่ในระดับรุนแรง ควรอยู่ในร่มเงาและป้องกันแสงแดดเมื่ออยู่นอกบ้าน'
      ],
      precip: [
        'ไม่คาดว่าจะมีหยาดน้ำฟ้าในอีกไม่กี่ชั่วโมงข้างหน้า',
        'อาจมีฝนในอีกไม่กี่ชั่วโมง พกร่มไว้ใกล้ตัวอาจช่วยได้',
        'มีโอกาสเกิดฝนซู่ในอีกไม่กี่ชั่วโมง ร่มอาจเป็นประโยชน์',
        'อาจมีหิมะในอีกไม่กี่ชั่วโมง ตรวจสอบพยากรณ์ก่อนออกเดินทาง',
        'มีโอกาสสูงที่จะมีหิมะในอีกไม่กี่ชั่วโมง หากออกไปข้างนอกควรเผื่อเวลาเพิ่ม'
      ],
      aqiSensitive: 'ไม่ดีต่อสุขภาพสำหรับกลุ่มเสี่ยง'
    },
    vi: {
      mode: ['Chân trời', 'Bầu trời của tôi'], time: ['Chào buổi sáng', 'Chào buổi chiều', 'Chào buổi tối', 'Chúc ngủ ngon'],
      horizon: ['{greeting}. Khám phá thời tiết ở khắp nơi trên thế giới.', '{greeting}. Cùng xem thời tiết tại nhiều nơi trên thế giới.'],
      prompt: '{greeting} — hãy chọn một thành phố để xem dự báo tại đó.', checking: '{greeting} — đang kiểm tra thời tiết ở {place}.',
      forecast: '{greeting} — {temp}, {condition} tại {place}.',
      condition: ['trời quang', 'trời hầu như quang', 'trời có mây rải rác', 'trời nhiều mây', 'có sương mù', 'có mưa phùn', 'có mưa', 'có tuyết', 'có dông'],
      uv: [
        'Chỉ số UV hôm nay ở mức thấp, nên nắng ít gay gắt hơn với phần lớn mọi người.',
        'UV đạt mức vừa phải vào thời điểm cao nhất hôm nay. Bóng râm và biện pháp chống nắng có thể giúp thời gian ngoài trời dễ chịu hơn.',
        'UV hôm nay lên mức cao. Bóng râm và biện pháp chống nắng có thể giúp thời gian ngoài trời dễ chịu hơn.',
        'UV rất cao vào khoảng giữa trưa. Bóng râm và biện pháp chống nắng có thể giúp thời gian ngoài trời dễ chịu hơn.',
        'UV cao nhất hôm nay ở mức cực đoan. Hãy tìm bóng râm và bảo vệ da khi ở ngoài trời.'
      ],
      precip: [
        'Không dự kiến có mưa trong vài giờ tới.',
        'Có thể có mưa trong vài giờ tới; để sẵn ô bên cạnh có thể hữu ích.',
        'Khả năng có mưa rào trong vài giờ tới khá cao, nên mang theo ô.',
        'Có thể có tuyết trong vài giờ tới; hãy xem dự báo trước khi ra ngoài.',
        'Khả năng có tuyết trong vài giờ tới cao. Nếu ra ngoài, hãy dành thêm thời gian.'
      ],
      aqiSensitive: 'Không lành mạnh đối với nhóm nhạy cảm'
    },
    id: {
      mode: ['Cakrawala', 'Langit Saya'], time: ['Selamat pagi', 'Selamat siang', 'Selamat sore', 'Selamat malam'],
      horizon: ['{greeting}. Lihat cuaca di berbagai belahan dunia.', '{greeting}. Jelajahi cuaca di berbagai tempat di seluruh dunia.'],
      prompt: '{greeting} — pilih kota untuk melihat prakiraan cuaca setempat.', checking: '{greeting} — memeriksa cuaca di {place}.',
      forecast: '{greeting} — {temp} dan {condition} di {place}.',
      condition: ['cerah', 'umumnya cerah', 'berawan sebagian', 'mendung', 'berkabut', 'gerimis', 'hujan', 'bersalju', 'badai'],
      uv: [
        'Indeks UV rendah hari ini, jadi paparan matahari tidak terlalu intens bagi kebanyakan orang.',
        'Puncak UV hari ini berada pada tingkat sedang. Berteduh dan memakai pelindung matahari dapat membuat kegiatan di luar lebih nyaman.',
        'UV mencapai tingkat tinggi hari ini. Berteduh dan memakai pelindung matahari dapat membuat kegiatan di luar lebih nyaman.',
        'UV sangat tinggi menjelang tengah hari. Berteduh dan memakai pelindung matahari dapat membuat kegiatan di luar lebih nyaman.',
        'Puncak UV hari ini ekstrem. Carilah tempat teduh dan lindungi diri dari matahari saat berada di luar.'
      ],
      precip: [
        'Tidak diperkirakan ada hujan dalam beberapa jam ke depan.',
        'Hujan mungkin turun dalam beberapa jam ke depan; menyiapkan payung bisa membantu.',
        'Hujan deras sesaat kemungkinan turun dalam beberapa jam ke depan, jadi payung mungkin berguna.',
        'Salju mungkin turun dalam beberapa jam ke depan; periksa prakiraan sebelum berangkat.',
        'Salju kemungkinan turun dalam beberapa jam ke depan. Luangkan waktu ekstra jika akan bepergian.'
      ],
      aqiSensitive: 'Tidak sehat bagi kelompok sensitif'
    },
    ja: {
      mode: ['地平線', '私の空'], time: ['おはようございます', 'こんにちは', 'こんばんは', 'おやすみなさい'],
      horizon: ['{greeting}。世界各地の天気を見てみましょう。', '{greeting}。世界のさまざまな場所の天気を探してみましょう。'],
      prompt: '{greeting}。都市を選ぶと、その場所の天気予報を確認できます。', checking: '{greeting}。{place}の天気を確認しています。',
      forecast: '{greeting}。{place}は{temp}、{condition}です。',
      condition: ['晴れ', 'おおむね晴れ', 'ところにより曇り', '曇り', '霧', '霧雨', '雨', '雪', '雷雨'],
      uv: [
        '今日はUV指数が低く、ほとんどの人にとって日差しの強さは控えめです。',
        '今日のUV指数はピーク時でも中程度です。日陰や日焼け対策で、屋外でも過ごしやすくなります。',
        '今日はUV指数が高くなります。日陰や日焼け対策で、屋外でも過ごしやすくなります。',
        '正午ごろはUV指数が非常に高くなります。日陰や日焼け対策で、屋外でも過ごしやすくなります。',
        '今日のUV指数は極端に高くなります。屋外では日陰に入り、日焼け対策をしてください。'
      ],
      precip: [
        '今後数時間、降水は予想されていません。',
        '今後数時間は雨の可能性があります。傘を手元に置いておくと安心です。',
        '今後数時間はにわか雨が予想されます。傘があると役立ちそうです。',
        '今後数時間は雪の可能性があります。出かける前に予報を確認してください。',
        '今後数時間は雪が予想されます。外出する場合は時間に余裕を持ちましょう。'
      ],
      aqiSensitive: '敏感な人には健康に良くない'
    },
    ko: {
      mode: ['지평선', '나의 하늘'], time: ['좋은 아침이에요', '좋은 오후예요', '좋은 저녁이에요', '안녕히 주무세요'],
      horizon: ['{greeting}. 세계 곳곳의 날씨를 살펴보세요.', '{greeting}. 세계 여러 지역의 날씨를 둘러보세요.'],
      prompt: '{greeting} — 도시를 선택하면 현지 예보를 볼 수 있어요.', checking: '{greeting} — {place}의 날씨를 확인하고 있어요.',
      forecast: '{greeting} — {place}: {temp}, {condition}.',
      condition: ['맑음', '대체로 맑음', '구름 조금', '흐림', '안개', '이슬비', '비', '눈', '뇌우'],
      uv: [
        '오늘 자외선 지수는 낮아 대부분의 사람에게 햇빛이 강하지 않습니다.',
        '오늘 자외선 지수는 최고 수준에서도 보통입니다. 그늘과 자외선 차단으로 야외 활동을 더 편하게 즐길 수 있어요.',
        '오늘 자외선 지수가 높습니다. 그늘과 자외선 차단으로 야외 활동을 더 편하게 즐길 수 있어요.',
        '한낮 무렵 자외선 지수가 매우 높습니다. 그늘과 자외선 차단으로 야외 활동을 더 편하게 즐길 수 있어요.',
        '오늘 자외선 지수 최고치는 매우 위험한 수준입니다. 야외에서는 그늘을 찾고 햇빛을 차단하세요.'
      ],
      precip: [
        '앞으로 몇 시간 동안 강수는 예상되지 않습니다.',
        '앞으로 몇 시간 안에 비가 올 수 있어요. 우산을 가까이 두면 도움이 됩니다.',
        '앞으로 몇 시간 안에 소나기가 올 가능성이 높아 우산이 유용할 수 있어요.',
        '앞으로 몇 시간 안에 눈이 올 수 있어요. 외출 전에 예보를 확인하세요.',
        '앞으로 몇 시간 안에 눈이 올 가능성이 높습니다. 외출한다면 시간을 조금 더 여유롭게 잡으세요.'
      ],
      aqiSensitive: '민감군에 건강에 해로움'
    },
    zh: {
      mode: ['地平线', '我的天空'], time: ['早上好', '下午好', '晚上好', '晚安'],
      horizon: ['{greeting}。看看世界各地的天气。', '{greeting}。探索世界各地的天气变化。'],
      prompt: '{greeting}。选择一座城市，查看当地天气预报。', checking: '{greeting}，正在查询{place}的天气。',
      forecast: '{greeting}，{place}现在{temp}，{condition}。',
      condition: ['晴朗', '大致晴朗', '局部多云', '阴天', '有雾', '毛毛雨', '有雨', '有雪', '有雷暴'],
      uv: [
        '今天紫外线指数较低，对大多数人来说，阳光照射不算强烈。',
        '今天紫外线峰值处于中等水平。遮阴和防晒能让户外活动更舒适。',
        '今天紫外线指数较高。遮阴和防晒能让户外活动更舒适。',
        '中午前后紫外线指数很高。遮阴和防晒能让户外活动更舒适。',
        '今天紫外线峰值极高。户外活动时请尽量待在阴凉处并做好防晒。'
      ],
      precip: [
        '未来几小时预计没有降水。',
        '未来几小时可能下雨，带把伞会更方便。',
        '未来几小时可能有阵雨，带把伞或许用得上。',
        '未来几小时可能下雪，出门前可以查看天气预报。',
        '未来几小时很可能下雪，出门时不妨预留更多时间。'
      ],
      aqiSensitive: '对敏感人群不健康'
    },
    'zh-TW': {
      mode: ['地平線', '我的天空'], time: ['早安', '午安', '晚安', '晚安'],
      horizon: ['{greeting}。看看世界各地的天氣。', '{greeting}。探索世界各地的天氣變化。'],
      prompt: '{greeting}。選擇一座城市，查看當地天氣預報。', checking: '{greeting}，正在查詢{place}的天氣。',
      forecast: '{greeting}，{place}現在{temp}，{condition}。',
      condition: ['晴朗', '大致晴朗', '局部多雲', '陰天', '有霧', '毛毛雨', '有雨', '有雪', '有雷雨'],
      uv: [
        '今天紫外線指數偏低，對大多數人來說，陽光照射不算強烈。',
        '今天紫外線最高時為中等。遮蔭和防曬能讓戶外活動更舒適。',
        '今天紫外線指數偏高。遮蔭和防曬能讓戶外活動更舒適。',
        '中午前後紫外線指數很高。遮蔭和防曬能讓戶外活動更舒適。',
        '今天紫外線最高值極高。戶外活動時請盡量待在陰涼處並做好防曬。'
      ],
      precip: [
        '未來幾小時預計沒有降水。',
        '未來幾小時可能下雨，帶把傘會比較方便。',
        '未來幾小時可能有陣雨，帶把傘或許派得上用場。',
        '未來幾小時可能下雪，出門前可以查看天氣預報。',
        '未來幾小時很可能下雪，出門時不妨預留更多時間。'
      ],
      aqiSensitive: '對敏感族群不健康'
    }
  };

  var localeCodes = global.DUSKLINE_LANG_CODES || [];
  var conditionNames = ['clear', 'mostlyClear', 'partlyCloudy', 'overcast', 'fog', 'drizzle', 'rain', 'snow', 'thunderstorms'];
  var uvNames = ['low', 'moderate', 'high', 'veryHigh', 'extreme'];
  var precipNames = ['none', 'rainPossible', 'rainLikely', 'snowPossible', 'snowLikely'];
  var S = {};
  Object.keys(D).forEach(function (code) {
    var row = D[code];
    function put(key, value) {
      S[key] = S[key] || {};
      S[key][code] = value;
    }
    put('weather.mode.horizon', row.mode[0]);
    put('weather.mode.mySky', row.mode[1]);
    ['morning', 'afternoon', 'evening', 'night'].forEach(function (period, i) {
      put('weather.greeting.' + period, row.time[i]);
    });
    put('weather.greeting.horizonA', row.horizon[0]);
    put('weather.greeting.horizonB', row.horizon[1]);
    put('weather.greeting.mySkyPrompt', row.prompt);
    put('weather.greeting.mySkyChecking', row.checking);
    put('weather.greeting.mySkyForecast', row.forecast);
    conditionNames.forEach(function (name, i) { put('weather.greeting.condition.' + name, row.condition[i]); });
    uvNames.forEach(function (name, i) { put('weather.context.uv.' + name, row.uv[i]); });
    precipNames.forEach(function (name, i) { put('weather.context.precip.' + name, row.precip[i]); });
    put('weather.aqiUnhealthySG', row.aqiSensitive);
  });

  global.I18N = global.I18N || {};
  localeCodes.forEach(function (code) {
    global.I18N[code] = Object.assign({}, global.I18N[code] || {});
    Object.keys(S).forEach(function (key) {
      var row = S[key];
      if (row[code] || row.en) global.I18N[code][key] = row[code] || row.en;
    });
  });
})(window);
