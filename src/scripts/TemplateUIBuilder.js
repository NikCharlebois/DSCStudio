import $ from "jquery";
import HandleBarManager from "HandleBarManager";
import OfficeFabricManager from "OfficeFabricManager";
import StyleLoader from "StyleLoader";
import TemplateManager from "TemplateManager";
var fabric = require("exports?fabric!..\\..\\node_modules\\office-ui-fabric-js\\dist\\js\\fabric.js");

export default {
    Fabric: fabric, 
    BuildPrimaryUI: function(template) {
        $("#templateNameHeader").text(template.metadata.title);
        if (template.metadata.description !== null) {
            $("#templateDescription").text(template.metadata.description);
            $("#templateDescription").show();
        } else {
            $("#templateDescription").hide();    
        }

        if (template.configDataSettings.certificateDetails === null || 
            template.configDataSettings.certificateDetails === true) {} else 
        {
            $("#certificateDetails").remove();
        } //TODO: Handle the "no secure password scenario here
    },
    BuildQuestionUI: function(questionGroups) {

        Object.keys(questionGroups).forEach(function(groupName) {
            $("#templateQuestions").append("<h3>" + groupName + "</h3>");
            questionGroups[groupName].forEach(function(question) {
                switch (question.type) {
                    case "text":
                    case "filepath":
                    case "regex":
                        HandleBarManager.RenderHandleBar('TextQuestion', question, '#templateQuestions');
                        break;
                    case "number":
                        HandleBarManager.RenderHandleBar('NumberQuestion', question, '#templateQuestions');
                        break;
                    case "boolean":
                        HandleBarManager.RenderHandleBar('BooleanQuestion', question, '#templateQuestions');
                        OfficeFabricManager.UpdateToggle('question-' + question.id);
                        break;
                    default:
                        alert("Field type not supported");
                        break;
                }
            });
        });

        OfficeFabricManager.UpdatePanels();
        StyleLoader.ApplyStyles();
    },
    BuildNewNodeUI: function() {
        var localFabric = this.Fabric;
        DscStudio.CurrentTemplate.configDataSettings.nodeSettings.forEach(function(setting) {
            switch (setting.valueType) {
                case "text":
                    HandleBarManager.RenderHandleBar('TextNodeOption', setting, '#additionalNodeDetails');
                    break;
                case "number":
                    HandleBarManager.RenderHandleBar('NumberNodeOption', setting, '#additionalNodeDetails');
                    break;
                case "boolean":
                    HandleBarManager.RenderHandleBar('BooleanNodeOption', setting, '#additionalNodeDetails');
                    new localFabric.Toggle(document.getElementById("nodeSetting-" + setting.powershellName));
                    break;
                default:
                    throw setting.valueType + " is not a supported node data type";
            }
        });
    }
};
