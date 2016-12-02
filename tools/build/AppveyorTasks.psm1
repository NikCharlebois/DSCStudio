function Start-InstallTasks
{
    [CmdletBinding()]
    param()

    Install-PackageProvider -Name NuGet -MinimumVersion 2.8.5.201 -Force
    Install-Module -Name Pester -Force  

    Start-Process -Wait -FilePath "git" -ArgumentList @(
        "clone",
        "-q",
        "https://github.com/PowerShell/DscResources",
        (Join-Path -Path $env:APPVEYOR_BUILD_FOLDER -ChildPath "DscResources")
    )
    Start-Process -Wait -FilePath "git" -ArgumentList @(
        "clone",
        "-q",
        "https://github.com/PowerShell/DscResource.Tests",
        (Join-Path -Path $env:APPVEYOR_BUILD_FOLDER `
                   -ChildPath "DscResource.Tests")
    )

    $testHelperPath = Join-Path -Path $env:APPVEYOR_BUILD_FOLDER `
                                -ChildPath "DscResource.Tests\TestHelper.psm1"
    Import-Module -Name $testHelperPath -Force
}

function Start-TestTasks
{
    [CmdletBinding()]
    param()

    $jsTests = Start-Process -FilePath "$env:APPVEYOR_BUILD_FOLDER\node_modules\.bin\mocha" `
                             -ArgumentList @(
                                "Tests\JavaScript", 
                                "--reporter", "mocha-junit-reporter", 
                                "--reporter-options", "mochaFile=mocharesults.xml") `
                             -Wait -PassThru

    $wc = New-Object 'System.Net.WebClient'
    $wc.UploadFile("https://ci.appveyor.com/api/testresults/junit/$($env:APPVEYOR_JOB_ID)", `
                   (Resolve-Path .\mocharesults.xml))

    $testResultsFile = ".\TestsResults.xml"
    $testsPath = Join-Path -Path $env:APPVEYOR_BUILD_FOLDER `
                            -ChildPath "Tests\PowerShell"
    $testCoverageFiles = @()
    Get-ChildItem "$env:APPVEYOR_BUILD_FOLDER\modules\DSCStudio\*.psm1" -Recurse | ForEach-Object -Process { 
        $testCoverageFiles += $_.FullName    
    } 
    $result = Invoke-Pester -Path $testsPath -CodeCoverage $testCoverageFiles -OutputFormat "NUnitXml" -OutputFile $testResultsFile -PassThru

    $testResultsFilePath = Resolve-Path -Path $testResultsFile
    $webClient = New-Object -TypeName "System.Net.WebClient"
    $webClient.UploadFile("https://ci.appveyor.com/api/testresults/nunit/$($env:APPVEYOR_JOB_ID)", 
                            $testResultsFilePath)

    if ($result.FailedCount -gt 0) 
    { 
        throw "$($result.FailedCount) tests failed."
    }
}

function Start-PackageTasks
{
    [CmdletBinding()]
    param()

    # Import so we can create zip files
    Add-Type -assemblyname System.IO.Compression.FileSystem

    $mainModulePath = Join-Path -Path $env:APPVEYOR_BUILD_FOLDER -ChildPath "modules\DscStudio"

    # Remove the readme files that are used to generate documentation so they aren't shipped
    $readmePaths = "$env:APPVEYOR_BUILD_FOLDER\Modules\**\readme.md"
    Get-ChildItem -Path $readmePaths -Recurse | Remove-Item -Confirm:$false

    # Add the appropriate build number to the manifest and zip/publish everything to appveyor
    $manifest = Join-Path -Path $env:APPVEYOR_BUILD_FOLDER -ChildPath "modules\DSCStudio\DSCStudio.psd1"
    (Get-Content $manifest -Raw).Replace("0.1.0.0", $env:APPVEYOR_BUILD_VERSION) | Out-File $manifest
    $zipFileName = "DscStudio_$($env:APPVEYOR_BUILD_VERSION).zip"
    [System.IO.Compression.ZipFile]::CreateFromDirectory($mainModulePath, "$env:APPVEYOR_BUILD_FOLDER\$zipFileName")
    New-DscChecksum -Path $env:APPVEYOR_BUILD_FOLDER -Outpath $env:APPVEYOR_BUILD_FOLDER
    Get-ChildItem -Path "$env:APPVEYOR_BUILD_FOLDER\$zipFileName" | ForEach-Object -Process { 
        Push-AppveyorArtifact $_.FullName -FileName $_.Name 
    }
    Get-ChildItem -Path "$env:APPVEYOR_BUILD_FOLDER\$zipFileName.checksum" | ForEach-Object -Process { 
        Push-AppveyorArtifact $_.FullName -FileName $_.Name 
    }

    Set-Location -Path $mainModulePath
    $nuspecParams = @{
        packageName = "DscStudio"
        version = $env:APPVEYOR_BUILD_VERSION
        author = "Microsoft"
        owners = "Microsoft"
        licenseUrl = "https://github.com/PowerShell/DSCStudio/blob/master/LICENSE"
        projectUrl = "https://github.com/$($env:APPVEYOR_REPO_NAME)"
        packageDescription = "DscStudio"
        tags = "DesiredStateConfiguration DSC"
        destinationPath = "."
    }
    New-Nuspec @nuspecParams

    Start-Process -FilePath "nuget" -Wait -ArgumentList @(
        "pack",
        ".\DscStudio.nuspec",
        "-outputdirectory $env:APPVEYOR_BUILD_FOLDER"
    )
    $nuGetPackageName = "DscStudio." + $env:APPVEYOR_BUILD_VERSION + ".nupkg"
    Get-ChildItem "$env:APPVEYOR_BUILD_FOLDER\$nuGetPackageName" | ForEach-Object -Process { 
        Push-AppveyorArtifact $_.FullName -FileName $_.Name 
    }
}

Export-ModuleMember -Function *
