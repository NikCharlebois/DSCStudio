

var TemplateManager = {
    Reader: null,
    CurrentTemplate: "",
    QuestionGroups: {},
    Responses: [],
    Init: function() {
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            this.Reader = new FileReader();
        } else {
            alert('Your browser does not support HTML5 file APIs. Please open this from a browser that supports HTML5.');
            return false;
        }

        if (DynamicTemplate !== undefined) {
            this.ReadTemplateFromDynamicSource();
        }
    },
    StartTemplateRead: function(filepicker) {
        if(filepicker.files && filepicker.files[0]) {
            this.Reader.onload = this.ReadTemplateFromJSON;
            this.Reader.readAsText(filepicker.files[0]);
            return true;
        }
        else 
        {
            return false;
        }
    },
    ReadTemplateFromJSON: function(contents) {
        TemplateManager.CurrentTemplate = JSON.parse(contents.target.result);
        TemplateManager.ReadTemplate();
    },
    ReadTemplateFromDynamicSource: function() {
        TemplateManager.CurrentTemplate = DynamicTemplate;
        TemplateManager.ReadTemplate();
    },
    ReadTemplate: function() {
        var questionGroups = {};
        TemplateManager.CurrentTemplate.questions.forEach(function(question) {
            if (question.group !== null) {
                if (questionGroups.hasOwnProperty(question.group) === false) {
                    questionGroups[question.group] = [];
                }
                questionGroups[question.group].push(question);
            } else {
                if (questionGroups.hasOwnProperty("Other questions") === false) {
                    questionGroups["Other questions"] = [];
                }
                questionGroups["Other questions"].push(question);
            }
        });
        TemplateManager.QuestionGroups = questionGroups;
        TemplateManager.GenerateTemplateUI();
    },
    GenerateTemplateUI: function() {
        TemplateUIBuilder.BuildPrimaryUI(this.CurrentTemplate);
        TemplateUIBuilder.BuildQuestionUI(this.QuestionGroups);
        TemplateUIBuilder.BuildNewNodeUI();
        FormValidator.EnableQuestionValidation();
        FormValidator.ValidateNodeData();
        ViewManager.ShowView('response');
    },
    StoreQuestionResponses: function() {
        responses = [];

        TemplateManager.CurrentTemplate.questions.forEach(function(question) {
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
                    alert("not text");
                    break;
            }
        });
        TemplateManager.Responses = responses;
    },
    GetQuestionResponse: function(outputResponse) {
        var matchedString = outputResponse.match(/[\[].+[\]]/g)[0];
        var questionId = matchedString.replace('[','').replace(']','');
        var response = responses[questionId];
        return outputResponse.replace(matchedString, response);
    }
};

var PowerShellManager = {
    CurrentScript: "",
    DownloadScript: "",
    SaveAsFileName: "DSCScript.ps1",
    DownloadCurrentScript: function() {
        var blob = new Blob([this.CurrentScript], {type: "text/plain;charset=utf-8"});
        saveAs(blob, this.SaveAsFileName);
    },
    UpdateCurrentScript: function() {
        var configText = "";

        // build the config data
        
        configText += "$configData = @{\r\n";
        configText += "    AllNodes = @(\r\n";
        configText += "        @{\r\n";
        configText += "            NodeName = \"*\"\r\n";

        if (TemplateManager.CurrentTemplate.configDataSettings.certificateDetails === undefined || TemplateManager.CurrentTemplate.configDataSettings.certificateDetails === true) {
            configText += "            CertificateFile = \"" + $("#CertPath").val() + "\"\r\n";
            configText += "            Thumbprint = \"" + $("#CertThumbprint").val() + "\"\r\n";
            configText += "            PSDscAllowPlainTextPassword = $false\r\n";
        } 
        
        configText += "        }";
        if (DscNodeManager.Nodes.length === 0) {
            configText += "\r\n";
        } else {
            DscNodeManager.Nodes.forEach(function(node) {
                configText += ",\r\n";
                configText += "        @{\r\n";
                configText += "            NodeName = \"" + node.name + "\"\r\n";
                if (TemplateManager.CurrentTemplate.configDataSettings.certificateDetails === null || TemplateManager.CurrentTemplate.configDataSettings.certificateDetails === true) {} else {
                    configText += "            PSDscAllowPlainTextPassword = $true\r\n";
                }
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

        configText += "Configuration " + TemplateManager.CurrentTemplate.metadata.configurationName + "\r\n";
        configText += "{\r\n";

        configText += "    param(";
        var firstParamAdded = false;
        TemplateManager.CurrentTemplate.inputParameters.forEach(function(param) {
            if (firstParamAdded === true) {
                configText += ",\r\n\r\n        [Parameter(Mandatory = $true)]\r\n";
            } else {
                configText += "\r\n        [Parameter(Mandatory = $true)]\r\n";
                firstParamAdded = true;
            }
            configText += "        [" + param.parameterType + "]\r\n";
            configText += "        $" + param.name;
        });
        configText += "\r\n    )\r\n";

        var downloadScript = "";
        TemplateManager.CurrentTemplate.dscModules.forEach(function(element){
            configText += "    Import-DscResource -ModuleName " + element.name;
            downloadScript += "Find-Module -Name \"" + element.name + "\"";
            if (element.version !== null) {
                configText += " -ModuleVersion " + element.version;
                downloadScript += " -RequiredVersion \"" + element.version + "\"";
            }
            configText += "\r\n";
            downloadScript += " | Install-Module \r\n";
        });
        
        configText += "\r\n";

        configText += "    node $AllNodes.NodeName\r\n";
        configText += "    {\r\n";

        TemplateManager.CurrentTemplate.outputResources.forEach(function(resource) {

            if (resource.includeQuestion !== undefined && resource.includeQuestion !== "") {
                if (responses[resource.includeQuestion] === false) {
                    return;
                }
            }

            var s = "";
            if (resource.includeNodeDataProperty !== undefined && resource.includeNodeDataProperty !== "") {
                configText += "        if ($node." + resource.includeNodeDataProperty + " -eq $true)\r\n        {\r\n";
                s = "    ";
            }

            configText += s + "        " + resource.resourceType + " " + resource.resourceName + "\r\n";
            configText += s + "        {\r\n";
            Object.keys(resource.resourceProperties).forEach(function(resourceProperty) {
                var outputValue = resource.resourceProperties[resourceProperty];
                if (outputValue.match(/[\[].+[\]]/g) !== null)
                {
                    outputValue = TemplateManager.GetQuestionResponse(outputValue);
                }
                if (outputValue.startsWith('$') === true || isNaN(outputValue) === false) {
                    configText += s + "            " + resourceProperty + " = " + outputValue + "\r\n";
                } else {
                    configText += s + "            " + resourceProperty + " = \"" + outputValue + "\"\r\n";
                }
            });
            if (resource.dependsOn !== undefined) {
                configText += s + "            DependsOn = \"" + resource.dependsOn + "\"\r\n";
            }

            configText += s + "        }\r\n";
            if (resource.includeNodeDataProperty !== undefined && resource.includeNodeDataProperty !== "") {
                configText += "        }\r\n";
            }
            configText += "\r\n";
        });

        configText += "        LocalConfigurationManager {\r\n";
        if (TemplateManager.CurrentTemplate.configDataSettings.certificateDetails === undefined || TemplateManager.CurrentTemplate.configDataSettings.certificateDetails === true) {
            configText += "            CertificateId = \"" + $("#CertThumbprint").val() + "\"\r\n";
        }

        var allowReboot = $("#AutoReboot label").hasClass("is-selected");
        configText += "            RebootIfNeeded = $" + allowReboot + "\r\n";
        configText += "            ConfigurationMode = \"" + $("#LcmConfigMode").val() + "\"\r\n";
        configText += "            ConfigurationModeFrequencyMins = " + $("#ConfigModeMins").val() + "\r\n";
        configText += "            ActionAfterReboot = \"" + $("#ActionAfterReboot").val() + "\"\r\n";
        configText += "        }\r\n";

        configText += "    }\r\n";
        configText += "}\r\n";
        configText += "\r\n";
        configText += "Set-DscLocalConfigurationManager -Path .\\" + TemplateManager.CurrentTemplate.metadata.configurationName + "\r\n";
        configText += "Start-DscConfiguration -Path .\\" + TemplateManager.CurrentTemplate.metadata.configurationName + " -ConfigurationData $configData\r\n";

        PowerShellManager.CurrentScript = configText;
        PowerShellManager.DownloadScript = downloadScript;
    }
};
