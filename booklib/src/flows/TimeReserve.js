import { LinkButton, LinkButtonSelect, LinkButtonEnum, ShowWhen, LoadingWhen } from './common.js'
import { dateSelections } from './MainReserve.js'
import moment from 'moment'
import { useEffect, useState } from 'react'
import axios from 'axios'

const dates = dateSelections()

function TimeReserve({ prevStep, nextStep }) {
    const [fromTime, setFromTime] = useState(0)
    const [toTime, setToTime] = useState(0)
    const [date, setDate] = useState(0)
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const now = dates[date].key

        async function fetchTimeslice() {
            setLoading(true)
            const result = await axios({
                url: "/api/timeslices",
                params: { from_time__gt: now.startOf('day').toISOString(), from_time__lt: now.endOf('day').toISOString() }
            })
            await new Promise(r => setTimeout(r, 500))
            console.log("loaded!")
            setLoading(false)
            setData(result.data)
        }

        fetchTimeslice()
    }, [date])

    return (
        <>
            <div className="px-3">
                <h1>选择时间</h1>
            </div>
            <div className="d-flex flex-row align-items-center">
                <div className="display-4 d-inline-block">
                    <LinkButtonEnum selections={dates} selected={date} setSelected={setDate}></LinkButtonEnum>
                </div>
                <LoadingWhen when={loading} size="3rem" className="text-muted"></LoadingWhen>
            </div>

            <ShowWhen when={!loading}>
                <div>
                    <div className="display-4 d-flex flex-row align-items-center px-3">
                        从
                        <LinkButtonSelect selections={data.map(({ id, from_time }) => ({ key: id, value: moment(from_time).local().format('HH:mm') }))} selected={fromTime} setSelected={setFromTime}></LinkButtonSelect>
                    </div>
                    <div className="display-4 d-flex flex-row align-items-center px-3">
                        到
                        <LinkButtonSelect selections={data.map(({ id, to_time }) => ({ key: id, value: moment(to_time).local().format('HH:mm') }))} selected={toTime} setSelected={setToTime}></LinkButtonSelect>
                    </div>
                </div>
            </ShowWhen>
            <div className="display-4 d-flex justify-content-between">
                <LinkButton onClick={prevStep}><i className="bi bi-arrow-left-square"></i></LinkButton>
                <LinkButton onClick={nextStep}><i className="bi bi-arrow-right-square"></i></LinkButton>
            </div>
        </>
    )
}

export default TimeReserve
