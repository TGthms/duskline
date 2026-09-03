**Ler em:** [English](../../README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Italiano](README.it.md) · **Português (Brasil)** · [Português (Portugal)](README.pt-PT.md) · [Nederlands](README.nl.md) · [Dansk](README.da.md) · [Svenska](README.sv.md) · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Polski](README.pl.md) · [Čeština](README.cs.md) · [Magyar](README.hu.md) · [Română](README.ro.md) · [Ελληνικά](README.el.md) · [Türkçe](README.tr.md) · [Русский](README.ru.md) · [Українська](README.uk.md) · [العربية](README.ar.md) · [עברית](README.he.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [Tiếng Việt](README.vi.md) · [Bahasa Indonesia](README.id.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [简体中文](README.zh.md) · [繁體中文](README.zh-TW.md)

# Duskline

Um app de clima gratuito, só no navegador, para consultar e explorar o tempo: busca mundial de cidades, visões horárias e de 10 dias, qualidade do ar, condições animadas e previsões e alertas aprimorados do U.S. National Weather Service.

[Abrir o duskline](https://duskline.pages.dev/) · [Política de privacidade](../../privacy.html) · [Termos de uso](../../terms.html)

Não há conta, backend próprio nem identificador de publicidade. Idioma, unidades, favoritos e uma localização salva de propósito aproximada ficam no seu navegador.

## Recursos

- Pesquise qualquer cidade do mundo, com sugestões usáveis pelo teclado
- Salve favoritos e, se quiser, use sua localização (as coordenadas são arredondadas antes de serem salvas ou enviadas)
- Condições atuais, previsão horária e panorama de 10 dias
- Qualidade do ar
- Para lugares dos EUA elegíveis, previsões e alertas públicos do National Weather Service
- Céu e precipitação animados na vista detalhada
- Unidades de temperatura, distância, vento, precipitação e pressão
- 30 idiomas de interface, incluindo árabe e hebraico (direita para a esquerda)

## Privacidade e dados

Os pedidos de clima saem do navegador para o [Open-Meteo](https://open-meteo.com/) e, em locais dos EUA, o [National Weather Service](https://www.weather.gov/). Se você usar a localização, a geocodificação inversa vai para o BigDataCloud e pode recorrer ao OpenStreetMap Nominatim. Hospedagem e Google Fonts podem ver dados técnicos comuns do pedido.

O duskline não vende essas informações. As previsões são para planejar e explorar, não para decisões de emergência. Detalhes: [Política de privacidade](../../privacy.html) e [Termos de uso](../../terms.html).

## Idiomas

O seletor do app e as páginas legais compartilham os mesmos 30 idiomas e a preferência `duskline-lang`. Os textos legais estão em `src/js/data/legal/packs/`. Estas traduções do README estão em [`docs/i18n/`](README.md).

## Desenvolvimento

O app é HTML, CSS e scripts clássicos estáticos — sem empacotador.

```bash
npm run serve
# http://127.0.0.1:8000/
```

- Checar a sintaxe de cada JS próprio: `npm run check`
- Testes unitários: `npm run test:unit`
- Os smokes do Playwright simulam as APIs de clima e não consomem cotas reais: `npm test`

## Publicação

A raiz do repositório é o site. [Cloudflare Pages](https://duskline.pages.dev/) é o host principal previsto; GitHub Pages é o backup. Ambos publicam os arquivos estáticos como estão.

## Licença

O código é [MIT](../../LICENSE). Os dados de clima pertencem aos provedores acima e seguem os termos deles. Não serve para segurança da vida nem emergências.
