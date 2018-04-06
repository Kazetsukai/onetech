const GameData = require('./src/GameData');

const gameData = new GameData();

if (process.argv.includes('download')) {
  console.log("Downloading data...");
  gameData.download("https://github.com/jasonrohrer/OneLifeData7.git");
}

console.log("Importing objects...");
gameData.importObjects();
gameData.importCategories();
gameData.importTransitions();

console.log("Populating versions...");
gameData.populateVersions();

console.log("Calculating object complexity...");
gameData.calculateObjectComplexity();

console.log("Exporting objects...");
gameData.exportObjects();

if (process.argv.includes('download') || process.argv.includes('sprites')) {
  if (process.argv.includes('download')) {
    console.log("Converting sprite images...");
    gameData.convertSpriteImages();
  }

  console.log("Processing sprites...");
  gameData.processSprites();
}

if (!process.argv.includes('dev')) {
  console.log("Copying static-dev to static...");
  gameData.syncStaticDir();
}
