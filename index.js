'use strict';

const path = require('path');
// const { URL } = require('url');
const DeployPluginBase = require('ember-cli-deploy-plugin');
const { upload: bugsnagUpload } = require('bugsnag-sourcemaps');
const RSVP = require('rsvp');

function removeFingerprint(file) {
  let re = /-[a-f0-9]+(?=\.(?:js|map)$)/;

  return file.replace(re, '');
}

module.exports = {
  name: require('./package').name,

  createDeployPlugin(options) {
    const DeployPlugin = DeployPluginBase.extend({
      name: options.name,

      defaultConfig: {
        bugsnagUpload() {
          return bugsnagUpload;
        },
        distDir(context) {
          return context.distDir;
        },
        distFiles(context) {
          return context.distFiles;
        },
        revisionKey(context) {
          if (context.revisionData) {
            return context.revisionData.revisionKey;
          }
        },

        includeAppVersion: true,
        overwrite: false
      },

      requiredConfig: ['apiKey', 'publicUrl'],

      upload() {
        let apiKey = this.readConfig('apiKey');
        let publicUrl = this.readConfig('publicUrl');
        let overwrite = this.readConfig('overwrite');
        let distDir = this.readConfig('distDir');
        let distFiles = this.readConfig('distFiles');
        let bugsnagUpload = this.readConfig('bugsnagUpload');
        let version = this.readConfig('revisionKey');

        let fileNames = this._formatFileNames(distFiles);
        let files = this._findFiles(fileNames);
        this.log(files);

        let uploads = files.map(({ js, map }) => {
          return bugsnagUpload({
            apiKey,
            appVersion: version,
            minifiedUrl: publicUrl + path.join('assets', js),
            // minifiedUrl: new URL(path.join('assets', js), publicUrl),
            sourceMap: path.join(distDir, 'assets', map),
            minifiedFile: path.join(distDir, 'assets', js),
            overwrite
          });
        });

        return RSVP.all(uploads);
      },

      _formatFileNames(files) {
        return files.map(file => {
          let base = path.basename(file);
          return base;
        });
      },

      _findFiles(files) {
        let sourceMaps = this._findSourceMaps(files).map(removeFingerprint);

        return sourceMaps.reduce((pairs, sourceMap) => {
          let { name } = path.parse(sourceMap);

          let maybeMatch = files.find(f => {
            let re = new RegExp(name + '-[a-f0-9]+\\.js$');
            return re.test(f);
          });

          if (maybeMatch) {
            let v = {
              js: maybeMatch,
              map: sourceMap
            };

            pairs.push(v);
          }

          return pairs;
        }, []);
      },

      _findSourceMaps(files) {
        return files.filter(file => {
          return path.extname(file) === '.map';
        });
      }
    });

    return new DeployPlugin();
  }
};
