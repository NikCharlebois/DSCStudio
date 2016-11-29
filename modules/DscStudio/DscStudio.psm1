$script:TemplateFolderName = "DSCTemplates"

function Start-DscStudio
{
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true, ValueFromPipelineByPropertyName = $true)]
        [ValidateNotNullOrEmpty()]
        [String]
        $Path
    )

    Begin {
        $engineLaunched = $false
    }
    Process {
        if ($engineLaunched -eq $false) {
            $engineFolder = Join-Path -Path $PSScriptRoot -ChildPath "Engine"
            $enginePath = Join-Path -Path $engineFolder -ChildPath "index.htm"
            $dynamicTemplatePath = Join-Path -Path $engineFolder -ChildPath "scripts/dynamictemplate.js"

            $templateContent = Get-Content -Path $Path -Raw
            "var DynamicTemplate = " + $templateContent | Out-File -FilePath $dynamicTemplatePath -Append:$false -Force:$true -Encoding utf8

            Start-Process -FilePath $enginePath
            $engineLaunched = $true
        } else {
            Write-Warning -Message "Start-DscStudio is designed to take a single template through the pipeline. The additional template '$Path' has therefore been ignored."
        }
    }
}

function Reset-DscStudioDynamicTemplate
{
    $engineFolder = Join-Path -Path $PSScriptRoot -ChildPath "Engine"
    $dynamicTemplatePath = Join-Path -Path $engineFolder -ChildPath "scripts/dynamictemplate.js"
    if ((Test-Path -Path $dynamicTemplatePath) -eq $true) {
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
                if ($null -ne $template.metadata -and $null -ne $template.questions -and $null -ne $template.dscModules)
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

Export-ModuleMember -Function *
