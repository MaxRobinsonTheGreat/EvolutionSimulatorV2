const Hyperparams = require("../../Hyperparameters");
const Directions = require("../Directions");
const CellStates = require("../Cell/CellStates");

const Decision = {
    neutral: 0,
    retreat: 1,
    chase: 2,
    left: 3,
    right: 4,
    getRandom: function(){
        return Math.floor(Math.random() * 5);
    },
    getRandomNonNeutral: function() {
        return Math.floor(Math.random() * 2)+1;
    }
}

class Brainog {
    constructor(owner){
        this.owner = owner;
        this.observations = [];
        this.chemicals = [];

        // corresponds to CellTypes
        this.decisions = {};
        this.chemDecisions = {};
        for (let cell of CellStates.all) {
            this.decisions[cell.name] = Decision.neutral;
        }
        this.decisions[CellStates.food.name] = Decision.chase;
        this.decisions[CellStates.killer.name] = Decision.retreat;
    }

    copy(brain) {
        for (let dec in brain.decisions) {
            this.decisions[dec] = brain.decisions[dec];
        }
    }

    randomizeDecisions(randomize_all=true) {
        // randomize the non obvious decisions
        if (randomize_all) {
            this.decisions[CellStates.food.name] = Decision.getRandom();
            this.decisions[CellStates.killer.name] = Decision.getRandom();
        }
        this.decisions[CellStates.mouth.name] = Decision.getRandom();
        this.decisions[CellStates.parasitic.name] = Decision.getRandom();
        this.decisions[CellStates.wall.name] = Decision.getRandom();
        this.decisions[CellStates.empty.name] = Decision.getRandom();
        this.decisions[CellStates.producer.name] = Decision.getRandom();
        this.decisions[CellStates.mover.name] = Decision.getRandom();
        this.decisions[CellStates.armor.name] = Decision.getRandom();
        this.decisions[CellStates.cool.name] = Decision.getRandom();
        this.decisions[CellStates.eye.name] = Decision.getRandom();
        this.decisions[CellStates.detector.name] = Decision.getRandom();
        this.decisions[CellStates.secretion.name] = Decision.getRandom();
        // do a for all detector cells chemicals make a get Random
    }

    randomizeChemicalDecisions(d) {
        this.chemicals[d] = Decision.getRandom();
    }

    observe(observation) {
        this.observations.push(observation);
    }

    detect(detection) {
        if (detection == null) {
            return
        }
        if (detection in this.chemicals == undefined) {
            randomizeChemicalDecisions(detection)
        }
    }

    decide() {
        var decision = Decision.neutral;
        var closest = Hyperparams.lookRange + 1;
        var move_direction = 0;
        for (var obs of this.observations) {
            if (obs.cell == null || obs.cell.owner == this.owner) {
                continue;
            }
            if (obs.distance < closest) {
                if (obs.cell.getStateName)
                    decision = this.decisions[obs.cell.getStateName()];
                else
                    decision = this.decisions[obs.cell.state.name];
                move_direction = obs.direction;
                closest = obs.distance;
            }
        }
        for (var c of this.chemicals) {
            decision = this.decisions[c];
        }
        this.observations = [];
        this.chemicals = [];
        if (decision == Decision.chase) {
            this.owner.changeDirection(move_direction);
            return true;
        }
        else if (decision == Decision.retreat) {
            this.owner.changeDirection(Directions.getOppositeDirection(move_direction));
            return true;
        }
        else if (decision == Decision.left) {
            this.owner.changeDirection(Directions.getLeftDirection(move_direction));
            return true;
        }
        else if (decision == Decision.right) {
            this.owner.changeDirection(Directions.getRightDirection(move_direction));
            return true;
        }
        return false;
    }

    mutate() {
        this.decisions[CellStates.getRandomName()] = Decision.getRandom();
        this.decisions[CellStates.empty.name] = Decision.neutral; // if the empty cell has a decision it gets weird
    }
    
    serialize() {
        return {decisions: this.decisions};
    }
}

Brainog.Decision = Decision;

module.exports = Brainog;