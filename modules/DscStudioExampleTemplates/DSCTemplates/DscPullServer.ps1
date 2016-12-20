configuration DscPullServer
{
    Import-DscResource -ModuleName PSDesiredStateConfiguration
    Import-DscResource -ModuleName xPSDesiredStateConfiguration

    $DscStudio = $ConfigurationData.NonNodeData.DscStudio

    node $AllNodes.NodeName
    {
        WindowsFeature DSCServiceFeature
        {
            Ensure = "Present"
            Name = "DSC-Service"
        }

        xDSCWebService PSDSCPullServer
        {
            Ensure = "Present"
            EndpointName = "PSDSCPullServer"
            Port = 8080
            PhysicalPath = $DscStudio.SitePath
            CertificateThumbPrint = $DscStudio.CertThumbprint
            ModulePath = $DscStudio.ModulePath
            ConfigurationPath = $DscStudio.ConfigurationPath
            State = "Started"
            UseSecurityBestPractices = $true
            DependsOn = "[WindowsFeature]DSCServiceFeature"
        }
    }
}
