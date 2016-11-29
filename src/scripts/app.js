"use-strict";

function loadScript(url, callback){
    var script = document.createElement("script");
    script.type = "text/javascript";
    if (script.readyState){  //IE
        script.onreadystatechange = function(){
            if (script.readyState == "loaded" ||
                    script.readyState == "complete"){
                script.onreadystatechange = null;
                callback();
            }
        };
    } else {  //Others
        script.onload = function(){
            callback();
        };
    }
    script.src = "scripts/" + url;
    document.getElementsByTagName("head")[0].appendChild(script);
}

loadScript("jquery-3.1.1.min.js", function () {});
loadScript("fabric.min.js", function () {});
loadScript("FileSaver.min.js", function () {});
loadScript("nodes.min.js", function () {});
loadScript("shCore.js", function () {});
loadScript("shBrushPowerShell.js", function () {});
loadScript("handlebars.min.js", function () {});
loadScript("ui.min.js", function () {
    StyleLoader.ApplyStyles();
    ViewManager.ShowView('start');
    EventManager.Init();
    OfficeFabricManager.InitFixedControls();
});
loadScript("validator.min.js", function () {
    FormValidator.InitForm();
});
loadScript("engine.min.js", function () {
    TemplateManager.Init();
});
