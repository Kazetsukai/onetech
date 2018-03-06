import _ from 'lodash';

export default class GameDataService {
  static loadGameData(progressCallback) {
    console.log('fetching directory...');

    return fetch('https://raw.githubusercontent.com/kazetsukai/onetech/master/src/assets/gamedata.json').then(data => {
      return data.json();
    }).then(data => {
      console.dir(data);
    });
  }
}