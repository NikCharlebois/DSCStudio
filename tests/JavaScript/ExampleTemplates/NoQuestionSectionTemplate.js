export default {
    "$schema": "https://raw.githubusercontent.com/BrianFarnhill/DSCStudio/master/schema.json",
    "metadata": {
        "title": "DSC Studio Dev Mode Test Template",
        "description": "This template is loaded when DSC Studio is run in the developer engine mode, and includes samples of all question types for testing the UI independent of any individual template",
        "configurationName": "DscStudioTest"
    },
    "configDataSettings": {
        "certificateDetails": true,
        "maxNodeCount": 1,
        "minNodeCount": 1,
        "nodeSettings": [
            {
                "displayName": "Text option",
                "powershellName": "TextOption",
                "valueType": "text"
            },
            {
                "displayName": "Number option",
                "powershellName": "NumberOption",
                "valueType": "number"
            },
            {
                "displayName": "Boolean option",
                "powershellName": "BooleanOption",
                "valueType": "boolean"
            }
        ]
    },
    "ScriptOutput": [
        "configuration ExampleConfig",
        "{",
        "    $DscStudio = $ConfigurationData.NonNodeData.DscStudio",
        "",
        "    node $AllNodes.NodeName",
        "    {",
        "        # the example config does not have a full script built in to it",
        "        # this is where resources would normally appear",
        "    }",
        "}"
    ]
};
