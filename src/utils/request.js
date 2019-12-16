import axios from 'axios'
import Router from '../router'
import application from '../store/application'
import Fingerprint2 from 'fingerprintjs2'
import { Notify } from 'quasar'

const service = axios.create({
  timeout: 5000
})

service.interceptors.request.use(config => {
  if (localStorage.getItem('token')) {
    config.headers['TOKEN'] = localStorage.getItem('token')
  }
  if (application.state.finger.length > 0) {
    config.headers['finger'] = application.state.finger
  } else {
    Fingerprint2.get(function (components) {
      let values = components.map(function (component) { return component.value })
      config.headers['finger'] = Fingerprint2.x64hash128(values.join(''), 31)
    })
  }
  return config
}, error => {
  console.log(error)
  return Promise.reject(error)
})

service.interceptors.response.use(response => {
  // console.log('response:')
  // console.log(response)
  const resp = response.data
  if (resp.code === 401) {
    console.log('error:401')
  }
  return resp
}, error => {
  console.log('responseError:')
  console.log(error.response.data)
  if (error.response.data.code === 40002 || error.response.data.code === 40005) {
    localStorage.clear()
    Router.push('/login')
  }
  if (error.response.data.code === 40006) {
    localStorage.clear()
    Notify.create({
      color: 'red',
      icon: 'error',
      position: 'center',
      timeout: 2500,
      message: error.response.data.message
    })
    Router.push('/login')
  }
  return Promise.reject(error)
})
export default service
