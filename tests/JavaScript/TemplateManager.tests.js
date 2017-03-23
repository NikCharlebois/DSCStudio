var assert = require("assert");
var sinon = require("sinon");
var TemplateManager = require("../../src/scripts/TemplateManager").default;

global.DynamicTemplate = undefined;

describe("TemplateManager - Init method", function() {
  it("Should alert when appropriate APIs are not supported", function() {
    var alert = sinon.spy();
    global.alert = alert;
    global.window = {};

    var returnVal = TemplateManager.Init();

    assert(returnVal === false, "Init method did not return false when the initialisation failed");
    assert(alert.calledOnce, "Alert was not called during the method");
  });

  it ("Should not return a value when appropriate APIs are supported", function () {
    var alert = sinon.spy();
    global.alert = alert;
    global.window = {
      File: {},
      FileReader: {},
      FileList: {},
      Blob: {}
    };

    var returnVal = TemplateManager.Init();
    assert(returnVal === undefined, "Init method should equal 'undefined' when it succeeds");
    assert(alert.notCalled, "Alert was called during the method");
  });
});
