import _ from 'lodash';

export default class GameDataService {
  static loadGameData() {
    console.log('fetching directory...');

    return fetch('./static/gamedata.json').then(data => {
      return data.json();
    }).then(data => {
      // Process data to add richness

      let objectMap = [];

      for (let o in data.objects) {
        let obj = data.objects[o];

        obj.transitionsFrom = [];
        obj.transitionsTo = [];

        if (obj.id)
          objectMap[obj.id] = obj;
      }

      for (let t in data.transitions) {
        let trans = data.transitions[t];

        if (isValidId(trans.targetID)) {
          objectMap[trans.targetID].transitionsFrom.push(trans);
        }
        if (isValidId(trans.actorID)) {
          objectMap[trans.actorID].transitionsFrom.push(trans);
        }
        if (isValidId(trans.newTargetID)) {
          objectMap[trans.newTargetID].transitionsTo.push(trans);
        }
        if (isValidId(trans.newActorID)) {
          objectMap[trans.newActorID].transitionsTo.push(trans);
        }
      }

      return data;
    });
  }
}

function isValidId(id) {
  return id && id > 0;
}