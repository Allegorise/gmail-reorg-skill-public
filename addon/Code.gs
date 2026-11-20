/**
 * Gmail add-on: one-click "Move to 7 Archive/Personal".
 * Zobrazí tlačítko v postranním panelu otevřeného e-mailu.
 * Klik = přidá štítek "7 Archive/Personal" + vyndá z inboxu (archivuje).
 */

// Název cílového štítku – kdyby sis ho přejmenovala, uprav jen tady:
var TARGET_LABEL = '7 Archive/Personal';

/** Sestaví kartu s tlačítkem, když otevřeš e-mail. */
function onGmailMessageOpen(e) {
  var btn = CardService.newTextButton()
    .setText('📁  → ' + TARGET_LABEL)
    .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
    .setOnClickAction(
      CardService.newAction()
        .setFunctionName('moveToArchivePersonal')
        .setParameters({ messageId: e.gmail.messageId })
    );

  var section = CardService.newCardSection().addWidget(btn);

  return CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader().setTitle('Rychlá archivace'))
    .addSection(section)
    .build();
}

/** Přidá štítek a archivuje (vyndá z inboxu). */
function moveToArchivePersonal(e) {
  var message = GmailApp.getMessageById(e.parameters.messageId);
  var thread = message.getThread();

  var label = GmailApp.getUserLabelByName(TARGET_LABEL);
  if (!label) {
    label = GmailApp.createLabel(TARGET_LABEL);
  }

  thread.addLabel(label);
  thread.moveToArchive(); // odebere INBOX (zůstane dohledatelné + má štítek)

  return CardService.newActionResponseBuilder()
    .setNotification(
      CardService.newNotification().setText('Přesunuto do ' + TARGET_LABEL + ' ✓')
    )
    .build();
}
