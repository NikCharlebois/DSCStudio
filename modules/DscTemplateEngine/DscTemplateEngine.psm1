function Start-DscTemplateBuilder
{
    param()

    $enginePath = Join-Path -Path $PSScriptRoot -ChildPath "Engine\index.htm"

    Start-Process -FilePath $enginePath
}


Export-ModuleMember -Function *
