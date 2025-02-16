const Brain = require("./Neurons");

test() {
    // set up
    let neurons = new Neurons();
    let inputIndex = neurons.addInput("one");
    let neuronIndex = neurons.addNeuron();
    let outputIndex = neurons.addOutput(Brain.Decision.chase);
    neurons.addConnection(inputIndex, neuronIndex, 1);
    neurons.addConnection(neuronIndex, outputIndex, 2);
    neurons.setInput("one", 10);
    neurons.compute();
    // verify
    let neuronValue = neurons.getNeuronValue(inputIndex);
    if (neuronValue != 10)
        throw new Error("something is broken");
    neuronValue = neurons.getNeuronValue(neuronIndex);
    if (neuronValue != 0)
        throw new Error("something is broken");
    neuronValue = neurons.getNeuronValue(outputIndex);
    // if (neuronValue != ?)
    //     throw new Error("something is broken");
    // let outputs = neurons.getOutputs();
    // if (outputs[Brain.Decision.chase] != ?)
    //     throw new Error("something is broken");
}
