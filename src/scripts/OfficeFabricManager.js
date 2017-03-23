import OfficeFabricManager from "./OfficeFabricManager";

export default {
    InitFixedControls: function() {
        var CommandBarElements = document.querySelectorAll(".ms-CommandBar");
        for(var commandBarCount = 0; commandBarCount < CommandBarElements.length; commandBarCount++) {
            new fabric.CommandBar(CommandBarElements[commandBarCount]);
        }

        var ListElements = document.querySelectorAll(".ms-List");
        for(var listElementsCount = 0; listElementsCount < ListElements.length; listElementsCount++) {
            new fabric.List(ListElements[listElementsCount]);
        }

        var ToggleElements = document.querySelectorAll(".ms-Toggle");
        for(var toggleElementsCount = 0; toggleElementsCount < ToggleElements.length; toggleElementsCount++) {
            new fabric.Toggle(ToggleElements[toggleElementsCount]);
        }
    },
    UpdateToggle: function(id) {
        new fabric.Toggle(document.getElementById(id));
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
            new _fabric.Panel(PanelExamplePanel);
        });
    }
};
