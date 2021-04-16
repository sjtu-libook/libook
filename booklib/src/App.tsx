import './App.css'
import Login from './views/Login'
import theme from './theme'
import { ChakraProvider } from "@chakra-ui/react"
import { Route, BrowserRouter as Router, Switch, useHistory } from "react-router-dom"
import Navbar from './components/Navbar'
import { Fragment, useEffect } from 'react'
import NoMatch from './views/NoMatch'
import DoReservation from 'views/DoReservation'

function RedirectPath() {
  const history = useHistory()
  useEffect(() => {
    history.replace('/reservations/me')
  })
  return <Fragment />
}

function App() {
  const MainRoutes = () => (<Fragment>
    <Navbar />
    <Switch>
      <Route exact path="/">
        <RedirectPath />
      </Route>
      <Route exact path="/reservations/make/custom">
        <DoReservation />
      </Route>
      <Route path="*">
        <NoMatch />
      </Route>
    </Switch>
  </Fragment>)
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Switch>
          <Route path="/login">
            <Login />
          </Route>
          <Route component={MainRoutes} />
        </Switch>
      </Router>
    </ChakraProvider>
  )
}

export default App
