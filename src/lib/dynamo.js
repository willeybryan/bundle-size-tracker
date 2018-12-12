let AWS = require("aws-sdk");

AWS.config.update({
  region: "ca-central-1"
});

module.exports.loadFromDynamo = async repo => {
  let docClient = new AWS.DynamoDB.DocumentClient({ dynamoDbCrc32: false });
  let params = {
    TableName: "bundle_sizes",
    KeyConditionExpression: "#repo = :name",
    ExpressionAttributeNames: {
      "#repo": "repo"
    },
    ExpressionAttributeValues: {
      ":name": repo
    }
  };

  const p = new Promise((resolve, reject) => {
    docClient.query(params, function(err, data) {
      if (err) {
        reject(err);
      } else {
        let results = {};
        data.Items.forEach(i => (results[i.sha] = i));
        resolve(results);
      }
    });
  });
  let r = await p;
  return r;
};

module.exports.saveToDynamo = async payload => {
  let docClient = new AWS.DynamoDB.DocumentClient();
  payload["timestamp"] = Date.now();
  let params = {
    TableName: "bundle_sizes",
    Item: payload
  };

  const p = new Promise((resolve, reject) => {
    docClient.put(params, function(err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
  let r = await p;
  return r;
};