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
            switch (question.type) {
                case "textarray":
                    var values = DscStudio.Responses[question.id].split(';');
                    var output = "@(";
                    values.forEach(function(val) {
                        if (output === "@(") {
                            output += "\"" + val + "\"";
                        } else {
                            output += ", \"" + val + "\"";
                        }
                    });
                    output += ")";
                    configText += "            \"" + question.id + "\" = " + output + "\r\n";
                    break;
                case "complextype":
                    var value = JSON.parse(DscStudio.Responses[question.id]);
                    var complexoutput = "@(\r\n";
                    value.forEach(function(val) {

                        if (complexoutput === "@(\r\n") {
                            complexoutput += "                @{\r\n";
                        } else {
                            complexoutput += ",\r\n                @{\r\n";
                        }
                        val.AllResponses.forEach(function(response) {
                            if (response.type === "boolean") {
                                complexoutput += "                    " + response.powershellName + " = $" + response.value + "\r\n";
                            } else {
                                complexoutput += "                    " + response.powershellName + " = \"" + response.value + "\"\r\n";
                            }
                        });
                        complexoutput += "                }";
                    });
                    complexoutput += "\r\n            )";
                    configText += "            \"" + question.id + "\" = " + complexoutput + "\r\n";
                    break;
                default:
                    configText += "            \"" + question.id + "\" = \"" + DscStudio.Responses[question.id] + "\" \r\n";
                    break;
            }
        });
        configText += "        }\r\n";
        configText += "    }\r\n";
        configText += "}\r\n\r\n";

        DscStudio.CurrentTemplate.ScriptOutput.forEach(function(line) {
            configText += line + "\r\n";
        });
        configText += "\r\n";
        
        configText += DscStudio.CurrentTemplate.metadata.configurationName + " -ConfigurationData $configData\r\n";
        configText += "Set-DscLocalConfigurationManager -Path .\\" + DscStudio.CurrentTemplate.metadata.configurationName + "\r\n";
        configText += "Start-DscConfiguration -Path .\\" + DscStudio.CurrentTemplate.metadata.configurationName + "\r\n";

        this.CurrentScript = configText;
    }
};
