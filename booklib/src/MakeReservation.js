import axios from 'axios'
import { CSSTransition } from 'react-transition-group'
import { useState } from 'react'

import MainReserve from './flows/MainReserve.js'
import ConfirmReserve from './flows/ConfirmReserve.js'
import SuccessReserve from './flows/SuccessReserve.js'
import TimeReserve from './flows/TimeReserve.js'
import LocationReserve from './flows/LocationReserve.js'
import DoReserve from './flows/DoReserve.js'

function FlowTransition({ match, children }) {
    return <CSSTransition
        in={match}
        appear={match}
        timeout={300}
        classNames="libook-flow"
    >
        <div className="libook-flow">
            <div className="libook-flow-inner">{children}</div>
        </div>
    </CSSTransition>
}

function MakeReservation() {
    let [step, setStep] = useState("quick")
    let [timeslice, setTimeslice] = useState(null)
    let [location, setLocation] = useState(null)
    let [error, setError] = useState(null)

    const onDoReserve = (returnStep, nextStep) => {
        setStep("in-progress")
        async function batchReserve() {
            await axios.post("/api/reservations/batch",
                timeslice.map(ts => ({
                    time: ts.id,
                    region: location.region.id
                })))
        }

        batchReserve().catch(err => {
            setError(`${err}`)
            setStep(returnStep)
        }).then(() => {
            setError(null)
            setStep(nextStep)
        })
    }

    return (
        <>
            <FlowTransition match={step === "in-progress"}>
                <DoReserve></DoReserve>
            </FlowTransition>
            <FlowTransition match={step === "quick"}>
                <MainReserve
                    nextStep={() => setStep("quick-confirm")}
                    generalStep={() => setStep("general-time")}
                ></MainReserve>
            </FlowTransition>
            <FlowTransition match={step === "quick-confirm"}>
                <ConfirmReserve
                    timeslice={timeslice}
                    prevStep={() => setStep("quick")}
                    nextStep={() => setStep("in-progress")}>
                </ConfirmReserve>
            </FlowTransition>
            <FlowTransition match={step === "general-time"}>
                <TimeReserve
                    prevStep={() => setStep("quick")}
                    nextStep={timeslice => { setTimeslice(timeslice); setStep("general-location") }}>
                </TimeReserve>
            </FlowTransition>
            <FlowTransition match={step === "general-location"}>
                <LocationReserve
                    timeslice={timeslice}
                    prevStep={() => setStep("general-time")}
                    nextStep={location => { setLocation(location); setStep("general-confirm") }}>
                </LocationReserve>
            </FlowTransition>
            <FlowTransition match={step === "general-confirm"}>
                <ConfirmReserve
                    timeslice={timeslice}
                    location={location}
                    error={error}
                    prevStep={() => setStep("general-location")}
                    nextStep={() => onDoReserve("general-confirm", "success")}>
                </ConfirmReserve>
            </FlowTransition>
            <FlowTransition match={step === "success"}>
                <SuccessReserve timeslice={timeslice}></SuccessReserve>
            </FlowTransition>
        </>
    )
}

export default MakeReservation
