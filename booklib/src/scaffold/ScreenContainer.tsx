import { Container } from "@chakra-ui/layout"
import React from "react"

function ScreenContainer({ children } : React.PropsWithChildren<{}>) {
  return <Container my={3}>{children}</Container>
}

export default ScreenContainer
