import MainReserve from './flows/MainReserve.js'
import ConfirmReserve from './flows/ConfirmReserve.js'
import SuccessReserve from './flows/SuccessReserve.js'
import { useState } from 'react'

function App() {
    let [step, setStep] = useState(0)
    return (
        <div className="App">
            <div className="container vh-100">
                <div className="row align-items-center justify-content-center h-100">
                    <div className="col-lg-6 col-12">
                        {step === 0 ? <MainReserve nextStep={() => setStep(1)}></MainReserve> : <></>}
                        {step === 1 ? <ConfirmReserve prevStep={() => setStep(0)} nextStep={() => setStep(2)}></ConfirmReserve> : <></>}
                        {step === 2 ? <SuccessReserve></SuccessReserve> : <></>}
            
                    </div>
                </div>
            </div>
        </div>
    )
}

export default App
