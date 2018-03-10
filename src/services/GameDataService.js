import _ from 'lodash';

export default class GameDataService {
  static loadGameData() {
    console.log('fetching directory...');

    return fetch('./static/gamedata.json').then(data => {
      return data.json();
    }).then(data => {
      // Process data to add richness
      let objectMap = [];

      data.objects = _.filter(data.objects, o => o.name && !o.name.toLowerCase().includes('attacking'));

      for (let o in data.objects) {
        let obj = data.objects[o];

        obj.transitionsFrom = [];
        obj.transitionsTo = [];

        obj.name = obj.name.replace('#', ' - ');

        if (obj.id)
          objectMap[obj.id] = obj;
      }

      let isValidId = function(id) {
        return id && id > 0 && objectMap[id];
      }

      for (let t in data.transitions) {
        let trans = data.transitions[t];

        // Ignore move transitions
        if (trans.move != 0) continue;

        if (isValidId(trans.targetID)) {
          trans.target = objectMap[trans.targetID];
          trans.target.transitionsFrom.push(trans);
        }
        if (isValidId(trans.actorID)) {
          trans.actor = objectMap[trans.actorID];
          trans.actor.transitionsFrom.push(trans);
        }
        // Hide new target if target hasn't changed
        if (isValidId(trans.newTargetID) && !trans.targetRemains) {
          trans.newTarget = objectMap[trans.newTargetID];
          trans.newTarget.transitionsTo.push(trans);
        }
        // Hide new actor if actor hasn't changed
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

function markReachable(objects) {
  objects.forEach(o => {
    if (true);
  });
}