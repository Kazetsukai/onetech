import _ from 'lodash';

export default class GameDataService {
  static loadGameData(progressCallback) {
    console.log('fetching directory...');

    let getObjects = fetchData('https://api.github.com/repos/jasonrohrer/OneLifeData7/contents/objects', parseObject, progressCallback, 'object');
    let getTransitions = fetchData('https://api.github.com/repos/jasonrohrer/OneLifeData7/contents/transitions', parseTransition, progressCallback, 'transition');

    return Promise.all([getObjects, getTransitions]).then(([objData, transData]) => {
      let objects = [];
      for (let i in objData) {
        let obj = objData[i];
        console.dir(obj);
        if (obj.id)
          objects[obj.id] = obj;
      }

      return {
        objects: objects,
        transitions: transData
      };
    });
  }
}

function fetchData (directoryUrl, parseFunc, progressCallback, type) {
  return fetch(directoryUrl).then(d => {
    return d.json();
  }).then(d => {
    console.log('got response, fetching ' + type + 's...');

    let count = d.length;
    var curr = 0;
    return Promise.all(_.map(d, f => { 
      return fetch(f.download_url).then(o => {
        return Promise.all([o.text(), o.url]);
      }).then(o => {
        let obj = parseObject(o[0], o[1]);

        curr += 1;
        if (progressCallback)
          progressCallback(type, curr, count, obj);

        return obj;
      });
    }));
  });
}

function parseObject (txt, url) {
  let lines = txt.split('\n');
  let obj = {};

  for (let i in lines) {
    let line = lines[i];
    var spl = line.split('=');
    if (spl.length < 2)
      continue;

    obj[spl[0]] = spl[1];

    // Break after the first sprite
    if (spl[0] === "spriteID")
      break;
  }

  if (lines[1])
    obj.name = lines[1];

  return obj;
}

function parseTransition (txt, url) {
  let trn = {};
  let file = _.last(url.split('/'));
  let fileParts = file.split('_');

  if (fileParts) {

  }

  return trn;
}