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
            },
            markdown: {
                files: grunt.file.expand(['static/markdown/*.md']),
                tasks: ['markdown']
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
            },
           dps: {
                options: {
                    sourceMap: 'bin/static/js/dps.min.map',
                    sourceMappingURL: 'dps.min.map',
                    sourceMapRoot: 'orig',
                    sourceMapPrefix: 2
                },
                files: {
                    'bin/static/js/dps.js': ['static/js/dps.js']
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
                        'static/favicon.ico',
                        'dps.py', 
                        'generate-statistics.py',
                        'scrape.py',
                        'requirements.txt',
                        'templates/**/*.html'
                    ]
                }, { 
                    expand: true,
                    cwd: 'static/js/',
                    dest: 'bin/static/js/orig',
                    src: ['*.js']
                }]
            }
        },
        markdown: {
            statistics: {
                files: [{
                    src: ['static/markdown/statistics.md'],
                    dest: 'templates/statistics-generated.html' 
                }],
                options: {
                    postProcess: function(html) {
                        return '{% extends "statistics.html" %}\n' +
                               '{% block post %} ' +
                                html +
                               '{% endblock %}';
                    }
                }
            },
            about: {
                files: [{
                    src: ['static/markdown/about.md'],
                    dest: 'templates/about-generated.html'
                }],
                options: {
                    postProcess: function(html) {
                        return '{% extends "base.html" %}\n' +
                               '{% block title %}About{% endblock %}\n' +
                               '{% block content %} ' +
                               '<div class="pure-u-1">\n' +
                                html +
                               '</div>\n' +
                               '{% endblock %}\n';
                    }
                }
            },
            home: {
                files: {
                    'templates/home-generated.html': ['static/markdown/home.md']
                },
                options: {
                    postProcess: function(html) {
                        return '{% extends "home.html" %}\n' +
                               '{% block post %} ' +
                                html +
                               '{% endblock %}';
                    }

                }
            }
        },
        cssmin: {
            min: {
                expand: true,
                src: ['bin/static/css/*.css']
            }
        },
        autoprefixer: {
            multiple: {
                expand: true,
                src: ['static/css/*.css'],
                dest: 'bin'
            }
        },
        compress: {
            gzip: {
                options: {
                    mode: 'tgz',
                    archive: 'app.tar.gz'
                },
                files: [
                    {expand: true, src: ['bin/*'], dest: 'bin'}
                ]
            }
        }
    });

    // Allow writing content to be written in markdown and then convert them
    // into templates.
    grunt.registerMultiTask('markdown', 'convert markdown', function() {
        var marked = require('marked');
        var fs = require('fs');
        var path = require('path');
        var options = this.options({
            postProcess: function(html) { return html; }
        });

        this.files.forEach(function(f) {
            var markdown = fs.readFileSync(f.src[0], 'utf8'); 
            var html = marked(markdown); 
            html = options.postProcess(html);
            fs.writeFileSync(f.dest, html);
        });
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.registerTask('default', ['jshint', 'shell', 'markdown']);
    grunt.registerTask('build', ['default', 'uglify', 'autoprefixer',  'cssmin', 'copy', 'compress']);
};
