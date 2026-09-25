'use strict';
/* U.S. AQI descriptions follow the supplied six-band table, localized for every picker language. */
(function (global) {
  var locales = global.DUSKLINE_LANG_CODES || [];
  var S = {
    'weather.aqiDescGood': {
      en: 'Air quality is satisfactory, and air pollution poses little or no risk.',
      es: 'La calidad del aire es satisfactoria y la contaminación atmosférica supone poco o ningún riesgo.',
      fr: 'La qualité de l’air est satisfaisante et la pollution atmosphérique présente peu ou pas de risque.',
      de: 'Die Luftqualität ist zufriedenstellend; die Luftverschmutzung birgt kaum oder kein Risiko.',
      it: 'La qualità dell’aria è soddisfacente e l’inquinamento atmosferico comporta rischi minimi o nulli.',
      'pt-BR': 'A qualidade do ar é satisfatória, e a poluição do ar representa pouco ou nenhum risco.',
      'pt-PT': 'A qualidade do ar é satisfatória e a poluição atmosférica representa pouco ou nenhum risco.',
      nl: 'De luchtkwaliteit is goed; luchtvervuiling vormt weinig tot geen risico.',
      da: 'Luftkvaliteten er tilfredsstillende, og luftforurening udgør kun en lille eller ingen risiko.',
      sv: 'Luftkvaliteten är tillfredsställande och luftföroreningarna innebär liten eller ingen risk.',
      nb: 'Luftkvaliteten er tilfredsstillende, og luftforurensning utgjør liten eller ingen risiko.',
      fi: 'Ilmanlaatu on tyydyttävä, ja ilmansaasteista aiheutuu vain vähän tai ei lainkaan riskiä.',
      pl: 'Jakość powietrza jest zadowalająca, a zanieczyszczenie powietrza wiąże się z niewielkim ryzykiem lub nie wiąże się z nim wcale.',
      cs: 'Kvalita ovzduší je uspokojivá a znečištění ovzduší představuje malé nebo žádné riziko.',
      hu: 'A levegő minősége kielégítő, a légszennyezés pedig alig vagy egyáltalán nem jelent kockázatot.',
      ro: 'Calitatea aerului este satisfăcătoare, iar poluarea prezintă un risc redus sau inexistent.',
      el: 'Η ποιότητα του αέρα είναι ικανοποιητική και η ατμοσφαιρική ρύπανση ενέχει μικρό ή μηδενικό κίνδυνο.',
      tr: 'Hava kalitesi tatmin edici düzeydedir; hava kirliliği çok az risk oluşturur ya da hiç oluşturmaz.',
      ru: 'Качество воздуха удовлетворительное, а загрязнение воздуха несёт незначительный риск или не несёт его вовсе.',
      uk: 'Якість повітря задовільна, а забруднення повітря становить незначний ризик або не становить його зовсім.',
      ar: 'جودة الهواء مُرضية، ولا يشكّل تلوث الهواء خطراً يُذكر أو لا يشكّل أي خطر.',
      he: 'איכות האוויר משביעת רצון, וזיהום האוויר מציב סיכון מועט או שאינו מציב סיכון כלל.',
      hi: 'वायु गुणवत्ता संतोषजनक है और वायु प्रदूषण से बहुत कम या कोई जोखिम नहीं है।',
      th: 'คุณภาพอากาศอยู่ในเกณฑ์น่าพอใจ มลพิษทางอากาศมีความเสี่ยงน้อยมากหรือไม่มีเลย',
      vi: 'Chất lượng không khí ở mức đạt yêu cầu; ô nhiễm không khí gây ít hoặc không gây rủi ro.',
      id: 'Kualitas udara memuaskan, dan polusi udara hanya menimbulkan sedikit atau tanpa risiko.',
      ja: '空気の質は良好です。大気汚染によるリスクはほとんど、またはまったくありません。',
      ko: '대기질은 만족스러운 수준이며, 대기 오염으로 인한 위험은 거의 없거나 없습니다.',
      zh: '空气质量令人满意，空气污染几乎不会造成健康风险。',
      'zh-TW': '空氣品質令人滿意，空氣污染幾乎不會造成健康風險。'
    },
    'weather.aqiDescModerate': {
      en: 'Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.',
      es: 'La calidad del aire es aceptable. Sin embargo, algunas personas pueden correr cierto riesgo, en particular quienes son inusualmente sensibles a la contaminación atmosférica.',
      fr: 'La qualité de l’air est acceptable. Certaines personnes peuvent toutefois être exposées à un risque, en particulier celles qui sont particulièrement sensibles à la pollution atmosphérique.',
      de: 'Die Luftqualität ist akzeptabel. Für manche Menschen kann jedoch ein Risiko bestehen, besonders für Menschen mit ungewöhnlicher Empfindlichkeit gegenüber Luftverschmutzung.',
      it: 'La qualità dell’aria è accettabile. Tuttavia, può esserci un rischio per alcune persone, soprattutto per chi è insolitamente sensibile all’inquinamento atmosferico.',
      'pt-BR': 'A qualidade do ar é aceitável. Ainda assim, pode haver risco para algumas pessoas, especialmente para quem tem sensibilidade incomum à poluição do ar.',
      'pt-PT': 'A qualidade do ar é aceitável. Ainda assim, pode haver risco para algumas pessoas, sobretudo para quem tem sensibilidade invulgar à poluição atmosférica.',
      nl: 'De luchtkwaliteit is aanvaardbaar. Toch kan er risico zijn voor sommige mensen, vooral voor mensen die ongewoon gevoelig zijn voor luchtvervuiling.',
      da: 'Luftkvaliteten er acceptabel. Nogle kan dog være i risiko, især personer, der er usædvanligt følsomme over for luftforurening.',
      sv: 'Luftkvaliteten är acceptabel. Vissa kan ändå vara i riskzonen, särskilt personer som är ovanligt känsliga för luftföroreningar.',
      nb: 'Luftkvaliteten er akseptabel. Noen kan likevel være utsatt, særlig personer som er uvanlig følsomme for luftforurensning.',
      fi: 'Ilmanlaatu on hyväksyttävä. Joillekin ihmisille voi silti aiheutua riskiä, etenkin niille, jotka ovat poikkeuksellisen herkkiä ilmansaasteille.',
      pl: 'Jakość powietrza jest akceptowalna. Niektóre osoby mogą jednak być narażone, zwłaszcza te o wyjątkowej wrażliwości na zanieczyszczenie powietrza.',
      cs: 'Kvalita ovzduší je přijatelná. Některým lidem však může hrozit riziko, zejména těm, kteří jsou na znečištění ovzduší neobvykle citliví.',
      hu: 'A levegő minősége elfogadható. Egyeseknél azonban fennállhat kockázat, különösen azoknál, akik szokatlanul érzékenyek a légszennyezésre.',
      ro: 'Calitatea aerului este acceptabilă. Totuși, unele persoane pot fi expuse unui risc, mai ales cele neobișnuit de sensibile la poluarea aerului.',
      el: 'Η ποιότητα του αέρα είναι αποδεκτή. Ωστόσο, ορισμένα άτομα μπορεί να διατρέχουν κίνδυνο, ιδίως όσα είναι ασυνήθιστα ευαίσθητα στην ατμοσφαιρική ρύπανση.',
      tr: 'Hava kalitesi kabul edilebilir düzeydedir. Ancak özellikle hava kirliliğine alışılmadık ölçüde duyarlı kişiler için risk söz konusu olabilir.',
      ru: 'Качество воздуха приемлемое. Однако для некоторых людей может существовать риск, особенно для тех, кто необычно чувствителен к загрязнению воздуха.',
      uk: 'Якість повітря прийнятна. Проте для деяких людей може існувати ризик, особливо для тих, хто незвично чутливий до забруднення повітря.',
      ar: 'جودة الهواء مقبولة. ومع ذلك، قد يواجه بعض الأشخاص خطراً، ولا سيما من لديهم حساسية غير معتادة تجاه تلوث الهواء.',
      he: 'איכות האוויר מקובלת. עם זאת, ייתכן סיכון לחלק מהאנשים, במיוחד למי שרגישים במיוחד לזיהום אוויר.',
      hi: 'वायु गुणवत्ता स्वीकार्य है। फिर भी कुछ लोगों को जोखिम हो सकता है, खासकर वे जो वायु प्रदूषण के प्रति असामान्य रूप से संवेदनशील हैं।',
      th: 'คุณภาพอากาศอยู่ในระดับที่ยอมรับได้ อย่างไรก็ตาม บางคนอาจมีความเสี่ยง โดยเฉพาะผู้ที่ไวต่อมลพิษทางอากาศเป็นพิเศษ',
      vi: 'Chất lượng không khí ở mức chấp nhận được. Tuy nhiên, một số người có thể gặp rủi ro, đặc biệt là người nhạy cảm bất thường với ô nhiễm không khí.',
      id: 'Kualitas udara masih dapat diterima. Namun, sebagian orang mungkin berisiko, terutama mereka yang sangat sensitif terhadap polusi udara.',
      ja: '空気の質は許容範囲です。ただし、大気汚染に特に敏感な人など、一部の人には影響が出る可能性があります。',
      ko: '대기질은 허용 가능한 수준입니다. 다만 대기 오염에 유난히 민감한 사람 등 일부에게는 위험이 있을 수 있습니다.',
      zh: '空气质量可以接受。不过，部分人群可能面临风险，尤其是对空气污染异常敏感的人。',
      'zh-TW': '空氣品質可以接受。不過，部分族群可能面臨風險，尤其是對空氣污染異常敏感的人。'
    },
    'weather.aqiDescUnhealthySG': {
      en: 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.',
      es: 'Las personas de grupos sensibles pueden sufrir efectos en la salud. Es menos probable que la población general se vea afectada.',
      fr: 'Les personnes appartenant à des groupes sensibles peuvent ressentir des effets sur leur santé. La population générale est moins susceptible d’être touchée.',
      de: 'Angehörige empfindlicher Gruppen können gesundheitliche Auswirkungen bemerken. Die Allgemeinbevölkerung ist wahrscheinlich weniger betroffen.',
      it: 'Le persone appartenenti a gruppi sensibili possono avvertire effetti sulla salute. È meno probabile che la popolazione generale ne risenta.',
      'pt-BR': 'Pessoas de grupos sensíveis podem apresentar efeitos à saúde. É menos provável que a população em geral seja afetada.',
      'pt-PT': 'Pessoas pertencentes a grupos sensíveis podem sentir efeitos na saúde. É menos provável que a população em geral seja afetada.',
      nl: 'Mensen uit gevoelige groepen kunnen gezondheidseffecten ervaren. De algemene bevolking wordt waarschijnlijk minder snel getroffen.',
      da: 'Personer i følsomme grupper kan opleve helbredspåvirkninger. Den øvrige befolkning påvirkes sandsynligvis i mindre grad.',
      sv: 'Personer i känsliga grupper kan få hälsoeffekter. Övriga befolkningen påverkas troligen i mindre utsträckning.',
      nb: 'Personer i følsomme grupper kan oppleve helseeffekter. Det er mindre sannsynlig at befolkningen ellers blir påvirket.',
      fi: 'Herkkiin ryhmiin kuuluvilla voi ilmetä terveysvaikutuksia. Muu väestö kärsii niistä epätodennäköisemmin.',
      pl: 'Osoby z grup wrażliwych mogą odczuwać skutki zdrowotne. Wpływ na ogół społeczeństwa jest mniej prawdopodobny.',
      cs: 'U citlivých skupin se mohou projevit zdravotní účinky. U ostatních lidí je méně pravděpodobné, že budou zasaženi.',
      hu: 'Az érzékeny csoportok tagjainál egészségügyi hatások jelentkezhetnek. A lakosság többi részét kisebb valószínűséggel érinti.',
      ro: 'Persoanele din grupurile sensibile pot resimți efecte asupra sănătății. Este mai puțin probabil ca restul populației să fie afectat.',
      el: 'Τα άτομα των ευαίσθητων ομάδων μπορεί να παρουσιάσουν επιπτώσεις στην υγεία. Είναι λιγότερο πιθανό να επηρεαστεί ο γενικός πληθυσμός.',
      tr: 'Hassas gruplardaki kişiler sağlık etkileri yaşayabilir. Genel nüfusun etkilenme olasılığı daha düşüktür.',
      ru: 'У людей из чувствительных групп могут возникнуть последствия для здоровья. Вероятность воздействия на остальное население ниже.',
      uk: 'У людей із чутливих груп можуть виникнути наслідки для здоров’я. Імовірність впливу на решту населення нижча.',
      ar: 'قد تظهر آثار صحية على أفراد الفئات الحساسة، بينما يُرجّح أن يكون تأثر عامة الناس أقل.',
      he: 'אנשים בקבוצות רגישות עלולים לחוות השפעות בריאותיות. סביר שהציבור הרחב יושפע פחות.',
      hi: 'संवेदनशील समूहों के लोगों पर स्वास्थ्य प्रभाव पड़ सकते हैं। आम जनता के प्रभावित होने की संभावना कम है।',
      th: 'ผู้ที่อยู่ในกลุ่มอ่อนไหวอาจได้รับผลกระทบต่อสุขภาพ ส่วนประชาชนทั่วไปมีแนวโน้มได้รับผลกระทบน้อยกว่า',
      vi: 'Người thuộc nhóm nhạy cảm có thể gặp ảnh hưởng sức khỏe. Công chúng nói chung ít có khả năng bị ảnh hưởng hơn.',
      id: 'Anggota kelompok sensitif dapat mengalami dampak kesehatan. Masyarakat umum cenderung lebih kecil kemungkinannya terdampak.',
      ja: '影響を受けやすい人には健康への影響が出る可能性があります。一般の人が影響を受ける可能性は比較的低いでしょう。',
      ko: '민감군은 건강 영향을 경험할 수 있습니다. 일반 대중은 영향을 받을 가능성이 상대적으로 낮습니다.',
      zh: '敏感人群可能会受到健康影响，普通公众受影响的可能性较低。',
      'zh-TW': '敏感族群可能會受到健康影響，一般大眾受影響的可能性較低。'
    },
    'weather.aqiDescUnhealthy': {
      en: 'Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects.',
      es: 'Algunas personas de la población general pueden sufrir efectos en la salud; las personas de grupos sensibles pueden sufrir efectos más graves.',
      fr: 'Certaines personnes de la population générale peuvent ressentir des effets sur leur santé ; ces effets peuvent être plus graves chez les personnes appartenant à des groupes sensibles.',
      de: 'Bei manchen Menschen in der Allgemeinbevölkerung können gesundheitliche Auswirkungen auftreten; bei empfindlichen Gruppen können sie schwerwiegender sein.',
      it: 'Alcune persone della popolazione generale possono avvertire effetti sulla salute; per i gruppi sensibili gli effetti possono essere più gravi.',
      'pt-BR': 'Algumas pessoas da população em geral podem apresentar efeitos à saúde; em grupos sensíveis, esses efeitos podem ser mais graves.',
      'pt-PT': 'Algumas pessoas da população em geral podem sentir efeitos na saúde; nas pessoas de grupos sensíveis, esses efeitos podem ser mais graves.',
      nl: 'Sommige mensen uit de algemene bevolking kunnen gezondheidseffecten ervaren; bij gevoelige groepen kunnen die ernstiger zijn.',
      da: 'Nogle i den øvrige befolkning kan opleve helbredspåvirkninger; personer i følsomme grupper kan opleve mere alvorlige påvirkninger.',
      sv: 'Vissa i den övriga befolkningen kan få hälsoeffekter; personer i känsliga grupper kan få allvarligare effekter.',
      nb: 'Noen i befolkningen ellers kan oppleve helseeffekter. Personer i følsomme grupper kan få mer alvorlige effekter.',
      fi: 'Osalla väestöstä voi ilmetä terveysvaikutuksia; herkkiin ryhmiin kuuluvilla ne voivat olla vakavampia.',
      pl: 'U części społeczeństwa mogą wystąpić skutki zdrowotne; u osób z grup wrażliwych mogą być poważniejsze.',
      cs: 'U některých lidí z běžné populace se mohou projevit zdravotní účinky; u citlivých skupin mohou být závažnější.',
      hu: 'A lakosság egyes tagjainál egészségügyi hatások jelentkezhetnek; az érzékeny csoportoknál ezek súlyosabbak lehetnek.',
      ro: 'Unele persoane din populația generală pot resimți efecte asupra sănătății; pentru grupurile sensibile, efectele pot fi mai grave.',
      el: 'Ορισμένα άτομα του γενικού πληθυσμού μπορεί να παρουσιάσουν επιπτώσεις στην υγεία· στα άτομα των ευαίσθητων ομάδων οι επιπτώσεις μπορεί να είναι σοβαρότερες.',
      tr: 'Genel nüfustan bazı kişiler sağlık etkileri yaşayabilir; hassas gruplardaki kişilerde etkiler daha ciddi olabilir.',
      ru: 'У некоторых людей из общей популяции могут возникнуть последствия для здоровья; у чувствительных групп они могут быть серьёзнее.',
      uk: 'У деяких людей із загальної популяції можуть виникнути наслідки для здоров’я; у чутливих груп вони можуть бути серйознішими.',
      ar: 'قد تظهر آثار صحية على بعض أفراد عامة الناس، وقد تكون هذه الآثار أشد لدى أفراد الفئات الحساسة.',
      he: 'חלק מהציבור הרחב עלולים לחוות השפעות בריאותיות; אצל אנשים בקבוצות רגישות ההשפעות עלולות להיות חמורות יותר.',
      hi: 'आम जनता के कुछ लोगों पर स्वास्थ्य प्रभाव पड़ सकते हैं; संवेदनशील समूहों पर ये प्रभाव अधिक गंभीर हो सकते हैं।',
      th: 'ประชาชนทั่วไปบางคนอาจได้รับผลกระทบต่อสุขภาพ ส่วนผู้ที่อยู่ในกลุ่มอ่อนไหวอาจได้รับผลกระทบรุนแรงกว่า',
      vi: 'Một số người trong cộng đồng có thể gặp ảnh hưởng sức khỏe; người thuộc nhóm nhạy cảm có thể gặp ảnh hưởng nghiêm trọng hơn.',
      id: 'Sebagian masyarakat umum dapat mengalami dampak kesehatan; anggota kelompok sensitif dapat mengalami dampak yang lebih serius.',
      ja: '一般の人にも健康への影響が出る可能性があり、影響を受けやすい人にはさらに深刻な影響が出ることがあります。',
      ko: '일반 대중 중 일부는 건강 영향을 경험할 수 있으며, 민감군은 더 심각한 영향을 받을 수 있습니다.',
      zh: '部分普通公众可能会受到健康影响；敏感人群可能会受到更严重的影响。',
      'zh-TW': '部分一般大眾可能會受到健康影響；敏感族群可能會受到更嚴重的影響。'
    },
    'weather.aqiDescVeryUnhealthy': {
      en: 'Health alert: The risk of health effects is increased for everyone.',
      es: 'Alerta sanitaria: aumenta el riesgo de efectos en la salud para todas las personas.',
      fr: 'Alerte sanitaire : le risque d’effets sur la santé augmente pour tout le monde.',
      de: 'Gesundheitswarnung: Für alle steigt das Risiko gesundheitlicher Auswirkungen.',
      it: 'Allerta sanitaria: aumenta per tutti il rischio di effetti sulla salute.',
      'pt-BR': 'Alerta de saúde: o risco de efeitos à saúde aumenta para todos.',
      'pt-PT': 'Alerta de saúde: o risco de efeitos na saúde aumenta para todos.',
      nl: 'Gezondheidswaarschuwing: voor iedereen neemt het risico op gezondheidseffecten toe.',
      da: 'Sundhedsadvarsel: Risikoen for helbredspåvirkninger er forhøjet for alle.',
      sv: 'Hälsovarning: risken för hälsoeffekter är förhöjd för alla.',
      nb: 'Helsevarsel: Risikoen for helseeffekter er økt for alle.',
      fi: 'Terveysvaroitus: terveysvaikutusten riski on suurentunut kaikilla.',
      pl: 'Ostrzeżenie zdrowotne: u wszystkich wzrasta ryzyko skutków zdrowotnych.',
      cs: 'Zdravotní výstraha: riziko zdravotních účinků je zvýšené pro všechny.',
      hu: 'Egészségügyi riasztás: mindenkinél megnő az egészségügyi hatások kockázata.',
      ro: 'Alertă de sănătate: riscul efectelor asupra sănătății crește pentru toată lumea.',
      el: 'Υγειονομικός συναγερμός: ο κίνδυνος επιπτώσεων στην υγεία αυξάνεται για όλους.',
      tr: 'Sağlık uyarısı: Sağlık etkileri riski herkes için artmıştır.',
      ru: 'Предупреждение о вреде для здоровья: риск последствий для здоровья повышен для всех.',
      uk: 'Попередження про загрозу здоров’ю: для всіх зростає ризик наслідків для здоров’я.',
      ar: 'تنبيه صحي: يزداد خطر الآثار الصحية على الجميع.',
      he: 'התראת בריאות: הסיכון להשפעות בריאותיות עולה עבור כולם.',
      hi: 'स्वास्थ्य चेतावनी: सभी के लिए स्वास्थ्य प्रभावों का जोखिम बढ़ा हुआ है।',
      th: 'แจ้งเตือนด้านสุขภาพ: ความเสี่ยงต่อผลกระทบต่อสุขภาพเพิ่มขึ้นสำหรับทุกคน',
      vi: 'Cảnh báo sức khỏe: nguy cơ ảnh hưởng đến sức khỏe tăng lên đối với tất cả mọi người.',
      id: 'Peringatan kesehatan: risiko dampak kesehatan meningkat bagi semua orang.',
      ja: '健康に関する警報：すべての人で健康への影響のリスクが高まっています。',
      ko: '건강 경보: 모든 사람의 건강 영향 위험이 높아집니다.',
      zh: '健康警报：所有人受到健康影响的风险均有所增加。',
      'zh-TW': '健康警報：所有人受到健康影響的風險都會增加。'
    },
    'weather.aqiDescHazardous': {
      en: 'Health warning of emergency conditions: everyone is more likely to be affected.',
      es: 'Aviso sanitario por condiciones de emergencia: es más probable que todas las personas se vean afectadas.',
      fr: 'Avertissement sanitaire en situation d’urgence : tout le monde est plus susceptible d’être touché.',
      de: 'Gesundheitswarnung bei Notfallbedingungen: Für alle ist eine Betroffenheit wahrscheinlicher.',
      it: 'Avviso sanitario per condizioni di emergenza: è più probabile che tutti ne risentano.',
      'pt-BR': 'Alerta de saúde para condições de emergência: é mais provável que todos sejam afetados.',
      'pt-PT': 'Aviso de saúde para condições de emergência: é mais provável que todos sejam afetados.',
      nl: 'Gezondheidswaarschuwing bij noodsituaties: iedereen loopt meer kans om gevolgen te ondervinden.',
      da: 'Sundhedsadvarsel om nødsituation: Alle har større risiko for at blive påvirket.',
      sv: 'Hälsovarning vid nödläge: alla löper större risk att påverkas.',
      nb: 'Helsevarsel ved nødsituasjon: Alle har større sannsynlighet for å bli påvirket.',
      fi: 'Terveysvaroitus hätätilanteesta: vaikutukset kohdistuvat todennäköisemmin kaikkiin.',
      pl: 'Ostrzeżenie zdrowotne o stanie zagrożenia: prawdopodobieństwo wpływu na każdego jest większe.',
      cs: 'Zdravotní varování před mimořádnou situací: pravděpodobnost dopadu na každého je vyšší.',
      hu: 'Egészségügyi figyelmeztetés veszélyhelyzetre: nagyobb valószínűséggel mindenkit érint a hatás.',
      ro: 'Avertizare de sănătate pentru condiții de urgență: este mai probabil ca toată lumea să fie afectată.',
      el: 'Υγειονομική προειδοποίηση για κατάσταση έκτακτης ανάγκης: είναι πιθανότερο να επηρεαστούν όλοι.',
      tr: 'Acil durum koşulları için sağlık uyarısı: herkesin etkilenme olasılığı daha yüksektir.',
      ru: 'Предупреждение о чрезвычайной ситуации: вероятность последствий для каждого повышена.',
      uk: 'Попередження про надзвичайні умови: імовірність впливу на кожного зростає.',
      ar: 'تحذير صحي من ظروف طارئة: تزداد احتمالية تأثر الجميع.',
      he: 'אזהרת בריאות על תנאי חירום: הסבירות שכולם יושפעו גבוהה יותר.',
      hi: 'आपातकालीन स्थिति की स्वास्थ्य चेतावनी: सभी के प्रभावित होने की संभावना अधिक है।',
      th: 'คำเตือนด้านสุขภาพในภาวะฉุกเฉิน: ทุกคนมีแนวโน้มได้รับผลกระทบมากขึ้น',
      vi: 'Cảnh báo sức khỏe về tình trạng khẩn cấp: mọi người đều có khả năng bị ảnh hưởng cao hơn.',
      id: 'Peringatan kesehatan untuk kondisi darurat: semua orang lebih mungkin terdampak.',
      ja: '緊急事態に関する健康警告：誰もが影響を受ける可能性が高くなっています。',
      ko: '비상 상황에 대한 건강 경고: 모든 사람이 영향을 받을 가능성이 더 높습니다.',
      zh: '紧急状况健康警告：所有人受到影响的可能性都更高。',
      'zh-TW': '緊急狀況健康警告：所有人受到影響的可能性都更高。'
    },
    'weather.aqiGreetingGood': {
      en: 'Air quality is good, with little health risk.', es: 'La calidad del aire es buena y supone poco riesgo para la salud.', fr: 'La qualité de l’air est bonne et présente peu de risques pour la santé.', de: 'Die Luftqualität ist gut; das Gesundheitsrisiko ist gering.', it: 'La qualità dell’aria è buona e comporta pochi rischi per la salute.',
      'pt-BR': 'A qualidade do ar é boa, com pouco risco à saúde.', 'pt-PT': 'A qualidade do ar é boa, com pouco risco para a saúde.', nl: 'De luchtkwaliteit is goed en vormt weinig gezondheidsrisico.', da: 'Luftkvaliteten er god og udgør kun en lille sundhedsrisiko.', sv: 'Luftkvaliteten är god och innebär liten hälsorisk.',
      nb: 'Luftkvaliteten er god og innebærer liten helserisiko.', fi: 'Ilmanlaatu on hyvä ja terveysriski on pieni.', pl: 'Jakość powietrza jest dobra i wiąże się z niewielkim ryzykiem dla zdrowia.', cs: 'Kvalita ovzduší je dobrá a zdravotní riziko je nízké.', hu: 'A levegő minősége jó, az egészségügyi kockázat alacsony.',
      ro: 'Calitatea aerului este bună, cu un risc redus pentru sănătate.', el: 'Η ποιότητα του αέρα είναι καλή και ο κίνδυνος για την υγεία είναι μικρός.', tr: 'Hava kalitesi iyi; sağlık riski düşük.', ru: 'Качество воздуха хорошее, риск для здоровья невелик.', uk: 'Якість повітря хороша, ризик для здоров’я низький.',
      ar: 'جودة الهواء جيدة ومخاطرها الصحية قليلة.', he: 'איכות האוויר טובה והסיכון הבריאותי נמוך.', hi: 'वायु गुणवत्ता अच्छी है और स्वास्थ्य जोखिम कम है।', th: 'คุณภาพอากาศดีและมีความเสี่ยงต่อสุขภาพต่ำ',
      vi: 'Chất lượng không khí tốt, nguy cơ ảnh hưởng sức khỏe thấp.', id: 'Kualitas udara baik dengan risiko kesehatan yang rendah.', ja: '空気の質は良好で、健康へのリスクは低いです。', ko: '대기질이 좋고 건강 위험은 낮습니다.', zh: '空气质量良好，健康风险较低。', 'zh-TW': '空氣品質良好，健康風險較低。'
    },
    'weather.aqiGreetingModerate': {
      en: 'Air quality is acceptable; unusually sensitive people may be affected.', es: 'La calidad del aire es aceptable; las personas especialmente sensibles podrían verse afectadas.', fr: 'La qualité de l’air est acceptable ; les personnes particulièrement sensibles peuvent être touchées.', de: 'Die Luftqualität ist akzeptabel; besonders empfindliche Menschen können betroffen sein.', it: 'La qualità dell’aria è accettabile; le persone particolarmente sensibili possono risentirne.',
      'pt-BR': 'A qualidade do ar é aceitável; pessoas especialmente sensíveis podem ser afetadas.', 'pt-PT': 'A qualidade do ar é aceitável; pessoas especialmente sensíveis podem ser afetadas.', nl: 'De luchtkwaliteit is aanvaardbaar; bijzonder gevoelige mensen kunnen effecten merken.', da: 'Luftkvaliteten er acceptabel; særligt følsomme personer kan blive påvirket.', sv: 'Luftkvaliteten är acceptabel; särskilt känsliga personer kan påverkas.',
      nb: 'Luftkvaliteten er akseptabel; særlig følsomme personer kan bli påvirket.', fi: 'Ilmanlaatu on hyväksyttävä; poikkeuksellisen herkät henkilöt voivat saada oireita.', pl: 'Jakość powietrza jest akceptowalna; szczególnie wrażliwe osoby mogą odczuć skutki.', cs: 'Kvalita ovzduší je přijatelná; zvlášť citliví lidé mohou pocítit její dopady.', hu: 'A levegő minősége elfogadható; a különösen érzékenyekre hatással lehet.',
      ro: 'Calitatea aerului este acceptabilă; persoanele deosebit de sensibile pot fi afectate.', el: 'Η ποιότητα του αέρα είναι αποδεκτή· τα ιδιαίτερα ευαίσθητα άτομα μπορεί να επηρεαστούν.', tr: 'Hava kalitesi kabul edilebilir; özellikle hassas kişiler etkilenebilir.', ru: 'Качество воздуха приемлемое; особо чувствительные люди могут ощутить его влияние.', uk: 'Якість повітря прийнятна; особливо чутливі люди можуть відчути його вплив.',
      ar: 'جودة الهواء مقبولة، وقد يتأثر الأشخاص ذوو الحساسية الشديدة.', he: 'איכות האוויר סבירה; אנשים רגישים במיוחד עשויים להיות מושפעים.', hi: 'वायु गुणवत्ता स्वीकार्य है; विशेष रूप से संवेदनशील लोगों पर असर पड़ सकता है।', th: 'คุณภาพอากาศอยู่ในระดับยอมรับได้ แต่อาจส่งผลต่อผู้ที่ไวต่อมลพิษเป็นพิเศษ',
      vi: 'Chất lượng không khí ở mức chấp nhận được; những người đặc biệt nhạy cảm có thể bị ảnh hưởng.', id: 'Kualitas udara dapat diterima; orang yang sangat sensitif mungkin terdampak.', ja: '空気の質は許容範囲ですが、特に敏感な人は影響を受けることがあります。', ko: '대기질은 허용 가능한 수준이지만, 특히 민감한 사람은 영향을 받을 수 있습니다.', zh: '空气质量可以接受，但尤其敏感的人可能会受到影响。', 'zh-TW': '空氣品質可以接受，但特別敏感的人可能會受到影響。'
    },
    'weather.aqiGreetingUnhealthySG': {
      en: 'Sensitive groups may feel effects; others are less likely to.', es: 'Los grupos sensibles pueden notar efectos; es menos probable que afecte al resto.', fr: 'Les groupes sensibles peuvent ressentir des effets ; les autres sont moins susceptibles d’être touchés.', de: 'Empfindliche Gruppen können Auswirkungen spüren; andere sind seltener betroffen.', it: 'I gruppi sensibili possono risentirne; è meno probabile per gli altri.',
      'pt-BR': 'Grupos sensíveis podem sentir efeitos; é menos provável que outras pessoas sejam afetadas.', 'pt-PT': 'Grupos sensíveis podem sentir efeitos; é menos provável que as outras pessoas sejam afetadas.', nl: 'Gevoelige groepen kunnen effecten merken; voor anderen is dat minder waarschijnlijk.', da: 'Følsomme grupper kan mærke påvirkninger; andre bliver mindre sandsynligt påvirket.', sv: 'Känsliga grupper kan märka av effekter; andra påverkas mer sällan.',
      nb: 'Følsomme grupper kan merke virkninger; andre blir mindre sannsynlig påvirket.', fi: 'Herkkiin ryhmiin kuuluvat voivat saada oireita; muut kärsivät niistä epätodennäköisemmin.', pl: 'Osoby z grup wrażliwych mogą odczuć skutki; pozostałe osoby są mniej narażone.', cs: 'Citlivé skupiny mohou pocítit dopady; u ostatních je to méně pravděpodobné.', hu: 'Az érzékeny csoportok tagjai tapasztalhatnak hatásokat; másoknál ez kevésbé valószínű.',
      ro: 'Grupurile sensibile pot resimți efecte; este mai puțin probabil ca ceilalți să fie afectați.', el: 'Οι ευαίσθητες ομάδες μπορεί να επηρεαστούν· οι υπόλοιποι είναι λιγότερο πιθανό να επηρεαστούν.', tr: 'Hassas gruplar etkilenebilir; diğerlerinin etkilenme olasılığı daha düşüktür.', ru: 'У чувствительных групп могут проявиться последствия; остальные подвержены им меньше.', uk: 'Чутливі групи можуть відчути вплив; решта населення менш імовірно постраждає.',
      ar: 'قد تتأثر الفئات الحساسة، بينما يقل احتمال تأثر الآخرين.', he: 'קבוצות רגישות עשויות להרגיש בהשפעה; הסיכוי לכך אצל אחרים נמוך יותר.', hi: 'संवेदनशील समूहों पर असर पड़ सकता है; अन्य लोगों के प्रभावित होने की संभावना कम है।', th: 'กลุ่มที่ไวต่อมลพิษอาจได้รับผลกระทบ ส่วนคนอื่นมีโอกาสน้อยกว่า',
      vi: 'Nhóm nhạy cảm có thể bị ảnh hưởng; những người khác ít có khả năng hơn.', id: 'Kelompok sensitif mungkin terdampak; orang lain lebih kecil kemungkinannya.', ja: '敏感な人には影響が出ることがありますが、ほかの人には出にくいでしょう。', ko: '민감한 사람은 영향을 받을 수 있지만, 다른 사람은 그럴 가능성이 낮습니다.', zh: '敏感人群可能受到影响，其他人受影响的可能性较低。', 'zh-TW': '敏感族群可能受到影響，其他人受影響的可能性較低。'
    },
    'weather.aqiGreetingUnhealthy': {
      en: 'Some people may feel effects; sensitive groups face greater risk.', es: 'Algunas personas pueden notar efectos; los grupos sensibles corren más riesgo.', fr: 'Certaines personnes peuvent ressentir des effets ; les groupes sensibles courent davantage de risques.', de: 'Manche Menschen können Auswirkungen spüren; empfindliche Gruppen sind stärker gefährdet.', it: 'Alcune persone possono risentirne; i gruppi sensibili corrono rischi maggiori.',
      'pt-BR': 'Algumas pessoas podem sentir efeitos; grupos sensíveis correm mais riscos.', 'pt-PT': 'Algumas pessoas podem sentir efeitos; os grupos sensíveis correm mais riscos.', nl: 'Sommige mensen kunnen effecten merken; gevoelige groepen lopen meer risico.', da: 'Nogle kan mærke påvirkninger; følsomme grupper er mere udsatte.', sv: 'Vissa kan märka av effekter; känsliga grupper löper större risk.',
      nb: 'Noen kan merke virkninger; følsomme grupper er mer utsatt.', fi: 'Joillekin voi tulla oireita; herkkiin ryhmiin kuuluvilla riski on suurempi.', pl: 'U niektórych mogą wystąpić skutki; osoby z grup wrażliwych są bardziej narażone.', cs: 'Někteří lidé mohou pocítit dopady; citlivé skupiny jsou ohroženější.', hu: 'Egyeseknél jelentkezhetnek hatások; az érzékeny csoportok nagyobb kockázatnak vannak kitéve.',
      ro: 'Unele persoane pot resimți efecte; grupurile sensibile sunt expuse unui risc mai mare.', el: 'Ορισμένοι μπορεί να επηρεαστούν· οι ευαίσθητες ομάδες διατρέχουν μεγαλύτερο κίνδυνο.', tr: 'Bazı kişiler etkilenebilir; hassas gruplar daha büyük risk altındadır.', ru: 'Некоторые могут ощутить последствия; чувствительные группы подвержены большему риску.', uk: 'Деякі люди можуть відчути вплив; чутливі групи мають вищий ризик.',
      ar: 'قد يشعر بعض الأشخاص بآثار صحية، وتواجه الفئات الحساسة خطراً أكبر.', he: 'חלק מהאנשים עשויים להרגיש בהשפעה; קבוצות רגישות נמצאות בסיכון גבוה יותר.', hi: 'कुछ लोगों पर असर पड़ सकता है; संवेदनशील समूहों को अधिक जोखिम है।', th: 'บางคนอาจได้รับผลกระทบ โดยกลุ่มที่ไวต่อมลพิษมีความเสี่ยงสูงกว่า',
      vi: 'Một số người có thể bị ảnh hưởng; nhóm nhạy cảm đối mặt với nguy cơ cao hơn.', id: 'Sebagian orang mungkin terdampak; kelompok sensitif menghadapi risiko lebih besar.', ja: '影響を受ける人もおり、敏感な人はより大きなリスクがあります。', ko: '일부 사람은 영향을 받을 수 있으며, 민감한 사람은 위험이 더 큽니다.', zh: '部分人群可能受到影响，敏感人群面临更高风险。', 'zh-TW': '部分族群可能受到影響，敏感族群面臨較高風險。'
    },
    'weather.aqiGreetingVeryUnhealthy': {
      en: 'Health alert: risk is increased for everyone.', es: 'Alerta sanitaria: aumenta el riesgo para toda la población.', fr: 'Alerte sanitaire : le risque augmente pour tout le monde.', de: 'Gesundheitswarnung: Das Risiko ist für alle erhöht.', it: 'Allerta sanitaria: il rischio aumenta per tutti.',
      'pt-BR': 'Alerta de saúde: o risco aumenta para todas as pessoas.', 'pt-PT': 'Alerta de saúde: o risco aumenta para todas as pessoas.', nl: 'Gezondheidswaarschuwing: voor iedereen is het risico verhoogd.', da: 'Sundhedsadvarsel: Risikoen er øget for alle.', sv: 'Hälsovarning: risken är förhöjd för alla.',
      nb: 'Helsevarsel: Risikoen er økt for alle.', fi: 'Terveysvaroitus: riski on kasvanut kaikilla.', pl: 'Ostrzeżenie zdrowotne: ryzyko wzrasta dla wszystkich.', cs: 'Zdravotní výstraha: riziko je zvýšené pro všechny.', hu: 'Egészségügyi riasztás: mindenkinek nagyobb a kockázata.',
      ro: 'Alertă de sănătate: riscul este crescut pentru toată lumea.', el: 'Υγειονομική προειδοποίηση: ο κίνδυνος είναι αυξημένος για όλους.', tr: 'Sağlık uyarısı: risk herkes için artmıştır.', ru: 'Предупреждение о здоровье: риск повышен для всех.', uk: 'Попередження про здоров’я: ризик підвищений для всіх.',
      ar: 'تنبيه صحي: المخاطر مرتفعة للجميع.', he: 'התראת בריאות: הסיכון מוגבר לכולם.', hi: 'स्वास्थ्य चेतावनी: सभी के लिए जोखिम बढ़ा हुआ है।', th: 'คำเตือนด้านสุขภาพ: ทุกคนมีความเสี่ยงเพิ่มขึ้น',
      vi: 'Cảnh báo sức khỏe: nguy cơ tăng cao đối với tất cả mọi người.', id: 'Peringatan kesehatan: risiko meningkat bagi semua orang.', ja: '健康警報：すべての人でリスクが高まっています。', ko: '건강 경보: 모든 사람의 위험이 높아졌습니다.', zh: '健康警报：所有人的风险都在增加。', 'zh-TW': '健康警報：所有人的風險都在增加。'
    },
    'weather.aqiGreetingHazardous': {
      en: 'Hazardous air may affect everyone.', es: 'El aire peligroso puede afectar a toda la población.', fr: 'La pollution dangereuse peut toucher tout le monde.', de: 'Gefährliche Luft kann alle beeinträchtigen.', it: 'L’aria pericolosa può avere effetti su tutti.',
      'pt-BR': 'O ar perigoso pode afetar todas as pessoas.', 'pt-PT': 'O ar perigoso pode afetar todas as pessoas.', nl: 'Gevaarlijke lucht kan iedereen treffen.', da: 'Farlig luft kan påvirke alle.', sv: 'Farlig luft kan påverka alla.',
      nb: 'Farlig luft kan påvirke alle.', fi: 'Vaarallinen ilmanlaatu voi vaikuttaa kaikkiin.', pl: 'Niebezpieczne powietrze może zaszkodzić każdemu.', cs: 'Nebezpečné ovzduší může ohrozit každého.', hu: 'A veszélyes levegőminőség mindenkit érinthet.',
      ro: 'Aerul periculos îi poate afecta pe toți.', el: 'Ο επικίνδυνος αέρας μπορεί να επηρεάσει τους πάντες.', tr: 'Tehlikeli hava herkesi etkileyebilir.', ru: 'Опасное качество воздуха может повлиять на каждого.', uk: 'Небезпечне повітря може вплинути на кожного.',
      ar: 'قد يؤثر الهواء الخطير على الجميع.', he: 'אוויר מסוכן עלול להשפיע על כולם.', hi: 'खतरनाक हवा सभी को प्रभावित कर सकती है।', th: 'อากาศที่เป็นอันตรายอาจส่งผลต่อทุกคน',
      vi: 'Không khí nguy hại có thể ảnh hưởng đến tất cả mọi người.', id: 'Udara berbahaya dapat berdampak pada semua orang.', ja: '危険な空気は誰にでも影響するおそれがあります。', ko: '위험한 대기질은 누구에게나 영향을 줄 수 있습니다.', zh: '危险的空气可能影响所有人。', 'zh-TW': '危險的空氣可能影響所有人。'
    },
    'weather.aqiMainPollutant': {
      en: 'Main pollutant', es: 'Contaminante principal', fr: 'Polluant principal', de: 'Hauptschadstoff', it: 'Inquinante principale',
      'pt-BR': 'Poluente principal', 'pt-PT': 'Poluente principal', nl: 'Belangrijkste vervuilende stof', da: 'Primært forurenende stof',
      sv: 'Främsta förorening', nb: 'Viktigste forurensende stoff', fi: 'Tärkein epäpuhtaus', pl: 'Główny zanieczyszczający składnik',
      cs: 'Hlavní znečišťující látka', hu: 'Fő szennyező anyag', ro: 'Poluantul principal', el: 'Κύριος ρύπος', tr: 'Başlıca kirletici',
      ru: 'Основной загрязнитель', uk: 'Основний забруднювач', ar: 'الملوِّث الرئيسي', he: 'המזהם העיקרי', hi: 'मुख्य प्रदूषक',
      th: 'มลพิษหลัก', vi: 'Chất ô nhiễm chính', id: 'Polutan utama', ja: '主な汚染物質', ko: '주요 오염 물질', zh: '主要污染物', 'zh-TW': '主要污染物'
    },
    'weather.aqiPollutantLevels': {
      en: 'Pollutant levels', es: 'Niveles de contaminantes', fr: 'Niveaux des polluants', de: 'Schadstoffwerte', it: 'Livelli degli inquinanti',
      'pt-BR': 'Níveis de poluentes', 'pt-PT': 'Níveis de poluentes', nl: 'Vervuilingsniveaus', da: 'Forureningsniveauer',
      sv: 'Föroreningsnivåer', nb: 'Forurensningsnivåer', fi: 'Epäpuhtauspitoisuudet', pl: 'Poziomy zanieczyszczeń',
      cs: 'Úrovně znečišťujících látek', hu: 'Szennyezőanyag-szintek', ro: 'Nivelurile poluanților', el: 'Επίπεδα ρύπων', tr: 'Kirletici düzeyleri',
      ru: 'Уровни загрязнителей', uk: 'Рівні забруднювачів', ar: 'مستويات الملوّثات', he: 'רמות מזהמים', hi: 'प्रदूषक स्तर',
      th: 'ระดับมลพิษ', vi: 'Mức độ chất ô nhiễm', id: 'Kadar polutan', ja: '汚染物質の濃度', ko: '오염 물질 농도', zh: '污染物浓度', 'zh-TW': '污染物濃度'
    },
    'weather.aqiContribution': {
      en: 'AQI contribution', es: 'Aporte al ICA', fr: 'Contribution à l’IQA', de: 'AQI-Beitrag', it: 'Contributo all’IQM',
      'pt-BR': 'Contribuição para o IQA', 'pt-PT': 'Contributo para o IQA', nl: 'Bijdrage aan de AQI', da: 'Bidrag til AQI',
      sv: 'Bidrag till AQI', nb: 'Bidrag til AQI', fi: 'Vaikutus ilmanlaatuindeksiin', pl: 'Udział w AQI', cs: 'Příspěvek k AQI',
      hu: 'Hozzájárulás az AQI-hoz', ro: 'Contribuție la AQI', el: 'Συμβολή στον AQI', tr: 'AQI katkısı', ru: 'Вклад в индекс AQI',
      uk: 'Внесок в індекс AQI', ar: 'المساهمة في مؤشر جودة الهواء', he: 'תרומה למדד AQI', hi: 'AQI में योगदान', th: 'ส่วนร่วมใน AQI',
      vi: 'Đóng góp vào AQI', id: 'Kontribusi terhadap AQI', ja: 'AQIへの寄与', ko: 'AQI 기여도', zh: 'AQI贡献值', 'zh-TW': 'AQI貢獻值'
    },
    'weather.aqiEuropeanAqi': {
      en: 'European AQI', es: 'ICA europeo', fr: 'IQA européen', de: 'Europäischer AQI', it: 'IQM europeo', 'pt-BR': 'IQA europeu', 'pt-PT': 'IQA europeu',
      nl: 'Europese AQI', da: 'Europæisk AQI', sv: 'Europeiskt AQI', nb: 'Europeisk AQI', fi: 'Eurooppalainen ilmanlaatuindeksi', pl: 'Europejski AQI', cs: 'Evropský AQI',
      hu: 'Európai AQI', ro: 'AQI european', el: 'Ευρωπαϊκός AQI', tr: 'Avrupa AQI', ru: 'Европейский AQI', uk: 'Європейський AQI', ar: 'مؤشر جودة الهواء الأوروبي',
      he: 'מדד AQI אירופי', hi: 'यूरोपीय AQI', th: 'AQI ยุโรป', vi: 'AQI châu Âu', id: 'AQI Eropa', ja: '欧州AQI', ko: '유럽 AQI', zh: '欧洲 AQI', 'zh-TW': '歐洲 AQI'
    },
    'weather.aqiClearSkyUv': {
      en: 'Clear-sky UV', es: 'UV con cielo despejado', fr: 'UV par ciel dégagé', de: 'UV bei klarem Himmel', it: 'UV a cielo sereno',
      'pt-BR': 'UV com céu limpo', 'pt-PT': 'UV com céu limpo', nl: 'UV bij heldere hemel', da: 'UV ved klar himmel', sv: 'UV vid klar himmel',
      nb: 'UV ved klar himmel', fi: 'UV-indeksi selkeällä säällä', pl: 'UV przy bezchmurnym niebie', cs: 'UV při jasné obloze', hu: 'UV derült égboltnál',
      ro: 'UV pe cer senin', el: 'UV με καθαρό ουρανό', tr: 'Açık havada UV', ru: 'УФ-индекс при ясном небе', uk: 'УФ-індекс за ясного неба',
      ar: 'مؤشر الأشعة فوق البنفسجية في سماء صافية', he: 'מדד UV בשמיים בהירים', hi: 'साफ़ आसमान में UV', th: 'UV ในวันที่ท้องฟ้าแจ่มใส',
      vi: 'UV khi trời quang', id: 'UV saat langit cerah', ja: '快晴時のUV', ko: '맑은 하늘의 UV', zh: '晴空紫外线指数', 'zh-TW': '晴空紫外線指數'
    },
    'weather.aqiAdditionalReadings': {
      en: 'Additional readings', es: 'Otras mediciones', fr: 'Autres mesures', de: 'Weitere Messwerte', it: 'Altri valori',
      'pt-BR': 'Outras medições', 'pt-PT': 'Outras medições', nl: 'Aanvullende metingen', da: 'Flere målinger', sv: 'Ytterligare mätvärden',
      nb: 'Flere målinger', fi: 'Muita mittaustietoja', pl: 'Dodatkowe pomiary', cs: 'Další měření', hu: 'További mérések', ro: 'Alte valori măsurate',
      el: 'Πρόσθετες μετρήσεις', tr: 'Ek ölçümler', ru: 'Дополнительные показатели', uk: 'Додаткові показники', ar: 'قراءات إضافية', he: 'מדידות נוספות',
      hi: 'अतिरिक्त माप', th: 'ค่าที่วัดเพิ่มเติม', vi: 'Số liệu bổ sung', id: 'Pengukuran tambahan', ja: 'その他の測定値', ko: '추가 측정값', zh: '其他读数', 'zh-TW': '其他讀數'
    },
    'weather.aqiDust': {
      en: 'Dust', es: 'Polvo', fr: 'Poussière', de: 'Staub', it: 'Polvere', 'pt-BR': 'Poeira', 'pt-PT': 'Poeira', nl: 'Stof', da: 'Støv',
      sv: 'Damm', nb: 'Støv', fi: 'Pöly', pl: 'Pył', cs: 'Prach', hu: 'Por', ro: 'Praf', el: 'Σκόνη', tr: 'Toz', ru: 'Пыль', uk: 'Пил',
      ar: 'الغبار', he: 'אבק', hi: 'धूल', th: 'ฝุ่น', vi: 'Bụi', id: 'Debu', ja: 'ほこり', ko: '먼지', zh: '尘埃', 'zh-TW': '塵埃'
    },
    'weather.aqiAerosolOpticalDepth': {
      en: 'Aerosol optical depth', es: 'Profundidad óptica de aerosoles', fr: 'Épaisseur optique des aérosols', de: 'Optische Aerosoldicke', it: 'Spessore ottico degli aerosol',
      'pt-BR': 'Profundidade óptica de aerossóis', 'pt-PT': 'Espessura ótica dos aerossóis', nl: 'Optische dikte van aerosolen', da: 'Aerosolers optiske dybde',
      sv: 'Aerosolernas optiska djup', nb: 'Aerosolenes optiske dybde', fi: 'Aerosolien optinen paksuus', pl: 'Grubość optyczna aerozoli', cs: 'Optická tloušťka aerosolů',
      hu: 'Aeroszolok optikai mélysége', ro: 'Grosimea optică a aerosolilor', el: 'Οπτικό βάθος αερολυμάτων', tr: 'Aerosol optik kalınlığı',
      ru: 'Оптическая толщина аэрозолей', uk: 'Оптична товщина аерозолів', ar: 'السُمك البصري للهباء الجوي', he: 'עומק אופטי של אירוסולים', hi: 'एरोसोल की प्रकाशीय गहराई',
      th: 'ความลึกเชิงแสงของละอองลอย', vi: 'Độ dày quang học của sol khí', id: 'Kedalaman optik aerosol', ja: 'エアロゾル光学的厚さ', ko: '에어로졸 광학 두께',
      zh: '气溶胶光学厚度', 'zh-TW': '氣膠光學厚度'
    },
    'weather.aqiAmmonia': {
      en: 'Ammonia (NH₃)', es: 'Amoníaco (NH₃)', fr: 'Ammoniac (NH₃)', de: 'Ammoniak (NH₃)', it: 'Ammoniaca (NH₃)',
      'pt-BR': 'Amônia (NH₃)', 'pt-PT': 'Amónia (NH₃)', nl: 'Ammoniak (NH₃)', da: 'Ammoniak (NH₃)', sv: 'Ammoniak (NH₃)', nb: 'Ammoniakk (NH₃)',
      fi: 'Ammoniakki (NH₃)', pl: 'Amoniak (NH₃)', cs: 'Amoniak (NH₃)', hu: 'Ammónia (NH₃)', ro: 'Amoniac (NH₃)', el: 'Αμμωνία (NH₃)',
      tr: 'Amonyak (NH₃)', ru: 'Аммиак (NH₃)', uk: 'Аміак (NH₃)', ar: 'الأمونيا (NH₃)', he: 'אמוניה (NH₃)', hi: 'अमोनिया (NH₃)',
      th: 'แอมโมเนีย (NH₃)', vi: 'Amoniac (NH₃)', id: 'Amonia (NH₃)', ja: 'アンモニア (NH₃)', ko: '암모니아 (NH₃)', zh: '氨（NH₃）', 'zh-TW': '氨（NH₃）'
    },
    'weather.aqiPollenAlder': {
      en: 'Alder pollen', es: 'Polen de aliso', fr: 'Pollen d’aulne', de: 'Erlenpollen', it: 'Polline di ontano', 'pt-BR': 'Pólen de amieiro', 'pt-PT': 'Pólen de amieiro',
      nl: 'Elzenpollen', da: 'Pollen fra el', sv: 'Alpollen', nb: 'Orpollen', fi: 'Lepän siitepöly', pl: 'Pyłek olchy', cs: 'Pyl olše', hu: 'Égerpollen', ro: 'Polen de arin',
      el: 'Γύρη σκλήθρου', tr: 'Kızılağaç poleni', ru: 'Пыльца ольхи', uk: 'Пилок вільхи', ar: 'حبوب لقاح الألدر', he: 'אבקת אלמון', hi: 'एल्डर पराग', th: 'เกสรต้นออลเดอร์',
      vi: 'Phấn hoa cây trăn', id: 'Serbuk sari alder', ja: 'ハンノキ花粉', ko: '오리나무 꽃가루', zh: '桤木花粉', 'zh-TW': '赤楊花粉'
    },
    'weather.aqiPollenBirch': {
      en: 'Birch pollen', es: 'Polen de abedul', fr: 'Pollen de bouleau', de: 'Birkenpollen', it: 'Polline di betulla', 'pt-BR': 'Pólen de bétula', 'pt-PT': 'Pólen de bétula',
      nl: 'Berkenpollen', da: 'Birkepollen', sv: 'Björkpollen', nb: 'Bjørkepollen', fi: 'Koivun siitepöly', pl: 'Pyłek brzozy', cs: 'Pyl břízy', hu: 'Nyírfapollen', ro: 'Polen de mesteacăn',
      el: 'Γύρη σημύδας', tr: 'Huş poleni', ru: 'Пыльца берёзы', uk: 'Пилок берези', ar: 'حبوب لقاح البتولا', he: 'אבקת ליבנה', hi: 'बर्च पराग', th: 'เกสรต้นเบิร์ช',
      vi: 'Phấn hoa bạch dương', id: 'Serbuk sari birch', ja: 'シラカバ花粉', ko: '자작나무 꽃가루', zh: '桦树花粉', 'zh-TW': '樺樹花粉'
    },
    'weather.aqiPollenGrass': {
      en: 'Grass pollen', es: 'Polen de gramíneas', fr: 'Pollen de graminées', de: 'Gräserpollen', it: 'Polline di graminacee', 'pt-BR': 'Pólen de gramíneas', 'pt-PT': 'Pólen de gramíneas',
      nl: 'Graspollen', da: 'Græspollen', sv: 'Gräspollen', nb: 'Gresspollen', fi: 'Heinän siitepöly', pl: 'Pyłek traw', cs: 'Pyl trav', hu: 'Fűpollen', ro: 'Polen de graminee',
      el: 'Γύρη χόρτων', tr: 'Çimen poleni', ru: 'Пыльца трав', uk: 'Пилок трав', ar: 'حبوب لقاح الأعشاب', he: 'אבקת עשבים', hi: 'घास का पराग', th: 'เกสรหญ้า',
      vi: 'Phấn hoa cỏ', id: 'Serbuk sari rumput', ja: 'イネ科花粉', ko: '잔디 꽃가루', zh: '草类花粉', 'zh-TW': '草類花粉'
    },
    'weather.aqiPollenMugwort': {
      en: 'Mugwort pollen', es: 'Polen de artemisa', fr: 'Pollen d’armoise', de: 'Beifußpollen', it: 'Polline di artemisia', 'pt-BR': 'Pólen de artemísia', 'pt-PT': 'Pólen de artemísia',
      nl: 'Bijvoetpollen', da: 'Bynkepollen', sv: 'Gråbopollen', nb: 'Burotpollen', fi: 'Pujon siitepöly', pl: 'Pyłek bylicy', cs: 'Pyl pelyňku', hu: 'Fekete üröm pollenje', ro: 'Polen de pelin',
      el: 'Γύρη αψιθιάς', tr: 'Pelin poleni', ru: 'Пыльца полыни', uk: 'Пилок полину', ar: 'حبوب لقاح الشيح', he: 'אבקת לענה', hi: 'मगवर्ट पराग', th: 'เกสรโกฐจุฬาลัมพา',
      vi: 'Phấn hoa ngải cứu', id: 'Serbuk sari mugwort', ja: 'ヨモギ花粉', ko: '쑥 꽃가루', zh: '蒿属花粉', 'zh-TW': '艾蒿花粉'
    },
    'weather.aqiPollenOlive': {
      en: 'Olive pollen', es: 'Polen de olivo', fr: 'Pollen d’olivier', de: 'Olivenpollen', it: 'Polline di ulivo', 'pt-BR': 'Pólen de oliveira', 'pt-PT': 'Pólen de oliveira',
      nl: 'Olijvenpollen', da: 'Oliventræspollen', sv: 'Olivpollen', nb: 'Olivpollen', fi: 'Oliivipuun siitepöly', pl: 'Pyłek oliwki', cs: 'Pyl olivovníku', hu: 'Olajfapollen', ro: 'Polen de măslin',
      el: 'Γύρη ελιάς', tr: 'Zeytin poleni', ru: 'Пыльца оливы', uk: 'Пилок оливи', ar: 'حبوب لقاح الزيتون', he: 'אבקת זית', hi: 'जैतून का पराग', th: 'เกสรมะกอก',
      vi: 'Phấn hoa ô liu', id: 'Serbuk sari zaitun', ja: 'オリーブ花粉', ko: '올리브 꽃가루', zh: '橄榄花粉', 'zh-TW': '橄欖花粉'
    },
    'weather.aqiPollenRagweed': {
      en: 'Ragweed pollen', es: 'Polen de ambrosía', fr: 'Pollen d’ambroisie', de: 'Ambrosiapollen', it: 'Polline di ambrosia', 'pt-BR': 'Pólen de ambrósia', 'pt-PT': 'Pólen de ambrósia',
      nl: 'Ambrosiapollen', da: 'Ambrosiepollen', sv: 'Ambrosiapollen', nb: 'Ambrosiapollen', fi: 'Tuoksukin siitepöly', pl: 'Pyłek ambrozji', cs: 'Pyl ambrózie', hu: 'Parlagfű pollenje', ro: 'Polen de ambrozie',
      el: 'Γύρη αμβροσίας', tr: 'Ambrosia poleni', ru: 'Пыльца амброзии', uk: 'Пилок амброзії', ar: 'حبوب لقاح عشبة الرجيد', he: 'אבקת אמברוסיה', hi: 'रैगवीड पराग', th: 'เกสรรักวีด',
      vi: 'Phấn hoa cỏ phấn hương', id: 'Serbuk sari ragweed', ja: 'ブタクサ花粉', ko: '돼지풀 꽃가루', zh: '豚草花粉', 'zh-TW': '豚草花粉'
    },
    'weather.aqiUnhealthySG': {
      en: 'Unhealthy for Sensitive Groups', es: 'Insalubre para grupos sensibles', fr: 'Malsain pour les groupes sensibles', de: 'Ungesund für empfindliche Gruppen',
      it: 'Insalubre per i gruppi sensibili', 'pt-BR': 'Insalubre para grupos sensíveis', 'pt-PT': 'Insalubre para grupos sensíveis', nl: 'Ongezond voor gevoelige groepen',
      da: 'Usundt for følsomme grupper', sv: 'Ohälsosamt för känsliga grupper', nb: 'Usunt for følsomme grupper', fi: 'Epäterveellistä herkille ryhmille',
      pl: 'Niezdrowa dla wrażliwych grup', cs: 'Nezdravé pro citlivé skupiny', hu: 'Egészségtelen az érzékeny csoportoknak', ro: 'Nesănătos pentru grupurile sensibile',
      el: 'Ανθυγιεινό για ευαίσθητες ομάδες', tr: 'Hassas Gruplar için Sağlıksız', ru: 'Вредно для чувствительных групп', uk: 'Шкідливо для чутливих груп',
      ar: 'غير صحي للفئات الحساسة', he: 'לא בריא לקבוצות רגישות', hi: 'संवेदनशील समूहों के लिए अस्वस्थ', th: 'ไม่ดีต่อสุขภาพสำหรับกลุ่มอ่อนไหว',
      vi: 'Không lành mạnh cho nhóm nhạy cảm', id: 'Tidak sehat bagi kelompok sensitif', ja: '敏感な人々に健康影響', ko: '민감군에게 나쁨', zh: '对敏感人群不健康', 'zh-TW': '對敏感族群不健康'
    },
    'weather.selectedPlace': {
      en: 'Chosen place', es: 'Lugar elegido', fr: 'Lieu choisi', de: 'Ausgewählter Ort', it: 'Luogo scelto', 'pt-BR': 'Local escolhido', 'pt-PT': 'Local escolhido',
      nl: 'Gekozen plaats', da: 'Valgt sted', sv: 'Vald plats', nb: 'Valgt sted', fi: 'Valittu paikka', pl: 'Wybrane miejsce', cs: 'Vybrané místo', hu: 'Kiválasztott hely',
      ro: 'Loc ales', el: 'Επιλεγμένη τοποθεσία', tr: 'Seçilen yer', ru: 'Выбранное место', uk: 'Вибране місце', ar: 'الموقع المحدد', he: 'המקום שנבחר', hi: 'चुना हुआ स्थान',
      th: 'สถานที่ที่เลือก', vi: 'Địa điểm đã chọn', id: 'Tempat yang dipilih', ja: '選択した場所', ko: '선택한 장소', zh: '已选地点', 'zh-TW': '已選地點'
    },
    'weather.mySkyEmpty': {
      en: 'Add your location or choose a city to make My Sky personal.', es: 'Añade tu ubicación o elige una ciudad para personalizar Mi cielo.', fr: 'Ajoutez votre position ou choisissez une ville pour personnaliser Mon ciel.', de: 'Füge deinen Standort hinzu oder wähle eine Stadt, um Mein Himmel persönlich zu gestalten.',
      it: 'Aggiungi la tua posizione o scegli una città per personalizzare Il mio cielo.', 'pt-BR': 'Adicione sua localização ou escolha uma cidade para personalizar Meu céu.', 'pt-PT': 'Adicione a sua localização ou escolha uma cidade para personalizar O meu céu.',
      nl: 'Voeg je locatie toe of kies een stad om Mijn hemel persoonlijk te maken.', da: 'Tilføj din placering, eller vælg en by for at gøre Min himmel personlig.', sv: 'Lägg till din plats eller välj en stad för att göra Min himmel personlig.',
      nb: 'Legg til stedet ditt eller velg en by for å gjøre Min himmel personlig.', fi: 'Lisää sijaintisi tai valitse kaupunki, jotta Oma taivas on henkilökohtainen.', pl: 'Dodaj swoją lokalizację lub wybierz miasto, aby spersonalizować Mój nieboskłon.',
      cs: 'Přidejte svou polohu nebo vyberte město a přizpůsobte si Moje nebe.', hu: 'Add meg a helyzetedet, vagy válassz várost, hogy személyre szabd az Égboltomat.',
      ro: 'Adaugă locația ta sau alege un oraș pentru a-ți personaliza Cerul meu.', el: 'Προσθέστε την τοποθεσία σας ή επιλέξτε μια πόλη για να εξατομικεύσετε τον Ουρανό μου.',
      tr: 'Gökyüzüm’ü kişiselleştirmek için konumunuzu ekleyin veya bir şehir seçin.', ru: 'Добавьте своё местоположение или выберите город, чтобы настроить «Моё небо».',
      uk: 'Додайте своє місцезнаходження або виберіть місто, щоб налаштувати «Моє небо».', ar: 'أضف موقعك أو اختر مدينة لتخصيص «سمائي».', he: 'הוסיפו את המיקום שלכם או בחרו עיר כדי להתאים אישית את ״השמיים שלי״.',
      hi: 'मेरे आसमान को व्यक्तिगत बनाने के लिए अपना स्थान जोड़ें या कोई शहर चुनें।', th: 'เพิ่มตำแหน่งหรือเลือกเมืองเพื่อทำให้ท้องฟ้าของฉันเป็นแบบเฉพาะตัว',
      vi: 'Thêm vị trí của bạn hoặc chọn một thành phố để cá nhân hóa Bầu trời của tôi.', id: 'Tambahkan lokasi Anda atau pilih kota untuk mempersonalisasi Langit Saya.',
      ja: '現在地を追加するか都市を選んで、「私の空」を自分向けにカスタマイズしましょう。', ko: '내 하늘을 나에게 맞게 꾸미려면 내 위치를 추가하거나 도시를 선택하세요.',
      zh: '添加你的位置或选择一座城市，打造专属的「我的天空」。', 'zh-TW': '加入你的位置或選擇一座城市，打造專屬的「我的天空」。'
    },
    'weather.chooseMySkyPlace': {
      en: 'Choose a city for My Sky', es: 'Elegir una ciudad para Mi cielo', fr: 'Choisir une ville pour Mon ciel', de: 'Stadt für Mein Himmel auswählen', it: 'Scegli una città per Il mio cielo',
      'pt-BR': 'Escolher uma cidade para Meu céu', 'pt-PT': 'Escolher uma cidade para O meu céu', nl: 'Kies een stad voor Mijn hemel', da: 'Vælg en by til Min himmel',
      sv: 'Välj en stad för Min himmel', nb: 'Velg en by for Min himmel', fi: 'Valitse kaupunki Oma taivas -näkymään', pl: 'Wybierz miasto dla Mojego nieboskłonu',
      cs: 'Vyberte město pro Moje nebe', hu: 'Válassz várost az Égboltomhoz', ro: 'Alege un oraș pentru Cerul meu', el: 'Επιλέξτε πόλη για τον Ουρανό μου',
      tr: 'Gökyüzüm için bir şehir seçin', ru: 'Выбрать город для «Моего неба»', uk: 'Вибрати місто для «Мого неба»', ar: 'اختر مدينة لسمائي', he: 'בחירת עיר עבור ״השמיים שלי״',
      hi: 'मेरे आसमान के लिए शहर चुनें', th: 'เลือกเมืองสำหรับท้องฟ้าของฉัน', vi: 'Chọn thành phố cho Bầu trời của tôi', id: 'Pilih kota untuk Langit Saya',
      ja: '「私の空」の都市を選ぶ', ko: '나의 하늘에 표시할 도시 선택', zh: '为「我的天空」选择城市', 'zh-TW': '為「我的天空」選擇城市'
    },
    'weather.changeMySkyPlace': {
      en: 'Change My Sky city', es: 'Cambiar ciudad de Mi cielo', fr: 'Changer la ville de Mon ciel', de: 'Stadt für Mein Himmel ändern', it: 'Cambia la città de Il mio cielo',
      'pt-BR': 'Trocar a cidade de Meu céu', 'pt-PT': 'Alterar a cidade de O meu céu', nl: 'Stad voor Mijn hemel wijzigen', da: 'Skift by for Min himmel',
      sv: 'Byt stad för Min himmel', nb: 'Endre by for Min himmel', fi: 'Vaihda Oma taivas -näkymän kaupunkia', pl: 'Zmień miasto Mojego nieboskłonu',
      cs: 'Změnit město pro Moje nebe', hu: 'Égboltom városának módosítása', ro: 'Schimbă orașul pentru Cerul meu', el: 'Αλλαγή πόλης για τον Ουρανό μου',
      tr: 'Gökyüzüm şehrini değiştirin', ru: 'Изменить город для «Моего неба»', uk: 'Змінити місто для «Мого неба»', ar: 'غيّر مدينة سمائي', he: 'שינוי העיר עבור ״השמיים שלי״',
      hi: 'मेरे आसमान का शहर बदलें', th: 'เปลี่ยนเมืองของท้องฟ้าของฉัน', vi: 'Đổi thành phố cho Bầu trời của tôi', id: 'Ubah kota Langit Saya',
      ja: '「私の空」の都市を変更', ko: '나의 하늘에 표시할 도시 변경', zh: '更改「我的天空」城市', 'zh-TW': '更改「我的天空」城市'
    },
    'weather.weatherView': {
      en: 'Weather view', es: 'Vista del tiempo', fr: 'Vue météo', de: 'Wetteransicht', it: 'Vista meteo', 'pt-BR': 'Visualização do clima', 'pt-PT': 'Vista meteorológica',
      nl: 'Weerweergave', da: 'Vejrvisning', sv: 'Vädervy', nb: 'Værvisning', fi: 'Säänäkymä', pl: 'Widok pogody', cs: 'Zobrazení počasí', hu: 'Időjárásnézet',
      ro: 'Vizualizare meteo', el: 'Προβολή καιρού', tr: 'Hava durumu görünümü', ru: 'Режим погоды', uk: 'Вигляд погоди', ar: 'عرض الطقس', he: 'תצוגת מזג אוויר',
      hi: 'मौसम दृश्य', th: 'มุมมองสภาพอากาศ', vi: 'Chế độ xem thời tiết', id: 'Tampilan cuaca', ja: '天気表示', ko: '날씨 보기', zh: '天气视图', 'zh-TW': '天氣檢視'
    }
  };

  global.I18N = global.I18N || {};
  Object.keys(S).forEach(function (key) {
    var row = S[key];
    locales.forEach(function (code) {
      global.I18N[code] = Object.assign({}, global.I18N[code] || {});
      if (row[code]) global.I18N[code][key] = row[code];
      else if (row.en) global.I18N[code][key] = row.en;
    });
  });
})(window);
