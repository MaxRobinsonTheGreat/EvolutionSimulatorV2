const Cell = require('../Organism/Cell/GridCell');
const CellStates = require('../Organism/Cell/CellStates');

class GridMap {
    constructor(cols, rows, cell_size) {
        this.resize(cols, rows, cell_size);
    }

    resize(cols, rows, cell_size) {
        this.grid = new Array(cols * rows); // 1D array
        this.cols = cols;
        this.rows = rows;
        this.cell_size = cell_size;
        for(let i=0; i<cols*rows; i++) {
            let c = Math.floor(i/rows);
            let r = i%rows;
            this.grid[i] = new Cell(CellStates.empty, c, r, c*cell_size, r*cell_size);
        }
    }

    fillGrid(state, ignore_walls=false) {
        for (const cell of this.grid) {
            if (ignore_walls && cell.state === CellStates.wall) continue;
            cell.setType(state);
            cell.owner = null;
            cell.cell_owner = null;
        }
    }

    cellAt(col, row) {
        if(col < 0 || row < 0 || col >= this.cols || row >= this.rows) return null;
        return this.grid[col * this.rows + row];
    }

    setCellType(col, row, state) {
        if (!this.isValidLoc(col, row)) {
            return;
        }
        this.grid[col * this.rows + row].setType(state);
    }

    setCellOwner(col, row, cell_owner) {
        if (!this.isValidLoc(col, row)) {
            return;
        }
        this.grid[col * this.rows + row].cell_owner = cell_owner;
        if (cell_owner != null)
            this.grid[col * this.rows + row].owner = cell_owner.org;
        else 
            this.grid[col * this.rows + row].owner = null;
    }

    isValidLoc(col, row){
        return col<this.cols && row<this.rows && col>=0 && row>=0;
    }

    getCenter(){
        return [Math.floor(this.cols/2), Math.floor(this.rows/2)]
    }

    xyToColRow(x, y) {
        var c = Math.floor(x/this.cell_size);
        var r = Math.floor(y/this.cell_size);
        if (c >= this.cols)
            c = this.cols-1;
        else if (c < 0)
            c = 0;
        if (r >= this.rows)
            r = this.rows-1;
        else if (r < 0)
            r = 0;
        return [c, r];
    }

    serialize() {
        let grid = {cell_size:this.cell_size, cols:this.cols, rows:this.rows};
        grid.food = [];
        grid.walls = [];
        for (const cell of this.grid) {
            if (cell.state === CellStates.wall || cell.state === CellStates.food) {
                const c = {c: cell.col, r: cell.row};
                cell.state === CellStates.food ? grid.food.push(c) : grid.walls.push(c);
            }
        }
        return grid;
    }

    loadRaw(grid) {
        // Handle both 1D and legacy 2D formats
        if(grid.grid) { // Legacy 2D format
            grid.food = grid.grid.flatMap(col => 
                col.filter(c => c.state === 'food').map(c => ({c: c.col, r: c.row}))
            );
            grid.walls = grid.grid.flatMap(col =>
                col.filter(c => c.state === 'wall').map(c => ({c: c.col, r: c.row}))
            );
        }
        for (let f of grid.food)
            this.setCellType(f.c, f.r, CellStates.food);
        for (let w of grid.walls)
            this.setCellType(w.c, w.r, CellStates.wall);
    }
}

module.exports = GridMap;
