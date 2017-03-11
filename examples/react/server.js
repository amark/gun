import express from 'express'
import Gun from '../..'
import webpack from 'webpack'
import WebpackDevMiddleware from 'webpack-dev-middleware'
import config from './webpack.config'


const app = express()
const gun = Gun()

gun.wsp(app)

const compiler = webpack(config)

const devMiddleware = WebpackDevMiddleware(compiler)

app.use(devMiddleware)

app.listen(4000)
