import $ from "jquery";

import UI from "./UI";

import FormValidator from "./FormValidator";
import TemplateManager from "./TemplateManager";
import SettingsStore from "./SettingsStore";
import HandleBarManager from "./HandleBarManager";


$(document).ready(function() {
    UI.SwitchView(UI.Views.Start);
    UI.Initialise();
    
    HandleBarManager.RegisterHelpers();
    FormValidator.InitForm();
    TemplateManager.Init();
});

module.exports =  SettingsStore;
