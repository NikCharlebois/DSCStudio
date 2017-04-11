export default {
    "$schema": "https://raw.githubusercontent.com/BrianFarnhill/DSCStudio/master/schema.json",
    "metadata": {
        "title": "DSC Studio Dev Mode Test Template",
        "description": "This template is loaded when DSC Studio is run in the developer engine mode, and includes samples of all question types for testing the UI independent of any individual template",
        "configurationName": "DscStudioTest"
    },
    "configDataSettings": {
        "certificateDetails": true,
        "maxNodeCount": 10,
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
    "questions": [
        {
            "id": "TextQuestion",
            "title": "An example text question",
            "type": "text",
            "defaultValue": "Hello world",
            "group": "Group 1"
        },
        {
            "id": "BoolQuestion",
            "title": "An example boolean question",
            "type": "boolean",
            "defaultValue": true,
            "group": "Group 1"
        },
        {
            "id": "ChoiceQuestion",
            "title": "An example choice questions",
            "type": "choice",
            "choices": [
                "Choice 1",
                "Choice 2",
                "Choice 3"
            ],
            "defaultValue": "Choice 2",
            "group": "Group 2"
        },
        {
            "id": "FilePathQuestion",
            "title": "An example file path question",
            "type": "filepath",
            "defaultValue": "C:\\example",
            "group": "Group 2"
        },
        {
            "id": "NumberQuestion",
            "title": "An example number question",
            "type": "number",
            "minValue": 1,
            "maxValue": 5,
            "defaultValue": "5"
        },
        {
            "id": "RegExQuestion",
            "title": "An example RegEx question",
            "type": "regex",
            "pattern": "/^([\\w\\.\\-_]+)?\\w+@[\\w-_]+(\\.\\w+){1,}$/igm",
            "defaultValue": "example@email.com"
        },
        {
            "id": "ArrayQuestion",
            "title": "An example text array question",
            "type": "textarray"
        },
        {
            "id": "ComplexTypeQuestion",
            "title": "An example complex type question",
            "type": "complextype",
            "properties": [
                {
                    "name": "Text data",
                    "powershellName": "text",
                    "type": "text"
                },
                {
                    "name": "Number data",
                    "powershellName": "number",
                    "type": "number"
                },
                {
                    "name": "Boolean data",
                    "powershellName": "boolean",
                    "type": "boolean"
                }
            ]
        }
    ],
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
