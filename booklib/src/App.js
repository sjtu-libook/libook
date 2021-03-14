import MainReserve from './flows/MainReserve.js'
import ConfirmReserve from './flows/ConfirmReserve.js'
import SuccessReserve from './flows/SuccessReserve.js'
import TimeReserve from './flows/TimeReserve.js'
import LocationReserve from './flows/LocationReserve.js'
import { CSSTransition } from 'react-transition-group'

import { useState } from 'react'

function FlowTransition({ match, children }) {
    return <CSSTransition
        in={match}
        timeout={300}
        classNames="libook-flow"
        unmountOnExit
    >
        <div className="libook-flow">
            <div className="libook-flow-inner">{children}</div>
        </div>
    </CSSTransition>
}

function App() {
    let [step, setStep] = useState("quick")

    return (
        <div className="App">
            <div className="container-fluid vh-100">
                <div className="row align-items-center justify-content-center h-100">
                    <div className="col-xl-4 col-lg-6 col-md-8 col-12 libook-wizard-container">
                        <FlowTransition match={step === "quick"}><MainReserve nextStep={() => setStep("quick-confirm")} generalStep={() => setStep("general-time")}></MainReserve></FlowTransition>
                        <FlowTransition match={step === "quick-confirm"}><ConfirmReserve prevStep={() => setStep("quick")} nextStep={() => setStep("success")}></ConfirmReserve></FlowTransition>
                        <FlowTransition match={step === "general-time"}><TimeReserve prevStep={() => setStep("quick")} nextStep={() => setStep("general-location")}></TimeReserve></FlowTransition>
                        <FlowTransition match={step === "general-location"}><LocationReserve prevStep={() => setStep("general-time")} nextStep={() => setStep("general-confirm")}></LocationReserve></FlowTransition>
                        <FlowTransition match={step === "general-confirm"}><ConfirmReserve prevStep={() => setStep("general-location")} nextStep={() => setStep("success")}></ConfirmReserve></FlowTransition>
                        <FlowTransition match={step === "success"}><SuccessReserve></SuccessReserve></FlowTransition>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default App
