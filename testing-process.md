# Testing process

## Objectives

This document explains the relevant tools and procedures to create an automated pipeline for the continuous integration of ETF and ETS developments, in order to:

* Carry out ETS testing through ETF build
	* Ensure that new and existing Test Suites follow the INSPIRE Technical Guidelines
	* Detect bugs and code malfunction in corner cases
* Maintain a quality control for ETF developments
	* Regression testing of new developments
	* Code quality

_____________________________________

## Tools

The proposed tools for quality control and continuos integration are presented in the following. Some of them are used for management purposes, while other are integrated in the automated workflow.


### TestLink

[TestLink](http://testlink.org/) is a  Web-based test management system for definition of test plans. Using this tool, a set of test steps can be defined for manual developments such as visual improvements on the ETF, user experience reviews, references to the INSPIRE Technical Guidelines, etc.

### JUnit

[JUnit](https://junit.org/junit5/) is a Regression Testing Framework to implement unit testing in Java applications. A number of assertions can be defined for each method present on the classes in the source code, setting all the possible inputs and the expected outputs for them. The ETF currently includes unit tests for the existing methods, which are run everytime the application is built before generating the WAR file. If the unit tests fail, then the building process is aborted.

### SonarQube

[SonarQube](https://www.sonarqube.org/) provides measures of code quality, ensuring that good programming practices are adopted. It can be used as a tool to ensure that new developments maintain a good quality and do not muddle up the existing code. Also, the analysis of the reports can end up generating new improvements proposals.

### Jenkins

[Jenkins](https://jenkins.io/) allows continuous integration with support for Version Control System. Jobs can be defined on Jenkins to periodically download the whole source code on a VCS repository (for example, GitHub), build the application using Maven or Gradle as a dependency manager, generate code quality reports using SonarQube, and publish the application directly on a server.

### Docker

[Docker](https://www.docker.com/) is a software platform that allows to build, test, and deploy applications quickly. Docker packages software into standardized units called containers that include everything the software needs to run including libraries, system tools, code, and runtime. Using Docker, it is possible to quickly deploy and scale applications into any environment and know that the code will run. These containers can be also run on cloud platforms such as AWS.

### NightwatchJS

[NightwatchJS](http://nightwatchjs.org) is a Javascript library allowing developers to define a set of test cases to run against various WebDriver browsers, such as Chrome, Firefox or Edge. The tests are written in a Javascript-like syntax, letting the user select elements with CSS selectors or XPath expressions. Actions can be defined to abe applied on these elements, e.g. clicking them. Finally, assertions can be defined over the content, HTML attributes or applied styles. This tool generates XML reports that are compatible with the JUnit report format, that can be taken by Jenkins and checked automatically for failures.

_____________________________________


## Testing approach

When developing a complete test plan, two types of tests must be covered: manual tests and automated tests.

Manual testing is performed every time a human intervention is required: interpreting a text message, checking visual styles, interacting with the application, etc. Since manual testing is time consuming, it should be avoided every time there are tasks which always follow the same steps and whose desired results are known beforehand. These tests can be automated. The following technical approach includes both manual and automated tests for the ETS and ETF development.

### ETS testing plan

For the Test Suites, a manual test plan should be developed using TestLink. It consists of a series of steps to follow when reviewing a new ETS, including:

* Text tags to review
* Correct reference to the INSPIRE Technical Guidelines
* Content of test reports

Regarding the automated pipeline, ETS developers should create testing scripts to check the responses of the application. A proposal for this is the following:

* For each Test Suite reflected on the INSPIRE Technical Guidelines, a repository of test data should be created. This data should include known errors, represent corner cases and have predefined values of the expected results for all the assertions defined on the ETS, as an XML, CSV or JSON file.
* Using an ETF deployment with these ETS loaded, a series of calls to the ETF API should be executed to run the test using test data as input
* A comparison script should be run to check the test result XML against the expected results for each assertion on the ETS

### ETF testing plan

The ETF testing plan should also include manual tests and automated tests. The aspects that manual tests should cover vary depending on the character of the feature developed. Mainly, they apply to visual enhancements and additional components, to check if the development covers everything listed on the EIP.

However, there should be a list of general items to review everytime there is a new update on the validator:

* Navigability: all the components should be accessible from their corresponding section, without server errors
* Style: the change should not break the existing styles defined in the HTML / CSS
* Text errors: there should be no errors on the texts, and they should be translated correctly

Regarding the automated tests, the tests already defined in JUnit can serve as a baseline for new unit tests. Each EIP resulting in a source code update on the ETF should also include all the necessary unit tests for each new method defined, and a revision of each unit test that apply to each updated method, to check if it still covers all the test cases. These unit tests would be applied on the Gradle building script when compiling the application. When developing new UI improvements, a set of Nightwatch tests should be developed, describing the workflow of the application in the execution of the new component.

Along with the unit testing, a set of metrics should be defined on SonarQube to monitor the quality of the source code. Some of the most common issues which are identified include: complexity of the code, code smells (bad design patterns), vulnerabilities, etc. Rules can also be established, to generate issues that should be addressed: automatic detection of bugs, correction of code smells, etc.
Finally, quality gates can be set to determine if the code passes the accepted threshold of metrics and rules compliance.

_____________________________________


## Continous integration and delivery workflow

With the test plan ready, a pipeline for automatically integrating all the new updates, building the application, applying the automated tests and publishing the application can be created. The core piece of this pipeline is Jenkins, which acts as an orchestrator for each step of the cycle.

A workflow for continuous testing and integration is proposed as follows:

* A _latest_ branch is created for each GitHub repository for ETF components, and for the ETF webapp as well.
* Several Jenkins jobs are setup to build each ETF component, and deploy them on an artifact repositoy such as [Sonatype Nexus](https://www.sonatype.com/nexus-repository-sonatype). This building process includes all the JUnit testing for the methods of each component.
* Another Jenkins job executes the ETF webapp integration, using the Gradle scripts included in the ETF source code to build all the components:
    * Pass the unit tests defined for the Java methods
    * Pass the NightWatch tests
    * Generate a SonarQube report and check the quality gates defined
    * If all these steps are successful, generate a WAR file with the webapp
* Using this WAR file Jenkins creates a Docker container, downloads the ETS repository along with the test data, and loads them on the validator; then it runs the test scripts to check if the Test Suites are aligned with the test data.
* If the previous scripts are successful, use the Elastic Beanstalk command line interpeter to deploy this container to an AWS test instance.

Once the application is deployed on AWS, manual tests can also be run to check all the open issues that are pending on testing. If all manual tests are passed, then a Pull Request can be created to add the developed features on the _next_ branch.

The workflow is summarized as follows:

![workflow](/images/testing-workflow.png)