const CellStates = require("../CellStates");
const BodyCell = require("./BodyCell");
const Hyperparams = require("../../../Hyperparameters");

class ParasiticCell extends BodyCell {
    constructor(org, loc_col, loc_row) {
        super(CellStates.parasitic, org, loc_col, loc_row);
    }

    performFunction() {
        var env = this.org.env;
        var prob = Hyperparams.parasiticSteal;
        var real_c = this.getRealCol();
        var real_r = this.getRealRow();
        if (Math.random() * 100 <= prob) {
            this.hostNeighbors = this.hostNeighbors;
            if (Math.random() * 100 >= prob) {
                var loc = Hyperparams.hostNeighbors[Math.floor(Math.random() * Hyperparams.hostNeighbors.length)]
                var loc_c = loc[0];
                var loc_r = loc[1];
                var cell = env.grid_map.cellAt(real_c + loc_c, real_r + loc_r);
                if (cell == null || cell.owner == null || cell.owner == this.org || !cell.owner.living || cell.state == CellStates.armor ) {
                    return
                }
                if (cell.owner.feed() > 0) {
                    foodTaken = cell.owner.feed(true)
                    this.org.food_collected += foodTaken
                    // it can't use cell
                }

            }
        }
    }
}

module.exports = ParasiticCell;