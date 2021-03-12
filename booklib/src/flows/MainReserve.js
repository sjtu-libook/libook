import moment from 'moment'
import { useState } from 'react'
import { LinkButton, LinkButtonEnum } from './common.js'

const calendarDateOnly = {
    sameDay: '[今天]',
    nextDay: '[明天]',
    nextWeek: function (now) {
        if (now.week() !== this.week()) {
            return '[下]ddd'
        } else {
            return '[本]ddd'
        }
    },
    lastDay: '[昨天]',
    lastWeek: function (now) {
        if (this.week() !== now.week()) {
            return '[上]ddd'
        } else {
            return '[本]ddd'
        }
    },
    sameElse: 'L',
}

function dateSelections() {
    let day = moment(new Date())
    const result = []

    for (let i = 0; i < 7; i++) {
        let item = day.calendar(calendarDateOnly)
        result.push({ key: day, value: item })

        day.add(1, 'days')
    }

    return result
}

function hourSelections() {
    const result = []

    for (let i = 1; i <= 6; i++) {
        result.push({ key: i, value: `${i} 小时` })
    }

    return result
}

function MainReserve({ nextStep }) {
    const dates = dateSelections()
    const [date, setDate] = useState(0)

    const times = [{ key: 'morning', 'value': '上午' }, { key: 'afternoon', 'value': '下午' }, { key: 'evening', 'value': '晚上' }]
    const [time, setTime] = useState(0)

    const hours = hourSelections()
    const [hour, setHour] = useState(0)

    return (
        <>
            <div className="px-3">
                <h1>快速预定座位</h1>
            </div>
            <div className="display-3">
                <LinkButtonEnum selections={dates} selected={date} setSelected={setDate}></LinkButtonEnum>
                        &nbsp;
                <LinkButtonEnum selections={times} selected={time} setSelected={setTime}></LinkButtonEnum>
            </div>
            <div className="display-3">
                <LinkButton>安静的地方</LinkButton>
            </div>
            <div className="display-3 d-flex justify-content-space-between">
                <LinkButtonEnum selections={hours} selected={hour} setSelected={setHour}></LinkButtonEnum>
                <LinkButton className="ml-auto" onClick={nextStep}><i className="bi bi-arrow-right-square"></i></LinkButton>
            </div>
            <div className="h3 text-right">
                <LinkButton className="text-muted">切换到自选模式 <i className="bi bi-arrow-right"></i></LinkButton>
            </div>
        </>
    )
}

export default MainReserve
