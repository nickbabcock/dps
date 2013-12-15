module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
           all: ['Gruntfile.js', 'static/js/**/*.js'] 
        },
        watch: {
            js: {
                files: ['Gruntfile.js', 'static/js/**/*.js'],
                tasks: ['jshint']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask('default', ['jshint']);
};
