const GameData = require('./src/GameData');

const gameData = new GameData();

if (process.argv[2] == 'download') {
  console.log("Downloading data...");
  gameData.download();

  console.log("Converting sprite images...");
  gameData.convertSpriteImages();
}

console.log("Importing objects...");
gameData.importObjects();

console.log("Importing transitions...");
gameData.importTransitions();

console.log("Exporting objects...");
gameData.exportObjects();

if (process.argv[2] != 'skip') {
  console.log("Processing sprites...");
  gameData.processSprites();
}
