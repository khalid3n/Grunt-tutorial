module.exports = function(grunt) {

    // Project configuration
    grunt.initConfig({
        // Load package.json file into pkg (this is actually a json file)
        pkg: grunt.file.readJSON('package.json'),

        jshint: {
              // The paths tell JSHint which files to validate
              files: ['src/js/*.js']
        },
        concat: {
            // Configuration for concatinating.
            js: {
                src: [
                    'src/js/*.js' // All JS files in JS folder
                    // you can also add specific files here (coma separated) 
                    
                ],
                dest: 'dist/js/main.js',
            },
            css: {
                src: 'src/sass/*.scss',
                dest: 'dist/sass/main.scss' 
            }   
        },
        uglify: {
            // configuration for uglifying/minifying
            build: {

                //src: 'dist/js/main.js',
                src: ['<%= concat.js.dest %>'],
                dest: 'dist/js/main.min.js'
            }
        },
        sass: {
            dist: {
                options: {
                    style: 'compressed'
                },
                files: {
                    'dist/css/main.css': 'dist/sass/main.scss'
                }
            } 
        },
        watch: {
            scripts: {
                // files to watch for changes
                files: ['src/js/*.js', 'src/sass/*.scss'],
                // task to perform upon a change
                tasks: ['concat', 'uglify', 'sass'],
                options: {
                    spawn: false,
                }
            } 
        }
    });
    // Load the plugin that provides the concat task.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    // Load the plugin that provides the concat task.
    grunt.loadNpmTasks('grunt-contrib-concat');
    // Load the plugin that provides the uglify task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    // Load the plugin that compile sass files.
    grunt.loadNpmTasks('grunt-contrib-sass');
    // watch files for changes
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default task(s) that will run when the grunt command is executed.
    grunt.registerTask('default', ['concat', 'uglify', 'sass', 'watch']);

};