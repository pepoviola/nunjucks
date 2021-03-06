'use strict';

var fs = require('fs');
var path = require('path');
var lib = require('./lib');
var Loader = require('./loader');
var PrecompiledLoader = require('./precompiled-loader.js');

// Node <0.7.1 compatibility
var existsSync = fs.existsSync || path.existsSync;

var FileSystemLoader = Loader.extend({
    init: function(searchPaths, opts) {
        if(typeof opts === 'boolean') {
            console.log(
                '[nunjucks] Warning: you passed a boolean as the second ' +
                'argument to FileSystemLoader, but it now takes an options ' +
                'object. See http://mozilla.github.io/nunjucks/api.html#filesystemloader'
            );
        }

        opts = opts || {};
        this.pathsToNames = {};
        this.noCache = !!opts.noCache;

        if(searchPaths) {
            searchPaths = lib.isArray(searchPaths) ? searchPaths : [searchPaths];
            // For windows, convert to forward slashes
            this.searchPaths = searchPaths.map(path.normalize);
        }
        else {
            this.searchPaths = ['.'];
        }

        if(opts.watch) {
            console.log(
                '[nunjucks-no-watch] Warning: you are passing watch option' +
                'but this module don\'t support watch because it is ment to be used ' +
                'with nunjucksify.'
            );
        }
    },

    getSource: function(name) {
        var fullpath = null;
        var paths = this.searchPaths;

        for(var i=0; i<paths.length; i++) {
            var basePath = path.resolve(paths[i]);
            var p = path.resolve(paths[i], name);

            // Only allow the current directory and anything
            // underneath it to be searched
            if(p.indexOf(basePath) === 0 && existsSync(p)) {
                fullpath = p;
                break;
            }
        }

        if(!fullpath) {
            return null;
        }

        this.pathsToNames[fullpath] = name;

        return { src: fs.readFileSync(fullpath, 'utf-8'),
                 path: fullpath,
                 noCache: this.noCache };
    }
});

module.exports = {
    FileSystemLoader: FileSystemLoader,
    PrecompiledLoader: PrecompiledLoader
};
