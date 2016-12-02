import $ from "jquery";

import StyleLoader from "StyleLoader";
import OfficeFabricManager from "OfficeFabricManager";
import ViewManager from "ViewManager";
import FormValidator from "FormValidator";
import EventManager from "EventManager";
import TemplateManager from "TemplateManager";
import SettingsStore from "SettingsStore";


$(document).ready(function() {
    StyleLoader.ApplyStyles();
    ViewManager.ShowView('start');
    EventManager.Init();
    OfficeFabricManager.InitFixedControls();
    FormValidator.InitForm();
    TemplateManager.Init();
});

module.exports =  SettingsStore;
