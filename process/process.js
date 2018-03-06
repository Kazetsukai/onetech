let exec = require('child_process').exec;
let fs = require('fs');
let fetch = require('node-fetch');
let _ = require('lodash');

let baseDir = "OneLifeData7-master/"
let gitRepo = "kazetsukai/"

if (process.argv[2] === 'download') {
  console.log("Downloading data...");

  let getData = exec('curl https://codeload.github.com/jasonrohrer/OneLifeData7/tar.gz/master | tar -xf -', (error, stdout, stderr) => {
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

  let objects = _.map(fs.readdirSync(objDir), f => {
    console.log(f);
    let file = objDir + '/' + f;
    return parseObject(fs.readFileSync(file, 'utf8'));
  });

  console.log("Pushing " + objects.length + " objects to GitHub...");

  fetch("https://api.github.com/repos/kazetsukai/onetech/contents/src/assets/objects.json")
    .then(response => response.json())
    .then(response => {
      let sha = response.sha;

      postData("https://api.github.com/repos/kazetsukai/onetech/contents/src/assets/objects.json", {
        message: "Updated object data",
        content: Buffer.from(JSON.stringify(objects)).toString('base64'),
        sha: sha
      }).then(response => response.json())
        .then(response => {
          console.dir(response);
        });
  });
  
}

function postData (url, obj) {
  return fetch(url, {
    body: JSON.stringify(obj),
    headers: {
      'content-type': 'application/json',
      'Authorization': 'token ' + process.env.ONETECH_GITHUB_TOKEN
    },
    method: 'PUT', 
    redirect: 'follow',
    referrer: 'no-referrer',
  });
}

function parseObject (txt, url) {
  let lines = txt.split('\n');
  let obj = { sprites: [] };

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