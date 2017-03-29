var assert = require("assert");
var sinon = require("sinon");
var FormValidator = require("../../src/scripts/FormValidator").default;
var SettingsStore = require("../../src/scripts/SettingsStore").default;
var TemplateManager = require("../../src/scripts/TemplateManager").default;
var PowerShellManager = require("../../src/scripts/PowerShellManager").default;
var UI = require("../../src/scripts/UI").default;

var ValidTemplate = require("./ExampleTemplates/ValidTemplate").default;

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
