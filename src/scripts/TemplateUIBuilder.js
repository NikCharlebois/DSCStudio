import $ from "jquery";
import HandleBarManager from "HandleBarManager";
import OfficeFabricManager from "OfficeFabricManager";
import StyleLoader from "StyleLoader";
import ViewManager from "ViewManager";
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
            HandleBarManager.RenderHandleBar('QuestionGroupHeader', groupName, '#templateQuestions');
            HandleBarManager.RenderHandleBar('NavigationLink', groupName, '#navBox ul');
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
                        switch (question.defaultValue) {
                            case true:
                                $("#question-" + question.id + " label").addClass("is-selected");
                                break;
                            case false:
                                $("#question-" + question.id + " label").removeClass("is-selected");
                                break;
                            default:
                                break;
                        }
                        break;
                    case "choice":
                        HandleBarManager.RenderHandleBar('ChoiceQuestion', question, '#templateQuestions');
                        if (question.defaultValue !== undefined) {
                            $("#question-" + question.id + "-value").val(question.defaultValue);
                        }
                        break;
                    default:
                        alert("Field type not supported");
                        break;
                }
            });
        });

        OfficeFabricManager.UpdatePanels();
        StyleLoader.ApplyStyles();

        Object.keys(questionGroups).forEach(function(groupName) {
            questionGroups[groupName].forEach(function(question) {
                if (question.showForTrueResponseQuestion !== undefined) {
                    
                    if ($("#question-" + question.showForTrueResponseQuestion + " label").hasClass("is-selected") === true) {
                        $('*[data-showforresponse="question-' + question.showForTrueResponseQuestion + '"]').show(250);
                    } else {
                        $('*[data-showforresponse="question-' + question.showForTrueResponseQuestion + '"]').hide(250);
                    }
                    
                    $("#question-" + question.showForTrueResponseQuestion).click(function() {
                        if ($(this).children("label").hasClass("is-selected") === true) {
                            $('*[data-showforresponse="' + this.id + '"]').show(250);
                        } else {
                            $('*[data-showforresponse="' + this.id + '"]').hide(250);
                        }
                        ViewManager.SetNavBarPosition();
                    });
                }
            });
        });
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
