// places a chemical/just a number below it
// add a function in world environment
const CellStates = require("../CellStates");
const BodyCell = require("./BodyCell");
const GridMap = require("../../.././Grid/GridMap");
// use cell at fucnction on Grid map then that variable do .chemical = ____

class DetectorCell extends BodyCell {
    constructor(org, loc_col, loc_row){
        super(CellStates.detector, org, loc_col, loc_row);
    }
    // in the constructor put a chemical thats inherited
    initInherit(parent) {
        // deep copy parent values
        super.initInherit(parent);
        this.chemical = parent.chemical;
    }
    
    initRandom() {
        const nothing = 6
        // initialize values randomly
        this.chemical = Math.random()*nothing
    }

    performFunction() {
        if (this.org.Brain) {
            var env = this.org.env
            let column = this.org.c + this.loc_col
            let row = this.org.r + this.loc_row
            let chemical = env.grid_map.cellAt(column, row).chemical
            this.org.Brain.detect(chemical);
        }
    }
}

module.exports = DetectorCell;