if (!process.env.ONETECH_FOOD_BONUS) {
  process.env.ONETECH_FOOD_BONUS = 2;
}

const MainProcessor = require('./src/MainProcessor');

const processor = new MainProcessor(__dirname);

processor.doDownload = process.argv.includes('download');
processor.doSprites = processor.doDownload || process.argv.includes('sprites');

console.log("--- Processing static-edge ---");
const unprocessedVersion = processor.process(null);

if (unprocessedVersion) {
  processor.doDownload = false;
  console.log(`--- Processing static for v${unprocessedVersion.id} ---`);
  processor.process(unprocessedVersion);
}
