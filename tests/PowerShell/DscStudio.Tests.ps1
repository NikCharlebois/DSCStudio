Import-Module -Name (Join-Path -Path $PSScriptRoot -ChildPath "..\..\Modules\DSCStudio\DSCStudio.psm1" -Resolve) -Force

$global:ScriptRoot = $PSScriptRoot

Describe -Name "DSC Studio Tests" -Fixture {
    InModuleScope -ModuleName "DSCStudio" -ScriptBlock {
        Context -Name "Get-DscStudioTemplate" -Fixture {

            Mock -CommandName "Get-Module" -MockWith {
                return @(
                    @{
                        ModuleBase = "C:\modules\TestModule1"
                        Name = "TestModule1"
                    },
                    @{
                        ModuleBase = "C:\modules\TestModule2"
                        Name = "TestModule2"
                    }
                )
            }

            Mock -CommandName "Get-Content" `
                 -ParameterFilter { $Path -like "C:\modules\testmodule*" } `
                 -MockWith {
                $filename = Split-Path -Path $Path -Leaf
                return Get-Content -Path (Join-Path -Path $global:ScriptRoot -ChildPath "TestTemplates\$filename") -Raw
            }

            It "Should return null when no templates can be found in any modules" {
                Mock -CommandName "Test-Path" -MockWith { return $false }

                Get-DscStudioTemplate | Should BeNullOrEmpty
            }

            Mock -CommandName "Test-Path" -MockWith { return $true }

            It "Should return a single template from a module that contains one" {
                Mock -CommandName "Get-Childitem" -ParameterFilter { $Path -like "*TestModule1*" } -MockWith {
                    return @(
                        @{
                            FullName = "C:\modules\TestModule1\DSCTemplates\test1.json"
                        }
                    )
                }
                Mock -CommandName "Get-Childitem" -ParameterFilter { $Path -like "*TestModule2*" } -MockWith { return @() }

                Get-DscStudioTemplate | Should Not BeNullOrEmpty
            }

            It "Should return multiple templates from the same module if they exist" {
                Mock -CommandName "Get-Childitem" -ParameterFilter { $Path -like "*TestModule1*" } -MockWith {
                    return @(
                        @{
                            FullName = "C:\modules\TestModule1\DSCTemplates\test1.json"
                        },
                        @{
                            FullName = "C:\modules\TestModule1\DSCTemplates\test2.json"
                        }
                    )
                }
                Mock -CommandName "Get-Childitem" -ParameterFilter { $Path -like "*TestModule2*" } -MockWith { return @() }

                (Get-DscStudioTemplate).Length | Should Be 2
            }

            It "Should return templates from multiple modules where they exist" {
                Mock -CommandName "Get-Childitem" -ParameterFilter { $Path -like "*TestModule1*" } -MockWith {
                    return @(
                        @{
                            FullName = "C:\modules\TestModule1\DSCTemplates\test1.json"
                        }
                    )
                }
                Mock -CommandName "Get-Childitem" -ParameterFilter { $Path -like "*TestModule2*" } -MockWith {
                    return @(
                        @{
                            FullName = "C:\modules\TestModule2\DSCTemplates\test2.json"
                        }
                    )
                }

                $result = Get-DscStudioTemplate
                $result[0].ModuleName | Should Not Be $result[1].ModuleName
            }

            It "Should only return templates from a specified module if the module name is given" {
                Mock -CommandName "Get-Module" -MockWith {
                    return @(
                        @{
                            ModuleBase = "C:\modules\TestModule1"
                            Name = "TestModule1"
                        }
                    )
                }
                
                Mock -CommandName "Get-Childitem" -ParameterFilter { $Path -like "*TestModule1*" } -MockWith {
                    return @(
                        @{
                            FullName = "C:\modules\TestModule1\DSCTemplates\test1.json"
                        }
                    )
                }
                Mock -CommandName "Get-Childitem" -ParameterFilter { $Path -like "*TestModule2*" } -MockWith {
                    return @(
                        @{
                            FullName = "C:\modules\TestModule2\DSCTemplates\test2.json"
                        }
                    )
                }

                (Get-DscStudioTemplate -ModuleName "TestModule1").ModuleName | Should Be "TestModule1"
            }   

            It "Should only return templates that match a name pattern if it is provided" {
                Mock -CommandName "Get-Module" -MockWith {
                    return @(
                        @{
                            ModuleBase = "C:\modules\TestModule1"
                            Name = "TestModule1"
                        },
                        @{
                            ModuleBase = "C:\modules\TestModule2"
                            Name = "TestModule2"
                        }
                    )
                }
                
                Mock -CommandName "Get-Childitem" -ParameterFilter { $Path -like "*TestModule1*" } -MockWith {
                    return @(
                        @{
                            FullName = "C:\modules\TestModule1\DSCTemplates\test1.json"
                        }
                    )
                }
                Mock -CommandName "Get-Childitem" -ParameterFilter { $Path -like "*TestModule2*" } -MockWith {
                    return @(
                        @{
                            FullName = "C:\modules\TestModule2\DSCTemplates\test2.json"
                        }
                    )
                }

                (Get-DscStudioTemplate -TemplateName "Test*").Length | Should Be 2
            }

            It "Should return templates with a specific name match if name is provided" {
                Mock -CommandName "Get-Module" -MockWith {
                    return @(
                        @{
                            ModuleBase = "C:\modules\TestModule1"
                            Name = "TestModule1"
                        },
                        @{
                            ModuleBase = "C:\modules\TestModule2"
                            Name = "TestModule2"
                        }
                    )
                }
                
                Mock -CommandName "Get-Childitem" -ParameterFilter { $Path -like "*TestModule1*" } -MockWith {
                    return @(
                        @{
                            FullName = "C:\modules\TestModule1\DSCTemplates\test1.json"
                        }
                    )
                }
                Mock -CommandName "Get-Childitem" -ParameterFilter { $Path -like "*TestModule2*" } -MockWith {
                    return @(
                        @{
                            FullName = "C:\modules\TestModule2\DSCTemplates\test2.json"
                        }
                    )
                }

                Get-DscStudioTemplate -TemplateName "Test 1" | Should Not BeNullOrEmpty
            }
        }

        Context -Name "Start-DscStudio" -Fixture {

            Mock -CommandName "Start-Process" -MockWith {}
            Mock -CommandName "Remove-Item" -MockWith {}
            Mock -CommandName "Out-File" -MockWith {}
            Mock -CommandName "Write-Warning" -MockWith {}

            Mock -CommandName "Get-Content" -ParameterFilter { $Path -like "C:\test*" } -MockWith {
                $filename = Split-Path -Path $Path -Leaf
                return Get-Content -Path (Join-Path -Path $global:ScriptRoot -ChildPath "TestTemplates\$filename") -Raw
            }

            It "Should run without any config specified" {
                Start-DscStudio
                Assert-MockCalled Out-File -Times 0
                Assert-MockCalled Start-Process
            }

            It "Should run with a single config" {
                Start-DscStudio -Path "C:\test\test1.json"
                Assert-MockCalled Out-File
                Assert-MockCalled Start-Process
            }
            
            It "Should run with the first config only when more than one is piped to it" {
                $a = New-Object -Type PSCustomObject -Property @{Path = "C:\test\test1.json"}
                $b = New-Object -Type PSCustomObject -Property @{Path = "C:\test\test2.json"}
                @($a, $b) | Start-DscStudio
                Assert-MockCalled Out-File
                Assert-MockCalled Start-Process
                Assert-MockCalled Write-Warning
            }
        }

        Context -Name "Reset-DscStudioDynamicTemplate" -Fixture {

            Mock -CommandName "Remove-Item" -MockWith {}
            
            It "Removes an existing template when it exists" {
                Mock -CommandName "Test-Path" -MockWith { return $true }
                Reset-DscStudioDynamicTemplate
                Assert-MockCalled -CommandName "Remove-Item" -Times 1
            }

            It "Does not remove anything when the template doesn't exist" {
                Mock -CommandName "Test-Path" -MockWith { return $false }
                Reset-DscStudioDynamicTemplate
                Assert-MockCalled -CommandName "Remove-Item" -Times 1
            }                
        }

        Context -Name "New-DscStudioTemplate" -Fixture {
            
            Mock -CommandName "Out-File" -MockWith {}

            It "New templates get generated without error" {
                New-DscStudioTemplate -Title "test" -Description "test" -FilePath "C:\test.json"
                Assert-MockCalled -CommandName "Out-File" -Times 1
            }
        }
    }
}
