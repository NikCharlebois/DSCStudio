import $ from "jquery";
import StyleLoader from "StyleLoader";
import PowerShellManager from "PowerShellManager";
require("script-loader!..\\syntaxhighlighter\\shCore.js");
require("script-loader!..\\syntaxhighlighter\\shBrushPowerShell.js");
var fabric = require("exports?fabric!..\\..\\node_modules\\office-ui-fabric-js\\dist\\js\\fabric.js");

export default {
    Fabric: fabric, 
    ShowView: function(view) {
        $("#templateStart").hide();
        $("#templateResponse").hide();
        $("#templateOutput").hide();
        switch(view) {
            case "start":
                $("#templateStart").show();
                break;
            case "response":
                $("#templateResponse").show();
                break;
            case "output":
                $("#templateOutput").show();

                $("#moduleDownloadScript").text(PowerShellManager.DownloadScript);
                $("#scriptContentParent").empty();
                $("#scriptContentParent").html("<pre id=\"scriptContent\" class=\"brush: powershell\">" + PowerShellManager.CurrentScript + "</pre>");

                StyleLoader.ApplyStyles();

                SyntaxHighlighter.highlight();
                break;
            default:
                throw view + " is an unknown view to switch this form to";
        }
    },
    ShowTab: function(tabname) {
        switch(tabname) 
        {
            case "configdata":
                $("#configDataEditor").show();
                $("#switchView-Config").parent().addClass("ms-bgColor-themeLight");
                $("#QuestionnaireEditor").hide();
                $("#switchView-Questions").parent().removeClass("ms-bgColor-themeLight");
                break;
            case "questionaire":
                $("#configDataEditor").hide();
                $("#switchView-Config").parent().removeClass("ms-bgColor-themeLight");
                $("#QuestionnaireEditor").show();
                $("#switchView-Questions").parent().addClass("ms-bgColor-themeLight");
                break;
            default:
                throw tabname + " is an unknown tab to switch this form to";
        }
    },
    OpenDialog: function(dialogId) {
        var dialog = document.getElementById(dialogId);
        var dialogComponent = new this.Fabric.Dialog(dialog);
        dialogComponent.open();
    },
    ToggleCodeMinimiseFrame: function() {
        if ($("#code-minimise-button").attr('class') == "ms-Icon ms-Icon--ChevronDown") {
            // expand 
            $("#code-minimise-button").attr('class', "ms-Icon ms-Icon--ChevronUp");
            $("#scriptContentParent").attr('class', "code-expanded");
        } else {
            // collapse
            $("#code-minimise-button").attr('class', "ms-Icon ms-Icon--ChevronDown");
            $("#scriptContentParent").attr('class', "code-minimise");
        }
    }
};
