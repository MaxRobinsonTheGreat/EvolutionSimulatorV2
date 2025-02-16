// places a chemical/just a number below it
// add a function in world environment
const CellStates = require("../CellStates");
const BodyCell = require("./BodyCell");
const GridMap = require("../../.././Grid/GridMap");
// use cell at fucnction on Grid map then that variable do .chemical = ____

class SecretionCell extends BodyCell{
    constructor(org, loc_col, loc_row){
        super(CellStates.secretion, org, loc_col, loc_row);
    }
    // in the constructor put a chemical thats inherited
    initInherit(parent) {
        // deep copy parent values
        super.initInherit(parent);
        this.chemical = parent.chemical;
    }
    
    initRandom() {
        // initialize values randomly
        const nothing = 6
        this.chemical = Math.random()*nothing
        if (this.chemical == nothing) {
            this.chemical = null
        }
    }

    performFunction() {
        var env = this.org.env
        let column = this.org.c + this.loc_col
        let row = this.org.r + this.loc_row
        let thisCell = env.grid_map.cellAt(column, row)
        if (thisCell != null) {
            thisCell.chemical = this.chemical
        }
    }
}


module.exports = SecretionCell;