Fuel SOAP Client (for Node.js) [![Build Status](https://travis-ci.org/salesforce-marketingcloud/FuelSDK-Node-SOAP.svg?branch=master)](https://travis-ci.org/salesforce-marketingcloud/FuelSDK-Node-SOAP)  [![Known Vulnerabilities](https://snyk.io/test/github/salesforce-marketingcloud/FuelSDK-Node-SOAP/badge.svg)](https://snyk.io/test/github/salesforce-marketingcloud/FuelSDK-Node-SOAP)
=============

***This repo used to be located at https://github.com/exacttarget/Fuel-Node-SOAP***

This library allows users access to the Salesforce Marketing Cloud (formerly ExactTarget) SOAP API at a low level.

```
npm install fuel-soap --save
```

## Docs & Examples

Our docs site is available [here](http://salesforce-marketingcloud.github.io/FuelSDK-Node-SOAP/)

Common examples:

1. [Setting up the client][3]
2. [Simple Retrieve][4]
3. [Business Unit Retrieve][5]
4. [Custom Headers][6]
5. [Upsert row to a Data Extension][7]
6. [Upsert Subscriber Record][8]
7. [Retrieve Subscriber Attributes][9]
8. [Retrieve Folder with Given Parent][10]
9. [Complex filter retrieving a folder with a given parent and name][11]
10. [Create Folder][12]
11. [Create Email][13]
12. [Retrieve Data Extension Object ID given a Customer Key][14]
13. [Create Email Send Definition][15]
14. [Perform/Send an Email Send Definition][16]


More in-depth examples can be found [here](https://github.com/salesforce-marketingcloud/FuelSDK-Node)

## Contributing

Please checkout our [`.jshintrc`][2] file and follow the linting rules when contributing. In addition, this project uses **tabs** not spaces.

## ChangeLog

* **releases after v1 will have their notes in the 'releases' section**
* **1.0.0** - 2014-11-13
    * add original response to the callback - *breaking*
    * initial unit tests
* **0.1.0** - 2014-09-22 - 1st npm release

[1]: https://github.com/salesforcefuel/FuelSDK-Node-Auth/wiki/Initialization
[2]: https://github.com/salesforcefuel/FuelSDK-Node-SOAP/blob/master/.jshintrc
[3]: https://gist.github.com/vernak2539/8babcdd13b80d632dd12#file-1_setup-js
[4]: https://gist.github.com/vernak2539/8babcdd13b80d632dd12#file-2_simple-retrieve-js
[5]: https://gist.github.com/vernak2539/8babcdd13b80d632dd12#file-3_business-unit-retrieve-js
[6]: https://gist.github.com/vernak2539/a1b5c6e36f6c7f1fe63b
[7]: https://gist.github.com/angrycider/02e858fd013144e1bab3b422f7dad72e
[8]: https://gist.github.com/angrycider/f8377566cb8846b1842da15786b7fd59
[9]: https://gist.github.com/angrycider/ce1d4e3a95dbd67c4c83176c04d08036
[10]: https://gist.github.com/angrycider/cef64f6d5081bad90625747bb622386e
[11]: https://gist.github.com/angrycider/0bb7f244784666d6d0713264d7e60db4
[12]: https://gist.github.com/angrycider/b5369270b48eea2b6d225aa75797c779
[13]: https://gist.github.com/angrycider/ee39a7a87454201ea469108104b6f0e0
[14]: https://gist.github.com/angrycider/47a2727e274ef87632c115b333aeb473
[15]: https://gist.github.com/angrycider/62ffa5285d7399b2fbaa8d63989c64c0
[16]: https://gist.github.com/angrycider/ca45209fcad89ae3f71e7119680f24ef
