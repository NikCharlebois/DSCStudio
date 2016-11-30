Import-Module -Name (Join-Path -Path $PSScriptRoot -ChildPath "..\..\Modules\DSCStudio\DSCStudio.psm1" -Resolve)

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
    }
}
