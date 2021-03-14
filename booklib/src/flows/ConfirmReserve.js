import { LinkButton } from './common.js'

function ConfirmReserve({ prevStep, nextStep }) {
    return (
        <>
            <div className="px-3">
                <h1>确认预定</h1>
            </div>
            <div className="px-3 mt-3 h2 fw-normal">
                <p>确认预定今天 15:00-17:00 时间段？</p>
            </div>
            <div className="display-4 d-flex justify-content-between">
                <LinkButton onClick={prevStep}><i className="bi bi-arrow-left-square"></i></LinkButton>
                <LinkButton className="ml-auto" onClick={nextStep}><i className="bi bi-check-square"></i></LinkButton>
            </div>
        </>
    )
}

export default ConfirmReserve
