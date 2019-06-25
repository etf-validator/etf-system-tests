const assert = require('assert');

const PORT = 80;

//server.listen(PORT);

const URL = `http://staging-inspire-validator.eu-west-1.elasticbeanstalk.com:${PORT}/etf-webapp`;

module.exports = {

  'Display and Hide Test Suite information': (browser) => {
    browser
      .url(URL)
      .assert.cssClassPresent('.ii-collapsible-li', 'ui-collapsible-collapsed')
      .click('.ui-collapsible-heading-toggle.ui-btn.ui-btn-icon-left.ui-btn-inherit.ui-icon-plus')
      .assert.visible('.ui-collapsible-content.ui-body-inherit')
      .click('.ui-collapsible-heading-toggle.ui-btn.ui-btn-icon-left.ui-btn-inherit.ui-icon-minus')
      .assert.hidden('.ui-collapsible-content.ui-body-inherit');
  },

  'Select and deselect test suite': (browser) => {
    browser
      .url(URL)
      .assert.cssClassNotPresent('.ui-flipswitch', 'ui-flipswitch-active')
      .click('.ui-flipswitch')
      .assert.visible('#fadin-start-tests-button')
      .click('.ui-flipswitch')
      .assert.hidden('#fadin-start-tests-button');
  },

  'Change to TestReports tab': (browser) => {
    browser
      .url(URL)
      .click(".ui-block-c")
      .assert.visible("#test-reports-page")
      .assert.hidden("#start-tests-page")
  },
};