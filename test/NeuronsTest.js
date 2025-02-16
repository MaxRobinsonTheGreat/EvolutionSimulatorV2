const assert = require('assert');
const Neurons = require('../src/Organism/Perception/Neurons');
const Brain = require('../src/Organism/Perception/Brain');

describe('Neurons', function () {
    it('simple neurons should work', function () {
        // set up
        let neurons = new Neurons();
        let inputIndex = neurons.addInput("one");
        assert.equal(inputIndex, 0);
        assert.equal(neurons.isInput(inputIndex), true);
        let neuronIndex = neurons.addNeuron();
        assert.equal(neuronIndex, 1);
        assert.equal(neurons.isInput(neuronIndex), false);
        let outputIndex = neurons.addOutput(Brain.Decision.chase);
        assert.equal(outputIndex, 2);
        assert.equal(neurons.isInput(outputIndex), false);
        neurons.addConnection(inputIndex, neuronIndex, 1);
        neurons.addConnection(neuronIndex, outputIndex, 1);
        neurons.setInput("one", 10);
        assert.equal(neurons.getNeuronValue(inputIndex), 10);
        // verify first compute
        neurons.compute();
        assert.equal(neurons.getNeuronValue(inputIndex), 0);
        assert.equal(neurons.getNeuronValue(neuronIndex), 10);
        assert.equal(neurons.getNeuronValue(outputIndex), 0);
        assert.equal(neurons.getOutputs()[Brain.Decision.chase], 0);
        // verify second compute
        neurons.compute();
        assert.equal(neurons.getNeuronValue(inputIndex), 0);
        assert.equal(neurons.getNeuronValue(neuronIndex), 0);
        assert.equal(neurons.getNeuronValue(outputIndex), 10);
        assert.equal(neurons.getOutputs()[Brain.Decision.chase], 10);
        // verify third compute
        neurons.compute();
        assert.equal(neurons.getNeuronValue(inputIndex), 0);
        assert.equal(neurons.getNeuronValue(neuronIndex), 0);
        assert.equal(neurons.getNeuronValue(outputIndex), 0);
        assert.equal(neurons.getOutputs()[Brain.Decision.chase], 0);
    });
});
