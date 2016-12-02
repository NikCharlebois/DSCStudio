# DSC Studio

[![Build status](https://ci.appveyor.com/api/projects/status/3ph2f2fy98kt12pt/branch/master?svg=true)](https://ci.appveyor.com/project/BrianFarnhill/dscstudio/branch/master)

DSC Studio is a tool that is designed to let you generate PowerShell DSC
configurations based on templates.

The project is under development, so please feel free to raise any issues
in the [issues](http://github.com/BrianFarnhill/DscStudio/issues) section
of the GitHub repo. Further documentation on all elements of the project
will be added over the coming weeks, so please bear with us while this is
worked on.

## Consuming dev builds of the module

If you do not wish to develop or contribute to the main engine of DSC Studio
you can still download compiled versions of the module for testing. This will
require that PowerShell 5 has been installed on your machine. Begin by adding
the test repository to your local machine with the following command:

    Register-PSRepository -Name DscStudioDev -SourceLocation https://ci.appveyor.com/nuget/dscstudio-preview

Once this has been run you can install the latest preview build by running
the following command:

    Find-Module DscStudio -Repository DscStudioDev | Install-Module

This installs the current preview version of the module locally so that you
can begin creating templates and testing the outputs of the main DSC Studio
engine.

## Development of the DSC Studio engine

If you are looking to download the full code base to develop the DSC Studio
engine you will need to install [Node.js](https://nodejs.org/en/). Then when
you have this repo cloned run the following commands to set up the development
environment:

    npm install

This will download all required dependencies. To run the local site in the
development engine, run the start command:

    npm start

This will load up the engine in development mode, allowing you to select a
template and begin. All source files will be loaded directly from the "src"
directory in this case, allowing for quick editing and testing.

To build a release version of the module that you can then test with the
included PowerShell cmdlets, run the following command.

    npm run build

This will generate the module in the "modules/DscStudio" directory in a form
that is ready to use. This is the equivillent of the builds that are published
through the preview repository mentioned above.
