// See: https://github.com/istanbuljs/nyc#configuring-nyc

module.exports = {
  all: true,
  include: [
    "**/*.js"
  ],
  exclude: [
    "**/examples/**",
    "**/test/**",
    "**/*.min.js",
    "**/*.config.js"
  ]
}
