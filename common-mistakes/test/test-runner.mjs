import chalk from 'chalk';

const tests = [];

export function test(name, fn) {
    tests.push([name, fn]);
    runTests();
}

let isRunning = false;

async function runTests() {
    if (isRunning) return;
    isRunning = true;
    let entry;
    while(entry = tests.shift()) {
        const [name, fn] = entry;
        const startTime = Date.now();
        await Promise.resolve()
            .then(fn)
            .then(() => reportSuccess(name, startTime), (err) => reportFailure(name, err, startTime));
    }


}

function reportSuccess(testName, startTime) {
    const timeDiff = Date.now() - startTime;
    console.error(chalk.green(`✔ ${testName} (${timeDiff.toFixed(1)}ms)`));
}

function reportFailure(testName, error, startTime) {
    const timeDiff = Date.now() - startTime;
    console.error(chalk.red(`✖ ${testName} (${timeDiff.toFixed(1)}ms)
    ${formatError(error)}`));
    process.exitCode = 1;
}

function formatError(err) {
    return err.stack.split('\n').map(line => `  ${line}`);
}