import {
    BrowserRouter as Router,
    Switch,
    Route,
    NavLink
} from "react-router-dom"
import MakeReservation from "./MakeReservation"
import Reservations from './Reservations'
import StatusBar from "./StatusBar"

function App() {
    return <Router>
        <div className="container-fluid vh-100">
            <div className="row justify-content-center h-100">
                <div className="col-12 mb-3 p-0">
                    <nav class="navbar navbar-expand-lg navbar-light bg-light">
                        <div class="container-fluid">
                            <ul className="navbar-nav me-auto">
                                <li className="nav-item">
                                    <NavLink className="nav-link" activeClassName="active" exact to="/">所有预约</NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink
                                        className="nav-link"
                                        activeClassName="active"
                                        to="/reservation/new">新预约</NavLink>
                                </li>
                            </ul>
                            <StatusBar></StatusBar>
                        </div>
                    </nav>
                </div>
                <div className="col-xl-4 col-lg-6 col-md-8 col-12 libook-wizard-container">
                    <div className="col-12">
                        <Switch>
                            <Route path="/reservation/new">
                                <MakeReservation></MakeReservation>
                            </Route>
                            <Route path="/">
                                <Reservations></Reservations>
                            </Route>
                        </Switch>
                    </div>
                </div>
            </div>
        </div >
    </Router >
}

export default App
