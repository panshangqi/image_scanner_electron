module.exports = function(grunt){
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        less:{
            less2css : {
                options: {
                    compress: false
                },
                files: {
                    'css/ui_frame.css':'less/ui_frame.less'
                }
            }
        },

        watch: {
            less: {
                files: ['less/*.less'],
                tasks:['default'],
                options: {livereload:false}
            }
        }
    })
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask('default',['less']);
    grunt.registerTask('watching',['watch']);
}