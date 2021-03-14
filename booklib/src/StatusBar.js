import { useEffect, useState } from 'react'
import axios from 'axios'

function StatusBar() {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        async function fetchUser() {
            setLoading(true)
            const result = await axios("/api/users/self")
            setLoading(false)
            setUser(result.data)
            setError(null)
        }

        fetchUser().catch(error => {
            if (error?.response?.status === 401) {
                window.location = "/api/auth/github/login"
            }
            setError(true)
            setLoading(false)
        })
    }, [])

    return (
        <>
            {error && <><i className="bi bi-exclamation-triangle-fill text-warning"></i> 无法登陆</>}
            {loading && <div className="spinner-border spinner-border-sm text-muted" role="status">
                <span className="visually-hidden">加载中...</span>
            </div>}
            {user && `欢迎您，${user.username}`}
        </>
    )
}

export default StatusBar
