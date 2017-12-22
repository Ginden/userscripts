export function log(firstArg) {
    console.log(...arguments);
    return firstArg;
}


export function error(firstArg) {
    console.error(...arguments);
    return firstArg;
}

export function timed(fn) {
    return async function(...args) {
        const startTime = performance.now();
        try {
            return await fn(...args);
        } finally {
            const timeDiff = performance.now()-startTime;
            log(`Executing function ${fn.name} took ${toHumanReadable(timeDiff)}`);
        }
    };

}

function toHumanReadable(timeInMs) {
    if (timeInMs > 1000) {
        return `${(timeInMs/1000).toFixed(2)}s`;
    } else if (timeInMs > 0.1) {
        return `${(timeInMs).toFixed(1)}ms`;
    }

    return 'less than 0.1ms';
}

export default {
    log,
    error
};
