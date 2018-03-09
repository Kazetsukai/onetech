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
          trans.target = objectMap[trans.targetID];
          trans.target.transitionsFrom.push(trans);
        }
        if (isValidId(trans.actorID)) {
          trans.actor = objectMap[trans.actorID];
          trans.actor.transitionsFrom.push(trans);
        }
        if (isValidId(trans.newTargetID) && !trans.targetRemains) {
          trans.newTarget = objectMap[trans.newTargetID];
          trans.newTarget.transitionsTo.push(trans);
        }
        if (isValidId(trans.newActorID) && !trans.tool) {
          trans.newActor = objectMap[trans.newActorID];
          trans.newActor.transitionsTo.push(trans);
        }
      }

      markReachable(data.objects);

      return data;
    });
  }
}

function isValidId(id) {
  return id && id > 0;
}

function markReachable(objects) {
  objects.forEach(o => {
    if (true);
  });
}