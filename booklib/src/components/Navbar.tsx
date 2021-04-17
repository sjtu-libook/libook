import { ButtonProps, IconButton } from "@chakra-ui/button"
import { Image } from "@chakra-ui/image"
import { Box, Flex, HStack, Spacer, Stack } from "@chakra-ui/layout"
import { Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/menu"
import LinkButton from "components/LinkButton"
import { ListIcon } from 'Icons'
import { PropsWithChildren } from "react"
import { Route, useHistory } from "react-router"

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
  const links = [
    { text: "我的预定", link: "/reservations/me" },
    { text: "快速预定", link: "/reservations/make/quick" },
    { text: "自选预定", link: "/reservations/make/custom" },
    { text: "人流密度", link: "/reservations/visualize" },
    { text: "联系我们", link: "/contact" },
  ]
  const history = useHistory()

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
            <Menu>
              <MenuButton as={IconButton} 
                icon={<ListIcon />} 
                size="sm"
                variant="ghost" 
                colorScheme="blue"
                display={{ base: 'unset', md: 'none' }}>
              </MenuButton>
              <MenuList>
                {links.map((link) => (
                  <MenuItem key={link.link} onClick={() => history.push(link.link)}>{link.text}</MenuItem>
                ))}
              </MenuList>
            </Menu>
            <StatusBar />
          </HStack>
          {true ? (
            <Box pb={4}>
              <Stack as={'nav'} spacing={4}>

              </Stack>
            </Box>
          ) : null}
        </Flex>
      </Box>
    </>)
}

export default Navbar
