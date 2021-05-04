import { IconButton } from '@chakra-ui/button'
import { HStack, Text } from '@chakra-ui/layout'
import * as api from 'api'
import { ArrowClockwiseIcon,ExclamationTriangleFill } from 'Icons'
import { TokenResult } from 'models'
import { Fragment, useEffect, useState } from 'react'
import { useHistory } from "react-router-dom"

function Token() {
  const history = useHistory()

  const [token, setToken] = useState<TokenResult>()
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const token = await api.fetchToken()
      setLoading(false)
      setToken(token)
      setError(false)
    }

    fetchData().catch(_error => doRefreshToken()).finally(() => setLoading(false))
  }, [history])

  const doRefreshToken = () => {
    async function fetchData() {
      setLoading(true)
      const token = await api.refreshToken()
      setLoading(false)
      setToken(token)
      setError(false)
    }

    fetchData().catch(_error => setError(true)).finally(() => setLoading(false))
  }

  function Digit({ digit }: { digit: string }) {
    return <Text borderRadius="md" borderWidth={1} px={2} py={1} fontSize="lg" fontWeight="bold">{digit}</Text>
  }

  return (
    <Fragment>
      <HStack spacing={3}>
        <Text>验证码</Text>
        {token &&
          <HStack spacing={1}>
            {token.token.split('').map((ch, idx) => <Digit digit={ch} key={idx}></Digit>)}
          </HStack>
        }
        {error && <Text color="yellow.500"><ExclamationTriangleFill /> 无法获取验证码</Text>}
        <IconButton
          onClick={doRefreshToken}
          variant="ghost"
          icon={<ArrowClockwiseIcon />}
          isLoading={loading}
          aria-label="Refresh" />
      </HStack>
    </Fragment>
  )
}

export default Token
