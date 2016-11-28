"use-strict";

var DscNodeManager = {
    Nodes: [],
    CanNewNodesBeAdded: function() {
        if (TemplateManager.CurrentTemplate.configDataSettings.maxNodeCount !== undefined && 
            DscNodeManager.Nodes.length >= TemplateManager.CurrentTemplate.configDataSettings.maxNodeCount) 
        {
            return false;
        }
        return true;
    },
    TooManyNodesMessage: function() {
        return 'This template supports a maximum of ' + 
              TemplateManager.CurrentTemplate.configDataSettings.maxNodeCount + 
              ' nodes, please remove a node before adding a new one.';
    },
    AddNewNode: function(event) {
        var additionalProperties = [];
        TemplateManager.CurrentTemplate.configDataSettings.nodeSettings.forEach(function(setting) {
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

        DscNodeManager.Nodes.push({
            name: $("#NewNodeName").val(),
            additionalProperties: additionalProperties,
            additionalPropsHtmlList: additionalPropsHtmlList
        });

        $("#NewNodeName").val("");
        $("#nodeList").empty();
        HandleBarManager.RenderHandleBar('NodeList', DscNodeManager.Nodes, '#nodeList');
        FormValidator.ValidateNodeData();
    },
    RemoveNode: function(nodeName) {
        if (window.confirm("Are you sure you wish to remove '" + nodeName + "'?")) {
            DscNodeManager.Nodes = DscNodeManager.Nodes.filter(function(item) {
                return item.name !== nodeName;
            });
            $("#nodeList").empty();
            HandleBarManager.RenderHandleBar('NodeList', DscNodeManager.Nodes, '#nodeList');
            FormValidator.ValidateNodeData();
        }
    }
};
