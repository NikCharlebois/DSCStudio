import $ from "jquery";
import ViewManager from "./ViewManager";
import DscNodeManager from "./DscNodeManager";
import TemplateManager from "./TemplateManager";
import FormValidator from "./FormValidator";
import PowerShellManager from "./PowerShellManager";
import UI from "./UI";
import Strings from "./Strings";

export default {
    Init: function() {
        $('#templateSelector').on('change', function() {
            if (UI.SetTemplateFromFilePicker(this) === true) {
                ViewManager.ShowTab('configdata');
            }
        });

        $("#goBackToResponses").on('click', function() {
            UI.SwitchView(UI.Views.Response);
            ViewManager.ShowTab('configdata');
        });

        $("#switchView-Config").on('click', function() {
            ViewManager.ShowTab('configdata');
        });

        $("#switchView-Questions").on('click', function() {
            ViewManager.ShowTab('questionaire');
            ViewManager.SetNavBarPosition();
        });

        $("#GenerateConfig").on('click', function() {
            FormValidator.ValidateForm(true);
        });

        $("#newNodeCommand").on('click', function() {
            if (DscNodeManager.CanNewNodesBeAdded() === true) {
                ViewManager.OpenDialog('newNodeDialog');
            } else {
                UI.SendAlert(Strings.ErrorTooManyNodes, [DscStudio.CurrentTemplate.configDataSettings.maxNodeCount.toString()]);
            }
        });

        $(window).scroll(function() {
            ViewManager.SetNavBarPosition();
        });

        $(window).resize(function() {
            ViewManager.SetNavBarPosition();
        });

        $("#saveConfig").on('click', function() {
            PowerShellManager.DownloadCurrentScript();
        });

        $("#code-expandButton").on('click', function() {
            ViewManager.ToggleCodeMinimiseFrame();
        });

        new fabric.Button(document.querySelector("#addNewNode"), DscNodeManager.AddNewNode);
    }
};
