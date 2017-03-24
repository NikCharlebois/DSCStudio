var assert = require("assert");
var sinon = require("sinon");
var DscNodeManager = require("../../src/scripts/DscNodeManager").default;
var SettingsStore = require("../../src/scripts/SettingsStore").default;
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
        assert(DscNodeManager.CanNewNodesBeAdded() === true, "DscNodeManager reports that nodes can not be added");
    });

    it("Should determine that new nodes can be added when there are currently less nodes than the defined maximum", function () {
        global.DscStudio.Nodes.push({
            name: "Node1",
            additionalProperties: {},
            additionalPropsHtmlList: {}
        });
        assert(DscNodeManager.CanNewNodesBeAdded() === true, "DscNodeManager reports that nodes can not be added");
    });

    it("Should determine that new nodes can be added when there are currently less nodes than the defined maximum", function () {
        for (var index = 0; index < 20; index++) {
            global.DscStudio.Nodes.push({
                name: "Node" + index.toString(),
                additionalProperties: {},
                additionalPropsHtmlList: {}
            });   
        }
        assert(DscNodeManager.CanNewNodesBeAdded() === false, "DscNodeManager reports that nodes can not be added");
    });

    it("Should determine that new nodes can be added when there is no maximum defined", function () {
        for (var index = 0; index < 20; index++) {
            global.DscStudio.Nodes.push({
                name: "Node" + index.toString(),
                additionalProperties: {},
                additionalPropsHtmlList: {}
            });   
        }
        global.DscStudio.CurrentTemplate.configDataSettings.maxNodeCount = undefined;

        assert(DscNodeManager.CanNewNodesBeAdded() === true, "DscNodeManager reports that nodes can not be added");
    });
});