import { Directions } from "../Directions.js";
/**
 * A cell defines the relative location of the cell in it's parent organism. It also defines their functional behavior.
 *
 * @class BaseCell
 */
export class BaseCell {
  constructor(){
  }

  initInherit( parent ) {
    // deep copy parent values
    this.loc_col = parent.loc_col;
    this.loc_row = parent.loc_row;
  }
    
  initRandom() {
    // initialize values randomly
  }

  initDefault() {
    // initialize to default values 
  }

  performFunction() {
    // default behavior: none
  }


  getRealCol() {
    return this.org.c + this.rotatedCol( this.org.rotation );
  }
    
  getRealRow() {
    return this.org.r + this.rotatedRow( this.org.rotation );
  }

  getRealCell() {
    var real_c = this.getRealCol(),
        real_r = this.getRealRow();

    return this.org.env.grid_map.cellAt( real_c, real_r );
  }

  rotatedCol( dir ){
    switch ( dir ){
    case Directions.up:
      return this.loc_col;
    case Directions.down:
      return this.loc_col * -1;
    case Directions.left:
      return this.loc_row;
    case Directions.right:
      return this.loc_row * -1;
    }
  }

  rotatedRow( dir ){
    switch ( dir ){
    case Directions.up:
      return this.loc_row;
    case Directions.down:
      return this.loc_row * -1;
    case Directions.left:
      return this.loc_col * -1;
    case Directions.right:
      return this.loc_col;
    }
  }
}