export class ThreeO {
  
  static async init() {
  }

  static async roll(diceCount, modifier = 'normal') {
    
    const character = game.user.character;
    const currentHP = character.system.attributes.hp.value;

    if (currentHP <= 0) {
        ui.notifications.error("У вас нет ресурса!");
        return;
    }

    let successes = 0;
    let empty = 0;
    let failures = 0;

    let roll = await new Roll(`${diceCount}df`).evaluate({ async: true });

    roll.terms[0].results.forEach(r => {
        if (r.result === -1) { failures += 1 }
        if (r.result === 0) { empty += 1 }
        if (r.result === 1) { successes += 1 }
    });

    let rollMessage = "<p>";
//Определение типа действия (1-2-3 кубика)
    let rollDiceText = "Действует как обычно, ";
    if (diceCount == '1') {rollDiceText = "Действует осторожно, ";
    }
    else if (diceCount == '3') {rollDiceText = "Действует опасно, ";}
//Конец определения типа действия
    let rollTypeText = "самостоятельно";
    if (modifier === 'hard') {
        rollTypeText = "но что-то мешает";
    }
    else if (modifier === 'easy') {
        rollTypeText = "но что-то помогает";
    }
    rollMessage += `<strong style="font-size: large;">${rollDiceText} ${rollTypeText}</strong><br>`;
    /*rollMessage += `<strong style="font-size: large;">-1: (${failures})</strong><br>`;
    rollMessage += `<strong style="font-size: large;">0: (${empty})</strong><br>`;
    rollMessage += `<strong style="font-size: large;">1: (${successes})</strong><br>`;*/
    rollMessage += "</p>";

    let resourceRemoved = 0;
    let totalResult = 0;
    if (modifier === 'normal'){
      resourceRemoved = failures+empty;
      totalResult = successes - failures;
    }
    else if (modifier === 'hard'){
      resourceRemoved = failures + empty;
      totalResult = successes - failures - empty;
    }
    else if (modifier === 'easy'){
      resourceRemoved = failures;
      totalResult = successes - failures + empty;
    }

    let statsMessage = `<strong style="color: red;">Затрачено ресурса: ${resourceRemoved}<br></strong>`;
    statsMessage += `<strong style="font-size: medium;">Успешность: ${totalResult}</strong>`;
    if (currentHP < resourceRemoved)
    {
      statsMessage += `<br><strong style="font-size: large;">Недостаточно ресурса, потеря сознания!</strong>`;
    }

    // Добавляем кнопку в сообщение
    // let buttonId = `reduce-dice`;
    // if (true) {
    //  statsMessage += `<button id="${buttonId}" data-failures="${failures}" style="margin-top: 10px; margin-bottom: 10px;">Убрать все "1" (${failures} шт.) из пула игроков</button>`;
    //}

    let flavor = `${rollMessage}${statsMessage}`;

    let speaker = ChatMessage.getSpeaker({ actor: character });
    let chatMessage = await roll.toMessage({ rollMode: 'publicroll', flavor, speaker });

    character.applyDamage(resourceRemoved);
  }
}  