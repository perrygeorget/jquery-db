/*jshint node: true */

'use strict';

var tmp = require('temporary');

module.exports = function (grunt) {
    var dir = new tmp.Dir();
    // console.log(dir.path);

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                sourceMap: 'build/<%= pkg.name %>.<%= pkg.version %>.map',
                mangle: {
                    except: ['jQuery']
                }
            },
            build: {
                src: 'src/<%= pkg.name %>.js',
                dest: 'build/<%= pkg.name %>.<%= pkg.version %>.min.js'
            }
        },
        clean: [
            'build',
            'dist'
        ],
        copy: {
            main: {
                flatten: true,
                expand: true,
                cwd: 'build/',
                src: [
                    '<%= pkg.name %>.<%= pkg.version %>.min.js',
                    '<%= pkg.name %>.<%= pkg.version %>.map'
                ],
                dest: 'dist/'
            }
        },
        jshint: {
            files: [
                'Gruntfile.js',
                'src/jquery.db.js'
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        qunit: {
            options: {
                '--web-security': 'no',
                '--local-storage-path': dir.path,
                coverage: {
                    src: ['src/**/*.js'],
                    instrumentedFiles: 'temp/',
                    htmlReport: 'report/coverage',
                    coberturaReport: 'report/',
                    linesThresholdPct: 85
                }
            },
            all: ['test/index.html']
        }
    });

    // Loading dependencies
    for (var key in grunt.file.readJSON('package.json').devDependencies) {
        if (key !== 'grunt' && key.indexOf('grunt') === 0) {
            grunt.loadNpmTasks(key);
        }
    }

    // Default task(s).
    grunt.registerTask('default', ['jshint', 'qunit', 'clean', 'uglify']);

    grunt.registerTask('test', ['jshint', 'qunit']);

    grunt.registerTask('dist', ['jshint', 'qunit', 'clean', 'uglify', 'copy']);
};
