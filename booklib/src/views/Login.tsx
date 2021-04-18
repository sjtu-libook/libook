import { Button, ButtonProps } from '@chakra-ui/button'
import { Box, Center, Container, Flex, Heading, Link, SimpleGrid, Stack, Text } from '@chakra-ui/layout'
import { API_ROOT } from 'api'
import React, { PropsWithChildren } from 'react'


function RedirectButton({ to, children, ...rest }: PropsWithChildren<{ to: string } & ButtonProps>) {
  return (<Link href={to} _hover={undefined}>
    <Button {...rest}>{children}</Button>
  </Link>)
}

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
              <RedirectButton variant="solid" colorScheme="blackAlpha"
                to={API_ROOT + "/api/auth/github/login/"}
                isFullWidth>
                GitHub
              </RedirectButton>
              <RedirectButton variant="solid" colorScheme="blackAlpha"
                to={API_ROOT + "/api/auth/jaccount/login/"}
                isFullWidth>
                jAccount
              </RedirectButton>
              <RedirectButton variant="solid" colorScheme="blackAlpha"
                to={API_ROOT + "/admin/"}
                isFullWidth>
                Django Admin
              </RedirectButton>
            </Stack>
          </Box>
        </SimpleGrid>
      </Container>
    </Flex>
    <Box p={3} background="white">
      <Center>
        <Text>Libook 是一个开源的图书馆预定系统。</Text>
      </Center>
    </Box>
  </Flex>
}

export default Login
