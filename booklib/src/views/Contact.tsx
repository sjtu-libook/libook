import { Heading, Link, Stack, Text } from "@chakra-ui/layout"
import { BoxArrowUpRightIcon } from "Icons"
import ScreenContainer from "scaffold/ScreenContainer"

function Contact() {
  return (
    <ScreenContainer>
      <Heading mb={3}>联系我们</Heading>
      <Stack spacing={2}>
        <Text>感谢您使用 Libook。Libook 是一个开源的图书馆座位预订系统。</Text>
        <Text>
          <Link isExternal={true} href="https://github.com/skyzh/libook">浏览源代码 (GitHub) <BoxArrowUpRightIcon /> </Link>
        </Text>
        <Text fontWeight="bold">版本信息</Text>
        <Text>{process.env.REACT_APP_VERCEL_GIT_COMMIT_SHA || "Development"}</Text>
        <Text>{process.env.REACT_APP_VERCEL_GIT_COMMIT_MESSAGE || "Development"}</Text>
      </Stack>
    </ScreenContainer> 
  )
}

export default Contact
