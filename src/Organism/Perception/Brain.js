const Hyperparams = require("../../Hyperparameters");
const Directions = require("../Directions");
const CellStates = require("../Cell/CellStates");
const Neurons = require("./Neurons");

const Decision = {
    neutral: 0,
    retreat: 1,
    chase: 2,
    rotate_left: 3,
    rotate_right: 4,
    getRandom: function(){
        return Math.round(Math.random() * 4);
    },
    getRandomNonNeutral: function() {
        return Math.round(Math.random() * 2)+1;
    }
}

class Brain {

    constructor(owner){
        this.owner = owner;
        this.observations = [];
        this.chemicals = [];
        // relates to CellTypes
        this.decisions = {};
        this.chemDecisions = {};
        for (let cell of CellStates.all) {
            this.decisions[cell.name] = Decision.neutral;
        }
        this.decisions[CellStates.food.name] = Decision.chase;
        this.decisions[CellStates.killer.name] = Decision.retreat;
        if (this.neurons == null)
            this.createNeurons();
    }

    copy(brain) {
        this.decisions = JSON.parse(JSON.stringify(brain.decisions));
        this.neurons = brain.neurons.copy();
    }

    randomizeDecisions(randomize_all=true) {
        // obsolete
    }

    randomizeChemicalDecisions(d) {
        this.chemicals[d] = Decision.getRandom();
    }

    observe(observation) {
        this.observations.push(observation);
    }

    detect(detection) {
        if (detection != null && detection in this.chemicals == undefined)
            randomizeChemicalDecisions(detection)
    }

    assignMove(move) {
        if(move == true) {
            return 20
        }
        else {
            return 10
        }
    }

    decide() {
        var decision = Decision.neutral;
        var closest = Hyperparams.lookRange + 1;
        var move_direction = 0;
        for (let obs of this.observations) {
            if (obs.distance < closest) {
                move_direction = obs.direction;
                closest = obs.distance;
            }
        }
        decision = this.fireNeurons(this.owner.food_collected, this.owner.lifetime, this.owner.damage, this.assignMove(this.owner.moved), this.observations, this.chemicals);
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
        else if (decision == Decision.rotate_left) {
            this.owner.attemptRotate(Directions.getLeftDirection(move_direction));
            return true;
        }
        else if (decision == Decision.rotate_right) {
            this.owner.attemptRotate(Directions.getRightDirection(move_direction));
            return true;
        }
        return false;
    }
    
    serialize() {
        return {decisions: this.decisions};
    }

    createNeurons() {
        this.neurons = new Neurons();
        // add input neurons
        this.neurons.addInput("food_collected");
        this.neurons.addInput("lifetime");
        this.neurons.addInput("damage");
        this.neurons.addInput("moved");
        for (let i = 0; i < this.owner.anatomy.countCellType(CellStates.eye); i++)
            this.neurons.addInput("obs" + i);
        for (let i = 0; i < this.owner.anatomy.countCellType(CellStates.detector); i++)
            this.neurons.addInput("chem" + i);
        // add neurons
        const neuronCount = Math.floor(Math.random() * 20) + 1;
        for (let i = 0; i < neuronCount; i++)
            this.neurons.addNeuron();
        // add output neurons
        this.neurons.addOutput(Brain.Decision.neutral);
        this.neurons.addOutput(Brain.Decision.chase);
        this.neurons.addOutput(Brain.Decision.retreat);
        this.neurons.addOutput(Brain.Decision.rotate_left); // I changed this
        this.neurons.addOutput(Brain.Decision.rotate_right);
        this.neurons.addOutput("nothing")
        // every input needs to be connected
        // every output needs to be connected
        // plus we need neurons to be connected
        // remove unconnected neurons at the end
        // this.neurons.addInputConnection("food_collected") // connected from the input to some random neuron, maybe even an output neuron
        let numOfInputs = this.neurons.getInputCount();
        let numOfOthers = this.neurons.getNeuronCount() - numOfInputs;
        for (let i = 0; i < this.neurons.neurons.length; i++) {
        let n = numOfInputs + Math.floor(Math.random() * numOfOthers) - 1;
        let w = Math.random() * 2;
        this.neurons.addConnection(i, n, w);
        }
        
    }

    mutate() {
        this.neurons.mutate()
    }

    fireNeurons(food_collected, lifetime, damage, moved, observations, chemicals) {
        // set neuron inputs
        this.neurons.setInput("food_collected", food_collected);
        this.neurons.setInput("lifetime", lifetime);
        this.neurons.setInput("damage", damage);
        this.neurons.setInput("moved", moved);
        for (let i = 0; i < observations.length; i++)
            this.neurons.setInput("obs" + i, this.mapObsToValue(observations[i]));
        for (let i = 0; i < chemicals.length; i++)
            this.neurons.setInput("chem" + i, this.mapChemToValue(chemicals[i]));
        // find the winning decision
        this.neurons.compute();
        let highestValue = 0;
        let winningDecision = Decision.neutral;
        for (let decision in this.neurons.getOutputs()) {
            let index = this.neurons.outputs[decision];
            let value = this.neurons.neurons[index];
            if (value > highestValue) {
                highestValue = value;
                winningDecision = decision;
            }
        }
        return winningDecision;
    }

    mapChemToValue(chemical) {
        if (chemical == null) 
            return 20;
        else
            return chemical
    }

    mapObsToValue(observation) {
        if (observation.cell == null)
            return CellStates.living.size + 10;
        if (observation.cell.state == CellStates.empty.name)
            return CellStates.living.size + 12;
        if (observation.cell.state == CellStates.food.name)
            return CellStates.living.size + 11;
        if (observation.cell.state == CellStates.wall.name)
            return CellStates.living.size + 10;
        let value = CellStates.living
            .map((ct) => ct.name)
            .indexOf(observation.cell.state.name) + 1;
        return value;
    }

}

Brain.Decision = Decision;

module.exports = Brain;