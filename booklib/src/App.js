import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom"
import MakeReservation from "./MakeReservation"
import Reservations from './Reservations'
import SideBar from './SideBar'
import Login from './Login'

function CardWarpper({ children }) {
    return <div className="w-100 h-100 d-flex justify-content-center align-items-center">
        <div className="col-xl-6 col-lg-8 col-md-10 col-12 libook-wizard-container">
            <div className="col-12">
                {children}
            </div>
        </div>
    </div>
}
function App() {
    return <Router>
        <Switch>
            <div className="container-fluid vh-100">
                <div className="row justify-content-center h-100">
                    <div className="col d-none d-md-block libook-sidebar bg-light">
                        <SideBar></SideBar>
                    </div>
                    <div className="col p-3">
                        <Route path="/reservation/custom">
                            <CardWarpper>
                                <MakeReservation custom></MakeReservation>
                            </CardWarpper>
                        </Route>
                        <Route path="/reservation/quick">
                            <CardWarpper>
                                <MakeReservation></MakeReservation>
                            </CardWarpper>
                        </Route>
                        <Route exact path="/">
                            <CardWarpper>
                                <Reservations></Reservations>
                            </CardWarpper>
                        </Route>
                    </div>
                </div>
            </div>
            <Route path="/login">
                <Login></Login>
            </Route>
        </Switch>
    </Router >
}

export default App
