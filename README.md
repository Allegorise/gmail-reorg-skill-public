# Gmail třídicí skill (Uživatel)

> ⚠️ **Anonymizovaná verze.** Konkrétní osobní adresy, jména a firmy jsou nahrazeny zástupnými (`vas-ucet`, `kontakt-pravnik`, `vase-firma`…). Při použití si doplň vlastní seznamy odesílatelů a whitelist.

Přenosný **skill pro AI agenta** (Claude / ChatGPT / Grok), který vytřídí Gmail do stálých
kategorií podle konkrétních pravidel — oddělí důležitou poštu od reklamy, bezpečnostního šumu
a účtenek, a udrží to filtry i do budoucna. Vznikl reálnou reorganizací schránky
(inbox **~21 000 → ~300** zpráv).

## Co v repu je

| Soubor | Co to je |
|---|---|
| **[GMAIL_REORG_SKILL.md](GMAIL_REORG_SKILL.md)** | **Skill** = hotová pravidla k aplikaci (schéma štítků, seznamy odesílatelů, klíčovky, priorita, pojistka). Tohle dáš agentovi. |
| **[HANDOFF.md](HANDOFF.md)** | Handoff / rozhodnutí · otevřené body · TODO (kontext a stav reorganizace). |
| **[addon/](addon/)** | Gmail add-on (Google Apps Script) na 1-klik archivaci do `7 Archive/Personal` + návod nasazení. |

## Jak to použít

### A) S agentem, co umí volat Gmail API (Claude Code / vlastní skript)
1. Agentovi dej do kontextu **`GMAIL_REORG_SKILL.md`** (+ volitelně `HANDOFF.md`).
2. Zajisti **OAuth přístup** ke schránce (refresh token, scopes `gmail.modify` +
   `gmail.settings.basic`). Token **NENÍ** v tomto repu — drž ho mimo (viz `.gitignore`).
3. Řekni agentovi, co chceš (audit / vytřídit / „tenhle e-mail do Shopping"). Agent podle pravidel
   přesune existující poštu a založí filtry pro budoucí.

### B) Jako referenční playbook pro jakéhokoli agenta
I bez API se dá skill použít jako **přesný návod**, jak schránku třídit (schéma, pravidla, priorita).

### Formát štítků
```
1 Important (= hvězdička) · 2 Security (/Codes /Alerts) · 3 Reading · 4 Shopping · 5 Junk
6 Other (/SaaS /Finance /Crypto /Government /Insurance) · 7 Archive (/Personal /Shopping …)
```

## Bezpečnostní zásady (jsou v skillu)

- **Měř → ukaž vzorek → přesuň** (u velkých dávek). 
- „Smaž" = **koš** (vratné 30 dní), ne natvrdo.
- **Pojistka:** urgentní (upomínka/splatnost/platba neprošla) zůstává v inboxu.
- **Nikdy nesahat** na účetní forward (filtr #58 → ucetni@vase-firma.cz).
- **Žádné tokeny v repu.** `.env*` je v `.gitignore`.

## Gmail add-on (volitelné)

Ve `addon/` je malý Apps Script add-on, který přidá tlačítko **📁 → 7 Archive/Personal**
(1-klik archivace). Nasazení: `addon/NASAZENI.md`. Pozn.: add-on žije v bočním panelu Gmailu
(ne v horní liště) a po akci e-mail nezavře — to je limit Apps Script add-onů.

## Omezení / stav

- Priorita (dvoj-štítky) je jednorázová — u nové pošty se může štítek zdvojit; řeš přečištěním
  nebo výlučnými sekcemi Multiple Inboxes.
- Seznamy odesílatelů rostou podle toho, jak uživatel flaguje poštu (každý flag = nové pravidlo).

---
*Osobní nástroj. Pravidla jsou šitá na konkrétní schránku; pro jinou si uprav seznamy odesílatelů a whitelist.*
