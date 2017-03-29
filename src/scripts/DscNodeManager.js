import $ from "jquery";
import FormValidator from "./FormValidator";
import DscNodeManager from './DscNodeManager';
import UI from "./UI";
import Strings from "./Strings";

export default {
    CanNewNodesBeAdded: function() {
        if (DscStudio.CurrentTemplate.configDataSettings.maxNodeCount !== undefined && 
            DscStudio.Nodes.length >= DscStudio.CurrentTemplate.configDataSettings.maxNodeCount) 
        {
            return false;
        }
        return true;
    },
    AddNewNode: function() {
        var additionalProperties = [];
        DscStudio.CurrentTemplate.configDataSettings.nodeSettings.forEach(function(setting) {
            additionalProperties.push({
                powershellName: setting.powershellName,
                displayName: setting.displayName,
                valueType: setting.valueType,
                value: UI.ReadNodeSettingResponse(setting)
            });
        });

        DscStudio.Nodes.push({
            name: UI.GetValue("#NewNodeName"),
            additionalProperties: additionalProperties
        });

        UI.ClearNodeSettingsValues(DscStudio.CurrentTemplate.configDataSettings.nodeSettings);

        UI.RenderUISection('NodeList', DscStudio.Nodes, '#nodeList');

        if (FormValidator.ValidateAllNodeData() === true) {
            UI.HideElement("configErrorFlag");
        } else {
            UI.ShowElement("configErrorFlag");
        }

        UI.RegisterEvent(".deleteNode", "click", function() {
            var nodeName = $(this).data("nodename");
            DscNodeManager.RemoveNode(nodeName);
        });
    },
    RemoveNode: function(nodeName) {
        if (UI.ConfirmAction(Strings.ConfirmRemoveNode, [nodeName])) {
            DscStudio.Nodes = DscStudio.Nodes.filter(function(item) {
                return item.name !== nodeName;
            });
            UI.RenderUISection('NodeList', DscStudio.Nodes, '#nodeList');
            FormValidator.ValidateAllNodeData();
        }
    }
};
