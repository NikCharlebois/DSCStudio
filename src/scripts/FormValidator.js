import $ from "jquery";
import TemplateManager from "./TemplateManager";
import PowerShellManager from "./PowerShellManager";
import ViewManager from "./ViewManager";
import DscNodeManager from "./DscNodeManager";
import FormValidator from "./FormValidator";
import UI from "./UI";
import Strings from "./Strings";

export default {
    InitForm: function() {
        UI.RegisterEvent(UI.Document(), "ready", function() {
            UI.HideElement("questionErrorFlag");
            UI.HideElement("configErrorFlag");
            UI.HideElement("globalValidationMessage");
            UI.HideElement("QuestionnaireEditor");
        });
    },
    ValidateForm: function(submitAfterValidate) {
        var formValid = true;
        if (FormValidator.ValidateConfigData() === false) {
            formValid = false;
        }
        if (FormValidator.ValidateAllNodeData() === false) {
            formValid = false;
        }

        var questionsValid = true;
        DscStudio.CurrentTemplate.questions.forEach(function(question) {
            var valid = FormValidator.ValidateQuestion(question);
            if (valid === false) {
                questionsValid = false;
            }
        });

        if (questionsValid === true) {
            UI.HideElement("questionErrorFlag");
        } else {
            UI.ShowElement("questionErrorFlag");
            formValid = false;
        }

        if (submitAfterValidate === true && formValid === true) {
            TemplateManager.StoreQuestionResponses();
            PowerShellManager.UpdateCurrentScript();
            UI.SwitchView(UI.Views.Output);
        }

        return formValid;
    },
    ValidateQuestion: function(question) {
        var questionValid = true;
        if (UI.IsElementVisible(`#question-${question.id}`) === false) {
            return true;
        }
        switch (question.type) {
            case "text":
                var textValue = UI.GetValue(`#question-${question.id}-value`);
                if (textValue === null || textValue === "") {
                    questionValid = false;
                }
                break;
            case "number":
                var numberValue = UI.GetValue(`#question-${question.id}-value`);
                if (numberValue === null || numberValue === "" || isNaN(numberValue)) {
                    questionValid = false;
                } else {
                    if (question.minValue !== null && numberValue < question.minValue) {
                        questionValid = false;
                    } else if(question.maxValue !== null && numberValue > question.maxValue) {
                        questionValid = false;
                    }
                }
                break;
            case "filepath":
                var filevalue = UI.GetValue(`#question-${question.id}-value`);
                if (filevalue === null || filevalue === "") {
                    questionValid = false;
                } else {
                    if (filevalue.match(/^(?:[\w]\:|\\)(\\[a-zA-Z_\-\s0-9\.]+)+\\*$/g) === null) {
                        questionValid = false;
                    }
                }
                break;
            case "regex":
                var regexvalue = UI.GetValue(`#question-${question.id}-value`);
                if (regexvalue === null || regexvalue === "") {
                    questionValid = false;
                } else {
                    // eval is required here to dynamically pull in the regex.
                    // The ignore comment has been added to pass the linting test 
                    if (regexvalue.match(eval(question.pattern)) === null) { // jshint ignore:line 
                        questionValid = false;
                    }
                }
                break;
            case "textarray":
                var hasItems = false;
                UI.GetUIElements(`#question-${question.id}-value option`).forEach(function(item) {
                    hasItems = true;
                }, this);
                if (hasItems === false) {
                    questionValid = false;
                }
                break;
            case "complextype":
                var complextypevalue = UI.GetValue(`#question-${question.id}-value`);
                var object = JSON.parse(complextypevalue);
                if (object.length === 0) {
                    questionValid = false;
                }
                break;
            case "boolean":
            case "choice":
                // no specific validation is required for these types
                break;
            default:
                UI.SendAlert(Strings.ErrorQuestionTypeNotSupported, [question.type]);
                questionValid = false;
                break;
        }
        if (questionValid) {
            UI.HideElement(`#question-${question.id}-error`);
        } else {
            UI.ShowElement(`#question-${question.id}-error`);
        }
        return questionValid;
    },
    EnableQuestionValidation: function() {
        UI.RegisterEvent("input[id^='question-']", "focusout", function() {
            var questionId = this.id.replace("question-", "").replace("-value","");
            var question = DscStudio.CurrentTemplate.questions.filter(function(item) {
                return item.id == questionId;
            })[0];
            FormValidator.ValidateQuestion(question);
        });
    },
    ValidateConfigData: function() {
        var configValid = true;
        
        if (DscStudio.CurrentTemplate.configDataSettings.certificateDetails === undefined || DscStudio.CurrentTemplate.configDataSettings.certificateDetails === true) {
            var certPath = UI.GetValue("#CertPath");
            if (certPath === null || certPath === "" || certPath.match(/^(?:[\w]\:|\\)(\\[a-z_\-\s0-9\.]+)+\.(cer)$/g) === null) {
                UI.ShowElement("CertPath-Error");
                configValid = false;
            } else {
                UI.HideElement("CertPath-Error");
            }

            var certThumbprint = UI.GetValue("#CertThumbprint");
            if (certThumbprint === null || certThumbprint === "" || certThumbprint.match(/^[A-Fa-f0-9]{40}/g) === null) {
                UI.ShowElement("CertThumbprint-Error");
                configValid = false;
            } else {
                UI.HideElement("CertThumbprint-Error");
            }
        }

        var configModeMins = UI.GetValue("#ConfigModeMins");
        if (configModeMins === null || configModeMins === "" || isNaN(configModeMins)) {
            UI.ShowElement("ConfigModeMins-Error");
            configValid = false;
        } else {
            if (configModeMins < 15) {
                UI.ShowElement("ConfigModeMins-Error");
                configValid = false;
            } else {
                UI.HideElement("ConfigModeMins-Error");
            }
        }

        if (configValid === true) {
            UI.HideElement("configErrorFlag");
        } else {
            UI.ShowElement("configErrorFlag");
        }
        return configValid;
    },
    ValidateAllNodeData: function() {
        var minCount = 1;
        var configValid = true;
        if (DscStudio.CurrentTemplate.configDataSettings.minNodeCount !== undefined) {
            minCount = DscStudio.CurrentTemplate.configDataSettings.minNodeCount;
        }

        UI.HideElement("minNodeCountMessage");
        UI.HideElement("nodeOptionsNotValidMessage");
        UI.EmptyObject("nodeOptionsNotValidContent");

        if (DscStudio.Nodes.length < minCount) {
            UI.ShowElement("minNodeCountMessage");
            UI.SetText("#minNodeCountNumber", minCount);
            return false;
        } 
        if (DscStudio.CurrentTemplate.configDataSettings.maxNodeCount !== undefined && DscStudio.Nodes.length > DscStudio.CurrentTemplate.configDataSettings.maxNodeCount) {
            return false;
        }

        var result = true;
        DscStudio.CurrentTemplate.configDataSettings.nodeSettings.forEach(function(nodeSetting) {
            if (nodeSetting.minOccurences !== null) {
                var occurences = 0;
                DscStudio.Nodes.forEach(function(node) {
                    node.additionalProperties.forEach(function(additionalProp) {
                        if (additionalProp.powershellName == nodeSetting.powershellName) {
                            switch(nodeSetting.valueType) {
                                case "text":
                                case "number":
                                    if (additionalProp.value.toString() !== null && additionalProp.value.toString() !== "") {
                                        occurences++;
                                    }
                                    break;
                                case "boolean":
                                    if (additionalProp.value === true) {
                                        occurences++;
                                    }
                                break;
                            }
                        }
                    });
                });
                if (occurences < nodeSetting.minOccurences) {
                    UI.ShowElement("nodeOptionsNotValidMessage");
                    var notEnoughRoleMessage = Strings.ErrorNodeSettingsRoleNeeded.replace("{0}", nodeSetting.minOccurences).replace("{1}", nodeSetting.displayName);
                    UI.AppendText("#nodeOptionsNotValidContent", notEnoughRoleMessage + "<br />");
                    result = false;
                }
                if (occurences > nodeSetting.maxOccurences) {
                    UI.ShowElement("nodeOptionsNotValidMessage");
                    var tooManyRoleMessage = Strings.ErrorNodeSettingsRoleAsMaximum.replace("{0}", nodeSetting.minOccurences).replace("{1}", nodeSetting.displayName);
                    UI.AppendText("#nodeOptionsNotValidContent", tooManyRoleMessage + "<br />");
                    result = false;
                }
            }
        });

        return result;
    },
    ValidateComplexTypeItem: function(id) {
        var question = null;
        DscStudio.CurrentTemplate.questions.forEach(function(element) {
            if (element.id === id) {
                question = element;
            }
        }, this);

        var returnVal = true;
        question.properties.forEach(function(element) {
            switch(element.type) {
                case "text":
                    var val = $("#complex-" + question.id + "-" + element.powershellName).val();
                    if (val === null || val === "" || val === undefined) {
                        $("#complex-" + question.id + "-" + element.powershellName).addClass("ms-borderColor-red");
                        returnVal = false;
                    } else {
                        $("#complex-" + question.id + "-" + element.powershellName).removeClass("ms-borderColor-red");
                    }
                    break;
                case "number":
                    var numval = $("#complex-" + question.id + "-" + element.powershellName).val();
                    if (numval === null || numval === "" || numval === undefined || isNaN(numval)) {
                        $("#complex-" + question.id + "-" + element.powershellName).addClass("ms-borderColor-red");
                        returnVal = false;
                    } else {
                        $("#complex-" + question.id + "-" + element.powershellName).removeClass("ms-borderColor-red");
                    }
                    break;
                case "boolean":

                    break;
            }
        });
        return returnVal;
    }
};
