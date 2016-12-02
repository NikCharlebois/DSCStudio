import OfficeFabricManager from "OfficeFabricManager";
var fabric = require("exports?fabric!..\\..\\node_modules\\office-ui-fabric-js\\dist\\js\\fabric.js");

export default {
    Fabric: fabric, 
    InitFixedControls: function() {
        var CommandBarElements = document.querySelectorAll(".ms-CommandBar");
        for(var commandBarCount = 0; commandBarCount < CommandBarElements.length; commandBarCount++) {
            new this.Fabric.CommandBar(CommandBarElements[commandBarCount]);
        }

        var ListElements = document.querySelectorAll(".ms-List");
        for(var listElementsCount = 0; listElementsCount < ListElements.length; listElementsCount++) {
            new this.Fabric.List(ListElements[listElementsCount]);
        }

        var ToggleElements = document.querySelectorAll(".ms-Toggle");
        for(var toggleElementsCount = 0; toggleElementsCount < ToggleElements.length; toggleElementsCount++) {
            new this.Fabric.Toggle(ToggleElements[toggleElementsCount]);
        }
    },
    UpdateToggle: function(id) {
        new this.Fabric.Toggle(document.getElementById(id));
    },
    UpdatePanels: function() {
        var PanelExamples = document.getElementsByClassName("ms-PanelExample");
        for (var panelExamplesCount = 0; panelExamplesCount < PanelExamples.length; panelExamplesCount++) {
            OfficeFabricManager.UpdatePanel(PanelExamples[panelExamplesCount]);
        }
    },
    UpdatePanel: function(container) {
        var PanelExampleButton = container.querySelector(".ms-Button");
        var PanelExamplePanel = container.querySelector(".ms-Panel");
        var _this = this;
        PanelExampleButton.addEventListener("click", function(i) {
            new _this.Fabric.Panel(PanelExamplePanel);
        });
    }
};
