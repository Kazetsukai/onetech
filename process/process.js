let exec = require('child_process').exec;
let fs = require('fs');
let imagemagick = require('imagemagick');
let _ = require('lodash');

let baseDir = "OneLifeData7-master/"

if (process.argv[2] === 'download') {
  console.log("Downloading data...");

  let getData = exec('curl https://codeload.github.com/jasonrohrer/OneLifeData7/tar.gz/master | tar -xzf -', (error, stdout, stderr) => {
    console.log(error);
    console.log(stdout);
    console.log(stderr);

    if (!error) {
      processData();
    }
  });
} else {
  processData();
}

function processData() {
  let objDir = baseDir + 'objects';
  let transDir = baseDir + 'transitions';
  let spriteDir = baseDir + 'sprites';

  // Load objects from files
  let objects = _.map(fs.readdirSync(objDir), f => {
    let file = objDir + '/' + f;
    return parseObject(fs.readFileSync(file, 'utf8'), f);
  });

  let objectArray = [];
  for (let i in objects) {
    let obj = objects[i];
    if (obj.id)
      objectArray[obj.id] = obj;
  }

  // Load transitions from files
  let transitions = _.map(fs.readdirSync(transDir), f => {
    let file = transDir + '/' + f;
    return parseTransition(fs.readFileSync(file, 'utf8'), f);
  });

  // Convert images to png
  console.log('Converting sprites...');
  Promise.all(_.map(fs.readdirSync(spriteDir), f => {
    if (!f.includes('tga'))
      return "";

    let inPath = spriteDir + '/' + f
    let outPath = '../src/assets/sprites/' + f.split('.')[0] + '.png';

    return new Promise((resolve, reject) => {
      imagemagick.convert([inPath, outPath], (err, stdout) => {
        if (err) {
          reject(err);
        } else {
          resolve(stdout);
        }
      });
    });
  })).then(imgs => {
    console.log('Converted ' + imgs.length + " sprites.");
  }).catch(error => {
    console.log(error);
  });

  //listTransitions(transitions, objectArray);

  // Save final game data object
  console.log("Saving gamedata blob...");
  let gameData = {
    objects: objects,
    transitions: transitions
  };

  fs.writeFileSync('../src/assets/gamedata.json', JSON.stringify(gameData));
}

function parseObject (txt, file) {
  let lines = txt.split('\n');
  let obj = { 
    sprites: []
  };

  let i = 0;

  let parseLine = (line) => {
    var spl = line.split('=');
    if (spl.length < 2)
      return;

    obj[spl[0]] = spl[1];
  }

  while (i < lines.length) {
    parseLine(lines[i++]);
    
    // Break after we see sprites
    if (lines[i-1].split('=')[0] === "numSprites")
      break;
  }

  // Parse sprites
  while (i < lines.length) {
    if (lines[i].includes('spriteID')) {
      let sprite = {};
      sprite.id = lines[i].split('=')[1];

      let pos = lines[i+1].split('=')[1].split(',');
      sprite.x = pos[0];
      sprite.y = pos[1];
      sprite.rot = lines[i+2].split('=')[1];

      obj.sprites.push(sprite);

      i += 8;
    } else {
      break;
    }
  }

  // Continue parsing after sprites
  while (i < lines.length) {
    parseLine(lines[i++]);
  }

  if (lines[1])
    obj.name = lines[1];

  return obj;
}


function parseTransition (txt, file) {
  let trn = {};
  let fileParts = file.split('.')[0].split('_');

  trn.lastUseActor = (fileParts[2] === 'LA');
  trn.lastUseTarget = (fileParts[2] === 'LT' || fileParts[2] === 'L');

  trn.actorID = fileParts[0];
  trn.targetID = fileParts[1];

  let txtParts = txt.split(' ');

  trn.newActorID = txtParts[0] || 0;
  trn.newTargetID = txtParts[1] || 0;
  trn.autoDecaySeconds = txtParts[2] || 0;
  trn.actorMinUseFraction = txtParts[3] || 0;
  trn.targetMinUseFraction = txtParts[4] || 0;
  trn.reverseUseActor = !!txtParts[5];
  trn.reverseUseTarget = !!txtParts[6];
  trn.move = txtParts[7] || 0;
  trn.desiredMoveDist = txtParts[8] || 1;

  trn.epochAutoDecay = trn.autoDecaySeconds < 0 ? -trn.autoDecaySeconds : 0;

  return trn;
}

function listTransitions (transitions, objectArray) {
  for (let t in transitions) {
    let trans = transitions[t];

    let act = (objectArray[trans.actorID] || {}).name || "Nothing";
    let trg = (objectArray[trans.targetID] || {}).name || "Nothing";
    let newAct = (objectArray[trans.newActorID] || {}).name || "Nothing";
    let newTrg = (objectArray[trans.newTargetID] || {}).name || "Nothing";

    console.log(act + " + " + trg + " = " + newAct + " + " + newTrg);
  }
}