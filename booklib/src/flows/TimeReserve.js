import { LinkButton, LinkButtonSelect, LinkButtonEnum, ShowWhen, LoadingWhen, ErrorWhen } from './common.js'
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
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const now = dates[date].key

        async function fetchTimeslice() {
            setLoading(true)
            const result = await axios({
                url: "/api/timeslices",
                params: { from_time__gt: now.startOf('day').toISOString(), from_time__lt: now.endOf('day').toISOString() }
            })
            setLoading(false)
            setData(result.data)
            setError(null)
        }

        fetchTimeslice().catch(err => {
            setError(`无法获取开馆时间: ${err}`)
        })
    }, [date])

    return (
        <>
            <div className="d-flex flex-row align-items-center justify-content-between px-3">
                <h1 className="d-inline-block">选择时间</h1>
                <LoadingWhen when={loading} size="3rem" className="text-muted"></LoadingWhen>
            </div>

            <div className="display-4">
                <LinkButtonEnum selections={dates} selected={date} setSelected={setDate}></LinkButtonEnum>
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

            <ErrorWhen error={error}></ErrorWhen>

            <div className="display-4 d-flex justify-content-between">
                <LinkButton onClick={prevStep}><i className="bi bi-arrow-left-square"></i></LinkButton>
                <LinkButton onClick={nextStep}><i className="bi bi-arrow-right-square"></i></LinkButton>
            </div>
        </>
    )
}

export default TimeReserve
