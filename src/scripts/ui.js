"use-strict";

var StyleLoader = {
    ApplyStyles: function() {
        $("h1").addClass("ms-font-su");
        $("h2").addClass("ms-font-xxl");
        $("h3").addClass("ms-font-xl");
        $("p").addClass("ms-font-m");
    }
};

var OfficeFabricManager = {
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
        PanelExampleButton.addEventListener("click", function(i) {
            new fabric.Panel(PanelExamplePanel);
        });
    }
};

var ViewManager = {
    ShowView: function(view) {
        $("#templateStart").hide();
        $("#templateResponse").hide();
        $("#templateOutput").hide();
        switch(view) {
            case "start":
                $("#templateStart").show();
                break;
            case "response":
                $("#templateResponse").show();
                break;
            case "output":
                $("#templateOutput").show();

                $("#moduleDownloadScript").text(PowerShellManager.DownloadScript);
                $("#scriptContentParent").empty();
                $("#scriptContentParent").html("<pre id=\"scriptContent\" class=\"brush: powershell\">" + PowerShellManager.CurrentScript + "</pre>");

                StyleLoader.ApplyStyles();

                SyntaxHighlighter.highlight();
                break;
            default:
                throw view + " is an unknown view to switch this form to";
        }
    },
    ShowTab: function(tabname) {
        switch(tabname) 
        {
            case "configdata":
                $("#configDataEditor").show();
                $("#switchView-Config").parent().addClass("ms-bgColor-themeLight");
                $("#QuestionnaireEditor").hide();
                $("#switchView-Questions").parent().removeClass("ms-bgColor-themeLight");
                break;
            case "questionaire":
                $("#configDataEditor").hide();
                $("#switchView-Config").parent().removeClass("ms-bgColor-themeLight");
                $("#QuestionnaireEditor").show();
                $("#switchView-Questions").parent().addClass("ms-bgColor-themeLight");
                break;
            default:
                throw tabname + " is an unknown tab to switch this form to";
        }
    },
    OpenDialog: function(dialogId) {
        var dialog = document.getElementById(dialogId);
        var dialogComponent = new fabric.Dialog(dialog);
        dialogComponent.open();
    },
    ToggleCodeMinimiseFrame: function() {
        if ($("#code-minimise-button").attr('class') == "ms-Icon ms-Icon--ChevronDown") {
            // expand 
            $("#code-minimise-button").attr('class', "ms-Icon ms-Icon--ChevronUp");
            $("#scriptContentParent").attr('class', "code-expanded");
        } else {
            // collapse
            $("#code-minimise-button").attr('class', "ms-Icon ms-Icon--ChevronDown");
            $("#scriptContentParent").attr('class', "code-minimise");
        }
    }
};

var EventManager = {
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

        new fabric.Button(document.querySelector("#addNewNode"), DscNodeManager.AddNewNode);
    }
};

var TemplateUIBuilder = {
    BuildPrimaryUI: function(template) {
        $("#templateNameHeader").text(template.metadata.title);
        if (template.metadata.description !== null) {
            $("#templateDescription").text(template.metadata.description);
            $("#templateDescription").show();
        } else {
            $("#templateDescription").hide();    
        }

        if (template.configDataSettings.certificateDetails === null || 
            template.configDataSettings.certificateDetails === true) {} else 
        {
            $("#certificateDetails").remove();
        } //TODO: Handle the "no secure password scenario here
    },
    BuildQuestionUI: function(questionGroups) {

        Object.keys(questionGroups).forEach(function(groupName) {
            $("#templateQuestions").append("<h3>" + groupName + "</h3>");
            questionGroups[groupName].forEach(function(question) {
                switch (question.type) {
                    case "text":
                    case "filepath":
                    case "regex":
                        HandleBarManager.RenderHandleBar('TextQuestion', question, '#templateQuestions');
                        break;
                    case "number":
                        HandleBarManager.RenderHandleBar('NumberQuestion', question, '#templateQuestions');
                        break;
                    case "boolean":
                        HandleBarManager.RenderHandleBar('BooleanQuestion', question, '#templateQuestions');
                        OfficeFabricManager.UpdateToggle('question-' + question.id);
                        break;
                    default:
                        alert("Field type not supported");
                        break;
                }
            });
        });

        OfficeFabricManager.UpdatePanels();
        StyleLoader.ApplyStyles();
    },
    BuildNewNodeUI: function() {
        TemplateManager.CurrentTemplate.configDataSettings.nodeSettings.forEach(function(setting) {
            switch (setting.valueType) {
                case "text":
                    HandleBarManager.RenderHandleBar('TextNodeOption', setting, '#additionalNodeDetails');
                    break;
                case "number":
                    HandleBarManager.RenderHandleBar('NumberNodeOption', setting, '#additionalNodeDetails');
                    break;
                case "boolean":
                    HandleBarManager.RenderHandleBar('BooleanNodeOption', setting, '#additionalNodeDetails');
                    new fabric.Toggle(document.getElementById("nodeSetting-" + setting.powershellName));
                    break;
                default:
                    throw setting.valueType + " is not a supported node data type";
            }
        });
    }
};


var QuestionHelpText = '<span class="ms-PanelDefaultExample ms-PanelExample helpIcon">' +
                       '    <button class="ms-Button" style="background-color:white; border: none;" id="question-{{id}}-helpbutton">' +
                       '        <span class="ms-Button-label"><i class="ms-Icon ms-Icon--Info ms-fontColor-blue"></i></span>' +
                       '    </button>' +
                       '    <div class="ms-Panel">' +
                       '        <button class="ms-Panel-closeButton ms-PanelAction-close">' +
                       '            <i class="ms-Panel-closeIcon ms-Icon ms-Icon--Cancel"></i>' +
                       '        </button>' +
                       '        <div class="ms-Panel-contentInner">' +
                       '            <p class="ms-Panel-headerText">{{title}}</p>' +
                       '            <div class="ms-Panel-content">' +
                       '                <span class="ms-font-m">{{helpText}}</span>' +
                       '            </div>' +
                       '        </div>' +
                       '    </div>' +
                       '</span>';

var QuestionValidationLabel = '<div class="ms-MessageBar ms-MessageBar--error" style="display: none;" id="question-{{id}}-error">' + 
                              '    <div class="ms-MessageBar-content">' + 
                              '        <div class="ms-MessageBar-icon">' + 
                              '            <i class="ms-Icon ms-Icon--ErrorBadge"></i>' + 
                              '        </div>' + 
                              '        <div class="ms-MessageBar-text">' +
                              '{{#if validationMessage}}' +
                              '            {{validationMessage}}' +
                              '{{else}}' +
                              '            This field is required' +
                              '{{/if}}' +
                              '        </div>' + 
                              '    </div>' + 
                              '</div>';

var HandleBarManager = {
    RenderHandleBar: function(templateName, context, appendTo) {
        var template = Handlebars.compile(HandleBarManager[templateName]);
        $(appendTo).append(template(context));
    },
    TextQuestion: '<div id="question-{{id}}" class=\"ms-TextField \">' +
                  '    <label class="ms-Label" for="question-{{id}}-value\">{{title}}' +
                  '{{#if helpText}}' +
                  QuestionHelpText +
                  '{{/if}}' +
                  '    </label>' +
                  '    <input class="ms-TextField-field" type="text" id="question-{{id}}-value" name="question-{{id}}-value" />' + 
                  QuestionValidationLabel +
                  '</div>',
    NumberQuestion: '<div id="question-{{id}}" class="ms-TextField">' +
                    '    <label class="ms-Label" for="question-{{id}}-value">{{title}}' +
                    '{{#if helpText}}' +
                    QuestionHelpText +
                    '{{/if}}' +
                    '    </label>' +
                    '    <input class="ms-TextField-field"  type="text" id="question-{{id}}-value" name="question-id-value" />' +
                    QuestionValidationLabel +
                    '</div>',
    BooleanQuestion: '<div id="question-{{id}}" class="ms-Toggle  ms-Toggle--textLeft">' +
                     '    <span class="ms-Toggle-description">{{title}}' +
                     '{{#if helpText}}' +
                     QuestionHelpText +
                     '{{/if}}' +
                     '    </span>' +
                     '    <input class="ms-Toggle-input"  type="checkbox" id=\"" + fieldName + "-value\" name=\"" + fieldName + "-value\" />' +
                     '    <label class="ms-Toggle-field" for="question-{{id}}-value">' + 
                     '        <span class="ms-Label ms-Label--off">No</span>' + 
                     '        <span class="ms-Label ms-Label--on">Yes</span>' + 
                     '    </label>' +
                     QuestionValidationLabel +
                     '</div>',
    NodeList: '{{#each this}}' + 
              '<li class="ms-ListItem" tabindex="0">' + 
              '    <span class="ms-ListItem-primaryText">{{name}}</span>' + 
              '    <span class="ms-ListItem-tertiaryText">' + 
              '        {{{additionalPropsHtmlList}}}' +
              '    </span>' + 
              '    <div class="ms-ListItem-selectionTarget"></div>' + 
              '    <div class="ms-ListItem-actions">' + 
              '        <div class="ms-ListItem-action"><i class="ms-Icon ms-Icon--Delete" onclick="DscNodeManager.RemoveNode(\'{{name}}\')"></i></div>' + 
              '    </div>' + 
              '</li>' + 
              '{{/each}}',
    TextNodeOption: '<div id="nodeSetting-{{powershellName}}" class="ms-TextField">' + 
                    '    <label class="ms-Label" for="nodeSetting-{{powershellName}}-value">{{displayName}}</label>' + 
                    '    <input class="ms-TextField-field" type="text" id="nodeSetting-{{powershellName}}-value" name="nodeSetting-{{powershellName}}-value" />' + 
                    '</div>',
    NumberNodeOption: '<div id="nodeSetting-{{powershellName}}" class="ms-TextField">' +
                      '    <label class="ms-Label" for="nodeSetting-{{powershellName}}-value">{{displayName}}</label>' +
                      '    <input class="ms-TextField-field"  type="text" id="nodeSetting-{{powershellName}}-value" name="nodeSetting-{{powershellName}}-value" />' +
                      '</div>',
    BooleanNodeOption: '<div id="nodeSetting-{{powershellName}}" class="ms-Toggle  ms-Toggle--textLeft">' +
                       '    <span class="ms-Toggle-description">{{displayName}}</span>' +
                       '    <input class="ms-Toggle-input"  type="checkbox" id="nodeSetting-{{powershellNam}}-value" name="nodeSetting-{{powershellName}}-value" />' +
                       '    <label class="ms-Toggle-field" for="nodeSetting-{{powershellName}}-value">' +
                       '        <span class="ms-Label ms-Label--off">No</span>' +
                       '        <span class="ms-Label ms-Label--on">Yes</span>' + 
                       '    </label>' +
                       '</div>'
};
