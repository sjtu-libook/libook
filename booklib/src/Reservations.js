import { ErrorWhen, LoadingWhen } from "./flows/common"
import axios from 'axios'
import { useState, useEffect } from 'react'
import moment from "moment"
import { mergeReservation } from "./utils"
import classnames from 'classnames'

function ReservationItem({ reservation, cancelReservation, disabled }) {
    const fromTime = moment(reservation.merged_time.from_time).calendar()
    const toTime = moment(reservation.merged_time.to_time).format('HH:mm')

    return <div className="card mb-3">
        <div className="card-body">
            <h5 className="card-title">{fromTime} - {toTime}</h5>
            <p className="card-text">{reservation.region.group.name} {reservation.region.name}</p>
            <div className="d-flex justify-content-end">
                <button
                    onClick={cancelReservation}
                    className={classnames("btn btn-outline-secondary", disabled ? "disabled" : "")}>
                    取消预约
                </button>
            </div>
        </div>
    </div>
}

function Reservations() {
    const [reservations, setReservations] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    async function fetchReservations() {
        const now = moment()
        setLoading(true)
        const result = await axios({
            url: "/api/reservations/",
            params: {
                from_time__gte: now.startOf('day').toISOString(),
                from_time__lte: now.endOf('day').add(7, 'day').toISOString()
            }
        })
        setLoading(false)
        setReservations(result.data)
        setError(null)
    }

    useEffect(() => {
        fetchReservations().catch(err => {
            setError(`无法获取预约信息: ${err}`)
        })
    }, [])

    const cancelReservation = (reservation) => {
        async function doCancel() {
            for (const revervationId of reservation.merged_id) {
                await axios.delete(`/api/reservations/${revervationId}/`)
            }
            await fetchReservations()
        }
        setLoading(true)
        doCancel().then(() => {
            setLoading(false)
        }).catch(err => {
            setError(`无法取消预定: ${err}`)
            setLoading(false)
        })
    }

    return <>
        <div className="d-flex flex-row align-items-center justify-content-between mb-3">
            <h1 className="d-inline-block">预约</h1>
            <LoadingWhen when={loading} size="3rem" className="text-muted"></LoadingWhen>
        </div>
        <div>
            {reservations.length > 0 ?
                <ul className="list-group">
                    {mergeReservation(reservations).map(reservation =>
                        <ReservationItem
                            reservation={reservation}
                            key={reservation.id}
                            cancelReservation={() => cancelReservation(reservation)}
                            disabled={loading}>
                        </ReservationItem>)}
                </ul> : <p>今日还没有预约。</p>}
        </div>
        <ErrorWhen error={error}></ErrorWhen>
    </>
}

export default Reservations
