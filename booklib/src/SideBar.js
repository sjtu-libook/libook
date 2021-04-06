import {
    NavLink
} from "react-router-dom"
import StatusBar from './StatusBar'

function SideBar() {
    return <div>
        <nav className="navbar navbar-light bg-light">
            <div className="container-fluid">
                <ul className="navbar-nav me-auto">
                    <p className="navbar-brand">Libook</p>
                    <li className="nav-item">
                        <NavLink className="nav-link" activeClassName="active" to="/reservation/all">
                            <i className="bi bi-calendar2-event"></i>&nbsp;&nbsp;所有预约
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink
                            className="nav-link"
                            activeClassName="active"
                            to="/reservation/custom">
                            <i className="bi bi-calendar-plus"></i>&nbsp;&nbsp;自选预约
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink
                            className="nav-link"
                            activeClassName="active"
                            to="/reservation/quick">
                            <i className="bi bi-calendar-plus"></i>&nbsp;&nbsp;一键预约
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink
                            className="nav-link"
                            activeClassName="active"
                            to="/population">
                            <i className="bi bi-calendar-plus"></i>&nbsp;&nbsp;人流密度
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink
                            className="nav-link"
                            activeClassName="active"
                            to="/contact-us">
                            <i className="bi bi-calendar-plus"></i>&nbsp;&nbsp;联系我们
                        </NavLink>
                    </li>
                    <li className="nav-item my-3">
                        <StatusBar></StatusBar>
                    </li>
                </ul>
            </div>
        </nav>
    </div>
}

export default SideBar
