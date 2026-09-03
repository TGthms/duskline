**Leer en:** [English](../../README.md) · **Español** · [Français](README.fr.md) · [Deutsch](README.de.md) · [Italiano](README.it.md) · [Português (Brasil)](README.pt-BR.md) · [Português (Portugal)](README.pt-PT.md) · [Nederlands](README.nl.md) · [Dansk](README.da.md) · [Svenska](README.sv.md) · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Polski](README.pl.md) · [Čeština](README.cs.md) · [Magyar](README.hu.md) · [Română](README.ro.md) · [Ελληνικά](README.el.md) · [Türkçe](README.tr.md) · [Русский](README.ru.md) · [Українська](README.uk.md) · [العربية](README.ar.md) · [עברית](README.he.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [Tiếng Việt](README.vi.md) · [Bahasa Indonesia](README.id.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [简体中文](README.zh.md) · [繁體中文](README.zh-TW.md)

# Duskline

Una app del tiempo gratuita, solo en el navegador, para consultar y explorar el clima: búsqueda mundial de ciudades, vistas horarias y a 10 días, calidad del aire, condiciones animadas y previsiones y alertas mejoradas del Servicio Meteorológico Nacional de EE. UU.

[Abrir duskline](https://duskline.pages.dev/) · [Política de privacidad](../../privacy.html) · [Términos de uso](../../terms.html)

No hay cuenta, no hay un backend propio ni identificador publicitario. El idioma, las unidades, los favoritos y una ubicación guardada deliberadamente aproximada permanecen en tu navegador.

## Funciones

- Busca cualquier ciudad del mundo, con sugerencias usables con teclado
- Guarda favoritos y, si quieres, usa tu ubicación (las coordenadas se redondean antes de guardarse o enviarse)
- Condiciones actuales, previsión horaria y panorama a 10 días
- Calidad del aire
- En lugares de EE. UU. elegibles, previsiones y alertas públicas del National Weather Service
- Cielo y precipitación animados en la vista detallada
- Unidades de temperatura, distancia, viento, precipitación y presión
- 30 idiomas de interfaz, incluidos árabe y hebreo (derecha a izquierda)

## Privacidad y datos

Las solicitudes meteorológicas salen de tu navegador hacia [Open-Meteo](https://open-meteo.com/) y, en ubicaciones de EE. UU., el [National Weather Service](https://www.weather.gov/). Si usas la ubicación, la geocodificación inversa va a BigDataCloud y puede recurrir a OpenStreetMap Nominatim. El alojamiento y Google Fonts pueden ver datos técnicos habituales de la solicitud.

duskline no vende esa información. Las previsiones son para planificar y explorar, no para decisiones de emergencia. Detalles: [Política de privacidad](../../privacy.html) y [Términos de uso](../../terms.html).

## Idiomas

El selector de la app y las páginas legales comparten los mismos 30 idiomas y la preferencia `duskline-lang`. El texto legal está en `src/js/data/legal/packs/`. Estas traducciones del README están en [`docs/i18n/`](README.md).

## Desarrollo

La app es HTML, CSS y scripts clásicos estáticos: no hay empaquetador.

```bash
npm run serve
# http://127.0.0.1:8000/
```

- Comprobar la sintaxis de cada JS propio: `npm run check`
- Pruebas unitarias: `npm run test:unit`
- Las pruebas Playwright simulan las APIs meteorológicas y no consumen cuotas reales: `npm test`

## Despliegue

La raíz del repositorio es el sitio. [Cloudflare Pages](https://duskline.pages.dev/) es el alojamiento principal previsto; GitHub Pages es la copia de seguridad. Ambos publican los archivos estáticos tal cual.

## Licencia

El código es [MIT](../../LICENSE). Los datos meteorológicos pertenecen a los proveedores anteriores y siguen sus términos. No sirve para seguridad vital ni emergencias.
