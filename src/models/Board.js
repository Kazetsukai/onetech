import BoardPanel from './BoardPanel';

export default class Board {
  constructor(objects) {
    this.panels = [];
    for (let object of objects) {
      this.addObject(object);
    }
  }

  addObject(object) {
    if (!this.hasObject(object)) {
      object.loadData();
      this.panels.unshift(new BoardPanel(object));
    }
  }

  hasObject(object) {
    for (let panel of this.panels) {
      if (panel.object == object) {
        return true;
      }
    }
    return false;
  }

  removePanel(panel) {
    this.panels = this.panels.filter(p => p != panel);
  }

  ingredientIds() {
    return this.panels.map(panel => panel.ingredientIds()).flat();
  }
}
