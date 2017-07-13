import $ from "jquery";
import Handlebars from "handlebars";

import QuestionHelpText from "../handlebars/QuestionHelpText.hbs";
import QuestionValidationLabel from "../handlebars/QuestionValidationLabel.hbs";

export default {
    RegisterHelpers: function() {
        Handlebars.registerHelper('ifTypeIsText', function(v1, options) {
            if(v1 === "text" || v1 === "choice") {
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
        Handlebars.registerHelper('rawtext', function(val) {
            return new Handlebars.SafeString(val);
        });
        Handlebars.registerPartial('QuestionHelpText', QuestionHelpText);
        Handlebars.registerPartial('QuestionValidationLabel', QuestionValidationLabel);
    },
    RenderHandleBar: function(templateName, context, appendTo) {
        var template = Handlebars.compile(this[templateName]);
        if (appendTo !== "")
        {
            $(appendTo).append(template(context));
        }
        else
        {
            return template(context);
        }
    },
    NavigationLink: require('../handlebars/NavigationLink.hbs'),
    QuestionGroupHeader: require('../handlebars/QuestionGroupHeader.hbs'),
    TextQuestion: require('../handlebars/TextQuestion.hbs'),
    TextArrayQuestion: require('../handlebars/TextArrayQuestion.hbs'),
    NumberQuestion: require('../handlebars/NumberQuestion.hbs'),
    BooleanQuestion: require('../handlebars/BooleanQuestion.hbs'),
    ChoiceQuestion: require('../handlebars/ChoiceQuestion.hbs'),
    ComplexTypeQuestion: require('../handlebars/ComplexTypeQuestion.hbs'),
    NodeList: require('../handlebars/NodeList.hbs'),
    ComplexQuestionDisplay: require('../handlebars/ComplexQuestionDisplay.hbs'),
    TextNodeOption: require('../handlebars/TextNodeOption.hbs'),
    NumberNodeOption: require('../handlebars/NumberNodeOption.hbs'),
    BooleanNodeOption: require('../handlebars/BooleanNodeOption.hbs'),
    ChoiceNodeOption: require('../handlebars/ChoiceNodeOption.hbs'),
    PowerShellTemplate: require('../handlebars/PowerShellTemplate.hbs')
};
