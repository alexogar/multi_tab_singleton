module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    bower: {
      install: {
        options: {
          targetDir: './lib',
          layout: 'byType',
          install: true,
          verbose: false,
          cleanTargetDir: false,
          cleanBowerDir: false,
          bowerOptions: {}
        }
      }
    },

    concat: {
      options: {
        separator: "\n\n"
      },
      dist: {
        src: [
          'src/_intro.js',
          'src/main.js',
          'src/_outro.js'
        ],
        dest: 'dist/<%= pkg.name.replace(".js", "") %>.js'
      },
      full: {
        src: [
          'lib/jstorage/jstorage.js',
          'lib/observe-js/observe.js',
          'src/_intro.js',
          'src/main.js',
          'src/_outro.js'
        ],
        dest: 'dist/<%= pkg.name.replace(".js", "") %>.full.js'
      }
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name.replace(".js", "") %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'dist/<%= pkg.name.replace(".js", "") %>.min.js': ['<%= concat.dist.dest %>']
        }
      },
      full : {
        files: {
          'dist/<%= pkg.name.replace(".js", "") %>.full.min.js': ['<%= concat.full.dest %>']
        }
      }
    },

    qunit: {
      files: ['test/*.html']
    },

    jshint: {
      files: ['dist/multi_tab_singleton.js'],
      options: {
        globals: {
          console: true,
          module: true,
          document: true
        },
        jshintrc: '.jshintrc'
      }
    },

    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['concat', 'jshint', 'qunit']
    }

  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-bower-task');

  grunt.registerTask('test', ['qunit', 'jshint',]);
  grunt.registerTask('default', ['bower','concat', 'qunit', 'jshint', 'uglify']);

};
