import $ from "jquery";

import UI from "./UI";

import StyleLoader from "./StyleLoader";
import OfficeFabricManager from "./OfficeFabricManager";
import ViewManager from "./ViewManager";
import FormValidator from "./FormValidator";
import TemplateManager from "./TemplateManager";
import SettingsStore from "./SettingsStore";
import HandleBarManager from "./HandleBarManager";


$(document).ready(function() {
    StyleLoader.ApplyStyles();

    UI.SwitchView(UI.Views.Start);
    UI.InitialiseEvents();
    
    OfficeFabricManager.InitFixedControls();
    HandleBarManager.RegisterHelpers();
    FormValidator.InitForm();
    TemplateManager.Init();
});

module.exports =  SettingsStore;
