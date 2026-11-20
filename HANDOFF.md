# Gmail reorganizace — handoff pro pokračování v novém chatu

**Datum:** 2026-11-20. **Kontext:** Součást Allegorise Command Center (model „dashboard = in:inbox").
Uživatel chtěla vytřídit přetížený Gmail, aby do dashboardu chodily jen důležité e-maily. V tomto
chatu jsme udělali **kompletní reorganizaci Gmailu** (ne jen filtry — přetřídění, archivaci, úklid).

**Výsledek:** inbox sražen z **~21 145 na ~300** zpráv. Jen aktuální/důležitá pošta; vše ostatní
oštítkované a filtrované, staré archivované, nic smazáno (kromě LinkedIn → koš a koš pak vysypán Pavlou).

**Přístup:** přes Gmail API, OAuth refresh token v `daily-command-center/.env.local`
(`GOOGLE_TASKS_REFRESH_TOKEN`, scopes `gmail.modify` + `gmail.settings.basic`). Skripty běžely z Node
(scratchpad, dočasné). App je v režimu Testing → token ~7 dní, pak re-consent (viz paměť oauth-testing-mode).
`gmail.modify` NEumí trvalé mazání (potřeba `mail.google.com`) — proto koš vysypala Uživatel ručně.

---

## SCHÉMA ŠTÍTKŮ (finální)

```
1 Important        ← = HVĚZDIČKA (is:starred). Uživatel si důležité hvězdí ručně.
2 Security
2 Security/Codes   ← OTP / ověřovací / login / confirmation kódy (přečtené, mimo inbox)
2 Security/Alerts  ← přihlášení, nové zařízení, passkey, změna/reset hesla, account recovery, breach
3 Reading          ← 8 ponechaných hobby odběrů (Patreon/Jiří Přibyl, TradeZella, TradingView, LinkedIn joby…)
4 Shopping         ← AKTUÁLNÍ účtenky/objednávky/doklady/faktury-zaplaceno, doručování
5 Junk             ← reklama, odhlášené odběry, sociální sítě, dotazníky, změny podmínek…
6 Other/SaaS       ← provozní služby: Google kalendář, hosting, Cloudflare, Vercel, GitHub, WordPress, cron-job…
6 Other/Finance    ← banky (Zonky, Fio, Wise, UniCredit…)  [POZN. PayU překlopeno do Shopping]
6 Other/Crypto     ← Bybit, OKX, MEXC, Coinmate, Koinly…
6 Other/Government ← Portál občana, datová schránka (ZŮSTÁVÁ v inboxu + štítek)
6 Other/Insurance  ← Allianz, Direct, Kooperativa, Generali…
7 Archive/Personal ← sloučený archiv staré osobní+pracovní pošty (~11 800), sem i ruční archivace
7 Archive/Shopping ← staré účtenky (přesunuto z 4 Shopping)
7 Archive/{Security,Reading,Finance,Crypto,SaaS,Government,Insurance,Junk,Other} ← starý archiv dle kategorií
```

> `Archive` je rezervované jméno → používáme `7 Archive`.

---

## ROZHODNUTÍ, KTERÁ PADLA

1. **Klasifikace = seznam odesílatelů (allowlist) + lidský whitelist + klíčová slova.** NE hádání
   „služba vs. člověk" (to selhávalo). Lidský whitelist (nech v inboxu): kontakt-pravnik@example.com,
   kontakt-banka@example.com, „kontakt-osoba1", kontakt-rodina, vas-byznys.*, vas-zamestnavatel.com, vase-firma.cz, fakturoid.
2. **Pojistka pro urgentní:** „upomínka / po splatnosti / k úhradě / payment failed / neprošla / past due /
   splatnost" **zůstává v inboxu**, i když sedí na kategorii. (POZOR: „action required" a „expiruje" jsme
   z pojistky VYNDALI — bylo moc široké, drželo to Cloudflare apod.)
3. **„Smaž" = koš** (vratné 30 dní). Na konci Uživatel koš ručně vysypala (napevno).
4. **1 Important = hvězdička.** Sekci DŮLEŽITÉ v Multiple Inboxes má mít `is:starred` (Uživatel ji nastaví v UI).
5. **Priorita (když víc štítků):** `2 Security → 1 Important → 4 Shopping → 6 Other → 3 Reading → 5 Junk`.
   Dedup = odebrat nižší štítek. (Zatím JEDNORÁZOVÝ — u nové pošty se dvoj-štítky můžou vrátit.)
6. **Obecná pravidla → Balast (Junk):** změny obchodních/smluvních **podmínek** + „Terms of Use/Service/
   and Conditions", **Privacy Policy** updaty, **nové registrace** účtů, **dotazníky/recenze** (hodnocení
   nákupu/návštěvy), **obchodní nabídky / „obchodní sdělení"**.
7. **Obecné pravidlo → Shopping:** „konec/koniec/end **předplatného**" (CZ/EN/SK).
8. **Government zůstává v inboxu** (datová schránka může nést termíny). Práce+osobní (vas-byznys, Zaměstnavatel,
   fakturoid, gmail/seznam lidé) zůstali v inboxu.
9. **Archiv dle stáří:** vše **starší 2 let** → odstěhováno z inboxu do **7 Archive/Personal** (sloučeno;
   mezidočasná „Stará pošta" smazána). Inbox = jen posledních ~2 roky.
10. **4 Shopping = aktuální**, staré účtenky přesunuty do **7 Archive/Shopping**. Nové účtenky chodí dál do
    4 Shopping (NEměnit — Uživatel potvrdila).
11. **Staré „_obsolete" osobní štítky** (Historical/HP+komora+Henry+Honza, Jeziiiiisek, Kunstova, Lišák,
    Mirka, Miskaliska, Petr, Radek, Vojta, Zemedelceni) sloučeny do 7 Archive/Personal; prázdné štítky smazány.
12. **LinkedIn starý štítek (1 391) → koš.** Microsoft 365 faktury (starý „vas-byznys" štítek, 218) → 4 Shopping
    + filtr na budoucí; passkeys→Security, cena→Junk.
13. **Účetní forward #58** (receipt/invoice → ucetni@vase-firma.cz) jsme NIKDY nesahali (zachován).
14. **Gmail add-on** (Apps Script, složka `gmail-archive-addon/`) na 1-klik archivaci do 7 Archive/Personal —
    FUNGUJE, ale omezený: je jen v bočním panelu (ne v horní liště) a po akci nezavře otevřený e-mail.

---

## OTEVŘENÉ / NEDODĚLANÉ

- **Přenosný skill `GMAIL_REORG_SKILL.md`** — rozepsaný, NEDOKONČENÝ (má obsáhnout všechna pravidla/nástrahy
  z tohoto chatu; Uživatel ho chce dát jakémukoli agentovi). Dopsat.
- **Multiple Inboxes sekce** — Uživatel si je nastavila z jiného vlákna; sekce DŮLEŽITÉ má být `is:starred`.
  Mnou neověřeno.
- **Dvoj-štítky u NOVÉ pošty** — prioritní dedup byl jednorázový. Nová pošta, co sedí na víc filtrů, může
  dvoj-štítek vytvořit znovu. Řešení (NEimplementováno): občasné přečištění, NEBO výlučné dotazy v MI sekcích.
- **1 nezařazená Microsoft zpráva** zbývá.
- **Staré `_obsolete` štítky, kterých jsme se NEdotkli:** Zaměstnavatel + Brunel, Vodafone, ptservis.com,
  Sent Items, vas-ucet@centrum.cz, vas-ucet@hotmail (2×), „Pajushka v říši".
- **Chrome rozšíření** pro skutečné tlačítko v horní liště — nabídnuto, NEpostaveno.
- **Klávesa `v`** vyžaduje zapnuté klávesové zkratky v Gmailu (Uživatel měla zapnout).
- **Staré finance/airbank štítky z původních 69 filtrů** — nechány, jak byly (mimo inbox, pod starými štítky).
  Volitelné sloučení do 6 Other schématu NEuděláno.

---

## TODO LIST

- [ ] Dopsat `GMAIL_REORG_SKILL.md` (přenosný playbook se všemi pravidly a nástrahami)
- [ ] Nastavit DŮLEŽITÉ sekci Multiple Inboxes na `is:starred` + ověřit ostatní sekce
- [ ] Rozhodnout strategii dvoj-štítků u nové pošty (přečištění vs. výlučné sekce)
- [ ] (Volitelné) Chrome rozšíření s tlačítkem v horní liště
- [ ] (Volitelné) Sloučit staré finance/insurance baseline štítky → 6 Other
- [ ] (Volitelné) Dořešit/smazat zbylé `_obsolete` štítky
- [ ] Průběžně: označovat špatně zařazenou poštu → přidávám pravidlo (dělá se za běhu)
- [ ] Růst lidského whitelistu podle nových kontaktů

---

## DOPAD NA COMMAND CENTER (dashboard)

Gmail je teď uklizený dle modelu „dashboard = in:inbox". Inbox má ~300 (jen důležité). **Dashboard v1 lze
odblokovat:** ingest uvolnit z `in:inbox newer_than:7d`/max25 na `in:inbox` (teď to nezavalí). Bezpečnostní
počítadlo napojit na štítek `2 Security`. Reorg použil scope `gmail.settings.basic` (filtry) — ten je v tokenu.
Viz sekce „Dohodnutý směr e-mailů" v paměti command-center (ta se tímto naplnila).
