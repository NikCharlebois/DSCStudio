import $ from "jquery";
import ViewManager from "./ViewManager";
import DscNodeManager from "./DscNodeManager";
import TemplateManager from "./TemplateManager";
import FormValidator from "./FormValidator";
import PowerShellManager from "./PowerShellManager";

export default {
    Init: function() {
        $('#templateSelector').on('change', function() {
            if (TemplateManager.StartTemplateRead(this) === false) {
                throw "An error has occured reading your template.";
            }
            ViewManager.ShowTab('configdata');

            
        });

        $("#goBackToResponses").on('click', function() {
            ViewManager.ShowView('response');
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
                throw DscNodeManager.TooManyNodesMessage();
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
