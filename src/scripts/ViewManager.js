import $ from "jquery";
import StyleLoader from "./StyleLoader";
import PowerShellManager from "./PowerShellManager";

export default {
    ShowTab: function(tabname) {
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
    OpenDialog: function(dialogId) {
        var dialog = document.getElementById(dialogId);
        var dialogComponent = new fabric.Dialog(dialog);
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
    },
    SetNavBarPosition: function() {
        var configButton = $("#GenerateConfig");
        var configPosition = configButton.offset();

        var scrollPosition = this.GetScrollPosition();
        var baseOffset = configButton.height() + configPosition.top;
        if (scrollPosition < baseOffset) {
            $("#navBox").css("top", 0);
        } else {
            $("#navBox").css("top", scrollPosition - baseOffset);
        }
    },
    GetScrollPosition: function () {
        if (typeof window.pageYOffset !== 'undefined' ) {
            // Most browsers
            return window.pageYOffset;
        }

        var d = document.documentElement;
        if (d.clientHeight) {
            // IE in standards mode
            return d.scrollTop;
        }

        // IE in quirks mode
        return document.body.scrollTop;
    }
};
