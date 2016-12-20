configuration TestConfig1
{
    $DscStudio = $ConfigurationData.NonNodeData.DscStudio

    node $AllNodes.NodeName
    {
        # This is a dummy config
    }
}
