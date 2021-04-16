import { Fragment, useEffect, useState } from 'react'
import { useHistory } from "react-router-dom"
import axios from 'axios'
import { User } from 'models'
import { Spinner } from '@chakra-ui/spinner'
import { Text } from '@chakra-ui/layout'
import { ExclamationTriangleFill } from 'Icons'


function StatusBar() {
  const history = useHistory()

  const [user, setUser] = useState<User>()
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)

  useEffect(() => {
    async function fetchUser() {
      setLoading(true)
      const result = await axios("/api/users/self")
      setLoading(false)
      setUser(result.data)
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
