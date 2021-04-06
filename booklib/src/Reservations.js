import { ErrorWhen, LoadingWhen } from "./flows/common"
import axios from 'axios'
import { useState, useEffect } from 'react'
import moment from "moment"
import { mergeReservation } from "./utils"
import classnames from 'classnames'
import reverse from 'lodash/reverse'

function ReservationItem({ reservation, cancelReservation, disabled }) {
    const fromTime = moment(reservation.merged_time.from_time)
    const toTime = moment(reservation.merged_time.to_time)
    const fromTimeCal = fromTime.calendar()
    const toTimeCal = toTime.format('HH:mm')
    const now = moment()

    let btnText = '取消预约'
    if (fromTime.isBefore(now)) {
        btnText = `取消 ${moment().startOf('hour').format('HH:mm')} 后的预约`
    }
    if (toTime.isBefore(now)) {
        btnText = ''
    }

    return <div className="card mb-3 shadow-sm">
        <div className="card-body">
            <h5 className="card-title">{fromTimeCal} - {toTimeCal}</h5>
            <p className="card-text">{reservation.region.group.name} {reservation.region.name}</p>
            {btnText && <div className="d-flex justify-content-end">
                <button
                    onClick={cancelReservation}
                    className={classnames("btn btn-outline-secondary", disabled ? "disabled" : "")}>
                    {btnText}
                </button>
            </div>}
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
    }

    useEffect(() => {
        fetchReservations()
            .then(() => setError(null))
            .catch(err => {
                setError(`无法获取预约信息: ${err}`)
            })
    }, [])

    const cancelReservation = (reservation) => {
        async function doCancel() {
            for (const revervationId of reverse(reservation.merged_id)) {
                try {
                    await axios.delete(`/api/reservations/${revervationId}/`)
                } catch (err) {
                    setError('部分预定已无法取消')
                }
            }
            await fetchReservations()
        }
        setLoading(true)
        doCancel().then(() => {
            setLoading(false)
        })
    }

    return <>
        <div className="d-flex flex-row align-items-center justify-content-between mb-3">
            <h1 className="d-inline-block">预约</h1>
            <LoadingWhen when={loading} size="3rem" className="text-muted"></LoadingWhen>
        </div>
        <ErrorWhen error={error}></ErrorWhen>
        <div className="mt-3">
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
    </>
}

export default Reservations
