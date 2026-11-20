# Gmail tlačítko „→ 7 Archive/Personal"

Jednoduchý Google Apps Script add-on. Přidá do Gmailu tlačítko, které otevřený
e-mail jedním klikem oštítkuje `7 Archive/Personal` a vyndá z inboxu (archivuje).
Běží jen pro tebe, nic se nepublikuje.

## Nasazení (cca 5 minut)

1. Otevři **https://script.google.com** → **Nový projekt**.
2. Soubor `Code.gs` (vlevo) – smaž výchozí obsah a vlož obsah **Code.gs** z téhle složky.
3. Vlevo klikni na ⚙ **Project Settings** → zaškrtni **„Show 'appsscript.json' manifest file in editor"**.
4. Vrať se do editoru (ikona `<>`), otevři soubor **`appsscript.json`** a nahraď jeho
   obsah obsahem **appsscript.json** z téhle složky. Ulož (Ctrl+S).
5. Vpravo nahoře **Deploy → Test deployments**.
6. V okně klikni na ozubené kolo „Select type" (pokud je potřeba) → **Gmail add-on**,
   pak **Install** / **Done**. (Test deployment stačí – add-on bude fungovat jen v tvém
   Gmailu bez publikování.)
7. Při prvním použití tě Google vyzve k **povolení oprávnění** (authorize) – povol.
   Protože to není ověřená aplikace, klikni „Advanced → Go to project (unsafe)" a povol.

## Použití

- V Gmailu otevři e-mail.
- Vpravo v postranním panelu (svislá lišta s ikonami) klikni na ikonu add-onu
  **„Archive → Personal"**.
- Klikni na tlačítko **📁 → 7 Archive/Personal**. Hotovo – e-mail zmizí z inboxu a má štítek.

> Tip: když si panel add-onu necháš otevřený, je to reálně jeden klik na zprávu.

## Kdyby sis štítek přejmenovala

V `Code.gs` nahoře uprav řádek:
```js
var TARGET_LABEL = '7 Archive/Personal';
```

---

## Alternativy (bez instalace)

- **Klávesová zkratka (nejrychlejší):** Nastavení → Zobrazit všechna nastavení →
  Obecné → **Klávesové zkratky: Zapnuto**. Pak u označeného e-mailu stiskni **`v`**
  (Move to), napiš `7 Arch…`, Enter → oštítkuje + archivuje. Žádné tlačítko, ale
  velmi rychlé.
- **Přetažení:** chytni e-mail a přetáhni na `7 Archive/Personal` v levém menu.
- **Skutečné tlačítko v horní liště** (ne v panelu) by chtělo browser rozšíření
  (Chrome extension) – to je víc práce a křehčí; můžu dodat, kdybys chtěla.
