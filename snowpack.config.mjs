export default {
    mount: {
        src: '/',
        public: '/public/',
    },
    buildOptions: {
        out: 'docs',
        metaUrlPath: 'snowpack'
    },
    optimize: {
        entrypoints: 'auto',
        preload: false,
        bundle: true,
        sourcemap: true,
        splitting: true,
        treeshake: true,
        manifest: true,
        minify: true,
        target: 'es2020',
    },
};