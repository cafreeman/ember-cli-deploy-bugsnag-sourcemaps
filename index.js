'use strict';

const DeployPluginBase = require('ember-cli-deploy-plugin');
const { upload } = require('bugsnag-sourcemaps');

module.exports = {
  name: require('./package').name,

  createDeployPlugin(options) {
    console.log(options);
    const DeployPlugin = DeployPluginBase.extend({
      name: options.name,

      defaultConfig: {},

      requiredConfig: ['apiKey', 'appVersion'],

      willUpload(context) {
        // upload(
        //   {
        //     apiKey: 'YOUR_API_KEY_HERE',
        //     appVersion: version,
        //     minifiedUrl: 'http://your.doma.in/static/js/bundle.js',
        //     sourceMap: resolve(__dirname, '/static/js/bundle.js.map'),
        //     minifiedFile: resolve(__dirname, '/static/js/bundle.js'),
        //     overwrite: true
        //   },
        //   cb
        // );
      },

      upload(context) {
        return Promise.resolve({
          uploadedAt: Date.now()
        });
      }
    });

    return new DeployPlugin();
  }
};
