/**
 * Gmail add-on: one-click "Move to 7 Archive/Personal".
 * Shows a button in the side panel of an open email.
 * Click = adds the "7 Archive/Personal" label + removes it from the inbox (archives).
 */

// Target label name — if you rename it, change it only here:
var TARGET_LABEL = '7 Archive/Personal';

/** Builds the card with the button when you open an email. */
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
    .setHeader(CardService.newCardHeader().setTitle('Quick archive'))
    .addSection(section)
    .build();
}

/** Adds the label and archives (removes from inbox). */
function moveToArchivePersonal(e) {
  var message = GmailApp.getMessageById(e.parameters.messageId);
  var thread = message.getThread();

  var label = GmailApp.getUserLabelByName(TARGET_LABEL);
  if (!label) {
    label = GmailApp.createLabel(TARGET_LABEL);
  }

  thread.addLabel(label);
  thread.moveToArchive(); // removes INBOX (stays searchable + keeps the label)

  return CardService.newActionResponseBuilder()
    .setNotification(
      CardService.newNotification().setText('Moved to ' + TARGET_LABEL + ' ✓')
    )
    .build();
}
