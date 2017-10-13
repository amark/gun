
import serve from './serve'

export default (Gun, dir) => {  // TODO: where did __dirname go ?
  Gun.serve = serve(dir)
  return Gun
}
