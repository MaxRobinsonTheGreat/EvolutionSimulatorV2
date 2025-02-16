const CellStates = require("../CellStates");
const BodyCell = require("./BodyCell");

class CooldownCell extends BodyCell {
    constructor(org, loc_col, loc_row) {
        super(CellStates.cool, org, loc_col, loc_row);
    }
    
    performFunction() {
        this.lifespan += 1
        this.org.heal()
    }
}


module.exports = CooldownCell;