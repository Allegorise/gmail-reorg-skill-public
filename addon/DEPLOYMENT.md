# Gmail button "→ 7 Archive/Personal"

A small Google Apps Script add-on. It adds a button to Gmail that labels the open email
`7 Archive/Personal` and removes it from the inbox (archives) in one click. Runs only for you,
nothing is published.

## Deploy (~5 minutes)

1. Open **https://script.google.com** → **New project**.
2. In `Code.gs` (left) delete the default content and paste the contents of **Code.gs** from this folder.
3. Left, click ⚙ **Project Settings** → tick **"Show 'appsscript.json' manifest file in editor"**.
4. Back in the editor open **`appsscript.json`** and replace its contents with **appsscript.json** from
   this folder. Save (Ctrl+S).
5. Top right **Deploy → Test deployments**.
6. There is usually **no "Install" button** in the newer Apps Script UI — once the manifest is valid, the
   add-on is available for your account automatically. Close the dialog (Done).
7. In Gmail press **Ctrl+Shift+R** (hard refresh), open an email → the add-on icon appears in the right
   side panel. On first use you'll be asked to **authorize** — allow it (Advanced → Go to… → Allow).

## Use

- Open an email → click the **"Archive → Personal"** add-on icon in the right side panel →
  click **📁 → 7 Archive/Personal**.

> If you rename the label, change `TARGET_LABEL` at the top of `Code.gs`.

## Limitations

- The add-on lives in the **side panel** (not the top toolbar) — that's an Apps Script limit.
- After the action the email **doesn't close by itself**; the label and archive are applied, but the open
  view won't refresh until you navigate away. A real toolbar button that also closes the email would need a
  browser extension.

## Native alternatives (no install)

- **Keyboard shortcut (fastest):** Settings → See all settings → General → **Keyboard shortcuts: On** →
  Save. Then on an email press **`v`** (Move to), type the label name, Enter → labels + archives + moves on.
- **Drag** the email onto the label in the left sidebar.
