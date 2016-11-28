requirejs.config({
    "baseUrl": "scripts",
    "paths": {
      //"app": "../app"
      "jquery": "jquery-3.1.1.min"
    },
    "shim": {
        // "jquery.alpha": ["jquery"],
        // "jquery.beta": ["jquery"]
    }
});

requirejs(['enginenew']);
