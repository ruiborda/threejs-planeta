export default {
    mount: {
        src: '/',
        public: '/public/',
    },
    buildOptions:{
        out:'docs',
        metaUrlPath:'snowpack'
    },
    optimize: {
        bundle: true,
        minify: true,
        target: 'es2020',
    },
};