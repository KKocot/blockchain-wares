# Credits

Dane i zasoby zewnetrzne redystrybuowane razem z kodem tego repozytorium.

## IP Geolocation by DB-IP

<https://db-ip.com>

Mapowanie zakresow adresow IP na kody krajow (`src/lib/geo/dataset.ts`) pochodzi z
**DB-IP IP to Country Lite** — <https://db-ip.com/db/download/ip-to-country-lite>.

Zbior jest udostepniony na licencji
[Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/),
ktora pozwala na redystrybucje i modyfikacje pod warunkiem podania zrodla. Dane w repo
sa przetworzone: zakresy zostaly scalone i przepakowane do formatu binarnego, dla IPv6
z precyzja ograniczona do /48 (szczegoly w `scripts/build_geoip.mjs`).

Wymagana atrybucja jest renderowana w panelu `/admin`, czyli na jedynym ekranie
korzystajacym z tych danych:

```html
<a href="https://db-ip.com">IP Geolocation by DB-IP</a>
```

Odswiezenie zbioru (wydania wychodza 1. dnia miesiaca):

```bash
node scripts/build_geoip.mjs
```
