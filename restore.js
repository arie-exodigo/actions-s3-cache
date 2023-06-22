const core = require('@actions/core');
const exec = require('@actions/exec');
const AWS = require('aws-sdk');
const fs = require('graceful-fs');

async function run() {

    try {
        const s3Bucket = core.getInput('s3-bucket', { required: true });
        const cacheKey = core.getInput('cache-key', { required: true });
        const paths = core.getInput('paths', { required: true });
        const unzipOption = core.getInput('unzip-option', { required: false });
        const workingDirectory = core.getInput('working-directory', { required: false });
        const fileName = cacheKey + '.zip';

        process.chdir(workingDirectory);

        const s3 = new AWS.S3();

        s3.getObject({
            Bucket: s3Bucket,
            Key: fileName
        }, async (err, data) => {
            if (err) {
                console.log(`No cache is found for key: ${fileName}`);
            } else {
                console.log(`Found a cache for key: ${fileName}`);
                fs.writeFileSync(fileName, data.Body);

                await exec.exec(`unzip ${unzipOption} ${fileName}`);
                await exec.exec(`rm -f ${fileName}`);
            }
        });

    }
    catch (error) {
        core.setFailed(error.message)
    }
}

run();
