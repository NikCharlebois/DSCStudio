import $ from "jquery";
import Handlebars from "handlebars";

const QuestionHelpText = '<span class="ms-PanelDefaultExample ms-PanelExample helpIcon">' +
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

const QuestionValidationLabel = '<div class="ms-MessageBar ms-MessageBar--error" style="display: none;" id="question-{{id}}-error">' + 
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

export default {
    RegisterHelpers: function() {
        Handlebars.registerHelper('ifTypeIsText', function(v1, options) {
            if(v1 === "text") {
                return options.fn(this);
            }
            return options.inverse(this);
        });
        Handlebars.registerHelper('ifTypeIsNumber', function(v1, options) {
            if(v1 === "number") {
                return options.fn(this);
            }
            return options.inverse(this);
        });
        Handlebars.registerHelper('ifTypeIsBoolean', function(v1, options) {
            if(v1 === "boolean") {
                return options.fn(this);
            }
            return options.inverse(this);
        });
    },
    RenderHandleBar: function(templateName, context, appendTo) {
        var template = Handlebars.compile(this[templateName]);
        $(appendTo).append(template(context));
    },
    NavigationLink: '<li><a class="ms-Link" href="#section-{{this}}">{{this}}</a></li>',
    QuestionGroupHeader: '<h3 id="section-{{this}}">{{this}}</h3>',
    TextQuestion: '<div id="question-{{id}}" class="ms-TextField "' +
                  '{{#if showForTrueResponseQuestion}}' +
                  'data-showforresponse="question-{{showForTrueResponseQuestion}}"' +
                  '{{/if}}' +
                  '>' +
                  '    <label class="ms-Label" for="question-{{id}}-value">{{title}}' +
                  '{{#if helpText}}' +
                  QuestionHelpText +
                  '{{/if}}' +
                  '    </label>' +
                  '    <input class="ms-TextField-field" type="text" id="question-{{id}}-value" name="question-{{id}}-value" value="{{defaultValue}}" />' + 
                  QuestionValidationLabel +
                  '</div>',
    TextArrayQuestion: '<div id="question-{{id}}" class="ms-TextField "' +
                       '{{#if showForTrueResponseQuestion}}' +
                       'data-showforresponse="question-{{showForTrueResponseQuestion}}"' +
                       '{{/if}}' +
                       '>' +
                       '    <label class="ms-Label" for="question-{{id}}-value">{{title}}' +
                       '{{#if helpText}}' +
                       QuestionHelpText +
                       '{{/if}}' +
                       '    </label>' +
                       '    <input class="ms-TextField-field textarraynewitem" type="text" id="question-{{id}}-newitem" name="question-{{id}}-newitem" />' + 
                       '    <button class="ms-Button ms-Button--command add" id="question-{{id}}-add"><span class="ms-CommandButton-icon"><i class="ms-Icon ms-Icon--Add"></i></span></button>' +
                       '    <button class="ms-Button ms-Button--command remove" id="question-{{id}}-remove"><span class="ms-CommandButton-icon"><i class="ms-Icon ms-Icon--Remove"></i></span></button>' +
                       '    <br/>' +
                       '    <select name="question-{{id}}-value" id="question-{{id}}-value" class="ms-TextField-field textarrayresponses" multiple>' + 
                       '    </select>' +
                       QuestionValidationLabel +
                       '</div>',
    NumberQuestion: '<div id="question-{{id}}" class="ms-TextField"' +
                    '{{#if showForTrueResponseQuestion}}' +
                    'data-showforresponse="question-{{showForTrueResponseQuestion}}"' +
                    '{{/if}}' +
                    '>' +
                    '    <label class="ms-Label" for="question-{{id}}-value">{{title}}' +
                    '{{#if helpText}}' +
                    QuestionHelpText +
                    '{{/if}}' +
                    '    </label>' +
                    '    <input class="ms-TextField-field"  type="text" id="question-{{id}}-value" name="question-id-value"value="{{defaultValue}}" />' +
                    QuestionValidationLabel +
                    '</div>',
    BooleanQuestion: '<div id="question-{{id}}" class="ms-Toggle  ms-Toggle--textLeft"' +
                     '{{#if showForTrueResponseQuestion}}' +
                     'data-showforresponse="question-{{showForTrueResponseQuestion}}"' +
                     '{{/if}}' +
                     '>' +
                     '    <span class="ms-Toggle-description">{{title}}' +
                     '{{#if helpText}}' +
                     QuestionHelpText +
                     '{{/if}}' +
                     '    </span>' +
                     '    <input class="ms-Toggle-input"  type="checkbox" id="question-{{id}}-value" name="question-{{id}}-value" />' +
                     '    <label class="ms-Toggle-field" for="question-{{id}}-value">' + 
                     '        <span class="ms-Label ms-Label--off">No</span>' + 
                     '        <span class="ms-Label ms-Label--on">Yes</span>' + 
                     '    </label>' +
                     QuestionValidationLabel +
                     '</div>',
    ChoiceQuestion: '<div id="question-{{id}}" class=\"ms-TextField \"' +
                    '{{#if showForTrueResponseQuestion}}' +
                    'data-showforresponse="question-{{showForTrueResponseQuestion}}"' +
                    '{{/if}}' +
                    '>' +
                    '    <label class="ms-Label" for="question-{{id}}-value\">{{title}}' +
                    '{{#if helpText}}' +
                    QuestionHelpText +
                    '{{/if}}' +
                    '    </label>' +
                    '    <select name="question-{{id}}-value" id="question-{{id}}-value" class="ms-TextField-field">' + 
                    '    {{#each choices}}' +
                    '        <option value="{{this}}">{{this}}</option>' +
                    '    {{/each}}' +
                    '    </select>' +
                    QuestionValidationLabel +
                    '</div>',
    ComplexTypeQuestion: '<div id="question-{{id}}" class=\"ms-TextField \"' +
                         '{{#if showForTrueResponseQuestion}}' +
                         'data-showforresponse="question-{{showForTrueResponseQuestion}}"' +
                         '{{/if}}' +
                         '>' +
                         '    <label class="ms-Label" for="question-{{id}}-value\">{{title}}' +
                         '{{#if helpText}}' +
                         QuestionHelpText +
                         '{{/if}}' +
                         '    </label>' +
                         '    <input type="hidden" id="question-{{id}}-value" value="[]"/>' +
                         '    <div class="ms-CommandButton">' +
                         '         <button class="ms-CommandButton-button" id="question-{{id}}-openbutton">' +
                         '             <span class="ms-CommandButton-icon ms-fontColor-themePrimary">' +
                         '                 <i class="ms-Icon ms-Icon--Add"></i>' +
                         '             </span>' +
                         '             <span class="ms-CommandButton-label">Add item</span>' +
                         '        </button>' +
                         '    </div>' +
                         '    <div id="question-{{id}}-results">' +
                         '    </div>' +  
                         '    <div class="ms-Dialog complextypedialog" id="question-{{id}}-dialog">' +
                         '        <div class="ms-Dialog-title">New item details</div>' +
                         '        <div class="ms-Dialog-content complextypedialog-content">' +
                         '        {{#each properties}}' +
                         '            {{#ifTypeIsText this.type}}' +
                         '                <div class="ms-TextField">' +
                         '                    <label for="complex-{{../id}}-{{powershellName}}" class="ms-Label">{{name}}</label>' +
                         '                    <input type="text" name="complex-{{../id}}-{{powershellName}}" id="complex-{{../id}}-{{powershellName}}" class="ms-TextField-field" />' +
                         '                </div>' +
                         '            {{/ifTypeIsText}}' +
                         '            {{#ifTypeIsNumber this.type}}' +
                         '                <div class="ms-TextField">' +
                         '                    <label for="complex-{{../id}}-{{powershellName}}" class="ms-Label">{{name}}</label>' +
                         '                    <input type="text" name="complex-{{../id}}-{{powershellName}}" id="complex-{{../id}}-{{powershellName}}" class="ms-TextField-field" />' +
                         '                </div>' +
                         '            {{/ifTypeIsNumber}}' +
                         '            {{#ifTypeIsBoolean this.type}}' +
                         '                <div class="ms-Toggle  ms-Toggle--textLeft" id="complex-{{../id}}-{{powershellName}}-toggle">' +
                         '                    <span class="ms-Toggle-description">{{name}}</span>' +
                         '                    <input class="ms-Toggle-input" type="checkbox" id="complex-{{../id}}-{{powershellName}}-value" name="complex-{{../id}}-{{powershellName}}-value" />' +
                         '                    <label class="ms-Toggle-field" for="complex-{{../id}}-{{powershellName}}-value">' + 
                         '                        <span class="ms-Label ms-Label--off">No</span>' + 
                         '                        <span class="ms-Label ms-Label--on">Yes</span>' + 
                         '                    </label>' +
                         '                </div>' +
                         '            {{/ifTypeIsBoolean}}' +
                         '        {{/each}}' +
                         '        </div>' +
                         '        <div class="ms-Dialog-actions">' +
                         '            <button id="complex-{{id}}-addbutton" class="ms-Button ms-Dialog-action ms-Button--primary">' +
                         '                <span class="ms-Button-label">Add item</span>' +
                         '            </button>' +
                         '            <button class="ms-Button ms-Dialog-action">' +
                         '                <span class="ms-Button-label">Cancel</span>' +
                         '            </button>' +
                         '        </div>' +
                         '    </div>' +
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
              '        <div class="ms-ListItem-action"><i class="ms-Icon ms-Icon--Delete deleteNode" data-nodename="{{name}}"></i></div>' + 
              '    </div>' + 
              '</li>' + 
              '{{/each}}',
    ComplexQuestionDisplay: '<ul class="ms-List complexquestiondisplay">' + 
                            '    {{#each this}}' +
                            '        <li class="ms-ListItem" tabindex="0">' +
                            '            {{#each AllResponses}}' +
                            '                {{name}}: {{value}}<br />' +
                            '            {{/each}}' +
                            '        </li>' +
                            '    {{/each}}' +
                            '</ul>',
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
                       '    <input class="ms-Toggle-input"  type="checkbox" id="nodeSetting-{{powershellName}}-value" name="nodeSetting-{{powershellName}}-value" />' +
                       '    <label class="ms-Toggle-field" for="nodeSetting-{{powershellName}}-value">' +
                       '        <span class="ms-Label ms-Label--off">No</span>' +
                       '        <span class="ms-Label ms-Label--on">Yes</span>' + 
                       '    </label>' +
                       '</div>'
};