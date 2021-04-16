import { ButtonProps } from "@chakra-ui/button"
import { useDisclosure } from "@chakra-ui/hooks"
import { Image } from "@chakra-ui/image"
import { Box, Flex, HStack, Spacer, Stack } from "@chakra-ui/layout"
import LinkButton from "components/LinkButton"
import { PropsWithChildren } from "react"
import { Route } from "react-router"
import StatusBar from "./StatusBar"

function NavButton({ to, exact = false, children, ...rest }: 
  PropsWithChildren<{ to: string, exact?: boolean } & ButtonProps>) {
  return (
    <Route
      path={to}
      exact={exact}
      children={({ match }) => (
        <LinkButton to={to}
          colorScheme={match ? "blue" : "gray"}
          color={match ? "blue.600" : "gray.500"}
          variant="unstyled"
          justifyContent="flex-start"
          borderBottomWidth={3}
          borderTopWidth={3}
          borderTopColor="transparent"
          borderBottomColor={match ? "blue.600" : "transparent"}
          borderRadius={0}
          {...rest}>
          {children}
        </LinkButton>
      )}
    />
  )
}


function Navbar() {
  const { isOpen } = useDisclosure()

  const links = [
    { text: "我的预约", link: "/reservations/me" },
    { text: "快速预约", link: "/reservations/make/quick" },
    { text: "自选预约", link: "/reservations/make/custom" },
  ]

  return (
    <>
      <Box px={4}>
        <Flex h={14} alignItems='center' justifyContent='space-between'>
          <HStack spacing={8} alignItems={'center'}>
            <HStack>
              <Image src="/static/apple-touch-icon.png" boxSize={10} />
            </HStack>
            <HStack
              as='nav'
              spacing={4}
              display={{ base: 'none', md: 'flex' }}>
              {links.map((link) => (
                <NavButton key={link.link} to={link.link}>{link.text}</NavButton>
              ))}
            </HStack>
          </HStack>
          <Spacer />
          <HStack>
            <StatusBar />
          </HStack>

          {isOpen ? (
            <Box pb={4}>
              <Stack as={'nav'} spacing={4}>
                {links.map((link) => (
                  <NavButton key={link.link} to={link.link}>{link.text}</NavButton>
                ))}
              </Stack>
            </Box>
          ) : null}
        </Flex>
      </Box>
    </>)
}

export default Navbar
