$nodemodulesPath = Join-Path -Path $PSScriptRoot -ChildPath "..\node_modules" -Resolve
$enginePath = Join-Path -Path $PSScriptRoot -ChildPath "..\Modules\DSCStudio\engine" -Resolve

$copyItems = @{
    "office-ui-fabric-js\dist\js\fabric.min.js" = "scripts"
    "office-ui-fabric-js\dist\css\fabric.components.min.css" = "css"
    "office-ui-fabric-js\dist\css\fabric.min.css" = "css"
    "file-saver\FileSaver.min.js" = "scripts"
    "handlebars\dist\handlebars.min.js" = "scripts"
}

$copyItems.Keys | ForEach-Object -Process {
    Copy-Item -Path (Join-Path -Path $nodemodulesPath -ChildPath $_) `
              -Destination (Join-Path -Path $enginePath -ChildPath $copyItems.$_) -Force
}
