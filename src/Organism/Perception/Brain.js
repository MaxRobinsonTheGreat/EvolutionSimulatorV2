// Assuming these dependencies are correct
const Hyperparams = require("../../Hyperparameters");
const Directions = require("../Directions");
const CellStates = require("../Cell/CellStates");

class Neurons {
    constructor() {
        this.neuronDict = {};
        this.neuronValue = {}; 
        this.neuronNum = 0;
        this.inputs = {};
        this.inputNum = 0;
        this.outputs = {};
        this.addOutputs();
        this.emptyNeurons = [];
        this.emptyInputs = [];
    }

    addNeuron() {
        const connections = this.createConnections();
        const outputChance = Math.round(Math.random() * 4);
        let output = null;

        if (outputChance === 4) {
            const randomOutput = Math.floor(Math.random() * 8);
            output = this.outputs[randomOutput];
        }

        if (this.emptyNeurons.length > 0) {
            const emptyIndex = this.emptyNeurons.shift();
            this.neuronDict[emptyIndex] = { connections, output };
            this.neuronValue[emptyIndex] = 0;
        } else {
            this.neuronDict[this.neuronNum] = { connections, output };
            this.neuronValue[this.neuronNum] = 0;
            this.neuronNum += 1;
        }
    }

    deleteNeuron(toDo) {
        delete this.neuronDict[toDo];
        delete this.neuronValue[toDo];
        this.emptyNeurons.push(toDo);
    }

    deleteInput(toDo) {
        delete this.inputs[toDo];
        this.emptyInputs.push(toDo);
    }

    addInput() {
        const connections = this.createConnections();

        if (this.emptyInputs.length > 0) {
            const emptyIndex = this.emptyInputs.shift();
            this.inputs[emptyIndex] = connections;
        } else {
            this.inputs[this.inputNum] = connections;
            this.inputNum += 1;
        }
    }

    addOutputs() {
        this.outputs = {
            0: "nothing",
            1: "mForward",
            2: "mBackward",
            3: "mRight",
            4: "mLeft",
            // 5: "tAround",
            // 6: "tRight",
            // 7: "tLeft",
        };
    }

    createConnections() {
        const connections = {};
        const connectNum = Math.floor(Math.random() * 4) + 1;
        const randomConnections = new Set();

        while (randomConnections.size < connectNum) {
            const randomNeuron = Math.floor(Math.random() * this.neuronNum);
            randomConnections.add(randomNeuron);
        }

        for (const connection of randomConnections) {
            connections[connection] = Math.random();
        }

        return connections;
    }

    mutate() {
        // Mutation logic will go here in the future
    }
}

module.exports = Neurons;

class Brain {
    constructor(owner) {
        this.owner = owner;
        this.observations = [];
        this.chemicals = [];
        this.food = 0;
        this.age = 0;
        this.damage = 0;
        this.value = {};
        this.createValue();
        this.brain = null;
        this.inheritBrain();
        if (!this.brain) {
            this.createFirstBrain();
        }
    }

    attemptRotateSpecifically(way) {
        if (!this.owner.can_rotate) {
            this.direction = Directions.getRandomDirection();
            this.move_count = 0;
            return true;
        }
        var new_rotation = way
        if (this.owner.isClear(this.owner.c, this.owner.r, new_rotation)) {
            for (var cell of this.owner.anatomy.cells) {
                var real_c = this.owner.c + cell.rotatedCol(this.owner.rotation);
                var real_r = this.owner.r + cell.rotatedRow(this.owner.rotation);
                this.env.changeCell(real_c, real_r, CellStates.empty, null);
            }
            this.owner.rotation = new_rotation;
            this.owner.direction = Directions.getRandomDirection();
            this.owner.updateGrid();
            this.owner.move_count = 0;
            return true;
        }
        return false;
    }

    brainLoop() {
        this.updateBrainValues()
        let info = this.fireNeurons()
        // add Values to Sums
        // inputSums = 0, neuronSums = 1, outputsList = 2
        for (const inputKey in info[0]) {
            const toAdd = info[0][inputKey];
            this.brain.neuronValue[inputKey] += toAdd;
        }
        for (const neuronKey in info[1]) {
            const toAdd = info[1][neuronKey];
            this.brain.neuronValue[neuronKey] += toAdd;
        }

        const finalOutputs = info.outputsList.map(outputKey => this.brain.neuronValue[outputKey]);

    // Find the index of the max output value
    const maxOutputIndex = finalOutputs.reduce(
    (maxIndex, currentValue, currentIndex, array) => 
        currentValue > array[maxIndex] ? currentIndex : maxIndex,
    0 // Initial maxIndex
    );

    finalOutput = this.brain.neuronDict[maxOutputIndex][1]


        if (finalOutput == "mForward") {
            this.owner.changeDirection(0);
            return true;
        }
        else if (finalOuput == "mBackward") {
            this.owner.changeDirection(Directions.getOppositeDirection(1));
            return true;
        }
        else if (finalOuput == "mLeft") {
            this.owner.changeDirection(Directions.getLeftDirection(2));
            return true;
        }
        else if (finalOuput == "mRight") {
            this.owner.changeDirection(Directions.getRightDirection(3));
            return true;
        }
        // else if (finalOuput == "tAround") {
        //     this.attemptRotateSpesificly();
        // }

    }

    createValue() {
        this.value = {
            [CellStates.food.name]: 11,
            [CellStates.killer.name]: 2,
            [CellStates.mouth.name]: 3,
            [CellStates.parasitic.name]: 7,
            [CellStates.wall.name]: 8,
            [CellStates.empty.name]: 9,
            [CellStates.producer.name]: 4,
            [CellStates.mover.name]: 10,
            [CellStates.armor.name]: 1,
            [CellStates.cool.name]: 12,
            [CellStates.eye.name]: 0,
            [CellStates.detector.name]: 6,
            [CellStates.secretion.name]: 5,
        };
    }

    updateBrainValues() {
        this.age = this.owner.lifetime;
        this.food = this.owner.food_collected;
        this.damage = this.owner.damage;
        const decision = null;
        let closest = Hyperparams.lookRange + 1;
        let move_direction = 0;
        for (const obs of this.observations) {
            if (obs.cell && obs.cell.owner !== this.owner) {
                if (obs.distance < closest) {
                    decision = obs.cell.getStateName ? this.value[obs.cell.getStateName()] : this.value[obs.cell.state.name];
                    move_direction = obs.direction;
                    closest = obs.distance;
                }
            }
        }
    }

    updateBrainChemicals(chemical) {
        this.chemicals.push(chemical);
    }

    updateBrainObservations(observation) {
        this.observations.push(observation);
    }

    inheritBrain(brain = null) {
        this.brain = brain || this.createFirstBrain();
    }

    createFirstBrain() {
        this.brain = new Neurons();
        for (let i = 0; i < 6; i++) this.brain.addNeuron();
        for (let i = 0; i < 4; i++) this.brain.addInput();
    }

    fireNeurons() {
        const toAddInputs = [this.observations, this.chemicals, this.food, this.age, this.damage];
        const inputsSums = {};
        
        for (let x = 0; x < Object.keys(this.brain.inputs).length; x++) {
            if (this.brain.inputs[x]) {
                for (const z in this.brain.inputs[x]) {
                    inputsSums[z] = (inputsSums[z] || 0) + this.brain.inputs[x][z] * toAddInputs[x % toAddInputs.length];
                }
            }
        }

        const neuronSums = {};
        const outputsList = [];

        for (const y in this.brain.neuronDict) {
            const neuron = this.brain.neuronDict[y];
            for (const t in neuron.connections) {
                neuronSums[t] = (neuronSums[t] || 0) + neuron.connections[t] * this.brain.neuronValue[y];
            }
            if (neuron.output != null) outputsList.push(neuron.output);
        }

        return { neuronSums, inputsSums, outputsList };
    }

    serialize() {
        return {neurons: this.Neurons};
    }
    
}

module.exports = Brain;
