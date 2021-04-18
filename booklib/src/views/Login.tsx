import { Button } from '@chakra-ui/button'
import { Box, Center, Container, Flex, Heading, SimpleGrid, Stack, Text } from '@chakra-ui/layout'
import { API_ROOT } from 'api'
import React from 'react'

function Login() {
  return <Flex direction="column" position="fixed" top={0} bottom={0} width="100%" justifyContent="center">
    <Flex flexGrow={1} justifyContent="center" alignItems="center" width="100%" backgroundColor="gray.50">
      <Container maxW="container.md">
        <SimpleGrid columns={[1, null, 2]} spacing={3} p={5} alignItems="center">
          <Stack spacing={2} p={5}>
            <Heading size="xl">登录</Heading>
            <Text>欢迎使用 libook。</Text>
          </Stack>
          <Box backgroundColor="white" shadow="lg" borderRadius="md" borderWidth={1} p={5}>
            <Text mb={3}>请选择认证方式</Text>
            <Stack spacing={2}>
              <Button variant="solid" colorScheme="blackAlpha"
                onClick={() => window.location.href = API_ROOT + "/api/auth/github/login/"}>
                GitHub
              </Button>
              <Button variant="solid" colorScheme="blackAlpha"
                onClick={() => window.location.href = API_ROOT + "/api/auth/jaccount/login/"}>
                jAccount
              </Button>
              <Button variant="solid" colorScheme="blackAlpha"
                onClick={() => window.location.href = API_ROOT + "/admin/"}>
                Django Admin
              </Button>
            </Stack>
          </Box>
        </SimpleGrid>
      </Container>
    </Flex>
    <Box p={3} background="white">
      <Center>
        <Text>Libook 是一个开源的图书馆预定系统。</Text>
      </Center>
      <Center>
        <Text fontSize="xs">{process.env.REACT_APP_VERCEL_GIT_COMMIT_SHA || "Development"}</Text>
      </Center>
    </Box>
  </Flex>
}

export default Login
