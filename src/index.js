require = require("esm")(module); // eslint-disable-line no-global-assign
const hello = require("./handler").hello;

module.exports.handleEvent = async (request, response) => {
  await hello(request.body);
  response.status(200).send("Done!");
};
