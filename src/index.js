import axios from 'axios'
import merge from 'lodash.merge'

export default {
  install (Vue, option) {
    const { name: api = '$api', defaults, interceptors, preset } = option
    if (!this.installed) {
      // axios global defaults
      if (typeof defaults === 'object') {
        Object.keys(defaults).forEach(_ => {
          axios.defaults[_] = defaults[_]
        })
      }
      // axios global interceptors
      if (typeof interceptors === 'object') {
        if (interceptors.request) {
          axios.interceptors.request.use(interceptors.request)
        }
        if (interceptors.response) {
          axios.interceptors.response.use(
            interceptors.response.success || null,
            interceptors.response.error || null
          )
        }
      }
      // install
      Object.defineProperty(Vue.prototype, api, {
        value () {
          if (typeof preset === 'object' && !!arguments[0] && preset.hasOwnProperty(arguments[0])) {
            const [name, layout] = arguments
            const [url, config] = preset[name]
            if (layout) { // merge config
              merge(config, layout)
            }
            if (config.data) { // clean
              Object.keys(config.data).forEach(d => {
                if ([null, undefined].indexOf(config.data[d]) > -1) {
                  config.data[d] = ''
                }
              })
            }
            return axios(url, config)
          } else {
            const [url, config] = arguments
            console.warn(`Can not find preset of '${arguments[0]}', use normal http request instead.`)
            if ((!!config && typeof config !== 'object') || arguments.length > 2) {
              console.warn('Please use api(url[, config]) to request http.')
            }
            if (/http[s]?:\/\//i.test(url)) {
              config.baseURL = null
            }
            return axios(url, config)
          }
        }
      })
      // install complete
      this.installed = true
    }
  }
}
