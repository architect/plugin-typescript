module.exports = { set: {
    customLambdas: ({ arc, inventory }) => {
      return {
        name: 'custom-lambda-new',
        src: __dirname + '/../custom' // Points to a handler dir inside the plugin
      }
    }
  } }