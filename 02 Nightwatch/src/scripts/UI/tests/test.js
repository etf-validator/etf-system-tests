const assert = require('assert');
const uuid = require('uuid');

const URL = `http://cicd03/etf-webapp`;
const testRunLabel = "Automated Test " + uuid();

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

  "Get ExecutableTestSuite ID": function(client) {
    var apiUrl = URL + '/v2/ExecutableTestSuites.json?offset=0&limit=500&fields=id%sClabel';
    client.apiGet(apiUrl, function(response) {
      var jsonResponse = JSON.parse(response.body);
      console.log(jsonResponse);
      if (jsonResponse.EtfItemCollection.returnedItems > 0) {
        jsonResponse.EtfItemCollection.executableTestSuites.ExecutableTestSuite.forEach(function(ts, index) {
          if (ts.label == 'WFS 2.0 (OGC 09-025r2/ISO 19142) Conformance Test Suite') {
            testSuiteId = ts.id;
            console.log('TestSuite ID: ' + testSuiteId);
          }
        });
      }
      client.assert.equal(response.statusCode, 200, "200 OK");
      client.end();
    });
  },

  "Create new TestRun": function(client) {
    var apiUrl = URL + '/v2/TestRuns';
    var postData = {
      "label": testRunLabel,
      "executableTestSuiteIds": [testSuiteId],
      "arguments": {},
      "testObject": {
        "resources": {
          "serviceEndpoint": "http://www.juntadeandalucia.es/fomentoyvivienda/IDE/laboratorioscalidad/servicios/wms?service=WFS&amp;request=GetCapabilities"
        }
      }
    };
    var postHeader = {
      "Content-Type": "application/json",
      "Accept": "application/json"
    };
    client.apiPost(apiUrl, postData, postHeader, undefined, function(response) {
      console.log(response.body);
      testRunId = response.body.EtfItemCollection.testRuns.TestRun.id;
      console.log("TestRun ID: " + testRunId);
      client.assert.equal(response.statusCode, 201, "201 OK");
      client.end();
    });
  },

  "Re-run test": (browser) => {
    browser
      .url(URL)
      .waitForElementVisible(".ui-block-c")
      .click(".ui-block-c")
      .waitForElementVisible('#test-reports-page', 10000)
      .assert.visible('#test-reports-page')
      .assert.hidden('#start-tests-page')
      .useXpath()
      .waitForElementPresent('//a[contains(.,\'' + testRunLabel + '\')]', 10000)
      .click('xpath', '//a[contains(.,\'' + testRunLabel + '\')]')
      .waitForElementPresent('//a[contains(.,\'Run test again\')]', 10000)
      .click('xpath', '//a[contains(.,\'Run test again\')]')
      .waitForElementVisible('//label[contains(.,\'All details\')]', 20000)
      .click('xpath', '//label[contains(.,\'All details\')]')
      .waitForElementVisible('//tr[td[contains(.,\'Log URI\')]]/td[2]/a', 10000)
      .click('xpath', '//tr[td[contains(.,\'Log URI\')]]/td[2]/a')
      .waitForElementVisible('/html/body/pre[not(contains(.,\'NullPointerException\'))]', 10000)
  },
};
