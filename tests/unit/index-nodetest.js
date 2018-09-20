const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const expect = chai.expect;

const stubProject = {
  name() {
    return 'ember-cli-deploy-bugsnag-sourcemaps';
  }
};

describe('ember-cli-deploy-bugsnag-sourcemaps', function() {
  let subject, mockUi;

  beforeEach(function() {
    subject = require('../../index');
    mockUi = {
      verbose: true,
      messages: [],
      write() {},
      writeLine(message) {
        this.messages.push(message);
      }
    };
  });

  it('has a name', function() {
    let result = subject.createDeployPlugin({
      name: 'test-plugin'
    });

    expect(result.name).to.equal('test-plugin');
  });

  describe('hook', function() {
    let plugin, context;

    it('calls the hook', function() {
      plugin = subject.createDeployPlugin({ name: 'test-plugin' });

      context = {
        ui: mockUi,
        project: stubProject,
        config: {
          'test-plugin': {
            pluginClient() {
              return {
                upload(context) {
                  console.log(context);
                  return Promise.resolve();
                }
              };
            }
          }
        }
      };

      return expect(plugin.upload(context)).to.be.fulfilled;
    });
  });
});
