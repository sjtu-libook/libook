import { ErrorWhen, LinkButton } from './common.js'
import minBy from 'lodash/minBy'
import maxBy from 'lodash/maxBy'
import moment from 'moment'

export function parseTimeslice(timeslice) {
    const fromTime = minBy(timeslice, ts => ts.id)
    const toTime = maxBy(timeslice, ts => ts.id)
    return `${moment(fromTime.from_time).calendar()}-${moment(toTime.to_time).format('HH:mm')}`
}

function ConfirmReserve({ prevStep, nextStep, timeslice, location, error }) {
    return (
        <>
            <div className="px-3">
                <h1>确认预约</h1>
            </div>
            <div className="px-3 mt-3 h2 fw-normal">
                <p>{location && `${location.regionGroup.name} ${location.region.name}`}</p>
                <p>{timeslice && parseTimeslice(timeslice)}</p>
            </div>

            <ErrorWhen error={error}></ErrorWhen>

            <div className="display-4 d-flex justify-content-between">
                <LinkButton onClick={prevStep}><i className="bi bi-arrow-left-square"></i></LinkButton>
                <LinkButton className="ml-auto" onClick={nextStep}><i className="bi bi-check-square"></i></LinkButton>
            </div>
        </>
    )
}

export default ConfirmReserve
