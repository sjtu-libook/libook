import moment from 'moment'
import { filterToNow } from './TimeReserve'

test('should filter timeslices up to now', () => {
    expect(filterToNow([{
        "id": 17,
        "from_time": "2021-03-24T07:00:00+08:00",
        "to_time": "2021-03-24T08:00:00+08:00"
    }, {
        "id": 18,
        "from_time": "2021-03-24T08:00:00+08:00",
        "to_time": "2021-03-24T09:00:00+08:00"
    }, {
        "id": 19,
        "from_time": "2021-03-24T09:00:00+08:00",
        "to_time": "2021-03-24T10:00:00+08:00"
    }, {
        "id": 20,
        "from_time": "2021-03-24T10:00:00+08:00",
        "to_time": "2021-03-24T11:00:00+08:00"
    }, {
        "id": 21,
        "from_time": "2021-03-24T11:00:00+08:00",
        "to_time": "2021-03-24T12:00:00+08:00"
    }, {
        "id": 22,
        "from_time": "2021-03-24T12:00:00+08:00",
        "to_time": "2021-03-24T13:00:00+08:00"
    }], moment("2021-03-24T10:59:59+08:00"))).toMatchObject([{ id: 21 }, { id: 22 }])
})
