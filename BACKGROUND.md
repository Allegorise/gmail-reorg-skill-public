# Background — decisions, open items, TODO

Context for the Gmail sorting skill: what a full reorganization of an overloaded Gmail looked like,
which decisions were made, what's still open. (Anonymized example.)

**Result:** inbox reduced from **~21,145 to ~300** messages. Only recent/important mail stays in the
inbox; everything else is labeled, filtered and archived — nothing deleted (except one old marketing
label dumped to Trash, which the user then emptied by hand).

**Access:** via the Gmail API, an OAuth refresh token in a local `.env` file (kept out of this repo),
scopes `gmail.modify` + `gmail.settings.basic`. Scripts ran from Node (ephemeral). If the OAuth app is in
Testing mode, the token lasts ~7 days, then re-consent. `gmail.modify` can't permanently delete — the
Trash was emptied manually in the UI.

---

## Label scheme (final)

```
1 Important        = STAR (is:starred). The user stars important mail by hand.
2 Security/Codes   OTP / verification / login / confirmation codes (read, out of inbox)
2 Security/Alerts  sign-in, new device, passkey, password change/reset, account recovery, breach
3 Reading          kept hobby subscriptions
4 Shopping         CURRENT receipts/orders/tax documents/paid invoices, delivery tracking
5 Junk             marketing, unsubscribed senders, social, surveys, terms changes…
6 Other/SaaS       operational service notices (calendar, hosting, Cloudflare, GitHub, WordPress, cron…)
6 Other/Finance    banks, payment gateways
6 Other/Crypto     crypto exchanges, tax tools
6 Other/Government national portals, data mailbox (STAYS in inbox + label)
6 Other/Insurance  insurers
7 Archive/Personal merged archive of old personal+work mail; also manual archiving target
7 Archive/Shopping old receipts (moved out of 4 Shopping)
7 Archive/{…}      older archive by category
```
> `Archive` is a reserved Gmail name → `7 Archive`.

---

## DECISIONS MADE

1. **Classification = sender allowlist + human whitelist + keywords.** NOT guessing "service vs human"
   (that failed badly). The human whitelist (keep in inbox) grows as the user flags contacts.
2. **Urgent safety guard:** "reminder / overdue / past due / amount due / payment failed" **stays in the
   inbox** even if it matches a category. (We REMOVED "action required" and "expires" from the guard —
   too broad; it was holding back routine service mail.)
3. **"Delete" = Trash** (reversible 30 days). The user emptied the Trash by hand at the end.
4. **1 Important = star.** The Multiple Inboxes IMPORTANT section should be `is:starred`.
5. **Priority (when multiple labels):** `2 Security → 1 Important → 4 Shopping → 6 Other → 3 Reading →
   5 Junk`. Dedup = remove the lower label. (One-off — new mail can re-create a double label.)
6. **General rules → Junk:** changes to terms of use/service/conditions, Privacy Policy updates, new-account
   registrations, satisfaction surveys/review requests, commercial offers ("commercial communication").
7. **General rule → Shopping:** "end of subscription" (multi-language).
8. **Government stays in the inbox** (official mail can carry deadlines). Work + personal mail stayed in
   the inbox (then archived by age).
9. **Archive by age:** everything **older than 2 years** moved out of the inbox to **7 Archive/Personal**.
   Inbox = only the last ~2 years.
10. **4 Shopping = current;** old receipts moved to **7 Archive/Shopping**. New receipts keep going to
    4 Shopping (unchanged).
11. **Old topic/person labels** merged into 7 Archive/Personal; empty labels deleted.
12. **Accounting forward** (receipt/invoice → accountant) was NEVER touched (preserved).
13. **Gmail add-on** (Apps Script, `addon/`) for one-click archiving — works, but limited (side panel only,
    doesn't close the open email).

---

## OPEN / NOT DONE

- **Multiple Inboxes sections** — the IMPORTANT section should be `is:starred`. Verify all sections.
- **Dual labels on NEW mail** — the priority dedup was one-off. New mail matching several filters can get a
  double label again. Options (not implemented): periodic re-clean, OR mutually-exclusive MI section queries.
- **A true top-toolbar archive button** — would require a browser extension (Apps Script add-ons can only
  use the side panel). Not built.
- **Keyboard shortcut `v`** (Move to) needs Gmail keyboard shortcuts enabled.
- **Old sender-based baseline filters** (from a previous owner) — left as-is (out of inbox, under old labels);
  optional merge into the new scheme not done.

---

## TODO

- [ ] Set the IMPORTANT Multiple Inboxes section to `is:starred` + verify the other sections
- [ ] Decide a dual-label strategy for future mail (periodic reclean vs. exclusive sections)
- [ ] (Optional) Build a browser extension for a toolbar archive button
- [ ] (Optional) Merge old baseline finance/insurance labels into `6 Other`
- [ ] Ongoing: flag misclassified mail → each flag becomes a rule
- [ ] Grow the human whitelist as new contacts are flagged

---

## Key lessons (the costly ones)

- **Measure → show a sample → move.** A broad rule once moved ~2,000 messages by mistake because no sample
  was shown first.
- **Sender allowlist + human whitelist, not keyword "service detection"** — keyword detection pulled bank
  OTPs, logins and invoices into the wrong place.
- **False positives:** "verification" also matches "ad verification program"; always show a sample.
- **Brand marketing ≠ brand transactional** — a bank's "news" subdomain is marketing (→ Junk); its
  transactional address is elsewhere. Distinguish subdomains.
- **`label:"A/B"` text search fails on slashes** → use label IDs. `label:"6 Other"` doesn't match sub-labels.
- Gmail add-on manifest must use the `addOns` format (not the legacy top-level `gmail`), and without
  `useLocaleFromApp` (that requires an extra scope).
