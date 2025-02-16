const Brain = require("./Brain");

// Ideas:
// -create another thing called reset time that resets a neuron after some time to 0

class Connection {
    constructor(from, to, weight) {
        this.from = from;
        this.to = to;
        this.weight = weight;
    }
}

class Neurons {
    
    constructor() {
        this.inputs = {};      // dictionary of names to neuron index
        this.outputs = {};     // dictionary of names to neuron index
        this.neurons = [];     // list of current neuron values
        this.nextNeurons = []; // list of incoming neuron values
        this.connections = []; // list of connection objects
        this.maxNeurons = 60
        this.maxConnections = 120
        this.fps = 5 // fires per second?!?!
    }

    compute() {
        let tempNeurons = new Array(this.neurons.length).fill(0); // Avoid reallocating an array
        for (let i = 0; i < this.connections.length; i++) {
            let conn = this.connections[i];
            tempNeurons[conn.to] += Math.round(conn.weight * this.neurons[conn.from]);
        }
        this.neurons = tempNeurons; // Swap arrays instead of copying values
    }

    addInput(name) {
        this.neurons.push(0);
        this.nextNeurons.push(0);
        this.inputs[name] = this.neurons.length - 1;
        return this.neurons.length - 1;
    }

    setInput(name, value) {
        let index = this.inputs[name];
        this.neurons[index] = value;
    }

    addOutput(decision) {
        this.neurons.push(0);
        this.nextNeurons.push(0);
        this.outputs[decision] = this.neurons.length - 1;
        return this.neurons.length - 1;
    }

    getOutputs() {
        let outputss = Object.assign({}, this.outputs);
        for (const [key, value] of Object.entries(outputss)) {
            outputss[key] = this.neurons[value];
        }
        return outputss;
    }

    addNeuron() {
        if ((this.neurons.length)-1 == this.maxNeurons) {
            return
        }
        this.neurons.push(0);
        this.nextNeurons.push(0);
        return this.neurons.length - 1;
    }

    deleteNeuron() {
        let index = Math.round(Math.random()*(this.neurons.length)-1)
        this.neurons.splice(index, 1)
        for (const connection of this.connections) {
            let conIndex = 0
            if (connection.from == index) {
                this.deleteConnection(conIndex)
                conIndex++
            }
            conIndex = 0
            if (connection.to == index) {
                this.deleteConnection(conIndex)
                conIndex++
            }
        }
    }

    // for testing
    getNeuronValue(index) {
        return this.neurons[index];
    }

    addConnection(from, to, weight) {
        if (this.connections != undefined) {
            if ((this.connections.length - 1) == this.maxConnections) {
                return
            }
        }
        if (from == undefined)
            from = Math.round(Math.random() * this.neurons.length - 1);
        if (to == undefined)
            to = Math.round(Math.random() * this.neurons.length - 1);
        if (weight == undefined)
            weight = Math.random*2;
        while (this.isInput(to)) // connection back to inputs are not allowed
            to = Math.round(Math.random() * this.neurons.length - 1);
        this.connections.push(new Connection(from, to, weight));
    }

    deleteConnection(index) {
        if (index == undefined) {
        this.connections.splice(Math.round(Math.random*this.connections.length-1), 1)
        }
        else {
            this.connections.splice(index, 1)
        }
    }

    changeConnection() {
        if (this.connections.length === 0) {
            console.warn("No connections to change.");
            return;
        }
        const index = Math.floor(Math.random() * this.connections.length); // Fixed random number generation
        this.connections[index].weight = Math.random() * 2;
    }

    getInputCount() {
        return Object.keys(this.inputs).length;
    }

    getNeuronCount() {
        return this.neurons.length;
    }

    // for testing
    isInput(nameOrIndex) {
        if (typeof nameOrIndex == "number")
            return (Object.values(this.inputs).includes(nameOrIndex))
        if (typeof nameOrIndex == "string")
            return nameOrIndex in this.inputs;
        throw new Error("Argument must be a string or integer.");
    }

    copy() {
        let newNeurons = new Neurons();
        newNeurons.inputs = JSON.parse(JSON.stringify(this.inputs)); // Deep copy
        newNeurons.outputs = JSON.parse(JSON.stringify(this.outputs));
        newNeurons.neurons = this.neurons.slice().fill(0);
        newNeurons.nextNeurons = this.neurons.slice().fill(0);
        newNeurons.connections = this.connections.slice();
        return newNeurons;
    }

    mutate() {
        let numOfMutations = Math.floor(Math.random() * 11);
        const mutations = [
            () => this.addConnection(),
            () => this.deleteConnection(),
            () => this.changeConnection(),
            () => this.addNeuron(),
            () => this.deleteNeuron()
        ];
        for (let i = 0; i < numOfMutations; i++) {
            let mutationIndex = Math.floor(Math.random() * mutations.length);
            mutations[mutationIndex](); // Directly call function
        }
    }

}

module.exports = Neurons;