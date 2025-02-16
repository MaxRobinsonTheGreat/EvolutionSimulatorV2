const Hyperparams = require("../../Hyperparameters");
const Directions = require("../Directions");
const CellStates = require("../Cell/CellStates");
const Neurons = require("./Neurons");

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

class Brain {

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
        this.createNeurons();
    }

    copy(brain) {
        for (let dec in brain.decisions) {
            this.decisions[dec] = brain.decisions[dec];
        }
        this.neurons = brain.neurons.copy();
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
        decision = this.fireNeurons(this.owner.food_collected, this.owner.lifetime, this.owner.damage, this.observations, this.chemicals);
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
        this.mutateNeurons();
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
        this.neurons.addOutput(Brain.Decision.left);
        this.neurons.addOutput(Brain.Decision.right);
        // every input needs to be connected
        // every output needs to be connected
        // plus we need neurons to be connected
        // remove unconnected neurons at the end
        // this.neurons.addInputConnection("food_collected") // connected from the input to some random neuron, maybe even an output neuron
        this.neurons.addConnection()
        this.neurons.addConnection()
        this.neurons.addConnection()
        this.neurons.addConnection()
        this.neurons.addConnection()
        this.neurons.addConnection()
    }

    mutateNeurons() {
        // to do
    }

    fireNeurons(food_collected, lifetime, damage, observations, chemicals) {
        // give inputs to neurons
        this.neurons.setInput("food_collected", food_collected);
        this.neurons.setInput("lifetime", lifetime);
        this.neurons.setInput("damage", damage);
        for (let i = 0; i < observations.length; i++)
            this.neurons.setInput("obs" + i, this.mapObsToValue(observations[i]));
        for (let i = 0; i < chemicals.length; i++)
            this.neurons.setInput("chem" + i, this.mapChemToValue(chemicals[i]));
        // give neurons to neurons
        this.neurons.compute();
        this.neurons.log();
        // find the decision
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