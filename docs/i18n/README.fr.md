**Lire en:** [English](../../README.md) · [Español](README.es.md) · **Français** · [Deutsch](README.de.md) · [Italiano](README.it.md) · [Português (Brasil)](README.pt-BR.md) · [Português (Portugal)](README.pt-PT.md) · [Nederlands](README.nl.md) · [Dansk](README.da.md) · [Svenska](README.sv.md) · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Polski](README.pl.md) · [Čeština](README.cs.md) · [Magyar](README.hu.md) · [Română](README.ro.md) · [Ελληνικά](README.el.md) · [Türkçe](README.tr.md) · [Русский](README.ru.md) · [Українська](README.uk.md) · [العربية](README.ar.md) · [עברית](README.he.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [Tiếng Việt](README.vi.md) · [Bahasa Indonesia](README.id.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [简体中文](README.zh.md) · [繁體中文](README.zh-TW.md)

# Duskline

Une appli météo gratuite, uniquement dans le navigateur, pour consulter et explorer le temps : recherche mondiale de villes, prévisions horaires et à 10 jours, qualité de l’air, conditions animées, et prévisions et alertes enrichies du U.S. National Weather Service.

[Ouvrir duskline](https://dusklineweather.pages.dev/) · [Politique de confidentialité](../../privacy.html) · [Conditions d’utilisation](../../terms.html)

Pas de compte, pas de backend à nous, pas d’identifiant publicitaire. La langue, les unités, les favoris et une position enregistrée volontairement approximative restent dans votre navigateur.

## Fonctionnalités

- Recherchez n’importe quelle ville dans le monde, avec des suggestions au clavier
- Enregistrez des favoris et, si vous le souhaitez, utilisez votre position (les coordonnées sont arrondies avant stockage ou envoi)
- Conditions actuelles, prévision horaire et horizon à 10 jours
- Qualité de l’air
- Pour les lieux américains éligibles, prévisions et alertes publiques du National Weather Service
- Ciel et précipitations animés dans la vue détaillée
- Unités de température, distance, vent, précipitations et pression
- 30 langues d’interface, dont l’arabe et l’hébreu (droite à gauche)

## Confidentialité et données

Les requêtes météo quittent votre navigateur vers [Open-Meteo](https://open-meteo.com/) et, pour les lieux américains, le [National Weather Service](https://www.weather.gov/). Si vous utilisez la localisation, le géocodage inverse va vers BigDataCloud et peut basculer vers OpenStreetMap Nominatim. L’hébergement et Google Fonts peuvent voir des données techniques ordinaires de requête.

duskline ne vend pas ces informations. Les prévisions servent à planifier et explorer, pas à prendre des décisions d’urgence. Détails : [Politique de confidentialité](../../privacy.html) et [Conditions d’utilisation](../../terms.html).

## Langues

Le sélecteur de l’appli et les pages juridiques partagent les 30 mêmes locales et la préférence `duskline-lang`. Les textes juridiques sont dans `src/js/data/legal/packs/`. Ces traductions du README sont dans [`docs/i18n/`](README.md).

## Développement

L’appli est du HTML, CSS et des scripts classiques statiques — pas d’empaqueteur.

```bash
npm run serve
# http://127.0.0.1:8000/
```

- Vérifier la syntaxe de chaque JS interne : `npm run check`
- Tests unitaires : `npm run test:unit`
- Les smokes Playwright simulent les API météo et ne consomment pas les quotas réels : `npm test`

## Déploiement

La racine du dépôt est le site. [Cloudflare Pages](https://dusklineweather.pages.dev/) est l’hébergeur principal prévu ; GitHub Pages est la sauvegarde. Les deux publient les fichiers statiques tels quels.

## Licence

Le code est sous [MIT](../../LICENSE). Les données météo appartiennent aux fournisseurs ci-dessus et restent soumises à leurs conditions. Pas pour la sécurité des personnes ni les urgences.
