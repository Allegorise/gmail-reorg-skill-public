---
name: gmail-trideni-uzivatel
description: Vytřídí Gmail (vas-ucet@gmail.com) do kategorií 1–7 podle konkrétních pravidel Pavly — seznamy odesílatelů, klíčová slova, priorita, pojistka na urgentní. Bezpečně, po dávkách, bez ztráty dat.
version: 1.0
audience: libovolný agent (Claude / ChatGPT / Grok) s přístupem ke Gmail API účtu vas-ucet@gmail.com
language: cs
---

# Skill: Vytřídění Gmailu do našich kategorií

Tenhle skill obsahuje **konkrétní pravidla Pavly** (ne obecný návod). Agent podle nich zařadí
příchozí i stávající poštu do štítků 1–7. Pokud hledáš obecnou metodiku, viz handoff
`GMAIL_REORG_HANDOFF.md`. Tady jsou **hotová pravidla k aplikaci**.

> **ZLATÉ PRAVIDLO:** U velkých/širokých dávek vždy nejdřív **změř počet + ukaž vzorek** (10–20 „odesílatel :: předmět"),
> teprve po souhlasu přesouvej. Mazání = **koš** (vratné), ne natvrdo. Nikdy nesahej na účetní forward (viz §8).

---

## 1. Přístup a mechanika

- **Účet:** vas-ucet@gmail.com. **OAuth refresh token** v `daily-command-center/.env.local`
  (`GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_TASKS_REFRESH_TOKEN`).
  Scopes: `gmail.modify` + `gmail.settings.basic`. (`gmail.modify` NEumí trvalé mazání.)
- **API:** `messages.list` (q + labelIds), `messages.batchModify` (≤1000 ids: addLabelIds/removeLabelIds),
  `settings/filters` (criteria.query/negatedQuery + action), `labels`.
- **Akce přes štítky:** přidat label; „mimo inbox" = removeLabelIds `INBOX`; „přečíst" = removeLabelIds `UNREAD`;
  „do koše" = addLabelIds `TRASH`.
- **Nástrahy:** `resultSizeEstimate` je JEN ODHAD (stránkuj a počítej reálné ID). `label:"A/B"` přes text
  **selhává na lomítka** → používej **labelIds** (přesné ID štítku z `labels.list`). `label:"6 Other"`
  NEmatchuje pod-štítky → vyjmenuj je přes OR. Filtr s `(( ... ))` nebo `subject:(...)` občas hází 400 →
  přepiš na ploché `OR`.

## 2. Štítky (ID)

```
1 Important=Label_44   (= HVĚZDIČKA / is:starred, ruční)
2 Security=Label_45  /Codes=Label_46  /Alerts=Label_47
3 Reading=Label_48
4 Shopping=Label_49
5 Junk=Label_50
6 Other=Label_51  /SaaS=Label_52 /Finance=Label_53 /Crypto=Label_54 /Government=Label_55 /Insurance=Label_56
7 Archive/Personal=Label_68  /Shopping=Label_60  (+ Security/Reading/Finance/Crypto/SaaS/Government/Insurance/Junk/Other)
```
> ID ověř přes `labels.list` (mohla se změnit). `Archive` je rezervované → `7 Archive`.

## 3. Lidský whitelist (NIKDY nepřesouvat, nech v inboxu)

```
kontakt-pravnik@example.com, kontakt-banka@example.com, "kontakt-osoba1", kontakt-rodina,
vas-byznys.com, vas-byznys.cz, vas-zamestnavatel.com, vase-firma.cz, fakturoid.cz, fakturoidmail.cz,
bankerka@vase-banka.cz, recepce@vas-lekar.cz
```
Osobní freemail (gmail.com/seznam.cz/tiscali.cz/centrum.cz/email.cz od lidí) = nech v inboxu.
Whitelist ROSTE — když Uživatel flagne kontakt jako „nech v inboxu", přidej ho sem.

## 4. Pojistka na urgentní (zůstává v inboxu, i když sedí na kategorii)

```
{upomínka "po splatnosti" "k úhradě" overdue "payment failed" neprošla "past due" splatnost}
```
POZN.: „action required" a „expiruje" do pojistky NEPATŘÍ (moc široké). Výjimka: Uživatel výslovně
řekla dát i selhanou platbu (Stripe/Grok „payment unsuccessful") do Shopping — řídí se její aktuální volbou.

## 5. Zařazení podle ODESÍLATELŮ (sender → kategorie)

**6 Other/SaaS (Label_52), skip inbox:** calendar-notification@google.com, cesky-hosting.cz,
notify.cloudflare.com, em1.cloudflare.com, email.openai.com, vercel.com, github.com, gitlab.com,
info.poda.cz, slack.com, notion.so, supabase.com, hostinger.com (mimo faktury), cron-job.org,
sc-noreply@google.com, wordpress@vase-firma.cz, simplex-services.com, typeshare.co, starlink (account update).

**6 Other/Finance (Label_53):** servis.zonky.cz, fio.cz, wise.com, unicreditleasing.cz, revolut.com, n26.com, gopay.cz.
  (Zonky „blíží se splátka / dorazila platba" → **KOŠ** přes filtr; „Zpožděná splátka" nech.)

**6 Other/Crypto (Label_54):** bybit.com, bybit.eu, okx.com, mexc.com, bingx.com, binance.com, coinbase.com, kraken.com, kucoin.com, coinmate.io, koinly.io (mimo invoice→Shopping).

**6 Other/Government (Label_55), ZŮSTÁVÁ v inboxu (+label):** portal.gov.cz, mojedatovaschranka.cz,
notifikace.gov.cz, financnisprava.cz, cssz.cz, accounts.google.com (bezpečnost).

**6 Other/Insurance (Label_56):** allianz.cz, komunikace.direct.cz, komunikace.koop.cz, generali.cz, generaliceska.cz, epojisteni.cz, csobpoj.cz.

**3 Reading (Label_48)** — ponechané hobby odběry: bingo@patreon.com, jiripribyl@creator.patreon.com,
info@jiripribyl.cz, umar@tradezella.com, zella@tradezella.com, jobs-noreply@linkedin.com,
jobalerts-noreply@linkedin.com, camilla@send.vas-byznys.com, info@news.limitlessbiochem.com,
sabrina@blotato.com, noreply@tradingview.com, hello@tradingview.com.

**4 Shopping (Label_49)** — e-shopy/doručovatelé: balikovna.cz, ppl.cz, packeta.com, zasilkovna.cz,
gls-czech.com, googleplay-noreply@google.com, benu.cz, recenze-zbozi.cz, ceskanadrz.cz, kanalizacelevne.cz,
callcentrum@mironet.cz, drevocentrum-as.cz, ceskytesar.cz, nejlevnejsipolykarbonat.cz, notify.niceboy.cz,
strechy-doplnky-levne@email.cz, stresni-krytiny-levne.cz, topstone.cz, info@luxor.cz, payu.com,
microsoft-noreply@google... (Microsoft 365 faktury), stripe.com (invoice/past due/statement), x.ai (invoice/credits).

**5 Junk (Label_50)** — reklama/odhlášené: academia-mail.com, t.allwyn.cz, thepraguecastle.com, pdfsimpli.com,
aiedge.news, roklen.cz, novinky.airbank.cz, duolingo.com, ewor.com, glassdoor.com, helius.xyz, intch.org,
nicnames.com, gravatar.com, googleone-noreply@google.com, analytics-noreply@google.com,
googleaistudio-noreply@google.com, bodygraph.io, send.calendly.com, smile.io (mimo objednávky), notino.cz
(mimo objednávky), rybizak.cz, bezpecne-na-motorce.cz, inrs.news, waze.com, gcr-noreply@google.com,
other-levels.com, alzaprofirmy@alza.cz, + `category:social` (instagram/tiktok/facebook/linkedin notifikace),
+ `category:promotions` (catch-all).

**Security (sender):** noreply-accounts@google.com → Alerts; account-update@amazon.com/.co.uk → Alerts;
verify@x.com → Alerts; googlewallet-noreply@google.com → Alerts; googlepay-noreply@google.com → Alerts.

## 6. Zařazení podle KLÍČOVÝCH SLOV (když sender nestačí)

**2 Security/Codes (Label_46)** (+ removeLabelIds UNREAD): `{"verification code" "confirmation code"
"login code" "ověřovací kód" "bezpečnostní kód" "jednorázový kód" "security code" "one-time" OTP
"authentication code" "2FA" passcode "your temporary"}` − negace `{faktura receipt objednávka "order confirmation"}`.

**2 Security/Alerts (Label_47):** `{"new login" "new sign-in" "nové přihlášení" "new device" "nové zařízení"
"password changed" "password updated" "password reset" "reset your password" "změna hesla" "heslo změněno"
passkey "přístupový klíč" "security alert" "bezpečnostní upozornění" "suspicious activity" "sign-in attempt"
"signed-in to your account" "account was recovered" "verify your email" "account has been linked"}`.

**4 Shopping (Label_49):** `{"your receipt" "receipt from" "order confirmation" "potvrzení objednávky"
"potvrzení o objednávce" "číslo objednávky" "daňový doklad" "your trip with" "jízda s" "order has shipped"
"byla odeslána" "stvrzenka" "za platbu" invoice faktura}` − pojistka (§4). + „konec/koniec/end předplatného".

**5 Junk (Label_50):** změny podmínek `{"obchodních podmínek" "smluvních podmínek" "Terms of Use"
"Terms of Service" "Terms and Conditions" "updated Terms" "Terms update" "právních smluv"}`;
Privacy Policy `{"updating our Privacy Policy" "zásady ochrany soukromí"}`; registrace `{"byl zaregistrován
nový uživatel" "nová registrace" "účet byl vytvořen" "account created" "successfully registered"
"Vaše přihlašovací jméno"}`; dotazníky/recenze `{"Jaký byl Váš nákup" "Hodnocení objednávky" "Jak jsme si vedli"
"jak jste byli spokojeni" "čekáme na vaše hodnocení" "waiting for your review" "how was your stay"}`;
obchodní nabídky `{"obchodní sdělení" "obchodní nabídka" "speciální nabídka" "výhodnější nabídku"
"special offer"}` − negace `{"cenová nabídka" poptávka objednávka faktura}`.

**Chráněné výjimky (NEdávat do Junku):** `{"vaší návštěvy" "připomínka návštěvy" "your appointment"
"your reservation" "potvrzení rezervace" rezervace schůzka "booking confirmation"}`.

## 7. Priorita (dvoj-štítky)

Pořadí (nejvyšší vyhrává): `2 Security → 1 Important → 4 Shopping → 6 Other → 3 Reading → 5 Junk`.
Dedup = projdi od nejvyšší kategorie dolů; u zprávy s víc štítky **odeber nižší** (batchModify removeLabelIds).
POZN.: toto je jednorázové — u nové pošty se dvoj-štítek může vrátit.

## 8. NIKDY

- Nesahat na **filtr #58** (forward receipt/invoice/statement → ucetni@vase-firma.cz, účetní bot).
- Nemazat natvrdo (jen TRASH). `gmail.modify` trvalé mazání stejně neumí.
- Nepřesouvat lidský whitelist (§3) ani Government z inboxu.

## 9. Postup (dávky)

1. **Audit:** spočítej inbox, rozpad `category:*`, stáří, top odesílatele (navzorkuj s rate-limiterem ~14 req/s).
2. **Štítky** (schéma §2) — zakládání je bezpečné.
3. Po kategoriích (Security → Shopping → Reading → Junk → Other): pro každou změř + ukaž vzorek, pak
   `batchModify` (add label, remove INBOX; u Codes i UNREAD) + založ **filtr** (criteria + negatedQuery → action).
4. **Priorita/dedup** (§7).
5. **Archiv dle stáří:** `in:inbox older_than:2y` → `7 Archive/Personal` (remove INBOX). Chraň práci/osobní/úřady.
6. **Multiple Inboxes** (Gmail UI): sekce DŮLEŽITÉ=`is:starred`, BEZPEČNOST=`label:"2 Security" OR /Codes OR /Alerts`,
   KE ČTENÍ=`label:"3 Reading"`, NÁKUPY=`label:"4 Shopping"`, BALAST=`label:"5 Junk"`, OSTATNÍ=`label:"6 Other"`.

## 10. Trénink (jak Uživatel pracuje)

Uživatel posílá screenshot/popis s cílovou kategorií („shopping", „balast", „security", „crypto", „hosting"…).
Agent: najde odesílatele/klíčové slovo, **přesune existující** kusy + **založí filtr** pro budoucí. Když je to
obecné pravidlo („všechny změny podmínek do balastu"), udělej klíčovkové pravidlo, ne jen 1 sender.
Každý flag rozšiřuje pravidla natrvalo. U nejednoznačných („asi security?") navrhni a nech rozhodnout.
