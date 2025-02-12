const core = require('@actions/core');
const exec = require('@actions/exec');
const AWS = require('aws-sdk');
const fs = require('graceful-fs');

async function run() {

  try {
    const s3Bucket = core.getInput('s3-bucket', { required: true });
    const cacheKey = core.getInput('cache-key', { required: true });
    const paths = core.getInput('paths', { required: true });
    const zipOption = core.getInput('zip-option', { required: false });
    const workingDirectory = core.getInput('working-directory', { required: false });
    const fileName = cacheKey + '.zip';

    process.chdir(workingDirectory);

    const s3 = new AWS.S3();

    await exec.exec(`zip ${zipOption} ${fileName} ${paths}`);

    s3.upload({
      Body: fs.readFileSync(fileName),
      Bucket: s3Bucket,
      Key: fileName,
    }, (err, data) => {
      if (err) {
        console.log(`Failed store to ${fileName}, ${err}`);
      } else {
        console.log(`Stored cache to ${fileName}`);
      }
    }
    );


  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
