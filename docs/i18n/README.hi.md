**इस भाषा में पढ़ें:** [English](../../README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Italiano](README.it.md) · [Português (Brasil)](README.pt-BR.md) · [Português (Portugal)](README.pt-PT.md) · [Nederlands](README.nl.md) · [Dansk](README.da.md) · [Svenska](README.sv.md) · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Polski](README.pl.md) · [Čeština](README.cs.md) · [Magyar](README.hu.md) · [Română](README.ro.md) · [Ελληνικά](README.el.md) · [Türkçe](README.tr.md) · [Русский](README.ru.md) · [Українська](README.uk.md) · [العربية](README.ar.md) · [עברית](README.he.md) · **हिन्दी** · [ไทย](README.th.md) · [Tiếng Việt](README.vi.md) · [Bahasa Indonesia](README.id.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [简体中文](README.zh.md) · [繁體中文](README.zh-TW.md)

# Duskline

मुफ़्त, केवल ब्राउज़र वाला मौसम ऐप: विश्वव्यापी शहर खोज, घंटेवार और 10-दिन का दृष्टिकोण, वायु गुणवत्ता, एनिमेटेड स्थितियाँ, और बेहतर U.S. National Weather Service पूर्वानुमान व अलर्ट।

[duskline खोलें](https://dusklineweather.pages.dev/) · [गोपनीयता नीति](../../privacy.html) · [उपयोग की शर्तें](../../terms.html)

कोई खाता नहीं, कोई अपना बैकएंड नहीं, कोई विज्ञापन पहचानकर्ता नहीं। भाषा, इकाइयाँ, पसंदीदा और जानबूझकर अनुमानित सहेजा गया स्थान आपके ब्राउज़र में रहता है।

## सुविधाएँ

- दुनिया के किसी भी शहर को खोजें, कीबोर्ड-अनुकूल सुझावों के साथ
- पसंदीदा सहेजें और वैकल्पिक रूप से अपना स्थान उपयोग करें (निर्देशांक सहेजने या भेजने से पहले पूर्णांकित होते हैं)
- वर्तमान स्थितियाँ, घंटेवार पूर्वानुमान और 10-दिन का दृष्टिकोण
- वायु गुणवत्ता
- पात्र अमेरिकी स्थानों के लिए National Weather Service पूर्वानुमान और सार्वजनिक अलर्ट
- विस्तृत दृश्य में एनिमेटेड आकाश और वर्षा
- तापमान, दूरी, हवा, वर्षा और दबाव की इकाइयाँ
- 30 इंटरफ़ेस भाषाएँ, जिनमें अरबी और हिब्रू (दाएँ से बाएँ) शामिल हैं

## गोपनीयता और डेटा

मौसम अनुरोध आपके ब्राउज़र से [Open-Meteo](https://open-meteo.com/) और अमेरिकी स्थानों के लिए [National Weather Service](https://www.weather.gov/) को जाते हैं। यदि आप स्थान उपयोग करते हैं, रिवर्स जियोकोडिंग BigDataCloud को जाती है और OpenStreetMap Nominatim पर लौट सकती है। होस्टिंग और Google Fonts सामान्य तकनीकी अनुरोध डेटा देख सकते हैं।

duskline उस जानकारी को नहीं बेचता। पूर्वानुमान योजना और अन्वेषण के लिए हैं, आपातकालीन निर्णयों के लिए नहीं। विवरण: [गोपनीयता नीति](../../privacy.html) और [उपयोग की शर्तें](../../terms.html)।

## भाषाएँ

ऐप का चयनकर्ता और कानूनी पृष्ठ वही 30 भाषाएँ और `duskline-lang` वरीयता साझा करते हैं। कानूनी पाठ `src/js/data/legal/packs/` में है। ये README अनुवाद [`docs/i18n/`](README.md) में हैं।

## विकास

ऐप स्थैतिक HTML, CSS और क्लासिक स्क्रिप्ट है — कोई बंडलर नहीं।

```bash
npm run serve
# http://127.0.0.1:8000/
```

- प्रत्येक अपने JS की सिंटैक्स जाँच: `npm run check`
- यूनिट परीक्षण: `npm run test:unit`
- Playwright स्मोक मौसम API का मॉक करते हैं और लाइव कोटा नहीं खर्च करते: `npm test`

## प्रकाशन

रिपॉज़िटरी रूट ही साइट है। [Cloudflare Pages](https://dusklineweather.pages.dev/) मुख्य होस्ट है; GitHub Pages बैकअप है। दोनों स्थैतिक फ़ाइलें ज्यों की त्यों प्रकाशित करते हैं।

## लाइसेंस

कोड [MIT](../../LICENSE) है। मौसम डेटा उपरोक्त तृतीय पक्षों का है और उनकी शर्तों के अधीन है। जीवन-सुरक्षा या आपातकाल के लिए नहीं।
