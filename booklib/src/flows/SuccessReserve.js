import { LinkButton } from './common.js'
import minBy from 'lodash/minBy'
import moment from 'moment'
import { Link } from "react-router-dom"

function parseTimeslice(timeslice) {
    const fromTime = minBy(timeslice, ts => ts.id)
    return moment(fromTime.to_time).calendar()
}

function SuccessReserve({ timeslice }) {
    return (
        <>
            <div className="px-3">
                <h1>预约成功</h1>
            </div>
            <div className="px-3 mt-3 h2 fw-normal">
                <p>您可以在 {timeslice && parseTimeslice(timeslice)} 前取消预约。</p>
            </div>
            <div className="h3 d-flex justify-content-end">
                <Link to="/">
                    <LinkButton className="text-muted">查看当前预约 <i className="bi bi-arrow-right"></i></LinkButton>
                </Link>
            </div>
            <div className="h3 d-flex justify-content-end">
                <LinkButton className="text-muted">继续预约 <i className="bi bi-arrow-right"></i></LinkButton>
            </div>
            <div className="h3 d-flex justify-content-end">
                <LinkButton className="text-muted">人流密度 <i className="bi bi-arrow-right"></i></LinkButton>
            </div>
        </>
    )
}

export default SuccessReserve
