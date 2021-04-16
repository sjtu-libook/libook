import { Container, Heading, Stack, Text  } from "@chakra-ui/layout"
import LinkButton from "components/LinkButton"
import ScreenContainer from "scaffold/ScreenContainer"

function NoMatch() {
  return <ScreenContainer>
    <Stack spacing={5}>
      <Heading textAlign="center">404 Not Found</Heading>
      <Text textAlign="center">您访问的页面不存在</Text>
    </Stack>
    <Container mt="10rem"><LinkButton isFullWidth to="/">返回首页</LinkButton></Container>
  </ScreenContainer>
}

export default NoMatch