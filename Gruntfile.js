module.exports = function(grunt) {
    var python = grunt.file.expand(['dps.py', 'preload-database.py', 'dps/**/*.py', 'tests/**/*.py']);
    var pythonTests = grunt.file.expand({cwd: 'tests'}, ['**/*.py']);

    // strip off the .py extension
    for (var i = 0; i < pythonTests.length; i++) {
        pythonTests[i] = pythonTests[i].substr(0, pythonTests[i].length - 3);
    }

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
           all: ['Gruntfile.js', 'static/js/**/*.js'] 
        },
        watch: {
            js: {
                files: ['Gruntfile.js', 'static/js/**/*.js'],
                tasks: ['jshint']
            },
            python: {
                files: python,
                tasks: ['shell:pyflakes', 'shell:pyTests']
            }
        },
        shell: {
            pyflakes: {
                command: 'pyflakes ' + python.join(' '),
                options: {
                    stdout: true,
                    failOnError: true
                }
            },
            pyTests: {
                command: 'python -m unittest ' + pythonTests.join(' '),
                options: {
                    stdout: true,
                    failOnError: true,
                    execOptions: {
                        cwd: 'tests'
                    }
                }
            }
        },
        uglify: {
            js: {
                options: {
                    sourceMap: 'bin/static/js/statistics.min.map',
                    sourceMappingURL: 'statistics.min.map',
                    sourceMapRoot: 'orig',
                    sourceMapPrefix: 2
                },
                files: {
                    'bin/static/js/statistics.js': ['static/js/statistics.js']
                }
            }
        },
        copy: {
            main: {
                files: [{
                    expand: true,
                    dest: 'bin',
                    src: [
                        'dps/**/*.py',
                        'dps.py', 
                        'static/css/*.css', 
                        'templates/**/*.html'
                    ]
                }, { 
                    expand: true,
                    cwd: 'static/js/',
                    dest: 'bin/static/js/orig',
                    src: ['*.js']
                }]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.registerTask('default', ['jshint', 'shell']);
    grunt.registerTask('build', ['default', 'uglify', 'copy']);
};
