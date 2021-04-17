import './App.css'

import { ChakraProvider } from "@chakra-ui/react"
import { Fragment, useEffect } from 'react'
import { BrowserRouter as Router, Route, Switch, useHistory } from "react-router-dom"
import DoReservation from 'views/DoReservation'
import MyReservations from 'views/MyReservations'

import Navbar from './components/Navbar'
import theme from './theme'
import Login from './views/Login'
import NoMatch from './views/NoMatch'

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
      <Route exact path="/reservations/me">
        <MyReservations />
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
