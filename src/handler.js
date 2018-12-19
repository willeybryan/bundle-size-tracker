"use strict";
import octokit, {
  notify,
  // validate,
  build,
  delta,
  loadFromDynamo,
  saveToDynamo,
  readFileSizeData,
  postResult
} from "./lib/";

export const hello = async event => {
  try {
    // const body = validate(event);
    const body = event;

    if (!body) {
      throw new Error("event validation failed");
    }

    if (!(await notify(body, octokit))) {
      throw new Error("failed to notify");
    }

    const {
      after,
      before,
      repository: { name, full_name: fullName }
    } = body;

    const [previousBranch, previousMaster] = await loadFromDynamo(
      fullName,
      before
    );

    await build({ name, fullName, after });
    const fileSizeData = await readFileSizeData(name);
    const branchSum = await delta(previousBranch, fileSizeData);
    const masterSum = await delta(previousMaster, fileSizeData);

    postResult(body, octokit, `${branchSum} | ${masterSum}`);

    saveToDynamo({
      repo: fullName,
      sha: after,
      data: fileSizeData,
      branch: body.ref
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Go Serverless v1.1! Your function executed successfully!",
        input: event
      })
    };

    // Use this code if you don't use the http event with the LAMBDA-PROXY integration
    // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
  } catch (e) {
    console.log(e.message);
    return false;
  }
};

/*
 */
