import $ from "jquery";
import ViewManager from "ViewManager";
import DscNodeManager from "DscNodeManager";
import TemplateManager from "TemplateManager";
import FormValidator from "FormValidator";
import PowerShellManager from "PowerShellManager";
var fabric = require("exports?fabric!..\\..\\node_modules\\office-ui-fabric-js\\dist\\js\\fabric.js");

export default {
    Fabric: fabric, 
    Init: function() {
        $('#templateSelector').on('change', function() {
            if (TemplateManager.StartTemplateRead(this) === false) {
                throw "An error has occured reading your template.";
            }
        });

        $("#goBackToResponses").on('click', function() {
            ViewManager.ShowView('response');
        });

        $("#switchView-Config").on('click', function() {
            ViewManager.ShowTab('configdata');
        });

        $("#switchView-Questions").on('click', function() {
            ViewManager.ShowTab('questionaire');
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

        $("#saveConfig").on('click', function() {
            PowerShellManager.DownloadCurrentScript();
        });

        $("#code-expandButton").on('click', function() {
            ViewManager.ToggleCodeMinimiseFrame();
        });

        new this.Fabric.Button(document.querySelector("#addNewNode"), DscNodeManager.AddNewNode);
    }
};
