var assert = require("assert");
var sinon = require("sinon");
var FormValidator = require("../../src/scripts/FormValidator").default;
var SettingsStore = require("../../src/scripts/SettingsStore").default;
var TemplateManager = require("../../src/scripts/TemplateManager").default;
var PowerShellManager = require("../../src/scripts/PowerShellManager").default;
var UI = require("../../src/scripts/UI").default;

var ValidTemplate = require("./ExampleTemplates/ValidTemplate").default;
var ValidNoCertificateData = require("./ExampleTemplates/ValidNoCertificateData").default;
var HighMinimumNodeCount = require("./ExampleTemplates/HighMinimumNodeCount").default;
var LowMaximumNodeCount = require("./ExampleTemplates/LowMaximumNodeCount").default;
var NoMinimumNodeCount = require("./ExampleTemplates/NoMinimumNodeCount").default;
var NoMaximumNodeCount = require("./ExampleTemplates/NoMaximumNodeCount").default;
var NoNodeCounts = require("./ExampleTemplates/NoNodeCounts").default;
var NodeOccurencesSample = require("./ExampleTemplates/NodeOccurencesSample").default;

describe("FormValidator - Init method", function () {
    var sandbox;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    it("Should register the UI methods in the document.ready function", function () {
        var eventMock = sandbox.stub(UI, "RegisterEvent").callsFake(function () { });
        sandbox.stub(UI, "Document").callsFake(function () { return {}; });
        FormValidator.InitForm();
        assert(eventMock.calledOnce);
    });
});

describe("FormValidator - ValidateForm method", function() {
    var sandbox;

    beforeEach(function () {
        global.DscStudio = JSON.parse(JSON.stringify(SettingsStore)); // Done to parse a new value, not a reference
        global.DscStudio.CurrentTemplate = ValidTemplate;
        sandbox = sinon.sandbox.create();

        sandbox.stub(UI, "HideElement").callsFake(function() { });
        sandbox.stub(UI, "ShowElement").callsFake(function() { });
        sandbox.stub(UI, "SwitchView").callsFake(function() { });
        sandbox.stub(TemplateManager, "StoreQuestionResponses").callsFake(function() { });
        sandbox.stub(PowerShellManager, "UpdateCurrentScript").callsFake(function() { });
    });

    afterEach(function () {
        sandbox.restore();
    });

    it("Should return false when the config data is invalid", function() {
        sandbox.stub(FormValidator, "ValidateConfigData").callsFake(function () { return false; });
        sandbox.stub(FormValidator, "ValidateAllNodeData").callsFake(function () { return true; });
        sandbox.stub(FormValidator, "ValidateQuestion").callsFake(function () { return true; });
        
        var result = FormValidator.ValidateForm(true);

        assert(result === false);
    });

    it("Should return false when the node data data is invalid", function() {
        sandbox.stub(FormValidator, "ValidateConfigData").callsFake(function () { return true; });
        sandbox.stub(FormValidator, "ValidateAllNodeData").callsFake(function () { return false; });
        sandbox.stub(FormValidator, "ValidateQuestion").callsFake(function () { return true; });

        var result = FormValidator.ValidateForm(true);

        assert(result === false);
    });

    it("Should return false when questions are invalid", function() {
        sandbox.stub(FormValidator, "ValidateConfigData").callsFake(function () { return true; });
        sandbox.stub(FormValidator, "ValidateAllNodeData").callsFake(function () { return true; });
        sandbox.stub(FormValidator, "ValidateQuestion").callsFake(function () { return false; });

        var result = FormValidator.ValidateForm(true);

        assert(result === false);
    });

    it("Should return true when all data is valid", function() {
        sandbox.stub(FormValidator, "ValidateConfigData").callsFake(function () { return true; });
        sandbox.stub(FormValidator, "ValidateAllNodeData").callsFake(function () { return true; });
        sandbox.stub(FormValidator, "ValidateQuestion").callsFake(function () { return true; });

        var result = FormValidator.ValidateForm(true);

        assert(result === true);
    });
});

describe("FormValidator - ValidateQuestion method", function() {
    var sandbox;

    beforeEach(function () {
        global.DscStudio = JSON.parse(JSON.stringify(SettingsStore)); // Done to parse a new value, not a reference
        global.DscStudio.CurrentTemplate = ValidTemplate;
        sandbox = sinon.sandbox.create();

        sandbox.stub(UI, "HideElement").callsFake(function() { });
        sandbox.stub(UI, "ShowElement").callsFake(function() { });
    });

    afterEach(function () {
        sandbox.restore();
    });

    it("Should return true for any invisible elements", function() {
        var question = {
            id: "TestQuestion",
            type: "text"
        };
        sandbox.stub(UI, "IsElementVisible").callsFake(function() { return false; });

        var result = FormValidator.ValidateQuestion(question);

        assert(result === true);
    });

    it("Should return false for an empty text value", function() {
        var question = {
            id: "TestQuestion",
            type: "text"
        };
        sandbox.stub(UI, "IsElementVisible").callsFake(function() { return true; });
        sandbox.stub(UI, "GetValue").callsFake(function() { return ""; });

        var result = FormValidator.ValidateQuestion(question);

        assert(result === false);
    });

    it("Should return true for a non-empty text value", function() {
        var question = {
            id: "TestQuestion",
            type: "text"
        };
        sandbox.stub(UI, "IsElementVisible").callsFake(function() { return true; });
        sandbox.stub(UI, "GetValue").callsFake(function() { return "valid"; });

        var result = FormValidator.ValidateQuestion(question);

        assert(result === true);
    });

    it("Should return false for an empty number value", function() {
        var question = {
            id: "TestQuestion",
            type: "number"
        };
        sandbox.stub(UI, "IsElementVisible").callsFake(function() { return true; });
        sandbox.stub(UI, "GetValue").callsFake(function() { return ""; });

        var result = FormValidator.ValidateQuestion(question);

        assert(result === false);
    });

    it("Should return false for an non number value", function() {
        var question = {
            id: "TestQuestion",
            type: "number"
        };
        sandbox.stub(UI, "IsElementVisible").callsFake(function() { return true; });
        sandbox.stub(UI, "GetValue").callsFake(function() { return "NotANumber"; });

        var result = FormValidator.ValidateQuestion(question);

        assert(result === false);
    });

    it("Should return true for a valid number value", function() {
        var question = {
            id: "TestQuestion",
            type: "number"
        };
        sandbox.stub(UI, "IsElementVisible").callsFake(function() { return true; });
        sandbox.stub(UI, "GetValue").callsFake(function() { return "123"; });

        var result = FormValidator.ValidateQuestion(question);

        assert(result === true);
    });

    it("Should return false for an empty filepath value", function() {
        var question = {
            id: "TestQuestion",
            type: "filepath"
        };
        sandbox.stub(UI, "IsElementVisible").callsFake(function() { return true; });
        sandbox.stub(UI, "GetValue").callsFake(function() { return ""; });

        var result = FormValidator.ValidateQuestion(question);

        assert(result === false);
    });

    it("Should return true for a valid local filepath value", function() {
        var question = {
            id: "TestQuestion",
            type: "filepath"
        };
        sandbox.stub(UI, "IsElementVisible").callsFake(function() { return true; });
        sandbox.stub(UI, "GetValue").callsFake(function() { return "C:\\test"; });

        var result = FormValidator.ValidateQuestion(question);

        assert(result === true);
    });

    it("Should return true for a valid network filepath value", function() {
        var question = {
            id: "TestQuestion",
            type: "filepath"
        };
        sandbox.stub(UI, "IsElementVisible").callsFake(function() { return true; });
        sandbox.stub(UI, "GetValue").callsFake(function() { return "\\\\server\\test"; });

        var result = FormValidator.ValidateQuestion(question);

        assert(result === true);
    });

    it("Should return false for an empty regex value", function() {
        var question = {
            id: "TestQuestion",
            type: "regex",
            pattern: "/^[A-Z]$/g"
        };
        sandbox.stub(UI, "IsElementVisible").callsFake(function() { return true; });
        sandbox.stub(UI, "GetValue").callsFake(function() { return ""; });

        var result = FormValidator.ValidateQuestion(question);

        assert(result === false);
    });

    it("Should return false for an invalid regex value", function() {
        var question = {
            id: "TestQuestion",
            type: "regex",
            pattern: "/^[A-Z]$/g"
        };
        sandbox.stub(UI, "IsElementVisible").callsFake(function() { return true; });
        sandbox.stub(UI, "GetValue").callsFake(function() { return "a"; });

        var result = FormValidator.ValidateQuestion(question);

        assert(result === false);
    });

    it("Should return true for a valid regex value", function() {
        var question = {
            id: "TestQuestion",
            type: "regex",
            pattern: "/^[A-Z]$/g"
        };
        sandbox.stub(UI, "IsElementVisible").callsFake(function() { return true; });
        sandbox.stub(UI, "GetValue").callsFake(function() { return "A"; });

        var result = FormValidator.ValidateQuestion(question);

        assert(result === true);
    });

    it("Should return false for an empty textarray value", function() {
        var question = {
            id: "TestQuestion",
            type: "textarray"
        };
        sandbox.stub(UI, "IsElementVisible").callsFake(function() { return true; });
        sandbox.stub(UI, "GetUIElements").callsFake(function() { return []; });

        var result = FormValidator.ValidateQuestion(question);

        assert(result === false);
    });

    it("Should return true for a non-empty textarray value", function() {
        var question = {
            id: "TestQuestion",
            type: "textarray"
        };
        sandbox.stub(UI, "IsElementVisible").callsFake(function() { return true; });
        sandbox.stub(UI, "GetUIElements").callsFake(function() { return ["Valid"]; });

        var result = FormValidator.ValidateQuestion(question);

        assert(result === true);
    });

    it("Should return false for an empty complextype value", function() {
        var question = {
            id: "TestQuestion",
            type: "complextype"
        };
        sandbox.stub(UI, "IsElementVisible").callsFake(function() { return true; });
        sandbox.stub(UI, "GetValue").callsFake(function() { return "[]"; });

        var result = FormValidator.ValidateQuestion(question);

        assert(result === false);
    });

    it("Should return true for a non-empty complextype value", function() {
        var question = {
            id: "TestQuestion",
            type: "complextype"
        };
        sandbox.stub(UI, "IsElementVisible").callsFake(function() { return true; });
        sandbox.stub(UI, "GetValue").callsFake(function() { return `[{"Test": "Value"}]`; });

        var result = FormValidator.ValidateQuestion(question);

        assert(result === true);
    });

    it("Should return false for any unknown question type", function() {
        var question = {
            id: "TestQuestion",
            type: "unknowntype"
        };
        sandbox.stub(UI, "IsElementVisible").callsFake(function() { return true; });
        var alertMock = sandbox.stub(UI, "SendAlert").callsFake(function() { });

        var result = FormValidator.ValidateQuestion(question);

        assert(result === false);
        assert(alertMock.calledOnce);
    });
});

describe("FormValidator - EnableQuestionValidation method", function() {
    var sandbox;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    it("Should register the UI methods in the document.ready function", function () {
        var eventMock = sandbox.stub(UI, "RegisterEvent").callsFake(function () { });

        FormValidator.EnableQuestionValidation();
        
        assert(eventMock.calledOnce);
    });
});

describe("FormValidator - ValidateConfigData method", function () {
    var sandbox;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.stub(UI, "HideElement").callsFake(function() { });
        sandbox.stub(UI, "ShowElement").callsFake(function() { });

        global.DscStudio = JSON.parse(JSON.stringify(SettingsStore)); // Done to parse a new value, not a reference
        global.DscStudio.CurrentTemplate = ValidTemplate;
    });

    afterEach(function () {
        sandbox.restore();
    });

    it("Should fail if the config data certificate path is empty", function () {
        var getValueStub = sandbox.stub(UI, "GetValue");
        getValueStub.withArgs("#CertPath").callsFake(function() { return ""; });
        getValueStub.withArgs("#CertThumbprint").callsFake(function() { return "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"; });
        getValueStub.withArgs("#ConfigModeMins").callsFake(function() { return "15"; });

        var result = FormValidator.ValidateConfigData();

        assert(result === false);
    });

    it("Should fail if the config data certificate path is not a valid path", function () {
        var getValueStub = sandbox.stub(UI, "GetValue");
        getValueStub.withArgs("#CertPath").callsFake(function() { return "invalid"; });
        getValueStub.withArgs("#CertThumbprint").callsFake(function() { return "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"; });
        getValueStub.withArgs("#ConfigModeMins").callsFake(function() { return "15"; });

        var result = FormValidator.ValidateConfigData();

        assert(result === false);
    });

    it("Should fail if the config data certificate path is a valid path but does not end in .cer", function () {
        var getValueStub = sandbox.stub(UI, "GetValue");
        getValueStub.withArgs("#CertPath").callsFake(function() { return "C:\\temp"; });
        getValueStub.withArgs("#CertThumbprint").callsFake(function() { return "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"; });
        getValueStub.withArgs("#ConfigModeMins").callsFake(function() { return "15"; });

        var result = FormValidator.ValidateConfigData();

        assert(result === false);
    });

    it("Should fail if the config data certificate thumbprint is empty", function () {
        var getValueStub = sandbox.stub(UI, "GetValue");
        getValueStub.withArgs("#CertPath").callsFake(function() { return "C:\\test.cer"; });
        getValueStub.withArgs("#CertThumbprint").callsFake(function() { return ""; });
        getValueStub.withArgs("#ConfigModeMins").callsFake(function() { return "15"; });

        var result = FormValidator.ValidateConfigData();

        assert(result === false);
    });

    it("Should fail if the config data certificate tumbprint is not valid", function () {
        var getValueStub = sandbox.stub(UI, "GetValue");
        getValueStub.withArgs("#CertPath").callsFake(function() { return "invalid"; });
        getValueStub.withArgs("#CertThumbprint").callsFake(function() { return "NotValid"; });
        getValueStub.withArgs("#ConfigModeMins").callsFake(function() { return "15"; });

        var result = FormValidator.ValidateConfigData();

        assert(result === false);
    });

    it("Should pass if the template does not require certificate data", function () {
        global.DscStudio.CurrentTemplate = ValidNoCertificateData;

        var getValueStub = sandbox.stub(UI, "GetValue");
        getValueStub.withArgs("#CertPath").callsFake(function() { return ""; });
        getValueStub.withArgs("#CertThumbprint").callsFake(function() { return ""; });
        getValueStub.withArgs("#ConfigModeMins").callsFake(function() { return "15"; });

        var result = FormValidator.ValidateConfigData();

        assert(result === true);
    });

    it("Should fail if the config mode mins value is not present", function () {
        global.DscStudio.CurrentTemplate = ValidNoCertificateData;

        var getValueStub = sandbox.stub(UI, "GetValue");
        getValueStub.withArgs("#CertPath").callsFake(function() { return "C:\\test.cer"; });
        getValueStub.withArgs("#CertThumbprint").callsFake(function() { return "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"; });
        getValueStub.withArgs("#ConfigModeMins").callsFake(function() { return ""; });

        var result = FormValidator.ValidateConfigData();

        assert(result === false);
    });

    it("Should fail if the config mode mins value is less then 15", function () {
        global.DscStudio.CurrentTemplate = ValidNoCertificateData;

        var getValueStub = sandbox.stub(UI, "GetValue");
        getValueStub.withArgs("#CertPath").callsFake(function() { return "C:\\test.cer"; });
        getValueStub.withArgs("#CertThumbprint").callsFake(function() { return "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"; });
        getValueStub.withArgs("#ConfigModeMins").callsFake(function() { return "5"; });

        var result = FormValidator.ValidateConfigData();

        assert(result === false);
    });

    it("Should fail if the config mode mins value is not a number", function () {
        global.DscStudio.CurrentTemplate = ValidNoCertificateData;

        var getValueStub = sandbox.stub(UI, "GetValue");
        getValueStub.withArgs("#CertPath").callsFake(function() { return "C:\\test.cer"; });
        getValueStub.withArgs("#CertThumbprint").callsFake(function() { return "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"; });
        getValueStub.withArgs("#ConfigModeMins").callsFake(function() { return "two"; });

        var result = FormValidator.ValidateConfigData();

        assert(result === false);
    });

    it("Should pass if the config data is all valid when included from the template", function () {
        var getValueStub = sandbox.stub(UI, "GetValue");
        getValueStub.withArgs("#CertPath").callsFake(function() { return "C:\\test.cer"; });
        getValueStub.withArgs("#CertThumbprint").callsFake(function() { return "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"; });
        getValueStub.withArgs("#ConfigModeMins").callsFake(function() { return "15"; });

        var result = FormValidator.ValidateConfigData();

        assert(result === true);
    });
});

describe("FormValidator - ValidateAllNodeData method", function() {
    var sandbox;

    beforeEach(function () {
        global.DscStudio = JSON.parse(JSON.stringify(SettingsStore)); // Done to parse a new value, not a reference
        sandbox = sinon.sandbox.create();

        sandbox.stub(UI, "HideElement").callsFake(function() { });
        sandbox.stub(UI, "ShowElement").callsFake(function() { });
        sandbox.stub(UI, "EmptyObject").callsFake(function() { });
        sandbox.stub(UI, "SetText").callsFake(function() { });
        sandbox.stub(UI, "AppendText").callsFake(function() { });
    });

    afterEach(function () {
        sandbox.restore();
    });

    it("Should return false if no nodes are added", function() {
        global.DscStudio.CurrentTemplate = ValidTemplate;

        var result = FormValidator.ValidateAllNodeData();

        assert(result === false);
    });

    it("Should return false if the number of nodes is less than the minimum from the template", function() {
        global.DscStudio.Nodes = [{
            Name: "TestNode"
        }];
        global.DscStudio.CurrentTemplate = HighMinimumNodeCount;

        var result = FormValidator.ValidateAllNodeData();

        assert(result === false);
    });

    it("Should return false if the number of nodes is more than the maximum from the template", function() {
        global.DscStudio.Nodes = [{
            Name: "TestNode"
        },
        {
            Name: "TestNode"
        },
        {
            Name: "TestNode"
        }];
        global.DscStudio.CurrentTemplate = LowMaximumNodeCount;

        var result = FormValidator.ValidateAllNodeData();

        assert(result === false);
    });

    it("Should return true if there number of nodes is larger than the minimim, but less than the maximum", function() {
        global.DscStudio.Nodes = [{
            Name: "TestNode",
            additionalProperties: []
        },
        {
            Name: "TestNode",
            additionalProperties: []
        },
        {
            Name: "TestNode",
            additionalProperties: []
        }];
        global.DscStudio.CurrentTemplate = ValidTemplate;

        var result = FormValidator.ValidateAllNodeData();

        assert(result === true);
    });

    it("Should return true if there number of nodes is larger than the minimim, and there is no maximum", function() {
        global.DscStudio.Nodes = [{
            Name: "TestNode",
            additionalProperties: []
        },
        {
            Name: "TestNode",
            additionalProperties: []
        },
        {
            Name: "TestNode",
            additionalProperties: []
        }];
        global.DscStudio.CurrentTemplate = NoMaximumNodeCount;

        var result = FormValidator.ValidateAllNodeData();

        assert(result === true);
    });

    it("Should return true if there is no minimum, and the number of nodes is less than the maximim", function() {
        global.DscStudio.Nodes = [{
            Name: "TestNode",
            additionalProperties: []
        },
        {
            Name: "TestNode",
            additionalProperties: []
        },
        {
            Name: "TestNode",
            additionalProperties: []
        }];
        global.DscStudio.CurrentTemplate = NoMinimumNodeCount;

        var result = FormValidator.ValidateAllNodeData();

        assert(result === true);
    });

    it("Should return true if there is at least one node and no minimum or maximum are defined", function() {
        global.DscStudio.Nodes = [{
            Name: "TestNode",
            additionalProperties: []
        },
        {
            Name: "TestNode",
            additionalProperties: []
        },
        {
            Name: "TestNode",
            additionalProperties: []
        }];
        global.DscStudio.CurrentTemplate = NoNodeCounts;

        var result = FormValidator.ValidateAllNodeData();

        assert(result === true);
    });

    it("Should return false if the node counts are correct but there aren't enough nodes using a specific text/number property", function() {
        global.DscStudio.Nodes = [{
            Name: "TestNode",
            additionalProperties: [
                {
                    powershellName: "TextOption",
                    value: ""
                },
                {
                    powershellName: "NumberOption",
                    value: "1"
                },
                {
                    powershellName: "BooleanOption",
                    value: true
                }
            ]
        },
        {
            Name: "TestNode",
            additionalProperties: [
                {
                    powershellName: "TextOption",
                    value: ""
                },
                {
                    powershellName: "NumberOption",
                    value: "1"
                },
                {
                    powershellName: "BooleanOption",
                    value: true
                }
            ]
        },
        {
            Name: "TestNode",
            additionalProperties: [
                {
                    powershellName: "TextOption",
                    value: ""
                },
                {
                    powershellName: "NumberOption",
                    value: ""
                },
                {
                    powershellName: "BooleanOption",
                    value: false
                }
            ]
        }];
        global.DscStudio.CurrentTemplate = NodeOccurencesSample;

        var result = FormValidator.ValidateAllNodeData();

        assert(result === false);
    });

    it("Should return false if the node counts are correct but there are too many nodes using a specific text/number property", function() {
        global.DscStudio.Nodes = [{
            Name: "TestNode",
            additionalProperties: [
                {
                    powershellName: "TextOption",
                    value: "test"
                },
                {
                    powershellName: "NumberOption",
                    value: "1"
                },
                {
                    powershellName: "BooleanOption",
                    value: true
                }
            ]
        },
        {
            Name: "TestNode",
            additionalProperties: [
                {
                    powershellName: "TextOption",
                    value: "test"
                },
                {
                    powershellName: "NumberOption",
                    value: "1"
                },
                {
                    powershellName: "BooleanOption",
                    value: true
                }
            ]
        },
        {
            Name: "TestNode",
            additionalProperties: [
                {
                    powershellName: "TextOption",
                    value: "test"
                },
                {
                    powershellName: "NumberOption",
                    value: ""
                },
                {
                    powershellName: "BooleanOption",
                    value: false
                }
            ]
        }];
        global.DscStudio.CurrentTemplate = NodeOccurencesSample;

        var result = FormValidator.ValidateAllNodeData();

        assert(result === false);
    });

    it("Should return false if the node counts are correct but there aren't enough nodes using a specific boolean property", function() {
        global.DscStudio.Nodes = [{
            Name: "TestNode",
            additionalProperties: [
                {
                    powershellName: "TextOption",
                    value: "test"
                },
                {
                    powershellName: "NumberOption",
                    value: "1"
                },
                {
                    powershellName: "BooleanOption",
                    value: false
                }
            ]
        },
        {
            Name: "TestNode",
            additionalProperties: [
                {
                    powershellName: "TextOption",
                    value: "test"
                },
                {
                    powershellName: "NumberOption",
                    value: "1"
                },
                {
                    powershellName: "BooleanOption",
                    value: false
                }
            ]
        },
        {
            Name: "TestNode",
            additionalProperties: [
                {
                    powershellName: "TextOption",
                    value: ""
                },
                {
                    powershellName: "NumberOption",
                    value: ""
                },
                {
                    powershellName: "BooleanOption",
                    value: false
                }
            ]
        }];
        global.DscStudio.CurrentTemplate = NodeOccurencesSample;

        var result = FormValidator.ValidateAllNodeData();

        assert(result === false);
    });

    it("Should return false if the node counts are correct but there are too many nodes using a specific boolean property", function() {
        global.DscStudio.Nodes = [{
            Name: "TestNode",
            additionalProperties: [
                {
                    powershellName: "TextOption",
                    value: "test"
                },
                {
                    powershellName: "NumberOption",
                    value: "1"
                },
                {
                    powershellName: "BooleanOption",
                    value: true
                }
            ]
        },
        {
            Name: "TestNode",
            additionalProperties: [
                {
                    powershellName: "TextOption",
                    value: "test"
                },
                {
                    powershellName: "NumberOption",
                    value: "1"
                },
                {
                    powershellName: "BooleanOption",
                    value: true
                }
            ]
        },
        {
            Name: "TestNode",
            additionalProperties: [
                {
                    powershellName: "TextOption",
                    value: ""
                },
                {
                    powershellName: "NumberOption",
                    value: ""
                },
                {
                    powershellName: "BooleanOption",
                    value: true
                }
            ]
        }];
        global.DscStudio.CurrentTemplate = NodeOccurencesSample;

        var result = FormValidator.ValidateAllNodeData();

        assert(result === false);
    });   

    it("Should return true if the node counts are correct and all node setting occurences are within ranges", function() {
        global.DscStudio.Nodes = [{
            Name: "TestNode",
            additionalProperties: [
                {
                    powershellName: "TextOption",
                    value: "test"
                },
                {
                    powershellName: "NumberOption",
                    value: "1"
                },
                {
                    powershellName: "BooleanOption",
                    value: true
                }
            ]
        },
        {
            Name: "TestNode",
            additionalProperties: [
                {
                    powershellName: "TextOption",
                    value: "test"
                },
                {
                    powershellName: "NumberOption",
                    value: "1"
                },
                {
                    powershellName: "BooleanOption",
                    value: true
                }
            ]
        },
        {
            Name: "TestNode",
            additionalProperties: [
                {
                    powershellName: "TextOption",
                    value: ""
                },
                {
                    powershellName: "NumberOption",
                    value: ""
                },
                {
                    powershellName: "BooleanOption",
                    value: false
                }
            ]
        }];
        global.DscStudio.CurrentTemplate = NodeOccurencesSample;

        var result = FormValidator.ValidateAllNodeData();

        assert(result === true);
    });   

});

describe("FormValidator - ValidateComplexTypeItem method", function() {
    var sandbox;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.stub(UI, "AddClass").callsFake(function() { });
        sandbox.stub(UI, "RemoveClass").callsFake(function() { });

        global.DscStudio = JSON.parse(JSON.stringify(SettingsStore)); // Done to parse a new value, not a reference
        global.DscStudio.CurrentTemplate = ValidTemplate;
    });

    afterEach(function () {
        sandbox.restore();
    });

    it("Should return false when a text value is empty", function() {
        var getValueStub = sandbox.stub(UI, "GetValue");
        getValueStub.withArgs("#complex-ComplexTypeQuestion-text").callsFake(function() { return ""; });
        getValueStub.withArgs("#complex-ComplexTypeQuestion-number").callsFake(function() { return "1"; });
        getValueStub.withArgs("#complex-ComplexTypeQuestion-boolean").callsFake(function() { return true; });
        
        var result = FormValidator.ValidateComplexTypeItem("ComplexTypeQuestion");

        assert(result === false);
    });

    it("Should return false when a number value is empty", function() {
        var getValueStub = sandbox.stub(UI, "GetValue");
        getValueStub.withArgs("#complex-ComplexTypeQuestion-text").callsFake(function() { return "valid"; });
        getValueStub.withArgs("#complex-ComplexTypeQuestion-number").callsFake(function() { return ""; });
        getValueStub.withArgs("#complex-ComplexTypeQuestion-boolean").callsFake(function() { return true; });
        
        var result = FormValidator.ValidateComplexTypeItem("ComplexTypeQuestion");

        assert(result === false);
    });

    it("Should return false when a number value is not a number", function() {
        var getValueStub = sandbox.stub(UI, "GetValue");
        getValueStub.withArgs("#complex-ComplexTypeQuestion-text").callsFake(function() { return "valid"; });
        getValueStub.withArgs("#complex-ComplexTypeQuestion-number").callsFake(function() { return "one"; });
        getValueStub.withArgs("#complex-ComplexTypeQuestion-boolean").callsFake(function() { return true; });
        
        var result = FormValidator.ValidateComplexTypeItem("ComplexTypeQuestion");

        assert(result === false);
    });

    it("Should return true when all values are valid", function() {
        var getValueStub = sandbox.stub(UI, "GetValue");
        getValueStub.withArgs("#complex-ComplexTypeQuestion-text").callsFake(function() { return "valid"; });
        getValueStub.withArgs("#complex-ComplexTypeQuestion-number").callsFake(function() { return "1"; });
        getValueStub.withArgs("#complex-ComplexTypeQuestion-boolean").callsFake(function() { return true; });
        
        var result = FormValidator.ValidateComplexTypeItem("ComplexTypeQuestion");

        assert(result === true);
    });
});
