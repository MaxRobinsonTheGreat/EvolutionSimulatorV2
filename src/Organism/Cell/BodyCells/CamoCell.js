const CellStates = require("../CellStates");
const BodyCell = require("./BodyCell");

class CamoCell extends BodyCell {
    constructor(org, loc_col, loc_row) {
        super(CellStates.camo, org, loc_col, loc_row);
    }
    initInherit(parent) {
        // deep copy parent values
        this.loc_col = parent.loc_col;
        this.loc_row = parent.loc_row;
        this.mimicryState = parent.mimicryState;
    }
    initRandom() {
        this.mimicryState = CellStates.getRandomName();
        while (this.mimicryState == 'camo')
            this.mimicryState = CellStates.getRandomName();
    }

    initDefault() {
         this.mimicryState = CellStates.getRandomName();
    }

    getStateName() {
        return this.mimicryState;
    }

    performFunction() {
    }

    // used when mymicing an eye cell
    getAbsoluteDirection() {
    // change this later
    return 0; // Directions.up
    }

}


module.exports = CamoCell;