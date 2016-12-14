import $ from "jquery";
import TemplateManager from "TemplateManager";
import DscNodeManager from "DscNodeManager";
require("script-loader!..\\..\\node_modules\\file-saver\\FileSaver.js");

export default {
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

        if (DscStudio.CurrentTemplate.configDataSettings.certificateDetails === undefined || DscStudio.CurrentTemplate.configDataSettings.certificateDetails === true) {
            configText += "            CertificateFile = \"" + $("#CertPath").val() + "\"\r\n";
            configText += "            Thumbprint = \"" + $("#CertThumbprint").val() + "\"\r\n";
        } 
        if (DscStudio.CurrentTemplate.configDataSettings.allowPlainTextPassword === undefined || DscStudio.CurrentTemplate.configDataSettings.allowPlainTextPassword === false) {
            configText += "            PSDscAllowPlainTextPassword = $false\r\n";
        }
        
        configText += "        }";
        if (DscStudio.Nodes.length === 0) {
            configText += "\r\n";
        } else {
            DscStudio.Nodes.forEach(function(node) {
                configText += ",\r\n";
                configText += "        @{\r\n";
                configText += "            NodeName = \"" + node.name + "\"\r\n";
                if (DscStudio.CurrentTemplate.configDataSettings.allowPlainTextPassword === true) {
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
        configText += "    NonNodeData = @{\r\n";
        configText += "        DscStudio = @{\r\n";

        DscStudio.CurrentTemplate.questions.forEach(function(question) {
            configText += "            # " + question.title + "\r\n";
            configText += "            \"" + question.id + "\" = \"" + DscStudio.Responses[question.id] + "\" \r\n";
        });
        configText += "        }\r\n";
        configText += "    }\r\n";
        configText += "}\r\n\r\n";

        // build the main configuration

        configText += "Configuration " + DscStudio.CurrentTemplate.metadata.configurationName + "\r\n";
        configText += "{\r\n";

        configText += "    param(";
        var firstParamAdded = false;
        DscStudio.CurrentTemplate.inputParameters.forEach(function(param) {
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
        DscStudio.CurrentTemplate.dscModules.forEach(function(element){
            configText += "    Import-DscResource -ModuleName " + element.name;
            downloadScript += "Find-Module -Name \"" + element.name + "\"";
            if (element.version !== undefined) {
                configText += " -ModuleVersion " + element.version;
                downloadScript += " -RequiredVersion \"" + element.version + "\"";
            }
            configText += "\r\n";
            downloadScript += " | Install-Module \r\n";
        });
        
        configText += "\r\n";
        configText += "    $DscStudio = $ConfigurationData.NonNodeData.DscStudio\r\n";
        configText += "\r\n";

        configText += "    node $AllNodes.NodeName\r\n";
        configText += "    {\r\n";

        DscStudio.CurrentTemplate.outputResources.forEach(function(resource) {

            if (resource.includeQuestion !== undefined && resource.includeQuestion !== "") {
                if (DscStudio.Responses[resource.includeQuestion] === false) {
                    return;
                }
            }

            var s = "";
            var ifStatementOpen = false;
            if (resource.includeNodeDataProperty !== undefined && resource.includeNodeDataProperty !== "") {
                configText += "        if ($node." + resource.includeNodeDataProperty + " -eq $true)\r\n        {\r\n";
                s = "    ";
                ifStatementOpen = true;
            } else if (resource.includeScriptTest !== undefined && resource.includeScriptTest !== "") {
                configText += "        if (" + resource.includeScriptTest + ")\r\n        {\r\n";
                s = "    ";
                ifStatementOpen = true;
            }

            configText += s + "        " + resource.resourceType + " " + resource.resourceName + "\r\n";
            configText += s + "        {\r\n";
            Object.keys(resource.resourceProperties).forEach(function(resourceProperty) {
                var outputValue = resource.resourceProperties[resourceProperty];
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
            if (ifStatementOpen === true) {
                configText += "        }\r\n";
            }
            configText += "\r\n";
        });

        configText += "        LocalConfigurationManager {\r\n";
        if (DscStudio.CurrentTemplate.configDataSettings.certificateDetails === undefined || DscStudio.CurrentTemplate.configDataSettings.certificateDetails === true) {
            configText += "            CertificateId = \"" + $("#CertThumbprint").val() + "\"\r\n";
        }

        var allowReboot = $("#AutoReboot label").hasClass("is-selected");
        configText += "            RebootNodeIfNeeded = $" + allowReboot + "\r\n";
        configText += "            ConfigurationMode = \"" + $("#LcmConfigMode").val() + "\"\r\n";
        configText += "            ConfigurationModeFrequencyMins = " + $("#ConfigModeMins").val() + "\r\n";
        configText += "            ActionAfterReboot = \"" + $("#ActionAfterReboot").val() + "\"\r\n";
        configText += "        }\r\n";

        configText += "    }\r\n";
        configText += "}\r\n";
        configText += "\r\n";
        configText += DscStudio.CurrentTemplate.metadata.configurationName + " -ConfigurationData $configData\r\n";
        configText += "Set-DscLocalConfigurationManager -Path .\\" + DscStudio.CurrentTemplate.metadata.configurationName + "\r\n";
        configText += "Start-DscConfiguration -Path .\\" + DscStudio.CurrentTemplate.metadata.configurationName + "\r\n";

        this.CurrentScript = configText;
        this.DownloadScript = downloadScript;
    }
};