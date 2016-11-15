var reader;
var currentTemplate;
var responses;
var inputValidationRules = "";

var errorTextTemplate = "<div class=\"ms-MessageBar ms-MessageBar--error\"><div class=\"ms-MessageBar-content\"><div class=\"ms-MessageBar-icon\"><i class=\"ms-Icon ms-Icon--Error\"></i></div><div class=\"ms-MessageBar-text\"></div></div></div>";

$(document).ready(function(){
    if (checkFileAPI() == false) {
        return;
    }

    $('#templateSelector').on('change', function() {
        readTemplate(this);
    });

    $("#goBackToFormLink").on('click', function() {
        $("#templateStart").hide();
        $("#templateResponse").show();
        $("#templateOutput").hide();
    });

    updateStyles();

    $("#templateStart").show();
    $("#templateResponse").hide();
    $("#templateOutput").hide();
});

function updateStyles() {
    $("h1").addClass("ms-font-su");
    $("h2").addClass("ms-font-xxl");
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

    var questionCount = 0;
    currentTemplate.questions.forEach(function(element) {
        switch (element.type) {
            case "text":
                $("#templateQuestions").append(GetTextQuestionRender(element,questionCount));
                break;
            case "number":
                $("#templateQuestions").append(GetNumberQuestionRender(element,questionCount));
                break;
            default:
                alert("not text")
                break;
        }
        questionCount++;
    }, this);

    $("#templateQuestions").append("<hr /><input type=\"submit\" value=\"Generate Config\" id=\"GenerateConfig\" class=\"ms-Button\" />");

    var rulesObject = JSON.parse("{" + inputValidationRules + "}");
    $("#templateQuestions").validate({
        submitHandler: function(form) {
            generateConfig();
        },
        rules: rulesObject,
        errorClass: "ms-MessageBar ms-MessageBar--error ms-MessageBar-text",
        debug: true
    });

    updateStyles();
    preparePivots();

    $("#templateStart").hide();
    $("#templateResponse").show();
    $("#templateOutput").hide();
}

function preparePivots() {
    var PivotElements = document.querySelectorAll(".ms-Pivot");
    for(var i = 0; i < PivotElements.length; i++) {
        new fabric['Pivot'](PivotElements[i]);
    }
}

function GetTextQuestionRender(question, questionCount) {
    var fieldName = "question-" + question.id;
    if (inputValidationRules == "") {
        inputValidationRules += "\"" + fieldName + "-value\": { \"required\": true }"
    } else {
        inputValidationRules += ",\"" + fieldName + "-value\": { \"required\": true }"
    }
    
    var output = "<div id=\"" + fieldName + "\" class=\"ms-TextField \">"
    output += "<label class=\"ms-Label\" for=\"" + fieldName + "-value\">" + (questionCount + 1) + ". " + question.title + "</label>"
    output += "<input class=\"ms-TextField-field ruleRequired\"  type=\"text\" id=\"" + fieldName + "-value\" name=\"" + fieldName + "-value\" />"
    output += "</div>" 
    return output;
}

function GetNumberQuestionRender(question, questionCount) {
    var fieldName = "question-" + question.id;
    if (inputValidationRules == "") {
        inputValidationRules += "\"" + fieldName + "-value\": { \"required\": true, \"number\": true }"
    } else {
        inputValidationRules += ",\"" + fieldName + "-value\": { \"required\": true, \"number\": true }"
    }
    
    var output = "<div id=\"" + fieldName + "\" class=\"ms-TextField \">"
    output += "<label class=\"ms-Label\" for=\"" + fieldName + "-value\">" + (questionCount + 1) + ". " + question.title + "</label>"
    output += "<input class=\"ms-TextField-field ruleRequired\"  type=\"text\" id=\"" + fieldName + "-value\" name=\"" + fieldName + "-value\" />"
    output += "</div>" 
    return output;
}


function generateConfig()
{
    responses = new Array();

    currentTemplate.questions.forEach(function(question) {
        switch (question.type) {
            case "text":
            case "number":
                responses[question.id] = $("#question-" + question.id + "-value")[0].value;
                break;
            
            default:
                alert("not text")
                break;
        }
    });

    var configText = ""

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

    currentTemplate.dscModules.forEach(function(element){
        configText += "    Import-DscResource -ModuleName " + element.name
        if (element.version != null) {
            configText += " -Version " + element.version
        }
        configText += "\r\n"
    });
    
    configText += "\r\n"

    configText += "    node localhost\r\n"
    configText += "    {\r\n"

    currentTemplate.outputResources.forEach(function(resource) {
        configText += "        " + resource.resourceType + " " + resource.resourceName + "\r\n"
        configText += "        {\r\n"
        Object.keys(resource.resourceProperties).forEach(function(resourceProperty) {
            var outputValue = resource.resourceProperties[resourceProperty]
            if (outputValue.match(/^[\[].+[\]]/g) != null)
            {
                outputValue = getQuestionResponse(outputValue);
            }
            if (outputValue.startsWith('$') == true) {
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

    $("#scriptContent").text(configText);

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
