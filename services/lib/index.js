const http = require('http');
const AWS = require('aws-sdk');

// settings
const config = {
  dynamoTableName: 'learnjs',
};

AWS.config.region = 'ap-northeast-1';
exports.dynamodb = new AWS.DynamoDB.DocumentClient();

exports.echo = function(json, context) {
  context.succeed(['Hello from the cloud! You sent ' + JSON.stringify(json)]);
};

// local functions 
const reduceItems = (memo, items) => {
  items.forEach((item) => {
    memo[item.answer] = (memo[item.answer] || 0) + 1;
  });
  return memo;
};

// ソート関数
const byCount = (e1, e2) => {
  return e2[0] - e1[0];
};

const filterItems = (items) => {
  const values = [];
  for (var i in items) {
    values.push([items[i], i]);
  }

  const topFive = [];
  values.sort(byCount).slice(0, 5).forEach((e) => {
    topFive[e[1]] = e[0];
  });
  return topFive;
};

exports.popularAnswers = (json, context) => {
  exports.dynamodb.scan({
    FilterExpression: 'problemId = :problemId',
    ExpressionAttributeValues: {
      ':problemId': json.problemNumber
    },
    TableName: config.dynamoTableName
  }, (err, data) =>{
    if (err) {
      context.fail(err);
    } else {
      context.succeed(filterItems(reduceItems({}, data.Items)));
    }
  });
};
