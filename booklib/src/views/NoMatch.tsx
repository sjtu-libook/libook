import { Box, Center, Flex, Heading, Stack, Text } from "@chakra-ui/layout"
import LinkButton from "components/LinkButton"

function NoMatch() {
  return <Flex alignItems="center" justifyContent="center" direction="column" minHeight="80vh">
    <Stack spacing={5}>
      <Heading textAlign="center">404 Not Found</Heading>
      <Text textAlign="center">您访问的页面不存在</Text>
      <Center>
        <LinkButton to="/">返回首页</LinkButton>
      </Center>
    </Stack>
  </Flex>
}

export default NoMatch