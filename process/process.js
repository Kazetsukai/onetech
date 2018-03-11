let exec = require('child_process').exec;
let fs = require('fs');
let imagemagick = require('imagemagick');
let Canvas = require('canvas')
let Image = Canvas.Image;
let _ = require('lodash');

let biomes = {
  0: 'grassland',
  1: 'swamp',
  2: 'prairie',
  3: 'rocky',
  4: 'snow'
}

let baseDir = "OneLifeData7-master/"

let download = process.argv[2] === 'download'
let skipGraphics = process.argv[2] === 'skip'

if (download) {
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

    if (obj.mapChance) {
      let bits = obj.mapChance.split('#');
      obj.mapChance = bits[0];

      if (bits[1].includes('_')) {
        obj.biomes = _.map(bits[1].split('_')[1].split(','), s => biomes[s]);
      } else console.log(bits[1]);

    }

    //console.dir(_.pick(obj, [ 'mapChance', 'name', 'biomes']))
  }

  // Load transitions from files
  let transitions = _.map(fs.readdirSync(transDir), f => {
    let file = transDir + '/' + f;
    return parseTransition(fs.readFileSync(file, 'utf8'), f);
  });

  markNaturalObjects(objectArray, transitions);

  // Convert images to png
  console.log('Converting sprites to PNG...');
  let files = fs.readdirSync(spriteDir);
  let spriteDeets = [];

  let promise = Promise.resolve();

  for (let i in files) {
    let f = files[i];
    promise = promise.then(() => {
      if (!f.includes('tga'))
        return "";

      let num = f.split('.')[0];
      let inPath = spriteDir + '/' + f
      let outPath = '../static/sprites/sprite_' + num + '.png';

      let bits = fs.readFileSync(spriteDir + '/' + num + '.txt', 'utf8').split(' ');
      spriteDeets[num] = {
        tag: bits[0],
        multiplicativeBlending: bits[1] === '1',
        centerAnchorXOffset: parseFloat(bits[2]),
        centerAnchorYOffset: parseFloat(bits[3])
      };

      if (!download)
        return Promise.resolve();
      else
        return new Promise((resolve, reject) => {
        imagemagick.convert([inPath, outPath], (err, stdout) => {
          if (err) {
            reject(err);
          } else {
            resolve(stdout);
          }
        });
      });
    });
  }

  // Composite sprites into object PNGs
  if (!skipGraphics) promise.then(() => processGraphics(objects, spriteDeets));

  //listTransitions(transitions, objectArray);

  // Save final game data object
  console.log("Saving gamedata blob...");
  let gameData = {
    objects: objects,
    transitions: transitions
  };

  fs.writeFileSync('../static/gamedata.json', JSON.stringify(gameData));
  fs.writeFileSync('../static/gamedata-pretty.json', JSON.stringify(gameData, null, 2));
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
      sprite.ageRange = _.map(lines[i+5].split('=')[1].split(','), parseFloat);

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
  trn.hand = trn.actorID == 0;
  trn.tool = trn.actorID >= 0 && trn.actorID == trn.newActorID;
  trn.targetRemains = trn.targetID >= 0 && trn.targetID == trn.newTargetID;
  
  if (trn.autoDecaySeconds > 0)
    trn.decay = trn.autoDecaySeconds + "s";
  if (trn.epochAutoDecay > 0)
    trn.decay = trn.epochAutoDecay + "h";

  return trn;
}

function listTransitions (transitions, objectArray) {
  for (let t in transitions) {
    let trans = transitions[t];
    
    if (trans.newTargetID != 0) continue;

    let act = (objectArray[trans.actorID] || {}).name || "Nothing";
    let trg = (objectArray[trans.targetID] || {}).name || "Nothing";
    let newAct = (objectArray[trans.newActorID] || {}).name || "Nothing";
    let newTrg = (objectArray[trans.newTargetID] || {}).name || "Nothing";

    console.log(act + " + " + trg + " = " + newAct + " + " + newTrg + "   epoch " + trans.epochAutoDecay + "    secs " + trans.autoDecaySeconds);
  }
}

function processGraphics(objects, spriteDeets) {
  console.log("Converted sprites, drawing objects");

  let canvas = new Canvas(512, 1024);
  let ctx = canvas.getContext('2d');

  for (let o in objects) {
    let obj = objects[o];
    let sprites = obj.sprites;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let maxX = 0;
    let maxY = 0;
    let minX = 0;
    let minY = 0;

    for (let s in sprites) {
      let sprite = sprites[s];
      let ages = sprite.ageRange;
      let targetAge = 20; // Draw sprites as if they were 20 years old
      if ((ages[0] > -1 || ages[1] > -1) && (ages[0] > targetAge || ages[1] < targetAge)) continue;

      let details = spriteDeets[sprite.id];

      let img = new Image;
      img.src = fs.readFileSync('../static/sprites/sprite_' + sprite.id + '.png');

      let angleRads = parseFloat(sprite.rot) * Math.PI * 2;
      let x = parseFloat(sprite.x);
      let y = parseFloat(sprite.y);

      let points = [
        {x: -img.width/2, y: -img.height/2},
        {x: img.width/2, y: -img.height/2},
        {x: img.width/2, y: img.height/2},
        {x: -img.width/2, y: img.height/2},
      ]

      let cosA = Math.cos(angleRads);
      let sinA = Math.sin(angleRads);

      for (let p in points) {
        p = points[p];
        p.x -= details.centerAnchorXOffset;
        p.y += details.centerAnchorYOffset;
        p.x = p.x * cosA - p.y * sinA;
        p.y = p.y * cosA + p.x * sinA;
        p.x += x;
        p.y += y;
        if (p.x > maxX) maxX = p.x + 2;
        if (p.x < minX) minX = p.x - 2;
        if (p.y > maxY) maxY = p.y + 2;
        if (p.y < minY) minY = p.y - 2;
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.translate(x + canvas.width / 2, -y + canvas.height / 2);
      ctx.rotate(angleRads);
      ctx.drawImage(img, -img.width / 2 - details.centerAnchorXOffset, -img.height / 2 - details.centerAnchorYOffset, img.width, img.height);
    }

    let tmpW = maxX - minX;
    let tmpH = maxY - minY;

    let newWidth = Math.max(tmpW, 128);
    let newHeight = Math.max(tmpH, 128);

    let tmpCanvas = new Canvas(newWidth, newHeight);
    let tmpCtx = tmpCanvas.getContext('2d');

    ctx.setTransform(1, 0, 0, 1, 0, 0);

    tmpCtx.drawImage(canvas, minX + canvas.width / 2, -maxY + canvas.height / 2, tmpW, tmpH, (newWidth - tmpW) / 2, (newHeight - tmpH) / 2, tmpW, tmpH);

    // Debug
    ctx.beginPath(); //
    ctx.rect(minX + canvas.width / 2, -maxY + canvas.height / 2, tmpW, tmpH);
    ctx.stroke();
    ctx.closePath(); //
    
    fs.writeFileSync('../static/sprites/obj_' + obj.id + '.png', tmpCanvas.toBuffer());
  }
}

function markNaturalObjects(objectArray, transitions) {
  // Mark all the natural objects
  
  /*let toExplore = [];

  targetToMap = []
  actorToMap = []

  for (let i = -2; i < 1; i++) {
    targetToMap[i] = [];
    actorToMap[i] = [];
  }

  let expand = function(o) {
    let targTo = targetToMap[o.id];
    if (!targTo) return;
    let actTo = actorToMap[o.id];

    console.log("Expanding " + o.name);

    targTo.forEach(obj => {
      toExplore.push([obj, true, o])
    });
    actTo.forEach(obj => {
      toExplore.push([obj, false, o])
    });
  }*/

  objectArray.forEach(o => {
    if (!o) return;

    if (o.mapChance > 0) {
      o.natural = true;
    }

    /*targetToMap[o.id] = [];
    actorToMap[o.id] = [];*/
  });


  /*transitions.forEach(t => {
    if (t.actorID < 1) {
      toExplore.push([objectArray[t.newTargetID], false, undefined]);
      toExplore.push([objectArray[t.newActorID], false, undefined]);
    }
    if (t.targetID < 1) {
      toExplore.push([objectArray[t.newTargetID], true, undefined]);
      toExplore.push([objectArray[t.newActorID], true, undefined]);
    }
    actorToMap[t.actorID].push(objectArray[t.newTargetID]);
    actorToMap[t.actorID].push(objectArray[t.newActorID]);
    targetToMap[t.targetID].push(objectArray[t.newTargetID]);
    targetToMap[t.targetID].push(objectArray[t.newActorID]);
  })

  // Expand the top level objects to get started
  objectArray.forEach(o => {
    if (o && o.natural) {
      expand(o);
    }
  });

  while (toExplore.length > 0) {
    let [obj, target, pred] = toExplore.shift();

    if (!obj) continue;

    // If we have paths to both sides of this, then stop
    if (obj.targetPredecessor && obj.actorPredecessor) continue;

    console.log("Exploring " + obj.name + " (" + obj.depth + ", " + target + ", " + (pred || {name: '*'}).name + ")");

    if (obj.targetPredecessor === undefined && target)
      obj.targetPredecessor = pred || { depth: 0 };
    if (obj.actorPredecessor === undefined && !target)
      obj.actorPredecessor = pred || { depth: 0 };

    // If one of the two above depths completed this object, then expand
    if (obj.targetPredecessor && obj.actorPredecessor) {
      console.log("#############################################");
      obj.depth = Math.max(obj.targetPredecessor.depth + 1, obj.actorPredecessor.depth + 1);
      expand(obj);
    }
  }

  objectArray.forEach(o => {
    if (o && o.depth > -1) {
      console.dir(_.pick(o, [ 'depth', 'name', 'targetPredecessor.name']));
    }
    if (o && o.depth === undefined) {
      console.log("UNREACHABLE:");
      console.dir(_.pick(o, [ 'depth', 'name', 'targetPredecessor.name']));
    }
  });*/

}



