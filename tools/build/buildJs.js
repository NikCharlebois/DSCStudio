// Builds the JavaScript bundle for the production version of the code. 
// Note that there is no build script provided for development as the 
// build is handled in memory using webpack middleware (to save time 
// writing to file).
//
// Build settings and plugins are configured in the webpack.config.prod 
// file.
import webpack from 'webpack';
import config from './webpack.config.dist';

/* eslint-disable no-console */

process.env.NODE_ENV = 'production'; // Ensure that all of the babel dev config is not applied to the production version of the code

console.log('Generating Production JavaScript Bundle...');

webpack(config).run((err, stats) => {
    if (err) {
        console.log(`Error: ${err}`);
        return 1;
    }

    const jsonStats = stats.toJson();

    if (jsonStats.hasErrors) {
        return jsonStats.errors.map(error => console.log(error.red));
    }

    if (jsonStats.hasWarnings) {
        console.log('Webpack generated the following warnings: ');
        jsonStats.warnings.map(warning => console.log(warning));
    }

    console.log(`The app has been bundled in production mode and written to ${config.output.path}.`);

    return 0;
});
