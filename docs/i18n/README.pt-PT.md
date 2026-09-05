**Ler em:** [English](../../README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Italiano](README.it.md) · [Português (Brasil)](README.pt-BR.md) · **Português (Portugal)** · [Nederlands](README.nl.md) · [Dansk](README.da.md) · [Svenska](README.sv.md) · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Polski](README.pl.md) · [Čeština](README.cs.md) · [Magyar](README.hu.md) · [Română](README.ro.md) · [Ελληνικά](README.el.md) · [Türkçe](README.tr.md) · [Русский](README.ru.md) · [Українська](README.uk.md) · [العربية](README.ar.md) · [עברית](README.he.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [Tiếng Việt](README.vi.md) · [Bahasa Indonesia](README.id.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [简体中文](README.zh.md) · [繁體中文](README.zh-TW.md)

# Duskline

Uma aplicação meteorológica gratuita, só no browser, para consultar e explorar o tempo: pesquisa mundial de cidades, perspetivas horárias e a 10 dias, qualidade do ar, condições animadas e previsões e alertas melhorados do U.S. National Weather Service.

[Abrir o duskline](https://dusklineweather.pages.dev/) · [Política de privacidade](../../privacy.html) · [Termos de utilização](../../terms.html)

Não há conta, backend próprio nem identificador publicitário. O idioma, as unidades, os favoritos e uma localização guardada de propósito aproximada ficam no browser.

## Funcionalidades

- Pesquise qualquer cidade do mundo, com sugestões utilizáveis pelo teclado
- Guarde favoritos e, se quiser, use a localização (as coordenadas são arredondadas antes de serem guardadas ou enviadas)
- Condições atuais, previsão horária e panorama a 10 dias
- Qualidade do ar
- Para lugares dos EUA elegíveis, previsões e alertas públicos do National Weather Service
- Céu e precipitação animados na vista detalhada
- Unidades de temperatura, distância, vento, precipitação e pressão
- 30 idiomas de interface, incluindo árabe e hebraico (direita para a esquerda)

## Privacidade e dados

Os pedidos meteorológicos saem do browser para o [Open-Meteo](https://open-meteo.com/) e, em localizações dos EUA, o [National Weather Service](https://www.weather.gov/). Se usar a localização, a geocodificação inversa vai para o BigDataCloud e pode recorrer ao OpenStreetMap Nominatim. O alojamento e o Google Fonts podem ver dados técnicos habituais do pedido.

O duskline não vende essas informações. As previsões servem para planear e explorar, não para decisões de emergência. Detalhes: [Política de privacidade](../../privacy.html) e [Termos de utilização](../../terms.html).

## Idiomas

O seletor da aplicação e as páginas legais partilham os mesmos 30 idiomas e a preferência `duskline-lang`. Os textos legais estão em `src/js/data/legal/packs/`. Estas traduções do README estão em [`docs/i18n/`](README.md).

## Desenvolvimento

A aplicação é HTML, CSS e scripts clássicos estáticos — sem empacotador.

```bash
npm run serve
# http://127.0.0.1:8000/
```

- Verificar a sintaxe de cada JS próprio: `npm run check`
- Testes unitários: `npm run test:unit`
- Os smokes do Playwright simulam as API meteorológicas e não consomem quotas reais: `npm test`

## Publicação

A raiz do repositório é o sítio. [Cloudflare Pages](https://dusklineweather.pages.dev/) é o anfitrião principal previsto; o GitHub Pages é a cópia de segurança. Ambos publicam os ficheiros estáticos tal como estão.

## Licença

O código é [MIT](../../LICENSE). Os dados meteorológicos pertencem aos fornecedores acima e continuam sujeitos aos respetivos termos. Não se destina a segurança de vida nem a emergências.
