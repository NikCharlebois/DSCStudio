import $ from "jquery";
import TemplateManager from "TemplateManager";
import PowerShellManager from "PowerShellManager";
import ViewManager from "ViewManager";
import DscNodeManager from "DscNodeManager";

export default {
    InitForm: function() {
        $(document).ready(function(){
            $("#questionErrorFlag").hide();
            $("#configErrorFlag").hide();
            $("#globalValidationMessage").hide();
            $("#QuestionnaireEditor").hide();
        });
    },
    ValidateForm: function(submitAfterValidate) {
        var formValid = true;
        if (this.ValidateConfigData() === false) {
            formValid = false;
        }
        if (this.ValidateNodeData() === false) {
            formValid = false;
        }

        var _this = this;
        var questionsValid = true;
        DscStudio.CurrentTemplate.questions.forEach(function(question) {
            var valid = _this.ValidateQuestion(question);
            if (valid === false) {
                questionsValid = false;
            }
        });

        if (questionsValid === true) {
            $("#questionErrorFlag").hide();
        } else {
            $("#questionErrorFlag").show();
            formValid = false;
        }

        if (submitAfterValidate === true && formValid === true) {
            TemplateManager.StoreQuestionResponses();
            PowerShellManager.UpdateCurrentScript();
            ViewManager.ShowView('output');
        }
    },
    ValidateQuestion: function(question) {
        var questionValid = true;
        if ($("#question-" + question.id).is(':visible') === false) {
            return true;
        }
        switch (question.type) {
            case "text":
                var textValue = $("#question-" + question.id + "-value")[0].value;
                if (textValue === null || textValue === "") {
                    questionValid = false;
                    $("#question-" + question.id + "-error").show();
                } else {
                    $("#question-" + question.id + "-error").hide();
                }
                break;
            case "number":
                var numberValue = $("#question-" + question.id + "-value")[0].value;
                if (numberValue === null || numberValue === "" || isNaN(numberValue)) {
                    questionValid = false;
                    $("#question-" + question.id + "-error").show();
                } else {
                    if (question.minValue !== null && numberValue < question.minValue) {
                        questionValid = false;
                        $("#question-" + question.id + "-error").show();
                    } else if(question.maxValue !== null && numberValue > question.maxValue) {

                    } else {
                        $("#question-" + question.id + "-error").hide();
                    }
                }
                break;
            case "filepath":
                var filevalue = $("#question-" + question.id + "-value")[0].value;
                if (filevalue === null || filevalue === "") {
                    questionValid = false;
                    $("#question-" + question.id + "-error").show();
                } else {
                    if (filevalue.match(/^(?:[\w]\:|\\)(\\[a-zA-Z_\-\s0-9\.]+)+\\*$/g) === null) {
                        questionValid = false;
                        $("#question-" + question.id + "-error").show();
                    } else {
                        $("#question-" + question.id + "-error").hide();
                    }
                }
                break;
            case "regex":
                var regexvalue = $("#question-" + question.id + "-value")[0].value;
                if (regexvalue === null || regexvalue === "") {
                    questionValid = false;
                    $("#question-" + question.id + "-error").show();
                } else {
                    // eval is required here to dynamically pull in the regex.
                    // The ignore comment has been added to pass the linting test 
                    if (regexvalue.match(eval(question.pattern)) === null) { // jshint ignore:line 
                        questionValid = false;
                        $("#question-" + question.id + "-error").show();
                    } else {
                        $("#question-" + question.id + "-error").hide();
                    }
                }
                break;
            case "textarray":
                var hasItems = false;
                $.each($("#question-" + question.id + "-value option"), function(item) {
                    hasItems = true;
                });
                if (hasItems === false) {
                    questionValid = false;
                    $("#question-" + question.id + "-error").show();
                }
                break;
            case "complextype":
                var complextypevalue = $("#question-" + question.id + "-value").val();
                var object = JSON.parse(complextypevalue);
                if (object.length === 0) {
                    questionValid = false;
                    $("#question-" + question.id + "-error").show();
                }
                break;
            case "boolean":
            case "choice":
                
                break;
            default:
                alert("Question type " + question.type + " does not have validation support");
                break;
        }
        return questionValid;
    },
    EnableQuestionValidation: function() {
        var _this = this;
        $("input[id^='question-']").on('focusout', function() {
            var questionId = this.id.replace("question-", "").replace("-value","");
            var question = DscStudio.CurrentTemplate.questions.filter(function(item) {
                return item.id == questionId;
            })[0];
            _this.ValidateQuestion(question);
        });
    },
    ValidateConfigData: function() {
        var configValid = true;

        if (DscStudio.CurrentTemplate.configDataSettings.certificateDetails === undefined || DscStudio.CurrentTemplate.configDataSettings.certificateDetails === true) {
            if ($("#CertPath").val() === null || $("#CertPath").val() === "" || $("#CertPath").val().match(/^(?:[\w]\:|\\)(\\[a-z_\-\s0-9\.]+)+\.(cer)$/g) === null) {
                $("#CertPath-Error").show();
                configValid = false;
            } else {
                $("#CertPath-Error").hide();
            }

            if ($("#CertThumbprint").val() === null || $("#CertThumbprint").val() === "" || $("#CertThumbprint").val().match(/^[A-Fa-f0-9]{40}/g) === null) {
                $("#CertThumbprint-Error").show();
                configValid = false;
            } else {
                $("#CertThumbprint-Error").hide();
            }
        }

        if ($("#ConfigModeMins").val() === null || $("#ConfigModeMins").val() === "" || isNaN($("#ConfigModeMins").val())) {
            $("#ConfigModeMins-Error").show();
            configValid = false;
        } else {
            if ($("#ConfigModeMins").val() < 15) {
                $("#ConfigModeMins-Error").show();
                configValid = false;
            } else {
                $("#ConfigModeMins-Error").hide();
            }
        }

        if (configValid === true) {
            $("#configErrorFlag").hide();
        } else {
            $("#configErrorFlag").show();
        }
        return configValid;
    },
    ValidateNodeData: function() {
        var minCount = 1;
        var configValid = true;
        if (DscStudio.CurrentTemplate.configDataSettings.minNodeCount !== undefined) {
            minCount = DscStudio.CurrentTemplate.configDataSettings.minNodeCount;
        }

        $("#minNodeCountMessage").hide();
        $("#nodeOptionsNotValidMessage").hide();
        $("#nodeOptionsNotValidContent").empty();

        if (DscStudio.Nodes.length < minCount) {
            $("#minNodeCountMessage").show();
            $("#minNodeCountNumber").text(minCount);
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
                    $("#nodeOptionsNotValidMessage").show();
                    $("#nodeOptionsNotValidContent").append("This template requires " + nodeSetting.minOccurences + " computers with the '" + nodeSetting.displayName + "' option <br/>");
                    result = false;
                }
                if (occurences > nodeSetting.maxOccurences) {
                    $("#nodeOptionsNotValidMessage").show();
                    $("#nodeOptionsNotValidContent").append("This template requires no more than " + nodeSetting.maxOccurences + " computers with the '" + nodeSetting.displayName + "' option <br/>");
                    result = false;
                }
            }
        });

        if (configValid === true) {
            $("#configErrorFlag").hide();
        } else {
            $("#configErrorFlag").show();
        }

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
