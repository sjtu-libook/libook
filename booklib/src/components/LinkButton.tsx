import { Button, ButtonProps } from "@chakra-ui/button"
import { Link } from "@chakra-ui/layout"
import { PropsWithChildren } from "react"
import { Link as ReachLink } from "react-router-dom"

function LinkButton({ to, children, ...rest }: PropsWithChildren<{ to: string } & ButtonProps>) {
  return (<Link as={ReachLink} to={to} _hover={undefined}>
    <Button {...rest}>{children}</Button>
  </Link>)
}

export default LinkButton