var assert = require("assert");
var sinon = require("sinon");
var TemplateManager = require("../../src/scripts/TemplateManager").default;
var UI = require("../../src/scripts/UI").default;

var ValidTemplate = require("./ExampleTemplates/ValidTemplate").default;
var NoQuestionSectionTemplate = require("./ExampleTemplates/NoQuestionSectionTemplate").default;
var NoQuestionsTemplate = require("./ExampleTemplates/NoQuestionsTemplate").default;

describe("TemplateManager - GetQuestionGroups method", function () {
  var sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  it("Should process questions when provided from a valid template", function () {
    var result = TemplateManager.GetQuestionGroups(ValidTemplate);
    assert(result !== undefined);
  });

  it("Should alert the user if no questions section is present", function () {
    var alertMock = sandbox.stub(UI, "SendAlert").callsFake(function () { });
    TemplateManager.GetQuestionGroups(NoQuestionSectionTemplate);
    assert(alertMock.calledOnce);
  });

  it("Should alert the user if no questions are added", function () {
    var alertMock = sandbox.stub(UI, "SendAlert").callsFake(function () { });
    TemplateManager.GetQuestionGroups(NoQuestionsTemplate);
    assert(alertMock.calledOnce);
  });
});

describe("TemplateManager - Init method", function () {
  var sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  it("Should alert when appropriate APIs are not supported", function () {
    sandbox.stub(UI, "SupportedBrowser").callsFake(function () { return false; });
    var alertMock = sandbox.stub(UI, "SendAlert").callsFake(function () { });

    var returnVal = TemplateManager.Init();

    assert(returnVal === false, "Init method did not return false when the initialisation failed");
    assert(alertMock.calledOnce);
  });

  it("Should not return a value when appropriate APIs are supported", function () {
    sandbox.stub(UI, "SupportedBrowser").callsFake(function () { return true; });
    global.DynamicTemplate = undefined;

    var returnVal = TemplateManager.Init();

    assert(returnVal === undefined);
  });

  it("Should read a dynamic template when it exists", function () {
    sandbox.stub(UI, "SupportedBrowser").callsFake(function () { return true; });
    sandbox.stub(UI, "HideElement").callsFake(function () { });
    var dyanmicRead = sandbox.stub(TemplateManager, "ParseTemplate").callsFake(function () { });
    global.DynamicTemplate = {};

    var returnVal = TemplateManager.Init();

    assert(returnVal === undefined);
    assert(dyanmicRead.calledOnce);
  });
});
