---
name: gmail-inbox-sorting
description: Sorts a Gmail inbox into categories 1–7 by explicit rules — sender lists, keywords, priority, and a safety guard for urgent mail. Safe, batched, no data loss.
version: 1.0
audience: any agent (Claude / ChatGPT / Grok) with Gmail API access to the mailbox
language: en
---

# Skill: Sort Gmail into categories

This skill holds **ready-to-apply rules**. An agent uses them to file both incoming and existing
mail into labels 1–7. For general methodology and context see `BACKGROUND.md`.

> **GOLDEN RULE:** For large/broad batches, first **count + show a sample** (10–20 "sender :: subject"),
> and only move after approval. "Delete" = **Trash** (reversible), never a hard delete. Never touch the
> accounting-forward filter (§8).

> **Anonymized:** addresses like `your-account@gmail.com`, `contact-lawyer@example.com`,
> `your-company.cz` are placeholders — replace with the real mailbox's values.

> **⚙ SETUP — ASK FIRST (two questions):**
> 1. *"What language(s) is most of your incoming mail in?"* → localize the keyword patterns in §4 and §6
>    to that language (translate each concept and use those as the match terms). **Sender lists (§5) are
>    language-independent** — they don't change. The tables below give **English + Czech** as a starting
>    point; add the user's language (keep EN/CZ if the mailbox is mixed).
> 2. *"How old should mail be before it's archived — moved out of the inbox into `7 Archive/…` only?"*
>    e.g. **6m / 1y / 2y / 3y**. Use it as the `older_than:` threshold in §9 step 5.
>
> Defaults if unanswered: EN+CS keywords, archive older than **2 years**.

---

## 1. Access & mechanics

- **Account:** `your-account@gmail.com`. **OAuth refresh token** kept in a local `.env` file
  **outside this repo** (`GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`,
  `GOOGLE_TASKS_REFRESH_TOKEN`). Scopes: `gmail.modify` + `gmail.settings.basic`.
  (`gmail.modify` cannot permanently delete.)
- **API:** `messages.list` (q + labelIds), `messages.batchModify` (≤1000 ids: addLabelIds/removeLabelIds),
  `settings/filters` (criteria.query/negatedQuery + action), `labels`.
- **Label actions:** add a label; "skip inbox" = removeLabelIds `INBOX`; "mark read" = removeLabelIds `UNREAD`;
  "to trash" = addLabelIds `TRASH`.
- **Gotchas:** `resultSizeEstimate` is ONLY an estimate (paginate and count real IDs). `label:"A/B"` in a
  text search **fails on slashes** → use **labelIds** (exact label ID from `labels.list`). `label:"6 Other"`
  does NOT match sub-labels → list them with OR. A filter query with `(( ... ))` or `subject:(...)` sometimes
  returns 400 → flatten to plain `OR`.

## 2. Labels

```
1 Important    (= STAR / is:starred, manual)
2 Security  /Codes  /Alerts
3 Reading
4 Shopping
5 Junk
6 Other  /SaaS /Finance /Crypto /Government /Insurance
7 Archive/Personal   /Shopping   (+ Security/Reading/Finance/Crypto/SaaS/Government/Insurance/Junk/Other)
```
> Look up IDs via `labels.list`. `Archive` is a reserved name → use `7 Archive`.

## 3. Human whitelist (NEVER move; keep in inbox)

```
contact-lawyer@example.com, contact-bank@example.com, "contact-person1", family-contact,
your-business.com, your-employer.com, your-company.cz, invoicing-service.cz,
banker@your-bank.cz, reception@your-doctor.cz
```
Personal freemail (gmail.com/seznam.cz/… from real people) = keep in inbox.
**The whitelist grows** — when the user flags a contact as "keep in inbox", add it here.

## 4. Urgent safety guard (stays in inbox even if it matches a category)

Concept = *overdue / due / failed payment / reminder to pay*. Localize to the mailbox's language (§ Language setup).

- **EN:** `{reminder overdue "past due" "amount due" "payment failed" "pay now"}`
- **CS:** `{upomínka "po splatnosti" "k úhradě" neprošla splatnost}`

NOTE: "action required" and "expires" do NOT belong in the guard (too broad). The user may override
per-case (e.g. move a failed payment to Shopping) — follow their explicit choice.

## 5. Routing by SENDER (sender → category)

Replace these examples with the real mailbox's senders. Categories and the pattern are the point.

**6 Other/SaaS, skip inbox:** calendar-notification@google.com, web-hosting providers,
notify.cloudflare.com, email.openai.com, vercel.com, github.com, gitlab.com, slack.com, notion.so,
supabase.com, hosting invoices excluded, cron services, sc-noreply@google.com (Search Console),
wordpress@your-company.cz (site notices).

**6 Other/Finance:** your-bank, wise.com, revolut.com, n26.com, leasing providers, payment gateways.
  (Routine "payment received / upcoming instalment" notices → **Trash** via a filter; keep "overdue".)

**6 Other/Crypto:** bybit.com, bybit.eu, okx.com, mexc.com, bingx.com, binance.com, coinbase.com,
kraken.com, kucoin.com, local exchanges, koinly.io (invoices → Shopping).

**6 Other/Government, KEEP in inbox (+label):** national e-gov portals, data mailbox, tax office,
social-security, accounts.google.com (security).

**6 Other/Insurance:** your insurers (allianz, direct, kooperativa/koop, generali, …).

**3 Reading** — kept hobby subscriptions: the newsletters/creators the user deliberately keeps.

**4 Shopping** — e-shops & couriers: parcel services (packeta, dpd, gls, local couriers),
googleplay-noreply@google.com, pharmacies/e-shops the user buys from, payment confirmations,
microsoft-noreply (Microsoft 365 invoices), stripe.com (invoice/past due/statement), x.ai (invoice/credits).

**5 Junk** — marketing / unsubscribed: newsletters, lottery/promo, coaching, app promos, job boards,
`category:social` (instagram/tiktok/facebook/linkedin notifications), review platforms, plus
`category:promotions` as a catch-all.

**Security (by sender):** noreply-accounts@google.com → Alerts; account-update@amazon.* → Alerts;
verify@x.com → Alerts; googlewallet-noreply@google.com, googlepay-noreply@google.com → Alerts.

## 6. Routing by KEYWORD (localize to the mailbox's language — see Language setup)

Each row is a **concept** with a target label. Use the keyword set for the user's language.
EN + CS are given as a start; add the user's language. (Codes also get removeLabelIds `UNREAD`.)

| Concept | → Label | English keywords | Czech keywords |
|---|---|---|---|
| One-time / verification code | 2 Security/Codes | `"verification code" "confirmation code" "login code" "security code" "one-time" OTP "authentication code" "2FA" passcode` | `"ověřovací kód" "bezpečnostní kód" "jednorázový kód" "přihlašovací kód"` |
| Login / account security alert | 2 Security/Alerts | `"new login" "new sign-in" "new device" "password changed" "password reset" "reset your password" passkey "security alert" "suspicious activity" "verify your email" "account was recovered" "account has been linked"` | `"nové přihlášení" "nové zařízení" "změna hesla" "reset hesla" "přístupový klíč" "bezpečnostní upozornění" "podezřelá aktivita" "ověřte svůj e-mail"` |
| Receipt / order / tax document | 4 Shopping | `"your receipt" "order confirmation" "order number" "tax document" invoice "has shipped" "your trip with"` | `"potvrzení objednávky" "číslo objednávky" "daňový doklad" faktura stvrzenka "byla odeslána" "jízda s"` |
| End of subscription | 4 Shopping | `"end of subscription" "subscription ending" "subscription cancellation"` | `"konec předplatného" "ukončení předplatného" "předplatné končí"` (SK `"koniec predplatného"`) |
| Terms / policy change | 5 Junk | `"terms of use" "terms of service" "terms and conditions" "updated terms" "privacy policy update"` | `"obchodních podmínek" "smluvních podmínek" "změna podmínek" "zásady ochrany soukromí" "právních smluv"` |
| New account registration | 5 Junk | `"account created" "new user registered" "successfully registered" "your login"` | `"nová registrace" "účet byl vytvořen" "byl zaregistrován nový uživatel" "přihlašovací jméno"` |
| Survey / review request | 5 Junk | `"how was your" "rate your" "waiting for your review" "leave a review" "your feedback"` | `"Jaký byl Váš nákup" "Hodnocení objednávky" "jak jste byli spokojeni" "čekáme na vaše hodnocení"` |
| Commercial offer | 5 Junk | `"commercial communication" "special offer" "exclusive offer"` − negate `{"price quote" inquiry order invoice}` | `"obchodní sdělení" "obchodní nabídka" "speciální nabídka"` − negace `{"cenová nabídka" poptávka objednávka faktura}` |
| **Protected — do NOT junk** | *(keep)* | `"your appointment" "appointment reminder" "your reservation" "booking confirmation" reservation` | `"vaší návštěvy" "potvrzení rezervace" rezervace schůzka "připomínka návštěvy"` |

## 7. Priority (dual labels)

Order (highest wins): `2 Security → 1 Important → 4 Shopping → 6 Other → 3 Reading → 5 Junk`.
Dedup = go top-down; on a message with multiple labels, **remove the lower** one (batchModify removeLabelIds).
This one-off pass is fine for existing mail. For **new** mail (several filters can match one message), keep it
clean one of two ways — see §11.

## 7a. Keeping categories clean on an ongoing basis (dual labels)

**Option A — display dedup (simplest, no automation).** Make the Multiple Inboxes section queries
*mutually exclusive*: every section excludes the labels of all higher-priority sections. The dual label
stays on the message, but it shows in exactly one section. Example (priority Security > Important(starred) >
Shopping > Other > Reading):
- SECURITY (highest): `label:"2 Security/Codes" OR label:"2 Security/Alerts" OR label:"2 Security"`
- IMPORTANT: `is:starred -label:"2 Security/Codes" -label:"2 Security/Alerts" -label:"2 Security"`
- SHOPPING: `label:"4 Shopping" -label:"2 Security/Codes" -label:"2 Security/Alerts" -label:"2 Security" -is:starred`
- OTHER: `(label:"6 Other/SaaS" OR label:"6 Other/Finance" OR label:"6 Other/Crypto" OR label:"6 Other/Government" OR label:"6 Other/Insurance") -label:"2 Security/Codes" -label:"2 Security/Alerts" -label:"2 Security" -is:starred -label:"4 Shopping"`
- READING: `label:"3 Reading" -label:"2 Security/Codes" -label:"2 Security/Alerts" -label:"2 Security" -is:starred -label:"4 Shopping"`

(`label:"6 Other"` doesn't include its sub-labels — list them with OR.)

**Option B — scheduled label cleanup (Apps Script time trigger).** A tiny Google Apps Script running on a
daily time-based trigger in the user's own account removes the lower label where a higher one is present
(same logic as §7, top-down tiers). No server, no token. Set it with `ScriptApp.newTrigger('dedup')
.timeBased().everyDays(1).create()`. Use this if you want the labels themselves cleaned (not just the view).

## 8. NEVER

- Don't touch the **accounting-forward filter** (forwards receipt/invoice/statement to the accountant).
- Don't hard-delete (Trash only). `gmail.modify` can't permanently delete anyway.
- Don't move the human whitelist (§3) or Government out of the inbox.

## 9. Procedure (batches)

0. **Setup (ask first):** (a) dominant mail language → localize §4/§6 keywords (sender lists §5 don't change);
   (b) archive age threshold (6m/1y/2y/3y) → used in step 5.
1. **Audit:** count the inbox, break down by `category:*`, by age, top senders (sample with a rate limiter ~14 req/s).
2. **Labels** (scheme §2) — creating labels is safe.
3. Per category (Security → Shopping → Reading → Junk → Other): measure + show a sample, then
   `batchModify` (add label, remove INBOX; for Codes also UNREAD) + create a **filter** (criteria + negatedQuery → action).
4. **Priority/dedup** (§7).
5. **Archive by age:** `in:inbox older_than:<chosen>` → `7 Archive/Personal` (add label + remove INBOX; stays
   searchable). `<chosen>` = the threshold from setup §0 (default `2y`). Protect work/personal/government.
6. **Multiple Inboxes** (Gmail UI): sections IMPORTANT=`is:starred`, SECURITY=`label:"2 Security" OR /Codes OR /Alerts`,
   READING=`label:"3 Reading"`, SHOPPING=`label:"4 Shopping"`, JUNK=`label:"5 Junk"`, OTHER=`label:"6 Other"`.

## 10. Training loop (how the user works)

The user sends a screenshot/description with a target category ("shopping", "junk", "security", "crypto",
"hosting"…). The agent: finds the sender/keyword, **moves existing** messages + **creates a filter** for
future mail. When it's a general rule ("all terms-of-service changes to junk"), make a keyword rule, not a
single-sender one. Every flag permanently extends the rules. For ambiguous cases ("maybe security?"),
propose and let the user decide.
