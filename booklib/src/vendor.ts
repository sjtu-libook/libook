/* eslint-disable simple-import-sort/imports */

import axios from 'axios'
import moment from 'moment'
import 'moment/locale/zh-cn'

moment.locale('zh-cn')
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = 'X-CSRFToken'
axios.defaults.withCredentials = true
