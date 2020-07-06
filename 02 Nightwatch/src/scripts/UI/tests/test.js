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

  'Re-run test': (browser) => {
    browser
      .url(URL)
      .waitForElementVisible(".ui-block-c")
      .click(".ui-block-c")
      .waitForElementVisible('#test-reports-page',10000)
      .assert.visible('#test-reports-page')
      .assert.hidden('#start-tests-page')
      .useXpath()
      .click('xpath','/html/body/div[4]/div[2]/ul/li[2]/h2/a')
      .waitForElementPresent('/html/body/div[4]/div[2]/ul/li[2]/div/div/div[2]/a[5]',10000)
      .click('xpath','/html/body/div[4]/div[2]/ul/li[2]/div/div/div[2]/a[5]')
      .waitForElementVisible('/html/body/div[12]/div[2]/div[1]/div[3]/div/fieldset[1]/div[2]/div[1]/label',20000)
      .click('xpath','/html/body/div[12]/div[2]/div[1]/div[3]/div/fieldset[1]/div[2]/div[1]/label')
      .waitForElementVisible('/html/body/div[12]/div[2]/div[1]/div[1]/div/table/tbody/tr[6]/td[2]/a',10000)
      .click('xpath','/html/body/div[12]/div[2]/div[1]/div[1]/div/table/tbody/tr[6]/td[2]/a')
      .waitForElementVisible('/html/body/pre',10000)
      .assert.not.containsText('/html/body/pre','NullPointerException')
  },
};