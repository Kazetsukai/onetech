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
      let panel = new BoardPanel(object, this);
      this.panels.unshift(panel);
      object.loadData(() => panel.generateSteps());
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
    // TODO: Perhaps only generate if they have shared ids
    this.panels.forEach(p => p.generateSteps());
  }

  ingredientIds() {
    return this.panels.map(panel => panel.ingredientIds()).flat();
  }
}
