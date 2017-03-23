import $ from "jquery";
import TemplateManager from "./TemplateManager";
import HandleBarManager from "./HandleBarManager";
import FormValidator from "./FormValidator";

export default {
    CanNewNodesBeAdded: function() {
        if (DscStudio.CurrentTemplate.configDataSettings.maxNodeCount !== undefined && 
            DscStudio.Nodes.length >= DscStudio.CurrentTemplate.configDataSettings.maxNodeCount) 
        {
            return false;
        }
        return true;
    },
    TooManyNodesMessage: function() {
        return 'This template supports a maximum of ' + 
              DscStudio.CurrentTemplate.configDataSettings.maxNodeCount + 
              ' nodes, please remove a node before adding a new one.';
    },
    AddNewNode: function(event) {
        var additionalProperties = [];
        DscStudio.CurrentTemplate.configDataSettings.nodeSettings.forEach(function(setting) {
            var internalValue;
            switch(setting.valueType) {
                case "text":
                case "number":
                    internalValue = $("#nodeSetting-" + setting.powershellName + "-value").val();
                    $("#nodeSetting-" + setting.powershellName + "-value").val("");
                    break;
                case "boolean":
                    internalValue = $("#nodeSetting-" + setting.powershellName + " label").hasClass("is-selected");
                    $("#nodeSetting-" + setting.powershellName + " label").removeClass("is-selected");
                break; 
            }

            additionalProperties.push({
                powershellName: setting.powershellName,
                displayName: setting.displayName,
                valueType: setting.valueType,
                value: internalValue
            });
        });

        var additionalPropsHtmlList = '';
        additionalProperties.forEach(function(prop) {
            additionalPropsHtmlList += prop.displayName + ': ' + prop.value + '<br />';
        });

        DscStudio.Nodes.push({
            name: $("#NewNodeName").val(),
            additionalProperties: additionalProperties,
            additionalPropsHtmlList: additionalPropsHtmlList
        });

        $("#NewNodeName").val("");
        $("#nodeList").empty();
        HandleBarManager.RenderHandleBar('NodeList', DscStudio.Nodes, '#nodeList');
        FormValidator.ValidateNodeData();

        var self = this;
        $(".deleteNode").click(function() {
            var nodeName = $(this).data("nodename");
            if (window.confirm("Are you sure you wish to remove '" + nodeName + "'?")) {
                DscStudio.Nodes = DscStudio.Nodes.filter(function(item) {
                    return item.name !== nodeName;
                });
                $("#nodeList").empty();
                HandleBarManager.RenderHandleBar('NodeList', DscStudio.Nodes, '#nodeList');
                FormValidator.ValidateNodeData();
            }
        });
    },
    RemoveNode: function(nodeName) {
        
    }
};
