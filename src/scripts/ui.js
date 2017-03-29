import $ from "jquery";
import TemplateManager from "./TemplateManager";
import TemplateUIBuilder from "./TemplateUIBuilder";
import FormValidator from "./FormValidator";
import Handlebars from "handlebars";
import HandleBarManager from "./HandleBarManager";
import Strings from "./Strings";

export default {
    Views: {
        Start: "start",
        Response: "response",
        Output: "output"
    },
    ResponseTabs: {
        ConfigData: "configdata",
        Questionaire: "questionaire"
    },
    BuildQuestionUI: function(template) {
        TemplateUIBuilder.BuildPrimaryUI(template);
        TemplateUIBuilder.BuildQuestionUI(TemplateManager.GetQuestionGroups(template));
        TemplateUIBuilder.BuildNewNodeUI();
        FormValidator.EnableQuestionValidation();
        FormValidator.ValidateAllNodeData();
    },
    AppendText: function(selector, text) {
        $(selector).append(text);
    },
    ClearNodeSettingsValues: function(NodeSettings) {
        NodeSettings.forEach(function(setting) {
            switch(setting.valueType) {
                case "text":
                case "number":
                    $("#nodeSetting-" + setting.powershellName + "-value").val("");
                    break;
                case "boolean":
                    $("#nodeSetting-" + setting.powershellName + " label").removeClass("is-selected");
                    break; 
                default:
                    this.SendAlert(Strings.ErrorNodeSettingTypeNotSupported); 
                    return;
            }
        });
        $("#NewNodeName").val("");
    },
    ConfirmAction: function(message, replacements) {
        var newMessage = message;
        if (replacements !== undefined) {
            var count = 0;
            replacements.forEach(function(replacement) {
                newMessage = newMessage.replace(`{${count}}`, replacement);
            }, this); 
        }
        return confirm(newMessage);
    },
    EmptyObject: function(selector) {
        $(selector).empty();
    },
    GetValue: function(selector) {
        return $(selector).val();
    },
    HideElement: function(elementId) {
        $(`#${elementId}`).hide();
    },
    ReadNodeSettingResponse: function(nodeSetting) {
        var internalValue;
            switch(nodeSetting.valueType) {
                case "text":
                case "number":
                    return $("#nodeSetting-" + nodeSetting.powershellName + "-value").val();
                case "boolean":
                    return $("#nodeSetting-" + nodeSetting.powershellName + " label").hasClass("is-selected");
                default:
                    this.SendAlert(Strings.ErrorNodeSettingTypeNotSupported); 
                    return;
            }
    },
    ReadQuestionResponse: function(question) {
        switch (question.type) {
            case "text":
            case "number":
            case "filepath":
            case "regex":
            case "complextype":
                return $(`#question-${question.id}-value`).val();
            case "boolean":
                return $(`#question-${question.id} label`).hasClass("is-selected");
            case "choice":
                return $(`#question-${question.id}-value`).val();
            case "textarray":
                var values = "";
                $.each($(`#question-${question.id}-value option`), function(item) {
                    if (values === "") {
                        values += this.text;
                    } else {
                        values += ";" + this.text;
                    }
                });
                return values;
            default:
                this.SendAlert(Strings.ErrorQuestionTypeNotSupported, [question.type]);
                break;
        }
    },
    RegisterEvent: function(target, method, callback) {
        $(target).on(method, callback);
    },
    RenderUISection: function(templateName, context, appendTo) {
        $("#nodeList").empty();
        var template = Handlebars.compile(HandleBarManager[templateName]);
        $(appendTo).append(template(context));
    },
    SendAlert: function(message, replacements) {
        var newMessage = message;
        if (replacements !== undefined) {
            var count = 0;
            replacements.forEach(function(replacement) {
                newMessage = newMessage.replace(`{${count}}`, replacement);
            }, this);
        }
        alert(newMessage);
    },
    SetTemplateFromFilePicker: function(filepicker) {
        var reader = new FileReader();
        if(filepicker.files && filepicker.files[0]) {
            reader.onload = function(contents) {
                TemplateManager.ParseTemplate(JSON.parse(contents.target.result));
            };
            reader.readAsText(filepicker.files[0]);
            return true;
        }
        else 
        {
            this.SendAlert(Strings.ErrorUnableToReadFileContents);
            return false;
        }
    },
    SetText: function(selector, text) {
        $(selector).text(text);
    },
    ShowElement: function(elementId) {
        $(`#${elementId}`).show();
    },
    SupportedBrowser: function() {
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            return true;
        } else {
            return false;
        }
    },
    SwitchResponseTab: function(tabName) {
        switch(tabname) 
        {
            case "configdata":
                $("#configDataEditor").show();
                $("#switchView-Config").parent().addClass("ms-bgColor-themeLight");
                $("#QuestionnaireEditor").hide();
                $("#switchView-Questions").parent().removeClass("ms-bgColor-themeLight");
                $("#navBox").hide();
                break;
            case "questionaire":
                $("#configDataEditor").hide();
                $("#switchView-Config").parent().removeClass("ms-bgColor-themeLight");
                $("#QuestionnaireEditor").show();
                $("#switchView-Questions").parent().addClass("ms-bgColor-themeLight");
                $("#navBox").show();
                break;
            default:
                throw tabname + " is an unknown tab to switch this form to";
        }
    },
    SwitchView: function(viewName) {
        this.HideElement("templateStart");
        this.HideElement("templateResponse");
        this.HideElement("templateOutput");
        
        switch(viewName) {
            case "start":
                this.ShowElement("templateStart");
                break;
            case "response":
                this.ShowElement("templateResponse");
                break;
            case "output":
                this.ShowElement("templateOutput");

                $("#moduleDownloadScript").text(PowerShellManager.DownloadScript);
                $("#scriptContentParent").empty();
                $("#scriptContentParent").html("<pre id=\"scriptContent\" class=\"brush: powershell\">" + PowerShellManager.CurrentScript + "</pre>");

                StyleLoader.ApplyStyles();

                SyntaxHighlighter.highlight();
                break;
            default:
                throw view + " is an unknown view to switch this form to";
        }
    }
};
