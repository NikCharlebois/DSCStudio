var reader;
var currentTemplate;
var responses;
var nodes = [];
var currentScript = "";

var errorTemplate = "<div class=\"ms-MessageBar ms-MessageBar--error\" style=\"display: none;\" id=\"{1}\"><div class=\"ms-MessageBar-content\"><div class=\"ms-MessageBar-icon\"><i class=\"ms-Icon ms-Icon--ErrorBadge\"></i></div><div class=\"ms-MessageBar-text\">{0}</div></div></div>";

$(document).ready(function(){
    if (checkFileAPI() == false) {
        return;
    }

    $('#templateSelector').on('change', function() {
        readTemplate(this);
    });

    $("#goBackToResponses").on('click', function() {
        $("#templateStart").hide();
        $("#templateResponse").show();
        $("#templateOutput").hide();
    });

    $("#newNodeCommand").on('click', function() {
        OpenNewNodeDialog();
    });

    $("#switchView-Config").on('click', function() {
        $("#configDataEditor").show();
        $("#switchView-Config").parent().addClass("ms-bgColor-themeLight");

        $("#QuestionnaireEditor").hide();
        $("#switchView-Questions").parent().removeClass("ms-bgColor-themeLight");
    });

    $("#switchView-Questions").on('click', function() {
        $("#configDataEditor").hide();
        $("#switchView-Config").parent().removeClass("ms-bgColor-themeLight");

        $("#QuestionnaireEditor").show();
        $("#switchView-Questions").parent().addClass("ms-bgColor-themeLight");
    });

    $("#GenerateConfig").on('click', function() {
        ValidateForm(true);
    });

    $("#saveConfig").on('click', function() {
        var blob = new Blob([currentScript], {type: "text/plain;charset=utf-8"});
        saveAs(blob, "DSCScript.ps1");
    });

    $("#code-expandButton").on('click', function() {
        if ($("#code-minimise-button").attr('class') == "ms-Icon ms-Icon--ChevronDown") {
            // expand 
            $("#code-minimise-button").attr('class', "ms-Icon ms-Icon--ChevronUp");
            $("#scriptContentParent").attr('class', "code-expanded");
        } else {
            // collapse
            $("#code-minimise-button").attr('class', "ms-Icon ms-Icon--ChevronDown");
            $("#scriptContentParent").attr('class', "code-minimise");
        }
    });

    new fabric['Button'](document.querySelector("#addNewNode"), NewNodeAdded);

    updateStyles();

    $("#templateStart").show();
    $("#templateResponse").hide();
    $("#templateOutput").hide();

    $("#questionErrorFlag").hide();
    $("#configErrorFlag").hide();
    $("#globalValidationMessage").hide();
    $("#QuestionnaireEditor").hide();
    
});

function updateStyles() {
    $("h1").addClass("ms-font-su");
    $("h2").addClass("ms-font-xxl");
    $("h3").addClass("ms-font-xl");
    $("p").addClass("ms-font-m");
}

function checkFileAPI() {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        reader = new FileReader();
        return true; 
    } else {
        alert('Your browser does not support HTML5 file APIs. Please open this from a browser that supports HTML5.');
        return false;
    }
}

function readTemplate(filePath) {
    var output = ""; 
    if(filePath.files && filePath.files[0]) {           
        reader.onload = function (e) {
            output = e.target.result;
            currentTemplate = JSON.parse(output);
            loadTemplate();
        };
        reader.readAsText(filePath.files[0]);
    }
    else 
    {
        return false;
    }
    return true;
}   

function loadTemplate() {
    $("#templateNameHeader").text(currentTemplate.metadata.title);
    if (currentTemplate.metadata.description != null) {
        $("#templateDescription").text(currentTemplate.metadata.description);
        $("#templateDescription").show();
    } else {
        $("#templateDescription").hide();    
    }

    if (currentTemplate.configDataSettings.certificateDetails == null || currentTemplate.configDataSettings.certificateDetails == true) {} else {
        $("#certificateDetails").remove();
    }

    var questionGroups = {};
    currentTemplate.questions.forEach(function(question) {
        if (question.group != null) {
            if (questionGroups.hasOwnProperty(question.group) == false) {
                questionGroups[question.group] = [];
            }
            questionGroups[question.group].push(question);
        } else {
            if (questionGroups.hasOwnProperty("Other questions") == false) {
                questionGroups["Other questions"] = [];
            }
            questionGroups["Other questions"].push(question);
        }
    });

    Object.keys(questionGroups).forEach(function(groupName) {
        $("#templateQuestions").append("<h3>" + groupName + "</h3>");
        questionGroups[groupName].forEach(function(question) {
            switch (question.type) {
                case "text":
                case "filepath":
                case "regex":
                    $("#templateQuestions").append(GetTextQuestionRender(question));
                    break;
                case "number":
                    $("#templateQuestions").append(GetNumberQuestionRender(question));
                    break;
                case "boolean":
                    $("#templateQuestions").append(GetBooleanQuestionRender(question));
                    break;
                default:
                    alert("Field type not supported");
                    break;
            }
        });
    });

    var PanelExamples = document.getElementsByClassName("ms-PanelExample");
    for (var i = 0; i < PanelExamples.length; i++) {
        (function() {
            var PanelExampleButton = PanelExamples[i].querySelector(".ms-Button");
            var PanelExamplePanel = PanelExamples[i].querySelector(".ms-Panel");
            PanelExampleButton.addEventListener("click", function(i) {
                new fabric['Panel'](PanelExamplePanel);
            });
        }());
    }

    $("input[id^='question-']").on('focusout', function() {
        var questionId = this.id.replace("question-", "").replace("-value","");
        var question = currentTemplate.questions.filter(function(item) {
            return item.id == questionId;
        })[0];
        validateQuestion(question);
    });

    UpdateNewNodeDialog();
    updateStyles();
    prepareFabricComponents();
    ValidateNodeParameters();

    $("#templateStart").hide();
    $("#templateResponse").show();
    $("#templateOutput").hide();
}

function prepareFabricComponents(specificParent) {
    var PivotElements = document.querySelectorAll(".ms-Pivot");
    for(var i = 0; i < PivotElements.length; i++) {
        new fabric['Pivot'](PivotElements[i]);
    }

    var CommandBarElements = document.querySelectorAll(".ms-CommandBar");
    for(var i = 0; i < CommandBarElements.length; i++) {
        new fabric['CommandBar'](CommandBarElements[i]);
    }

    var ListElements = document.querySelectorAll(".ms-List");
    for(var i = 0; i < ListElements.length; i++) {
        new fabric['List'](ListElements[i]);
    }

    var DialogElements = document.querySelectorAll(".ms-Dialog");
    var DialogComponents = [];
    for (var i = 0; i < DialogElements.length; i++) {
        (function(){
            DialogComponents[i] = new fabric['Dialog'](DialogElements[i]);
        }());
    }

    var ToggleElements = document.querySelectorAll(".ms-Toggle");
    for(var i = 0; i < ToggleElements.length; i++) {
        new fabric['Toggle'](ToggleElements[i]);
    }
}

function UpdateNewNodeDialog() {
    currentTemplate.configDataSettings.nodeSettings.forEach(function(setting) {
        switch (setting.valueType) {
            case "text":
                $("#additionalNodeDetails").append(RenderNewNodeDialogTextBox(setting));
                break;
            case "number":
                $("#additionalNodeDetails").append(RenderNewNodeDialogNumber(setting));
                break;
            case "boolean":
                $("#additionalNodeDetails").append(RenderNewNodeDialogBoolean(setting));
                var ToggleElements = document.getElementById("nodeSetting-" + setting.powershellName);
                for (var i = 0; i < ToggleElements.length; i++) {
                    new fabric['Toggle'](ToggleElements[i]);
                }
                break;
            default:
                alert("not a supported type")
                break;
        }
    });   
}

function RenderNewNodeDialogTextBox(nodeSetting) {
    var fieldName = "nodeSetting-" + nodeSetting.powershellName;
    var output = "<div id=\"" + fieldName + "\" class=\"ms-TextField \">"
    output += "<label class=\"ms-Label\" for=\"" + fieldName + "-value\">" + nodeSetting.displayName + "</label>"
    output += "<input class=\"ms-TextField-field\"  type=\"text\" id=\"" + fieldName + "-value\" name=\"" + fieldName + "-value\" />"
    output += "</div>" 
    return output;
}

function RenderNewNodeDialogNumber(nodeSetting) {
    var fieldName = "nodeSetting-" + nodeSetting.powershellName;
    var output = "<div id=\"" + fieldName + "\" class=\"ms-TextField \">"
    output += "<label class=\"ms-Label\" for=\"" + fieldName + "-value\">" + nodeSetting.displayName + "</label>"
    output += "<input class=\"ms-TextField-field\"  type=\"text\" id=\"" + fieldName + "-value\" name=\"" + fieldName + "-value\" />"
    output += "</div>" 
    return output;
}

function RenderNewNodeDialogBoolean(nodeSetting) {
    var fieldName = "nodeSetting-" + nodeSetting.powershellName;
    var output = "<div id=\"" + fieldName + "\" class=\"ms-Toggle  ms-Toggle--textLeft\">";
    output += "<span class=\"ms-Toggle-description\">" + nodeSetting.displayName + "</span>";
    output += "<input class=\"ms-Toggle-input\"  type=\"checkbox\" id=\"" + fieldName + "-value\" name=\"" + fieldName + "-value\" />";
    output += "<label class=\"ms-Toggle-field\" for=\"" + fieldName + "-value\"><span class=\"ms-Label ms-Label--off\">No</span><span class=\"ms-Label ms-Label--on\">Yes</span></label>";
    output += "</div>" 
    return output;
}

function ValidateNodeParameters() {
    var minCount = 1;
    if (currentTemplate.configDataSettings.minNodeCount != null) {
        minCount = currentTemplate.configDataSettings.minNodeCount
    }

    $("#minNodeCountMessage").hide()
    $("#nodeOptionsNotValidMessage").hide();
    $("#nodeOptionsNotValidContent").empty();

    if (nodes.length < minCount) {
        $("#minNodeCountMessage").show();
        $("#minNodeCountNumber").text(minCount);
        return false;
    } 
    if (currentTemplate.configDataSettings.maxNodeCount != null && nodes.length > currentTemplate.configDataSettings.maxNodeCount) {
        return false;
    }

    var result = true;
    currentTemplate.configDataSettings.nodeSettings.forEach(function(nodeSetting) {
        if (nodeSetting.minOccurences != null) {
            var occurences = 0;
            nodes.forEach(function(node) {
                node.additionalProperties.forEach(function(additionalProp) {
                    if (additionalProp.powershellName == nodeSetting.powershellName) {
                        switch(nodeSetting.valueType) {
                            case "text":
                            case "number":
                                if (additionalProp.value.toString() != null && additionalProp.value.toString() != "") {
                                    occurences++;
                                }
                                break;
                            case "boolean":
                                if (additionalProp.value == true) {
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

    return result;
}

function OpenNewNodeDialog() {
    if (currentTemplate.configDataSettings.maxNodeCount != null && nodes.length >= currentTemplate.configDataSettings.maxNodeCount) {
        alert('This template supports a maximum of ' + currentTemplate.configDataSettings.maxNodeCount + ' nodes, please remove a node before adding a new one.');
    } else {
        var dialog = document.getElementById("newNodeDialog");
        var dialogComponent = new fabric['Dialog'](dialog);
        dialogComponent.open();
    }
}

function removeNode(nodeName) {
    if (window.confirm("Are you sure you wish to remove '" + nodeName + "'?")) {
        nodes = nodes.filter(function(item) {
            return item.name !== nodeName;
        });
        RenderNodeListDetails();
        ValidateNodeParameters();
    }
}

function RenderNodeListDetails() {
    $("#nodeList").empty();
    nodes.forEach(function(node) {

        var additionalDetails = "";

        node.additionalProperties.forEach(function(prop) {
            additionalDetails += prop.displayName + ": " + prop.value + "<br />"
        });

        var output = "";
        output += "<li class=\"ms-ListItem\" tabindex=\"0\">";
        output += "<span class=\"ms-ListItem-primaryText\">" + node.name + "</span>";
        output += "<span class=\"ms-ListItem-tertiaryText\">" + additionalDetails + "</span>";
        output += "<div class=\"ms-ListItem-selectionTarget\"></div>";
        output += "<div class=\"ms-ListItem-actions\">";
        output += "<div class=\"ms-ListItem-action\"><i class=\"ms-Icon ms-Icon--Delete\" onclick=\"removeNode('" + node.name +"')\"></i></div>";
        output += "</div>";
        output += "</li>";

        $("#nodeList").append(output);
    });
}

function NewNodeAdded(event) {

    var additionalProperties = [];
    currentTemplate.configDataSettings.nodeSettings.forEach(function(setting) {
        var internalValue;
        switch(setting.valueType) {
            case "text":
            case "number":
                internalValue = $("#nodeSetting-" + setting.powershellName + "-value").val();
                $("#nodeSetting-" + setting.powershellName + "-value").val("");
                break;
            case "boolean":
                internalValue = $("#nodeSetting-" + setting.powershellName + " label").hasClass("is-selected");
                $("#nodeSetting-" + setting.powershellName + " label").removeClass("is-selected");
            break; 
        }

        additionalProperties.push({
            powershellName: setting.powershellName,
            displayName: setting.displayName,
            valueType: setting.valueType,
            value: internalValue
        });
    });

    nodes.push({
        name: $("#NewNodeName").val(),
        additionalProperties: additionalProperties
    });

    $("#NewNodeName").val("");
    RenderNodeListDetails();
    ValidateNodeParameters();
    return false;
}
function GetErrorTagForQuestion(message, elementId) {
    return errorTemplate.replace("{0}", message).replace("{1}", elementId);
}

function GetQuestionHelpText(fieldName, question) {
    var output = "";
    if (question.helpText != null && question.helpText != "") {
        output += "<span class=\"ms-PanelDefaultExample ms-PanelExample helpIcon\">";
        output += "<button class=\"ms-Button\" style=\"background-color:white; border: none;\" id=\"" + fieldName + "-helpbutton\">";
        output += "<span class=\"ms-Button-label\"><i class=\"ms-Icon ms-Icon--Info ms-fontColor-blue\"></i></span>";
        output += "</button>";
        output += "<div class=\"ms-Panel\">";
        output += "<button class=\"ms-Panel-closeButton ms-PanelAction-close\">";
        output += "<i class=\"ms-Panel-closeIcon ms-Icon ms-Icon--Cancel\"></i>";
        output += "</button>";
        output += "<div class=\"ms-Panel-contentInner\">";
        output += "<p class=\"ms-Panel-headerText\">" + question.title + "</p>";
        output += "<div class=\"ms-Panel-content\">";
        output += "<span class=\"ms-font-m\">" + question.helpText + "</span>";
        output += "</div>";
        output += "</div>";
        output += "</div>";
        output += "</span>";
    }
    return output;
}

function GetTextQuestionRender(question) {
    var fieldName = "question-" + question.id;
    var output = "<div id=\"" + fieldName + "\" class=\"ms-TextField \">";
    output += "<label class=\"ms-Label\" for=\"" + fieldName + "-value\">" + question.title;
    output += GetQuestionHelpText(fieldName, question) + "</label>";
    output += "<input class=\"ms-TextField-field\"  type=\"text\" id=\"" + fieldName + "-value\" name=\"" + fieldName + "-value\" />";
    if (question.validationMessage != null || question.validationMessage == "") {
        output += GetErrorTagForQuestion(question.validationMessage, fieldName + "-error");
    } else {
        output += GetErrorTagForQuestion("This field is required", fieldName + "-error");
    }
    output += "</div>";
    return output;
}

function GetNumberQuestionRender(question) {
    var fieldName = "question-" + question.id;
    var output = "<div id=\"" + fieldName + "\" class=\"ms-TextField \">";
    output += "<label class=\"ms-Label\" for=\"" + fieldName + "-value\">" + question.title;
    output += GetQuestionHelpText(fieldName, question) + "</label>";
    output += "<input class=\"ms-TextField-field\"  type=\"text\" id=\"" + fieldName + "-value\" name=\"" + fieldName + "-value\" />";
    if (question.validationMessage != null || question.validationMessage == "") {
        output += GetErrorTagForQuestion(question.validationMessage, fieldName + "-error");
    } else {
        output += GetErrorTagForQuestion("This field is required and must be a number", fieldName + "-error");
    }
    output += "</div>"; 
    return output;
}

function GetBooleanQuestionRender(question) {
    var fieldName = "question-" + question.id;
    var output = "<div id=\"" + fieldName + "\" class=\"ms-Toggle  ms-Toggle--textLeft\">";
    output += "<span class=\"ms-Toggle-description\">" + question.title;
    output += GetQuestionHelpText(fieldName, question) + "</span>";
    output += "<input class=\"ms-Toggle-input\"  type=\"checkbox\" id=\"" + fieldName + "-value\" name=\"" + fieldName + "-value\" />";
    output += "<label class=\"ms-Toggle-field\" for=\"" + fieldName + "-value\"><span class=\"ms-Label ms-Label--off\">No</span><span class=\"ms-Label ms-Label--on\">Yes</span></label>";
    if (question.validationMessage != null || question.validationMessage == "") {
        output += GetErrorTagForQuestion(question.validationMessage, fieldName + "-error");
    } else {
        output += GetErrorTagForQuestion("This field is required", fieldName + "-error");
    }
    output += "</div>" 
    return output;
}

function ValidateForm(submitAfterValidate) {

    updateStyles();

    // validate config data
    var configValid = true;

    if ($("#CertPath").val() == null || $("#CertPath").val() == "" || $("#CertPath").val().match(/^(?:[\w]\:|\\)(\\[a-z_\-\s0-9\.]+)+\.(cer)$/g) == null) {
        $("#CertPath-Error").show();
        configValid = false;
    } else {
        $("#CertPath-Error").hide();
    }

    if ($("#CertThumbprint").val() == null || $("#CertThumbprint").val() == "" || $("#CertThumbprint").val().match(/^[A-Fa-f0-9]{40}/g) == null) {
        $("#CertThumbprint-Error").show();
        configValid = false;
    } else {
        $("#CertThumbprint-Error").hide();
    }

    if (ValidateNodeParameters() == false) {
        configValid = false;
    }

    if (configValid == true) {
        $("#configErrorFlag").hide()
    } else {
        $("#configErrorFlag").show()
    }

    // validate question responses
    var questionsValid = true;
    currentTemplate.questions.forEach(function(question) {
        validateQuestion(question);
    });

    if (questionsValid == true) {
        $("#questionErrorFlag").hide()
    } else {
        $("#questionErrorFlag").show()
    }

    if (questionsValid == false || configValid == false) {
        $("#globalValidationMessage").show();
    } else {
        $("#globalValidationMessage").hide();
        if (submitAfterValidate == true) {
            generateConfig();
        }
    }
}

function validateQuestion(question) {
    switch (question.type) {
        case "text":
            var value = $("#question-" + question.id + "-value")[0].value;
            if (value == null || value == "") {
                questionsValid = false;
                $("#question-" + question.id + "-error").show();
            } else {
                $("#question-" + question.id + "-error").hide();
            }
            break;
        case "number":
            var value = $("#question-" + question.id + "-value")[0].value;
            if (value == null || value == "" || isNaN(value)) {
                questionsValid = false;
                $("#question-" + question.id + "-error").show();
            } else {
                if (question.minValue != null && value < question.minValue) {
                    questionsValid = false;
                    $("#question-" + question.id + "-error").show();
                } else if(question.maxValue != null && value > question.maxValue) {

                }else {
                    $("#question-" + question.id + "-error").hide();
                }
            }
            break;
        case "filepath":
            var value = $("#question-" + question.id + "-value")[0].value;
            if (value == null || value == "") {
                questionsValid = false;
                $("#question-" + question.id + "-error").show();
            } else {
                if (value.match(/^(?:[\w]\:|\\)(\\[a-z_\-\s0-9\.]+)+\\*$/g) == null) {
                    questionsValid = false;
                    $("#question-" + question.id + "-error").show();
                } else {
                    $("#question-" + question.id + "-error").hide();
                }
            }
            break;
        case "regex":
            var value = $("#question-" + question.id + "-value")[0].value;
            if (value == null || value == "") {
                questionsValid = false;
                $("#question-" + question.id + "-error").show();
            } else {
                if (value.match(eval(question.pattern)) == null) {
                    questionsValid = false;
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
}

function generateConfig()
{
    responses = new Array();

    currentTemplate.questions.forEach(function(question) {
        switch (question.type) {
            case "text":
            case "number":
            case "filepath":
            case "regex":
                responses[question.id] = $("#question-" + question.id + "-value")[0].value;
                break;
            case "boolean":
                internalValue = $("#question-" + question.id + " label").hasClass("is-selected");
                responses[question.id] = internalValue;
                break;
            default:
                alert("not text")
                break;
        }
    });

    var configText = ""

    // build the config data
    
    configText += "$configData = @{\r\n";
    configText += "    AllNodes = @(\r\n";
    configText += "        @{\r\n";
    configText += "            NodeName = \"*\"\r\n";

    if (currentTemplate.configDataSettings.certificateDetails == null || currentTemplate.configDataSettings.certificateDetails == true) {
        configText += "            CertificateFile = \"" + $("#CertPath").val() + "\"\r\n";
        configText += "            Thumbprint = \"" + $("#CertThumbprint").val() + "\"\r\n";
        configText += "            PSDscAllowPlainTextPassword = $false\r\n";
    } else {
        configText += "            PSDscAllowPlainTextPassword = $true\r\n";
    }
    
    configText += "        }";
    if (nodes.length == 0) {
        configText += "\r\n";
    } else {
        nodes.forEach(function(node) {
            configText += ",\r\n";
            configText += "        @{\r\n";
            configText += "            NodeName = \"" + node.name + "\"\r\n";
            node.additionalProperties.forEach(function(prop) {
                switch(prop.valueType) {
                    case "text":
                        configText += "            " + prop.powershellName + " = \"" + prop.value + "\"\r\n";
                        break;
                    case "number":
                        configText += "            " + prop.powershellName + " = " + prop.value + "\r\n";
                        break;
                    case "boolean":
                        configText += "            " + prop.powershellName + " = $" + prop.value + "\r\n";
                        break;
                }
            });
            configText += "        }";
        });
        configText += "\r\n";
    }
    configText += "    )\r\n";
    configText += "}\r\n\r\n";

    // build the main configuration

    configText += "Configuration " + currentTemplate.metadata.configurationName + "\r\n"
    configText += "{\r\n"

    configText += "    param("
    var firstParamAdded = false;
    currentTemplate.inputParameters.forEach(function(param) {
        if (firstParamAdded == true) {
            configText += ",\r\n\r\n        [Parameter(Mandatory = $true)]\r\n"
        } else {
            configText += "\r\n        [Parameter(Mandatory = $true)]\r\n"
            firstParamAdded = true;
        }
        configText += "        [" + param.parameterType + "]\r\n"
        configText += "        $" + param.name
    });
    configText += "\r\n    )\r\n"

    var downloadScript = "";
    currentTemplate.dscModules.forEach(function(element){
        configText += "    Import-DscResource -ModuleName " + element.name
        downloadScript += "Find-Module -Name \"" + element.name + "\""
        if (element.version != null) {
            configText += " -ModuleVersion " + element.version
            downloadScript += " -RequiredVersion \"" + element.version + "\""
        }
        configText += "\r\n"
        downloadScript += " | Install-Module \r\n"
    });
    $("#moduleDownloadScript").text(downloadScript);
    
    configText += "\r\n"

    configText += "    node $AllNodes.NodeName\r\n"
    configText += "    {\r\n"

    currentTemplate.outputResources.forEach(function(resource) {

        if (resource.includeQuestion != null && resource.includeQuestion != "") {
            if (responses[resource.includeQuestion] == false) {
                return;
            }
        }
        
        configText += "        " + resource.resourceType + " " + resource.resourceName + "\r\n"
        configText += "        {\r\n"
        Object.keys(resource.resourceProperties).forEach(function(resourceProperty) {
            var outputValue = resource.resourceProperties[resourceProperty]
            if (outputValue.match(/^[\[].+[\]]/g) != null)
            {
                outputValue = getQuestionResponse(outputValue);
            }
            if (outputValue.startsWith('$') == true || isNaN(outputValue) == false) {
                configText += "            " + resourceProperty + " = " + outputValue + "\r\n"
            } else {
                configText += "            " + resourceProperty + " = \"" + outputValue + "\"\r\n"
            }
        });
        if (resource.dependsOn != null) {
            configText += "            DependsOn = \"" + resource.dependsOn + "\"\r\n"
        }
        configText += "        }\r\n\r\n"
    });

    configText += "    }\r\n"
    configText += "}\r\n"
    configText += "\r\n"
    configText += "Start-DscConfiguration -Path .\\" + currentTemplate.metadata.configurationName + " -ConfigurationData $configData\r\n"

    currentScript = configText;

    $("#scriptContentParent").empty();
    $("#scriptContentParent").html("<pre id=\"scriptContent\" class=\"brush: powershell\">" + configText + "</pre>");

    updateStyles();

    SyntaxHighlighter.highlight();
    
    $("#templateStart").hide();
    $("#templateResponse").hide();
    $("#templateOutput").show();
}

function getQuestionResponse(outputResponse) {
    var matchedString = outputResponse.match(/^[\[].+[\]]/g)[0];
    var questionId = matchedString.replace('[','').replace(']','');
    var response = responses[questionId];
    return outputResponse.replace(matchedString, response);
}
