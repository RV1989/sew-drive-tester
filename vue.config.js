module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  configureWebpack: {
    // Configuration applied to all builds
  },
  pluginOptions: {
    electronBuilder: {
      appId : 'sewDriveTester',
      "files": [
        "dist/bundled/**/*"
      ]
     
    }
  }
}