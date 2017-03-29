var assert = require("assert");
var sinon = require("sinon");
var DscNodeManager = require("../../src/scripts/DscNodeManager").default;
var SettingsStore = require("../../src/scripts/SettingsStore").default;
var FormValidator = require("../../src/scripts/FormValidator").default;
var UI = require("../../src/scripts/UI").default;

var ValidTemplate = require("./ExampleTemplates/ValidTemplate").default;

describe("DscNodeManager - CanNewNodesBeAdded method", function () {
    var sandbox;

    beforeEach(function () {
        global.DscStudio = JSON.parse(JSON.stringify(SettingsStore)); // Done to parse a new value, not a reference
        global.DscStudio.CurrentTemplate = ValidTemplate;
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    it("Should determine that new nodes can be added when there are currently no nodes", function () {
        assert(DscNodeManager.CanNewNodesBeAdded() === true);
    });

    it("Should determine that new nodes can be added when there are currently less nodes than the defined maximum", function () {
        global.DscStudio.Nodes.push({
            name: "Node1",
            additionalProperties: {}
        });
        assert(DscNodeManager.CanNewNodesBeAdded() === true);
    });

    it("Should determine that new nodes can be added when there are currently less nodes than the defined maximum", function () {
        for (var index = 0; index < 20; index++) {
            global.DscStudio.Nodes.push({
                name: "Node" + index.toString(),
                additionalProperties: {}
            });   
        }
        assert(DscNodeManager.CanNewNodesBeAdded() === false);
    });

    it("Should determine that new nodes can be added when there is no maximum defined", function () {
        for (var index = 0; index < 20; index++) {
            global.DscStudio.Nodes.push({
                name: "Node" + index.toString(),
                additionalProperties: {}
            });   
        }
        global.DscStudio.CurrentTemplate.configDataSettings.maxNodeCount = undefined;

        assert(DscNodeManager.CanNewNodesBeAdded() === true);
    });
});

describe("DscNodeManager - AddNewNode method", function() {
    var sandbox;

    beforeEach(function () {
        global.DscStudio = JSON.parse(JSON.stringify(SettingsStore)); // Done to parse a new value, not a reference
        global.DscStudio.CurrentTemplate = ValidTemplate;
        global.DscStudio.Nodes = [];
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    it("Should add a new item to the nodes array", function() {
        sandbox.stub(UI, "ReadNodeSettingResponse").callsFake(function() { return ""; });
        sandbox.stub(UI, "GetValue").callsFake(function() { return ""; });
        sandbox.stub(UI, "ClearNodeSettingsValues").callsFake(function() { });
        sandbox.stub(UI, "RenderUISection").callsFake(function() { });
        sandbox.stub(UI, "RegisterEvent").callsFake(function() { });
        sandbox.stub(UI, "HideElement").callsFake(function() { });
        sandbox.stub(UI, "ShowElement").callsFake(function() { });
        sandbox.stub(FormValidator, "ValidateAllNodeData").callsFake(function() { return true; });
        
        DscNodeManager.AddNewNode();

        assert(global.DscStudio.Nodes.length > 0);
    });
});

describe("DscNodeManager - RemoveNode function", function() {
    var sandbox;

    beforeEach(function () {
        global.DscStudio = JSON.parse(JSON.stringify(SettingsStore)); // Done to parse a new value, not a reference
        global.DscStudio.CurrentTemplate = ValidTemplate;
        global.DscStudio.Nodes = [{
            name: "testNode"
        }];
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    it("Should remove a node that exists in the array when the user confirms", function() {
        sandbox.stub(UI, "RenderUISection").callsFake(function() { });
        sandbox.stub(UI, "ConfirmAction").callsFake(function() { return true; });
        sandbox.stub(FormValidator, "ValidateAllNodeData").callsFake(function() { return true; });

        DscNodeManager.RemoveNode("testNode");

        assert(global.DscStudio.Nodes.length === 0);
    });

    it("Should not remove a node that exists in the array when the user doesn't confirm", function() {
        sandbox.stub(UI, "RenderUISection").callsFake(function() { });
        sandbox.stub(UI, "ConfirmAction").callsFake(function() { return false; });
        sandbox.stub(FormValidator, "ValidateAllNodeData").callsFake(function() { return true; });

        DscNodeManager.RemoveNode("testNode");

        assert(global.DscStudio.Nodes.length > 0);
    });
});
