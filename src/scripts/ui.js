import $ from "jquery";
import TemplateManager from "./TemplateManager";
import TemplateUIBuilder from "./TemplateUIBuilder";
import FormValidator from "./FormValidator";
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
        FormValidator.ValidateNodeData();
    },
    HideElement: function(elementId) {
        $(`#${elementId}`).hide();
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
    SendAlert: function(message, replacements) {
        var newMessage = message;
        if (replacements !== undefined) {
            var count = 0;
            replacements.forEach(function(replacement) {
                newMessage.replace(`{${count}}`, replacement);
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
