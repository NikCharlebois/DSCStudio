import $ from "jquery";
import HandleBarManager from "HandleBarManager";
import OfficeFabricManager from "OfficeFabricManager";
import StyleLoader from "StyleLoader";
import ViewManager from "ViewManager";
import TemplateManager from "TemplateManager";
import FormValidator from "FormValidator";
import TemplateUIBuilder from "TemplateUIBuilder";
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

        var localFabric = this.Fabric;
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
                            case "true":
                                $("#question-" + question.id + " label").addClass("is-selected");
                                break;
                            case "false":
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
                    case "textarray":
                        HandleBarManager.RenderHandleBar('TextArrayQuestion', question, '#templateQuestions');
                        $("#question-" + question.id + " button.add").click(function() {
                            var newValue = $("#" + this.id.replace("add", "newitem")).val();
                            $("#" + this.id.replace("add", "value")).append("<option value=\"" + newValue + "\">" + newValue + "</option>");
                            $("#" + this.id.replace("add", "newitem")).val("");
                        });
                        $("#question-" + question.id + " button.remove").click(function() {
                            var current = $("#" + this.id.replace("remove", "value")).val();
                            $("#" + this.id.replace("remove", "value")).children("option[value=\"" + current + "\"]").remove();
                        });
                        break;
                    case "complextype":
                        HandleBarManager.RenderHandleBar('ComplexTypeQuestion', question, '#templateQuestions');
                        $("#question-" + question.id + "-openbutton").click(function() {
                            ViewManager.OpenDialog(this.id.replace("openbutton", "dialog"));
                        });

                        question.properties.forEach(function(property) {
                            if (property.type === "boolean") {
                                OfficeFabricManager.UpdateToggle('complex-' + question.id + '-' + property.powershellName + "-toggle");
                                if (property.default !== undefined) {
                                    if (property.default === "true" || property.default === true) {
                                        $("label[for='complex-" + question.id + "-" + property.powershellName + "-value']").addClass("is-selected");
                                    } else {
                                        $("label[for='complex-" + question.id + "-" + property.powershellName + "-value']").removeClass("is-selected");
                                    }
                                }
                            }
                        });

                        var validationResult = FormValidator.ValidateComplexTypeItem(question.id);
                        if (validationResult === false) {
                            $("#complex-" + question.id + "-addbutton").attr("disabled", "disabled");
                        } else {
                            $("#complex-" + question.id + "-addbutton").removeAttr("disabled");      
                        }

                        $("#question-" + question.id + " input").on("keyup", function() {
                            var currentDialogId = $(this).parents(".ms-Dialog").attr('id');
                            var questionId = currentDialogId.replace("question-","").replace("-dialog","");
                            var validationResult = FormValidator.ValidateComplexTypeItem(questionId);
                            if (validationResult === false) {
                                $("#complex-" + questionId + "-addbutton").attr("disabled", "disabled");
                            } else {
                                $("#complex-" + questionId + "-addbutton").removeAttr("disabled");      
                            }
                        });

                        TemplateUIBuilder.BuildComplexQuestionOutput(question.id);

                        new localFabric.Button(document.getElementById("complex-" + question.id + "-addbutton"), function(event) {
                            var id = event.currentTarget.id.replace("-addbutton", "").replace("complex-", "");
                            var validationResult = FormValidator.ValidateComplexTypeItem(id);
                            if (validationResult === false) {
                                alert("The values you submitted were not valid. Please attempt to add this item again.");
                            } else {
                                var currentValue = JSON.parse($("#question-" + id + "-value").val());
                                var newItem = {};
                                var question = null;
                                DscStudio.CurrentTemplate.questions.forEach(function(element) {
                                    if (element.id === id) {
                                        question = element;
                                    }
                                }, this);

                                newItem.AllResponses = [];
                                question.properties.forEach(function(element) {
                                    switch(element.type) {
                                        case "text":
                                        case "number":
                                            var propertyValue = $("#complex-" + id + "-" + element.powershellName).val();
                                            newItem.AllResponses.push({
                                                name: element.name,
                                                powershellName: element.powershellName,
                                                type: element.type,
                                                value: propertyValue
                                            });
                                            if (element.default !== undefined) {
                                                $("#complex-" + id + "-" + element.powershellName).val(element.default);
                                            } else {
                                                $("#complex-" + id + "-" + element.powershellName).val("");
                                            }
                                            break;
                                        case "boolean":
                                            newItem.AllResponses.push({
                                                name: element.name,
                                                powershellName: element.powershellName,
                                                type: element.type,
                                                value: $("label[for='complex-" + id + "-" + element.powershellName + "-value']").hasClass("is-selected")
                                            });
                                            if (element.default !== undefined && (element.default === true || element.default === "true")) {
                                                $("label[for='complex-" + id + "-" + element.powershellName + "-value']").addClass("is-selected");
                                            } else {
                                                $("label[for='complex-" + id + "-" + element.powershellName + "-value']").removeClass("is-selected");
                                            }
                                            break;
                                    }
                                });
                                currentValue.push(newItem);
                                var newValue = JSON.stringify(currentValue);
                                $("#question-" + id + "-value").val(newValue);
                                TemplateUIBuilder.BuildComplexQuestionOutput(question.id);
                            }
                        });
                        break;
                    default:
                        alert("Field type '" + question.type + "'not supported");
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
    },
    BuildComplexQuestionOutput: function(questionId) {
        var value = $("#question-" + questionId + "-value").val();
        var currentObject = JSON.parse(value);

        var resultsDisplayBox = $("#question-" + questionId + "-results");
        resultsDisplayBox.empty();

        if (currentObject.length === 0) {
            resultsDisplayBox.append("<p>No items</p>");
        } else {
            HandleBarManager.RenderHandleBar('ComplexQuestionDisplay', currentObject, '#question-' + questionId + '-results');
        }
    }
};
