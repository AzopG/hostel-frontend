// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  let chromePath;
  try {
    const puppeteer = require('puppeteer');
    chromePath = puppeteer.executablePath();
    process.env.CHROME_BIN = chromePath;
    console.log('Using Puppeteer Chrome at:', chromePath);
  } catch (e) {
    console.log('Puppeteer not found, using system Chrome');
    chromePath = process.env.CHROME_BIN || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  }
  
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {
        // you can add configuration options for Jasmine here
        // the possible options are listed at https://jasmine.github.io/api/edge/Configuration.html
        // for example, you can disable the random execution order
        // random: false
      },
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    jasmineHtmlReporter: {
      suppressAll: true // removes the duplicated traces
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/frontend-app'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' },
        { type: 'lcovonly' }
      ],
      check: {
        global: {
          statements: 70,
          branches: 70,
          functions: 70,
          lines: 70
        }
      }
    },
    reporters: ['progress', 'kjhtml', 'coverage'],
    browsers: ['ChromeHeadlessNoSandbox'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox', 
          '--disable-web-security', 
          '--disable-gpu', 
          '--remote-debugging-port=9222',
          '--disable-dev-shm-usage'
        ]
      }
    },
    restartOnFileChange: true,
    singleRun: false,
    autoWatch: true
  });
};