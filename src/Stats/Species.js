import CellStates from '../Organism/Cell/CellStates';

class Species {
    constructor(anatomy, ancestor, start_tick) {
        this.anatomy = anatomy;
        this.ancestor = ancestor; // eventually need to garbage collect ancestors to avoid memory problems
        this.population = 1;
        this.cumulative_pop = 1;
        this.start_tick = start_tick;
        this.end_tick = -1;
        this.name = Math.random().toString(36).substring(2, 10);
        this.extinct = false;
        this.calcAnatomyDetails();
    }

    calcAnatomyDetails() {
        if (!this.anatomy) return;
        var cell_counts = {};
        for (let c of CellStates.living) {
            cell_counts[c.name] = 0;
        }
        for (let cell of this.anatomy.cells) {
            cell_counts[cell.state.name] += 1;
        }
        this.cell_counts = cell_counts;
    }

    addPop() {
        this.population++;
        this.cumulative_pop++;
    }

    lifespan() {
        return this.end_tick - this.start_tick;
    }
}

export default Species;
