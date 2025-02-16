const CellStates = require("../Organism/Cell/CellStates");

var color_scheme = {
    "empty":"#131d29",
    "food":"#a199a0",
    "wall":"gray",
    "mouth":"#fea300",
    "producer":"#017501",
    "mover":"#3692e1",
    "killer":"#dc3c3c",
    "armor":"#6e0b87",
    "cool":"#ffffff",
    "camo":"#000000",
    "inner-camo":"#131d29",
    "eye":"#B6C1EA",
    "eye-slit":"#0E1318",
    "parasitic":"#8a2b47",
    "detector":"#2b3994",
    "secretion":"#f2e127",
}

// Renderer controls access to a canvas. There is one renderer for each canvas
class ColorScheme {
    constructor(world_env, editor_env) {
        this.world_env = world_env;
        this.editor_env = editor_env;
    }

    loadColorScheme() {
        for (var state of CellStates.all) {
            state.color = color_scheme[state.name];
        }
        CellStates.eye.slit_color=color_scheme['eye-slit']
        for (var cell_type in color_scheme) {
            $('#'+cell_type+'.cell-type ').css('background-color', color_scheme[cell_type]);
            $('#'+cell_type+'.cell-legend-type').css('background-color', color_scheme[cell_type]);
            
        }
        this.world_env.renderer.renderFullGrid(this.world_env.grid_map.grid);
        this.editor_env.renderer.renderFullGrid(this.editor_env.grid_map.grid);
    }
}

module.exports = ColorScheme;