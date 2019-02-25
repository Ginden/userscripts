import './global';

const waitMs = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
    let i = 10;
    const actualWindow = typeof windowProxy === 'undefined' ? typeof unsafeWindow === 'undefined' ? window : unsafeWindow : windowProxy;
    while(!('_octo' in actualWindow)) {
        if (i > 35*1000) return; // Give up after ~1 minute
        await waitMs(i *= 2);
    }
    const {
        actor,
        dimensions
    } = _octo;
    if(!(actor && actor.login && dimensions)) {
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

