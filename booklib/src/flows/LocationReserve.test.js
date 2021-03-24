import { reserveToMap } from './LocationReserve'

test('should correctly map reservation data', () => {
    expect(reserveToMap(
        [{
            "reserved": 1,
            "capacity": 400,
            "time_id": 28,
            "region_group_id": 1
        }, {
            "reserved": 233,
            "capacity": 400,
            "time_id": 29,
            "region_group_id": 1
        }, {
            "reserved": 1,
            "capacity": 300,
            "time_id": 30,
            "region_group_id": 2
        }], r => r.region_group_id)).toMatchObject({
        "1": {
            "reserved": 233,
            "capacity": 400
        }, "2": {
            "reserved": 1,

            "capacity": 300
        }
    })
})
