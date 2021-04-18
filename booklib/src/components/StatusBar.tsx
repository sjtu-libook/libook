import { Text } from '@chakra-ui/layout'
import { Spinner } from '@chakra-ui/spinner'
import * as api from 'api'
import { ExclamationTriangleFill } from 'Icons'
import { User } from 'models'
import { Fragment, useEffect, useState } from 'react'
import { useHistory } from "react-router-dom"

function StatusBar() {
  const history = useHistory()

  const [user, setUser] = useState<User>()
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)

  useEffect(() => {
    async function fetchUser() {
      setLoading(true)
      const user = await api.fetchUser()
      setLoading(false)
      setUser(user)
      setError(false)
    }

    fetchUser().catch(error => {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        history.push("/login")
      }
      setError(true)
      setLoading(false)
    })
  }, [history])

  return (
    <Fragment>
      {error && <Text color="yellow.500"><ExclamationTriangleFill/> 无法登录</Text>}
      {loading && <Spinner size="sm"/> }
      {user && <Text fontSize="sm">{user.username}</Text>}
    </Fragment>
  )
}

export default StatusBar
