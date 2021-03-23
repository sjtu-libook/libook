import { ErrorWhen, LoadingWhen } from "./flows/common"
import axios from 'axios'
import { useState, useEffect } from 'react'
import moment from "moment"
import { mergeReservation } from "./utils"

function ReservationItem({ reservation }) {
    const fromTime = moment(reservation.merged_time.from_time).format('HH:mm')
    const toTime = moment(reservation.merged_time.to_time).format('HH:mm')

    return <div className="card mb-3">
        <div className="card-body">
            <h5 className="card-title">{fromTime} - {toTime}</h5>
            <p className="card-text">{reservation.region.group.name} {reservation.region.name}</p>
            <a href="/" className="card-link">查看详情</a>
            <a href="/" className="card-link">取消预约</a>
        </div>
    </div>
}

function Reservations() {
    const [reservations, setReservations] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const now = moment()

        async function fetchReservations() {
            setLoading(true)
            const result = await axios({
                url: "/api/reservations/",
                params: {
                    from_time__gte: now.startOf('day').toISOString(),
                    from_time__lte: now.endOf('day').toISOString()
                }
            })
            setLoading(false)
            setReservations(result.data)
            setError(null)
        }

        fetchReservations().catch(err => {
            setError(`无法获取预约信息: ${err}`)
        })
    }, [])

    return <>
        <div className="d-flex flex-row align-items-center justify-content-between mb-3">
            <h1 className="d-inline-block">今日预约</h1>
            <LoadingWhen when={loading} size="3rem" className="text-muted"></LoadingWhen>
        </div>
        <div>
            <ul className="list-group">
                {mergeReservation(reservations).map(reservation => 
                    <ReservationItem reservation={reservation} key={reservation.id}></ReservationItem>)}
            </ul>
        </div>
        <ErrorWhen error={error}></ErrorWhen>
    </>
}

export default Reservations
