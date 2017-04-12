import $ from "jquery";
import TemplateManager from "./TemplateManager";
import DscNodeManager from "./DscNodeManager";
import HandleBarManager from "./HandleBarManager";
import UI from "./UI";

export default {
    CurrentScript: "",
    DownloadScript: "",
    SaveAsFileName: "DSCScript.ps1",
    DownloadCurrentScript: function() {
        var blob = new Blob([this.CurrentScript], {type: "text/plain;charset=utf-8"});
        saveAs(blob, this.SaveAsFileName);
    },
    UpdateCurrentScript: function() {
        var UseCertificate = false;
        if (DscStudio.CurrentTemplate.configDataSettings.certificateDetails === undefined || DscStudio.CurrentTemplate.configDataSettings.certificateDetails === true)
        {
            UseCertificate = true;
        }

        var AllowPlainTextPassword = true;
        if (DscStudio.CurrentTemplate.configDataSettings.allowPlainTextPassword === undefined || DscStudio.CurrentTemplate.configDataSettings.allowPlainTextPassword === false)
        {
            AllowPlainTextPassword = false;
        }

        var questionAnswerArray = [];
        DscStudio.CurrentTemplate.questions.forEach(function(question) {
            var stringValue = "";
            switch (question.type) {
                case "textarray":
                    stringValue = "@(";
                    DscStudio.Responses[question.id].split(';').forEach(function(val) {
                        if (stringValue === "@(") {
                            stringValue += `"${val}"`;
                        } else {
                            stringValue += `, "${val}"`;
                        }
                    });
                    stringValue += ")";
                    break;
                case "complextype":
                    var value = JSON.parse(DscStudio.Responses[question.id]);
                    stringValue = `@(
`;
                    value.forEach(function(val) {

                        if (stringValue === `@(
`) {
                            stringValue += `                @{
`;
                        } else {
                            stringValue += `,
                @{
`;
                        }

                        val.AllResponses.forEach(function(response) {
                            if (response.type === "boolean") {
                                stringValue += `                    ${response.powershellName} = $${response.value}
`;
                            } else {
                                stringValue += `                    ${response.powershellName} = "${response.value}"
`;
                            }
                        });
                        stringValue += "                }";
                    });
                    stringValue += `
            )`;
                    break;
                case "boolean":
                    stringValue = `$${DscStudio.Responses[question.id]}`;
                    break;
                default:
                    stringValue = `"${DscStudio.Responses[question.id]}"`;
                    break;
            }
            var newObject = {
                Title: question.title,
                Id: question.id,
                ValueString: stringValue
            };
            questionAnswerArray.push(newObject);
        });
        

        var dataBinder = {
            UseCertificate: UseCertificate,
            CertificatePath: UI.GetValue("#CertPath"),
            CertificateThumbprint: UI.GetValue("#CertThumbprint"),
            AllowPlainTextPassword: AllowPlainTextPassword,
            Nodes: DscStudio.Nodes,
            Questions: questionAnswerArray,
            ScriptOutput: DscStudio.CurrentTemplate.ScriptOutput,
            ConfigurationName: DscStudio.CurrentTemplate.metadata.configurationName
        };
        var configText = HandleBarManager.RenderHandleBar("PowerShellTemplate", dataBinder, "");

        this.CurrentScript = configText;
    }
};
