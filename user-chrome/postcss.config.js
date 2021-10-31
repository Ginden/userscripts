const imageInliner = require('postcss-image-inliner');
module.exports = {
    plugins: [
        require('postcss-assets'),
        imageInliner({
            maxFileSize: 1024 * 1024,
            strict: true,
        })
    ]
}
