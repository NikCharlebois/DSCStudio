"use-strict";

var FormValidator = {
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

        var questionsValid = true;
        TemplateManager.CurrentTemplate.questions.forEach(function(question) {
            var valid = FormValidator.ValidateQuestion(question);
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
                    if (filevalue.match(/^(?:[\w]\:|\\)(\\[a-z_\-\s0-9\.]+)+\\*$/g) === null) {
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
                    if (regexvalue.match(eval(question.pattern)) === null) {
                        questionValid = false;
                        $("#question-" + question.id + "-error").show();
                    } else {
                        $("#question-" + question.id + "-error").hide();
                    }
                }
                break;
            case "boolean":
                
                break;
            default:
                alert("not text or number")
                break;
        }
        return questionValid;
    },
    EnableQuestionValidation: function() {
        $("input[id^='question-']").on('focusout', function() {
            var questionId = this.id.replace("question-", "").replace("-value","");
            var question = TemplateManager.CurrentTemplate.questions.filter(function(item) {
                return item.id == questionId;
            })[0];
            FormValidator.ValidateQuestion(question);
        });
    },
    ValidateConfigData: function() {
        var configValid = true;

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
        if (TemplateManager.CurrentTemplate.configDataSettings.minNodeCount !== undefined) {
            minCount = TemplateManager.CurrentTemplate.configDataSettings.minNodeCount;
        }

        $("#minNodeCountMessage").hide();
        $("#nodeOptionsNotValidMessage").hide();
        $("#nodeOptionsNotValidContent").empty();

        if (DscNodeManager.Nodes.length < minCount) {
            $("#minNodeCountMessage").show();
            $("#minNodeCountNumber").text(minCount);
            return false;
        } 
        if (TemplateManager.CurrentTemplate.configDataSettings.maxNodeCount !== undefined && DscNodeManager.Nodes.length > TemplateManager.CurrentTemplate.configDataSettings.maxNodeCount) {
            return false;
        }

        var result = true;
        TemplateManager.CurrentTemplate.configDataSettings.nodeSettings.forEach(function(nodeSetting) {
            if (nodeSetting.minOccurences !== null) {
                var occurences = 0;
                DscNodeManager.Nodes.forEach(function(node) {
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
                    $("#nodeOptionsNotValidContent").append("This template requires " + nodeSetting.minOccurences + " computers with the '" + nodeSetting.displayName + "' option <br/>")
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
    }
};
