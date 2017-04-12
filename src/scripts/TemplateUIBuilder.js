import HandleBarManager from "./HandleBarManager";
import FormValidator from "./FormValidator";
import TemplateUIBuilder from "./TemplateUIBuilder";
import UI from "./UI";
import Strings from "./Strings";

export default {
    BuildPrimaryUI: function(template) {
        UI.SetText("#templateNameHeader",template.metadata.title);
        if (template.metadata.description !== null) {
            UI.SetText("#templateDescription", template.metadata.description);
            UI.ShowElement("templateDescription");
        } else {
            UI.HideElement("templateDescription");
        }

        if (template.configDataSettings.certificateDetails === null || 
            template.configDataSettings.certificateDetails === true) {} else 
        {
            UI.RemoveElement("#certificateDetails");
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
                        UI.UpdateToggle(`question-${question.id}`);
                        switch (question.defaultValue) {
                            case "true":
                                UI.AddClass(`#question-${question.id} label`,"is-selected");
                                break;
                            case "false":
                                UI.RemoveClass(`#question-${question.id} label`,"is-selected");
                                break;
                            default:
                                break;
                        }
                        break;
                    case "choice":
                        HandleBarManager.RenderHandleBar('ChoiceQuestion', question, '#templateQuestions');
                        if (question.defaultValue !== undefined) {
                            UI.SetValue(`#question-${question.id}-value`, question.defaultValue);
                        }
                        break;
                    case "textarray":
                        HandleBarManager.RenderHandleBar('TextArrayQuestion', question, '#templateQuestions');
                        UI.RegisterEvent(`#question-${question.id} button.add`, "click", function() {
                            var newItemId = this.id.replace("add", "newitem");
                            var valueId = this.id.replace("add", "value");
                            var newValue = UI.GetValue(`#${newItemId}`);

                            UI.AppendText(`#${valueId}`, `<option value="${newValue}">${newValue}</option>`);
                            UI.SetValue(`#${newItemId}`, "");
                        });

                        UI.RegisterEvent(`#question-${question.id} button.remove`, "click", function() {
                            var itemId = this.id.replace("remove", "value");
                            var current = UI.GetValue(`#${itemId}`);
                            UI.RemoveValueFromSelectList(`#${itemId}`,current);
                        });
                        break;
                    case "complextype":
                        HandleBarManager.RenderHandleBar('ComplexTypeQuestion', question, '#templateQuestions');
                        UI.RegisterEvent(`#question-${question.id}-openbutton`, "click", function() {
                            UI.OpenDialog(this.id.replace("openbutton", "dialog"));
                        });

                        question.properties.forEach(function(property) {
                            if (property.type === "boolean") {
                                UI.UpdateToggle(`complex-${question.id}-${property.powershellName}-toggle`);
                                if (property.default !== undefined) {
                                    if (property.default === "true" || property.default === true) {
                                        UI.AddClass(`label[for='complex-${question.id}-${property.powershellName}-value']`,"is-selected");
                                    } else {
                                        UI.RemoveClass(`label[for='complex-${question.id}-${property.powershellName}-value']`,"is-selected");
                                    }
                                }
                            }
                        });

                        var validationResult = FormValidator.ValidateComplexTypeItem(question.id);
                        if (validationResult === false) {
                            UI.SetAttribute(`#complex-${question.id}-addbutton`, "disabled", "disabled");
                        } else {
                            UI.RemoveAttribute(`#complex-${question.id}-addbutton`,"disabled");   
                        }
                        
                        UI.RegisterEvent(`#question-${question.id} input`, "keyup", function() {
                            var currentDialogId = UI.GenericSelector(this).parents(".ms-Dialog").attr('id');
                            var questionId = currentDialogId.replace("question-","").replace("-dialog","");
                            var validationResult = FormValidator.ValidateComplexTypeItem(questionId);
                            if (validationResult === false) {
                                UI.SetAttribute(`#complex-${question.id}-addbutton`, "disabled", "disabled");
                            } else {
                                UI.RemoveAttribute(`#complex-${question.id}-addbutton`,"disabled");   
                            }
                        });

                        TemplateUIBuilder.BuildComplexQuestionOutput(question.id);

                        new fabric.Button(document.getElementById(`complex-${question.id}-addbutton`), function(event) {
                            var id = event.currentTarget.id.replace("-addbutton", "").replace("complex-", "");
                            var validationResult = FormValidator.ValidateComplexTypeItem(id);
                            if (validationResult === false) {
                                UI.SendAlert(Strings.ComplexTypeNotValid);
                            } else {
                                var currentValue = JSON.parse(UI.GetValue(`#question-${id}-value`));
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
                                            var propertyValue = UI.GetValue(`#complex-${id}-${element.powershellName}`);
                                            newItem.AllResponses.push({
                                                name: element.name,
                                                powershellName: element.powershellName,
                                                type: element.type,
                                                value: propertyValue
                                            });
                                            if (element.default !== undefined) {
                                                UI.SetValue(`#complex-${id}-${element.powershellName}`, element.default);
                                            } else {
                                                UI.SetValue(`#complex-${id}-${element.powershellName}`, "");
                                            }
                                            break;
                                        case "boolean":
                                            newItem.AllResponses.push({
                                                name: element.name,
                                                powershellName: element.powershellName,
                                                type: element.type,
                                                value: UI.GenericSelector(`label[for='complex-${id}-${element.powershellName}-value']`).hasClass("is-selected")
                                            });
                                            if (element.default !== undefined && (element.default === true || element.default === "true")) {
                                                UI.AddClass(`label[for='complex-${id}-${element.powershellName}-value']`, "is-selected");
                                            } else {
                                                UI.RemoveClass(`label[for='complex-${id}-${element.powershellName}-value']`, "is-selected");
                                            }
                                            break;
                                    }
                                });
                                currentValue.push(newItem);
                                var newValue = JSON.stringify(currentValue);
                                UI.SetValue(`#question-${id}-value`, newValue);
                                TemplateUIBuilder.BuildComplexQuestionOutput(question.id);
                            }
                        });
                        break;
                    default:
                        UI.SendAlert(Strings.ErrorQuestionTypeNotSupported, [question.type]);
                        break;
                }
            });
        });

        UI.InitialisePanels();
        UI.ApplyStyles();

        Object.keys(questionGroups).forEach(function(groupName) {
            questionGroups[groupName].forEach(function(question) {
                if (question.showForTrueResponseQuestion !== undefined) {
                    
                    if (UI.GenericSelector(`#question-${question.showForTrueResponseQuestion} label`).hasClass("is-selected") === true) {
                        UI.GenericSelector(`*[data-showforresponse="question-${question.showForTrueResponseQuestion}"]`).show(250);
                    } else {
                        UI.GenericSelector(`*[data-showforresponse="question-${question.showForTrueResponseQuestion}"]`).hide(250);
                    }
                    
                    UI.RegisterEvent(`#question-${question.showForTrueResponseQuestion}`, "click", function() {
                        if (UI.GenericSelector(this).children("label").hasClass("is-selected") === true) {
                            UI.GenericSelector(`*[data-showforresponse="${this.id}"]`).show(250);
                        } else {
                            UI.GenericSelector(`*[data-showforresponse="${this.id}"]`).hide(250);
                        }
                        UI.SetNavBarPosition();
                    });
                }
            });
        });
    },
    BuildNewNodeUI: function() {
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
                    new fabric.Toggle(document.getElementById("nodeSetting-" + setting.powershellName));
                    break;
                default:
                    throw setting.valueType + " is not a supported node data type";
            }
        });
    },
    BuildComplexQuestionOutput: function(questionId) {
        var value = UI.GetValue(`#question-${questionId}-value`);
        var currentObject = JSON.parse(value);

        var resultsDisplayBox = UI.GenericSelector(`#question-${questionId}-results`);
        resultsDisplayBox.empty();

        if (currentObject.length === 0) {
            resultsDisplayBox.append("<p>No items</p>");
        } else {
            HandleBarManager.RenderHandleBar('ComplexQuestionDisplay', currentObject, `#question-${questionId}-results`);
        }
    }
};
