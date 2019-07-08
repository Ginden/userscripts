import './global';

console.log('Script start');
const waitMs = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
    let i = 10;
    const actualWindow = typeof windowProxy === 'undefined' ? typeof unsafeWindow === 'undefined' ? window : unsafeWindow : windowProxy;
    let _octo: Octo = null;
    const windows = [
        () => window,
        () => windowProxy,
        () => unsafeWindow
    ].map(f => {
        try {
            return f()
        } catch (err) {
            return null;
        }
    }).filter(Boolean);
    while (!_octo) {
        for (const win of windows) {
            if (win._octo && win._octo.actor && win._octo.actor.login) {
                _octo = win._octo;
            }
        }
        if (i > 60 * 1000) {
            console.log(`Failed to read property _octo of window`);
            return; // Give up after ~1 minute
        }
        await waitMs(500);
        i += 500;
    }
    console.log(`Found _octo`);
    const {
        actor,
        dimensions
    } = _octo;
    if (!(actor && actor.login && dimensions)) {
        return;
    }

    const {
        repository_is_fork: isFork,
        repository_nwo: repoPath,
        repository_parent_nwo: repoParentPath,
        repository_public: isPublic
    } = dimensions;
    if (!(isFork === 'true' && isPublic === 'true' && repoPath && repoParentPath)) return;
    const repoName = repoPath.split('/').pop();

    const commandString = `
        git clone git@github.com:${repoPath}.git;
        cd ${repoName};
        git remote add upstream git@github.com:${repoParentPath}.git
    `.split('\n').map(line => line.trim()).filter(Boolean).join('\n');

    const domElement = actualWindow.document.createElement('pre');
    domElement.textContent = commandString;

    const pos = actualWindow.document.querySelector('#topics-list-container');
    if (!pos) return;
    pos.parentNode.insertBefore(domElement, pos);

})().catch(err => {
    console.error(err, err.stack);
});

