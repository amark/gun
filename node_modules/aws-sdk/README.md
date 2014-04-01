# AWS SDK for JavaScript [![Version](https://badge.fury.io/js/aws-sdk.png)](http://badge.fury.io/js/aws-sdk) [![Build Status](https://travis-ci.org/aws/aws-sdk-js.png?branch=master)](https://travis-ci.org/aws/aws-sdk-js)

The official AWS SDK for JavaScript, available for browsers and mobile devices,
or Node.js backends

Release notes can be found at http://aws.amazon.com/releasenotes/SDK/JavaScript

## Installing

### In the Browser

To use the SDK in the browser, simply add the following script tag to your
HTML pages:

    <script src="https://sdk.amazonaws.com/js/aws-sdk-2.0.0-rc13.min.js"></script>

### In Node.js

The preferred way to install the AWS SDK for Node.js is to use the
[npm](http://npmjs.org) package manager for Node.js. Simply type the following
into a terminal window:

```sh
npm install aws-sdk
```

## Usage and Getting Started

You can find a getting started guide at:

http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/

## Supported Services

<p class="note"><strong>Note</strong>:
Although all services are supported in the browser version of the SDK,
not all of the services are available in the default hosted build (using the
script tag provided above). A list of services in the hosted build are provided
in the "<a href="http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/browser-services.html">Working With Services</a>"
section of the browser SDK guide, including instructions on how to build a
custom version of the SDK with extra services.
</p>

The SDK currently supports the following services:

<table>
  <thead>
    <th>Service Name</th>
    <th>Class Name</th>
    <th>API Version</th>
  </thead>
  <tbody>
    <tr><td rowspan="2">Amazon CloudFront</td><td rowspan="2">AWS.CloudFront</td><td>2012-05-05</td></tr>
    <tr><td>2013-11-11</td></tr>
    <tr><td rowspan="2">Amazon CloudSearch</td><td rowspan="2">AWS.CloudSearch</td><td>2011-02-01</td></tr>
    <tr><td>2013-01-01</td></tr>
    <tr><td>Amazon CloudWatch</td><td>AWS.CloudWatch</td><td>2010-08-01</td></tr>
    <tr><td rowspan="2">Amazon DynamoDB</td><td rowspan="2">AWS.DynamoDB</td><td>2011-12-05</td></tr>
    <tr><td>2012-08-10</td></tr>
    <tr><td>Amazon Elastic Compute Cloud</td><td>AWS.EC2</td><td>2014-02-01</td></tr>
    <tr><td>Amazon Elastic MapReduce</td><td>AWS.EMR</td><td>2009-03-31</td></tr>
    <tr><td>Amazon Elastic Transcoder</td><td>AWS.ElasticTranscoder</td><td>2012-09-25</td></tr>
    <tr><td>Amazon ElastiCache</td><td>AWS.ElastiCache</td><td>2013-06-15</td></tr>
    <tr><td>Amazon Glacier</td><td>AWS.Glacier</td><td>2012-06-01</td></tr>
    <tr><td>Amazon Kinesis</td><td>AWS.Kinesis</td><td>2013-12-02</td></tr>
    <tr><td>Amazon Redshift</td><td>AWS.Redshift</td><td>2012-12-01</td></tr>
    <tr><td rowspan="3">Amazon Relational Database Service</td><td rowspan="3">AWS.RDS</td><td>2013-01-10</td></tr>
    <tr><td>2013-02-12</td></tr>
    <tr><td>2013-09-09</td></tr>
    <tr><td>Amazon Route 53</td><td>AWS.Route53</td><td>2013-04-01</td></tr>
    <tr><td>Amazon Simple Email Service</td><td>AWS.SES</td><td>2010-12-01</td></tr>
    <tr><td>Amazon Simple Notification Service</td><td>AWS.SNS</td><td>2010-03-31</td></tr>
    <tr><td>Amazon Simple Queue Service</td><td>AWS.SQS</td><td>2012-11-05</td></tr>
    <tr><td>Amazon Simple Storage Service</td><td>AWS.S3</td><td>2006-03-01</td></tr>
    <tr><td>Amazon Simple Workflow Service</td><td>AWS.SimpleWorkflow</td><td>2012-01-25</td></tr>
    <tr><td>Amazon SimpleDB</td><td>AWS.SimpleDB</td><td>2009-04-15</td></tr>
    <tr><td>Auto Scaling</td><td>AWS.AutoScaling</td><td>2011-01-01</td></tr>
    <tr><td>AWS CloudFormation</td><td>AWS.CloudFormation</td><td>2010-05-15</td></tr>
    <tr><td>AWS CloudTrail</td><td>AWS.CloudTrail</td><td>2013-11-01</td></tr>
    <tr><td>AWS Data Pipeline</td><td>AWS.DataPipeline</td><td>2012-10-29</td></tr>
    <tr><td>AWS Direct Connect</td><td>AWS.DirectConnect</td><td>2012-10-25</td></tr>
    <tr><td>AWS Elastic Beanstalk</td><td>AWS.ElasticBeanstalk</td><td>2010-12-01</td></tr>
    <tr><td>AWS Identity and Access Management</td><td>AWS.IAM</td><td>2010-05-08</td></tr>
    <tr><td>AWS Import/Export</td><td>AWS.ImportExport</td><td>2010-06-01</td></tr>
    <tr><td>AWS OpsWorks</td><td>AWS.OpsWorks</td><td>2013-02-18</td></tr>
    <tr><td>AWS Security Token Service</td><td>AWS.STS</td><td>2011-06-15</td></tr>
    <tr><td rowspan="2">AWS Storage Gateway</td><td rowspan="2">AWS.StorageGateway</td><td>2012-06-30</td></tr>
    <tr><td>2013-06-30</td></tr>
    <tr><td>AWS Support</td><td>AWS.Support</td><td>2013-04-15</td></tr>
    <tr><td>Elastic Load Balancing</td><td>AWS.ELB</td><td>2012-06-01</td></tr>
  </tbody>
</table>

## License

This SDK is distributed under the
[Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0).

```no-highlight
Copyright 2012-2014. Amazon Web Services, Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
