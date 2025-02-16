const Brain = require("./Brain");

// Notes:
// -Every weight is unique (0-1)

// i <-- w --> n <-- w --> o

// i <-- w -->
// inputs:
// {inputId: {neuronId: weight, ...}, ...}
// { 0: { 11: w, 7: w, 13: w },
//   1: { 11: w, 6: w,  3: w } }
// (output = a brain decition)

// n
// neuronValue:
// {neuronId: value}
// {7, 33}

// <-- w --> o
// neuronDict:
// {neuronId: [{neuronId: weight,...}, dicision], ...}
// { 0: [[11: w, 12: w, 3: w], decision], ... ,
//   1: [[12: w, 1: w, 32: w], decision] }

// {inputId: [{neuronId: weight}, decision], ...}, ...}
// { 0: [{ 11: w}, decision], ...},
//   1: [{ 11: w}, decision], ...} }

// Ideas:
// -create another thing called reset time that resets a neuron after some time to 0

// Connections
// 0 ->  1
//   \-> 2
// [{"from": 0, "to": 1: "weight": 8}, ...]

// Neuron Values:
// inputs: {"damage": 0, "age": 1, "eye0": 2, "eye1": 3, ...}
// neurons: [7,5,10]
// outputs: {"chase": 6, "retreat": 7, ...}

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
        this.connections = []; // list of connetion objects
        this.shouldLog = false;
    }

    copy() {
        let newNeurons = new Neurons();
        Object.assign(newNeurons.inputs, this.inputs);
        Object.assign(newNeurons.outputs, this.outputs);
        newNeurons.neurons = this.neurons.slice().fill(0);
        newNeurons.nextNeurons = this.neurons.slice().fill(0);
        newNeurons.connections = this.connections.slice();
        return newNeurons;
    }

    compute() {
        for (let connection in this.connections) {
            let value = this.neurons[connection.from];
            let toAdd = connection.weight * value;
            this.nextNeurons[connection.to] += toAdd;
        }
        for (let i = 0; i < this.neurons.length; i++) {
            this.neurons[i] = this.nextNeurons[i];
        }
    }

    addInput(trait) {
        this.neurons.push(0);
        this.nextNeurons.push(0);
        this.inputs[trait] = this.neurons.length - 1;
        return this.neurons.length - 1;
    }

    setInput(trait, value) {
        let index = this.inputs[trait];
        this.neurons[index] = value;
    }

    addOutput(decision) {
        this.neurons.push(0);
        this.nextNeurons.push(0);
        this.outputs[decision] = this.neurons.length - 1;
        return this.neurons.length - 1;
    }

    getOutputs() {
        let outputs = Object.assign({}, this.outputs);
        for (const [key, value] of Object.entries(outputs)) {
            outputs[key] = this.neurons[value];
        }
        return outputs;
    }

    addNeuron() {
        this.neurons.push(0);
        this.nextNeurons.push(0);
        return this.neurons.length - 1;
    }

    getNeuronValue(index) {
        return this.neurons[index];
    }

    addConnection() {
        let from = Math.round(Math.random() * this.neurons.length);
        let to = Math.round(Math.random() * this.neurons.length);
        while (this.isInput(to)) // connection back to inputs are not allowed
            to = Math.round(Math.random() * this.neurons.length);
        let weight = Math.random();
        this.connections.push(new Connection(from, to, weight));
    }

    isInput(index) {
        return index in this.inputs;
    }

    mutate() {
        // Mutation logic will go here in the future
        // add and/or delete neurons
        // add and/or delete connections
        // change connection weights
    }

    log() {
        if (!this.shouldLog)
            return;
        console.log("----");
        console.log(this.inputs);
        console.log(this.nextNeurons);
        console.log(this.neurons);
        console.log(this.connections);
        console.log(this.outputs);
        console.log("----");
    }
}

module.exports = Neurons;