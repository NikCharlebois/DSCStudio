$script:TemplateFolderName = "DSCTemplates"

function Start-DscStudio
{
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true, ValueFromPipelineByPropertyName = $true)]
        [String]
        $Path
    )

    Begin 
    {
        $engineLaunched = $false
        Reset-DscStudioDynamicTemplate
    }
    Process 
    {
        if ($engineLaunched -eq $false) 
        {
            $engineFolder = Join-Path -Path $PSScriptRoot -ChildPath "Engine"
            $enginePath = Join-Path -Path $engineFolder -ChildPath "index.htm"
            $dynamicTemplatePath = Join-Path -Path $engineFolder `
                                             -ChildPath "DynamicTemplate.js"

            $tokens = $null
            $errors = $null
            $ps1Path = $Path.Replace(".json", ".ps1")
            $ast = [System.Management.Automation.Language.Parser]::ParseFile($ps1Path, [ref] $tokens, [ref] $errors)
            $configurations = $ast.FindAll({
                $args[0] -is [System.Management.Automation.Language.ConfigurationDefinitionAst]
            }, $true)

            $sr = New-Object -TypeName System.IO.StringReader `
                             -ArgumentList $configurations[0].ToString()

            $contentRows = @()
            $line = [string]::Empty
            do {
                $line = $sr.ReadLine()
                if ($null -ne $line) {
                    $contentRows += $line
                }
            }
            while ($null -ne $line)

            $template = Get-Content -Raw -Path $Path | ConvertFrom-Json
            $template = $template | Add-Member -MemberType NoteProperty `
                                               -Name "ScriptOutput" `
                                               -Value $contentRows `
                                               -PassThru
            $dynamicContent = "var DynamicTemplate = " + ($template | ConvertTo-Json -Depth 10)

            $dynamicContent | Out-File -FilePath $dynamicTemplatePath `
                            -Append:$false `
                            -Force:$true `
                            -Encoding utf8

            Start-Process -FilePath $enginePath
            $engineLaunched = $true
        } 
        else 
        {
            Write-Warning -Message ("Start-DscStudio is designed to take a single template " + `
                                    "through the pipeline. The additional template '$Path' " + `
                                    "has therefore been ignored.")
        }
    }
}

function Reset-DscStudioDynamicTemplate
{
    $engineFolder = Join-Path -Path $PSScriptRoot -ChildPath "Engine"
    $dynamicTemplatePath = Join-Path -Path $engineFolder -ChildPath "scripts/dynamictemplate.js"
    if ((Test-Path -Path $dynamicTemplatePath) -eq $true) 
    {
        Remove-Item -Path $dynamicTemplatePath -Force:$true -Confirm:$false
    }
}

function Get-DscStudioTemplate
{
    param(
        [Parameter(Mandatory = $false)]
        [String]
        $ModuleName,

        [Parameter(Mandatory = $false)]
        [String]
        $TemplateName
    )

    $getModuleParams = @{
        ListAvailable = $true
    }
    
    if ($PSBoundParameters.ContainsKey("ModuleName") -eq $true) 
    {
        $getModuleParams.Add("Name", $ModuleName)
    }
    $availableModules = Get-Module @getModuleParams

    $alltemplates = @()
    $availableModules | ForEach-Object -Process {
        $currentModule = $_
        $templatePath = Join-Path -Path $_.ModuleBase -ChildPath $script:TemplateFolderName
        if ((Test-Path -Path $templatePath) -eq $true)
        {
            Get-Childitem -Path $templatePath -Filter "*.json" | ForEach-Object -Process {
                $template = Get-Content -Raw -Path $_.FullName | ConvertFrom-Json
                if ($null -ne $template.metadata -and $null -ne $template.questions)
                {
                     $templateObject = New-Object -TypeName PSObject | 
                                        Add-Member -Name "Name" `
                                                   -Value $template.metadata.title `
                                                   -MemberType NoteProperty `
                                                   -PassThru |
                                        Add-Member -Name "ModuleName" `
                                                   -Value $currentModule.Name `
                                                   -MemberType NoteProperty `
                                                   -PassThru |
                                        Add-Member -Name "Description" `
                                                   -Value $template.metadata.description `
                                                   -MemberType NoteProperty `
                                                   -PassThru |
                                        Add-Member -Name "Path" `
                                                   -Value $_.FullName `
                                                   -MemberType NoteProperty `
                                                   -PassThru

                    $templateObject.PSObject.TypeNames.Insert(0, "Microsoft.PowerShell.DscStudio.TemplateInfo")
                    $alltemplates += $templateObject
                }
            }
        }
    }

    if ($PSBoundParameters.ContainsKey("TemplateName") -eq $true) 
    {
        return $alltemplates | Where-Object -FilterScript { $_.Name -like $TemplateName }
    }
    else 
    {
        return $alltemplates
    }
}

function New-DscStudioTemplate
{
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [String]
        $Title,

        [Parameter(Mandatory = $false)]
        [String]
        $Description,

        [Parameter(Mandatory = $false)]
        [String]
        $ConfigurationName = "DscStudioConfiguration",

        [Parameter(Mandatory = $true)]
        [String]
        $FilePath
    )

    $template = [string]::Empty
    function New-Line 
    {
        param($Text)
        $template = Get-Variable -Name "template" -Scope 1
        Set-Variable -Name "template" -Value ("$($template.Value)$Text$([System.Environment]::NewLine)") -Scope 1
    }

    New-Line -Text "{"
    New-Line -Text "    `"`$schema`": `"https://raw.githubusercontent.com/BrianFarnhill/DSCStudio/master/schema.json`","
    New-Line -Text "    `"metadata`": {"
    New-Line -Text "        `"title`": `"$Title`","
    if ($PSBoundParameters.ContainsKey("Description") -eq $true)
    {
        New-Line -Text "        `"description`": `"$Description`","
    }
    New-Line -Text "        `"configurationName`": `"$ConfigurationName`""
    New-Line -Text "    },"
    New-Line -Text "    `"dscModules`": ["
    New-Line -Text "    ],"
    New-Line -Text "    `"configDataSettings`": {"
    New-Line -Text "        `"certificateDetails`": true,"
    New-Line -Text "        `"nodeSettings`": []"
    New-Line -Text "    },"
    New-Line -Text "    `"questions`": ["
    New-Line -Text "    ],"
    New-Line -Text "    `"inputParameters`": ["
    New-Line -Text "    ],"
    New-Line -Text "    `"outputResources`": ["
    New-Line -Text "    ]"
    New-Line -Text "}"

    $template | Out-File -FilePath $FilePath -Append:$false -Force -Confirm:$false
}

Export-ModuleMember -Function *
