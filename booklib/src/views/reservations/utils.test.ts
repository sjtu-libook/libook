import { mergeReservation } from './utils'

test('should merge empty reservations', () => {
  expect(mergeReservation([])).toStrictEqual([])
})

test('should merge one reservations', () => {
  expect(mergeReservation([{
    "id": 1,
    "region": {
      "id": 1,
      "name": "1 号桌",
      "group": {
        "id": 1,
        "name": "新图 A200"
      },
      "capacity": 8
    },
    "time": {
      "id": 1,
      "from_time": "2021-03-23T07:00:00+08:00",
      "to_time": "2021-03-23T08:00:00+08:00"
    }
  }]
  )).toMatchObject([{
    "region": {
      "id": 1,
    },
    "merged_time": {
      "from_time": "2021-03-23T07:00:00+08:00",
      "to_time": "2021-03-23T08:00:00+08:00"
    }
  }]
  )
})


test('should merge multiple reservations', () => {
  expect(mergeReservation([{
    "id": 1,
    "region": {
      "id": 1,
      "name": "1 号桌",
      "group": {
        "id": 1,
        "name": "新图 A200"
      },
      "capacity": 8
    },
    "time": {
      "id": 1,
      "from_time": "2021-03-23T07:00:00+08:00",
      "to_time": "2021-03-23T08:00:00+08:00"
    }
  }, {
    "id": 2,
    "region": {
      "id": 1,
      "name": "1 号桌",
      "group": {
        "id": 1,
        "name": "新图 A200"
      },
      "capacity": 8
    },
    "time": {
      "id": 2,
      "from_time": "2021-03-23T08:00:00+08:00",
      "to_time": "2021-03-23T09:00:00+08:00"
    }
  }, {
    "id": 3,
    "region": {
      "id": 1,
      "name": "1 号桌",
      "group": {
        "id": 1,
        "name": "新图 A200"
      },
      "capacity": 8
    },
    "time": {
      "id": 3,
      "from_time": "2021-03-23T09:00:00+08:00",
      "to_time": "2021-03-23T10:00:00+08:00"
    }
  }, {
    "id": 4,
    "region": {
      "id": 1,
      "name": "1 号桌",
      "group": {
        "id": 1,
        "name": "新图 A200"
      },
      "capacity": 8
    },
    "time": {
      "id": 4,
      "from_time": "2021-03-23T10:00:00+08:00",
      "to_time": "2021-03-23T11:00:00+08:00"
    }
  }, {
    "id": 5,
    "region": {
      "id": 188,
      "name": "38 号桌",
      "group": {
        "id": 4,
        "name": "新图 A300"
      },
      "capacity": 8
    },
    "time": {
      "id": 5,
      "from_time": "2021-03-23T11:00:00+08:00",
      "to_time": "2021-03-23T12:00:00+08:00"
    }
  }]
  )).toMatchObject([{
    "region": {
      "id": 1,
    },
    "merged_time": {
      "from_time": "2021-03-23T07:00:00+08:00",
      "to_time": "2021-03-23T11:00:00+08:00"
    },
    "merged_id": [1, 2, 3, 4]
  },
  {
    "region": {
      "id": 188,
    },
    "merged_time": {
      "from_time": "2021-03-23T11:00:00+08:00",
      "to_time": "2021-03-23T12:00:00+08:00"
    },
    "merged_id": [5]
  }]
  )
})
