function Reservations() {
    return <>
        <div className="d-flex flex-row align-items-center justify-content-between mb-3">
            <h1 className="d-inline-block">登录</h1>
        </div>
        <div className="display-4">
            <div>
                <button
                    className="libook-big-selection btn btn-link"
                    onClick={() => window.location = "/api/auth/github/login/"}>GitHub</button>
            </div>
            <div>
                <button
                    className="libook-big-selection btn btn-link"
                    onClick={() => window.location = "/api/auth/jaccount/login/"}>jAccount</button>
            </div>
        </div>
    </>
}

export default Reservations
