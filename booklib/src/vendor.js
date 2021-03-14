import moment from 'moment'
import 'moment/locale/zh-cn'
import axios from 'axios'

moment.locale('zh-cn')
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = 'X-CSRFToken'
