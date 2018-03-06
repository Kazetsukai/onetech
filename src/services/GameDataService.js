import _ from 'lodash';

export default class GameDataService {
  static loadGameData() {
    console.log('fetching directory...');

    return fetch('./static/gamedata.json').then(data => {
      return data.json();
    });
  }
}