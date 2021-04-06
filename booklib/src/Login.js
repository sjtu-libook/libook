function Login() {
    return <div className="container-fluid vh-100 bg-light d-flex flex-column">
        <div className="row d-flex align-items-center flex-grow-1">
            <div className="col">
                <div className="row align-items-center justify-content-center">
                    <div className="col-md-4 mb-3 mt-3">
                        <h1>登录</h1>
                        <h2 className="fw-normal">欢迎使用 libook。</h2>
                    </div>
                    <div className="col-md-4 mb-3">
                        <div className="card shadow">
                            <div className="card-body d-grid gap-2">
                                <p>请选择认证方式</p>
                                <button className="btn btn-lg btn-dark"
                                    onClick={() => window.location = "/api/auth/github/login/"}>
                                    GitHub
                                </button>
                                <button className="btn btn-lg btn-dark"
                                    onClick={() => window.location = "/api/auth/jaccount/login/"}>
                                    jAccount
                                </button>
                                <button className="btn btn-lg btn-dark"
                                    onClick={() => window.location = "/admin/"}>
                                    Django Admin
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="row bg-white p-3">
            <p className="m-0 text-center">Libook 是一个开源的图书馆预约系统。</p>
        </div>
    </div>
}

export default Login
