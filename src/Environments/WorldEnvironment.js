import { Environment } from "./Environment";
import { Renderer }  from "../Rendering/Renderer"; 
import { GridMap } from "../Grid/GridMap"; 
import { Organism } from "../Organism/Organism"; 
import { CellStates } from "../Organism/Cell/CellStates"; 
import { EnvironmentController } from "../Controllers/EnvironmentController"; 
import { Hyperparams } from "../Hyperparameters.js"; 
import { FossilRecord } from "../Stats/FossilRecord"; 
import { WorldConfig } from "../WorldConfig"; 
import $ from "jquery";
export class WorldEnvironment extends Environment{
  constructor( cell_size ) {
    super();
    this.renderer = new Renderer( "env-canvas", "env", cell_size );
    this.controller = new EnvironmentController( this, this.renderer.canvas );
    this.num_rows = Math.ceil( this.renderer.height / cell_size );
    this.num_cols = Math.ceil( this.renderer.width / cell_size );
    this.grid_map = new GridMap( this.num_cols, this.num_rows, cell_size );
    this.organisms = [];
    this.walls = [];
    this.total_mutability = 0;
    this.largest_cell_count = 0;
    this.reset_count = 0;
    this.total_ticks = 0;
    this.data_update_rate = 100;
    FossilRecord.setEnv( this );
  }

  update() {
    var to_remove = [];

    for ( var i in this.organisms ) {
      var org = this.organisms[ i ];

      if ( !org.living || !org.update() ) 
        to_remove.push( i );
            
    }
    if ( Hyperparams.foodDropProb > 0 ) 
      this.generateFood();
        
    this.removeOrganisms( to_remove );
    this.total_ticks++;
    if ( this.total_ticks % this.data_update_rate == 0 ) 
      FossilRecord.updateData();
        
  }

  render() {
    if ( WorldConfig.headless ) {
      this.renderer.cells_to_render.clear();
      return;
    }
    this.renderer.renderCells();
    this.renderer.renderHighlights();
  }

  renderFull() {
    this.renderer.renderFullGrid( this.grid_map.grid );
  }

  removeOrganisms( org_indeces ) {
    let start_pop = this.organisms.length;

    for ( var i of org_indeces.reverse() ){
      this.total_mutability -= this.organisms[ i ].mutability;
      this.organisms.splice( i, 1 );
    }
    if ( this.organisms.length === 0 && start_pop > 0 ) 
      if ( WorldConfig.auto_pause )
        $( ".pause-button" )[ 0 ].click();
      else if ( WorldConfig.auto_reset ) {
        this.reset_count++;
        this.reset( false );
      }
        
  }

  OriginOfLife() {
    var center = this.grid_map.getCenter(),
        org = new Organism( center[ 0 ], center[ 1 ], this );

    org.anatomy.addDefaultCell( CellStates.mouth, 0, 0 );
    org.anatomy.addDefaultCell( CellStates.producer, 1, 1 );
    org.anatomy.addDefaultCell( CellStates.producer, -1, -1 );
    this.addOrganism( org );
    FossilRecord.addSpecies( org, null );
  }

  addOrganism( organism ) {
    organism.updateGrid();
    this.total_mutability += organism.mutability;
    this.organisms.push( organism );
    if ( organism.anatomy.cells.length > this.largest_cell_count ) 
      this.largest_cell_count = organism.anatomy.cells.length;
  }

  averageMutability() {
    if ( this.organisms.length < 1 )
      return 0;
    if ( Hyperparams.useGlobalMutability ) 
      return Hyperparams.globalMutability;
        
    return this.total_mutability / this.organisms.length;
  }

  changeCell( c, r, state, owner ) {
    super.changeCell( c, r, state, owner );
    this.renderer.addToRender( this.grid_map.cellAt( c, r ) );
    if ( state == CellStates.wall )
      this.walls.push( this.grid_map.cellAt( c, r ) );
  }

  clearWalls() {
    for ( var wall of this.walls ){
      let wcell = this.grid_map.cellAt( wall.col, wall.row );

      if ( wcell && wcell.state == CellStates.wall )
        this.changeCell( wall.col, wall.row, CellStates.empty, null );
    }
  }

  clearOrganisms() {
    for ( var org of this.organisms )
      org.die();
    this.organisms = [];
  }

  generateFood() {
    var num_food = Math.max( Math.floor( this.grid_map.cols * this.grid_map.rows * Hyperparams.foodDropProb / 50000 ), 1 ),
        prob = Hyperparams.foodDropProb;

    for ( var i = 0; i < num_food; i++ ) 
      if ( Math.random() <= prob ){
        var c = Math.floor( Math.random() * this.grid_map.cols ),
            r = Math.floor( Math.random() * this.grid_map.rows );

        if ( this.grid_map.cellAt( c, r ).state == CellStates.empty )
          this.changeCell( c, r, CellStates.food, null );
                
      }
        
  }

  reset( confirm_reset = true, reset_life = true ) {
    if ( confirm_reset && !confirm( "The current environment will be lost. Proceed?" ) )
      return false;

    this.organisms = [];
    this.grid_map.fillGrid( CellStates.empty, !WorldConfig.clear_walls_on_reset );
    this.renderer.renderFullGrid( this.grid_map.grid );
    this.total_mutability = 0;
    this.total_ticks = 0;
    FossilRecord.clear_record();
    if ( reset_life )
      this.OriginOfLife();
    return true;
  }

  resizeGridColRow( cell_size, cols, rows ) {
    this.renderer.cell_size = cell_size;
    this.renderer.fillShape( rows * cell_size, cols * cell_size );
    this.grid_map.resize( cols, rows, cell_size );
  }

  resizeFillWindow( cell_size ) {
    this.renderer.cell_size = cell_size;
    this.renderer.fillWindow( "env" );
    this.num_cols = Math.ceil( this.renderer.width / cell_size );
    this.num_rows = Math.ceil( this.renderer.height / cell_size );
    this.grid_map.resize( this.num_cols, this.num_rows, cell_size );
  }
}