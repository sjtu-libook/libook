import MainReserve from './flows/MainReserve.js'
import ConfirmReserve from './flows/ConfirmReserve.js'
import SuccessReserve from './flows/SuccessReserve.js'
import TimeReserve from './flows/TimeReserve.js'

import { useState } from 'react'

function App() {
    let [step, setStep] = useState("general-time")
    
    return (
        <div className="App">
            <div className="container-fluid vh-100">
                <div className="row align-items-center justify-content-center h-100">
                    <div className="col-xl-4 col-lg-6 col-md-8 col-12 libook-wizard-container">
                        {step === "quick" ? <MainReserve nextStep={() => setStep("quick-confirm")} generalStep={() => setStep("general-time")}></MainReserve> : <></>}
                        {step === "quick-confirm" ? <ConfirmReserve prevStep={() => setStep("quick")} nextStep={() => setStep("success")}></ConfirmReserve> : <></>}
                        {step === "general-time" ? <TimeReserve prevStep={() => setStep("quick")}></TimeReserve> : <></>}
                        {step === "success" ? <SuccessReserve></SuccessReserve> : <></>}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default App
