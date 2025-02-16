const CellStates = require("../CellStates");
const BodyCell = require("./BodyCell");

class CooldownCell extends BodyCell{
    constructor(org, loc_col, loc_row){
        super(CellStates.cool, org, loc_col, loc_row);
    }
}

module.exports = CooldownCell;