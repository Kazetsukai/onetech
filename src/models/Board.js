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
      let panel = new BoardPanel(object, this, 1);
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
    this.panels = panel.otherPanels();
    // TODO: Perhaps only generate if they have shared ids
    this.panels.forEach(p => p.generateSteps());
  }

  ingredientSteps() {
    const stepsMap = {};
    const panelObjectIds = this.panels.map(panel => panel.object.id);
    const steps = this.panels.map(panel => panel.ingredientSteps).flat().
      filter(step => !panelObjectIds.includes(step.id));
    for (let step of steps) {
      if (stepsMap[step.id]) {
        stepsMap[step.id] = step.merge(stepsMap[step.id]);
      } else {
        stepsMap[step.id] = step;
      }
    }
    return Object.values(stepsMap).sort((a,b) => a.compareIngredient(b));
  }
}
