import UI from "./UI";
import Strings from "./Strings";

export default {
    CurrentTemplate: "",
    GetQuestionGroups: function (template) {
        var questionGroups = {};

        if (template.questions === undefined || template.questions.length === 0) {
            UI.SendAlert(Strings.ErrorNoQuestionsInTemplate);
            return;
        }

        // Read the questions out and store them in their groups
        template.questions.forEach(function(question) {
            if (question.group !== undefined) {
                if (questionGroups.hasOwnProperty(question.group) === false) {
                    questionGroups[question.group] = [];
                }
                questionGroups[question.group].push(question);
            } else {
                if (questionGroups.hasOwnProperty(Strings.LabelOtherQuestionsCategory) === false) {
                    questionGroups[Strings.LabelOtherQuestionsCategory] = [];
                }
                question.group = Strings.LabelOtherQuestionsCategory;
                questionGroups[Strings.LabelOtherQuestionsCategory].push(question);
            }
        });

        return questionGroups;
    },
    Init: function() {
        if (UI.SupportedBrowser() === false) {
            UI.SendAlert(Strings.ErrorUnsupportedFeatures);
            return false;
        }

        if (DynamicTemplate !== undefined) {
            UI.HideElement("navBox");
            this.ParseTemplate(DynamicTemplate);
        }
    },
    ParseTemplate: function(template) {
        DscStudio.CurrentTemplate = template;
        UI.BuildQuestionUI(template);
        UI.SwitchView(UI.Views.Response);
        UI.SwitchResponseTab(UI.ResponseTabs.ConfigData);
    },
    StoreQuestionResponses: function() {
        var responses = [];
        DscStudio.CurrentTemplate.questions.forEach(function(question) {
            responses[question.id] = UI.ReadQuestionResponse(question);
        });
        DscStudio.Responses = responses;
    }
};
