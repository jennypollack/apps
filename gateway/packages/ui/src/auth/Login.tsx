import { TwoFaType, User } from '@centrifuge/gateway-lib/models/user'
import { PERMISSIONS } from '@centrifuge/gateway-lib/utils/constants'
import { Box } from 'grommet'
import React, { FunctionComponent, useContext, useState } from 'react'
import { Redirect, RouteComponentProps, withRouter } from 'react-router'
import { AppContext } from '../App'
import { httpClient } from '../http-client'
import routes from '../routes'
import LoginForm from './LoginForm'
import TwoFAForm from './TwoFAForm'

type Props = {} & RouteComponentProps

const LoginPage: FunctionComponent<Props> = (props) => {
  const [error, setError] = useState<Error>()
  const [loginCandidate, setLoginCandidate] = useState<User>()
  const { user } = useContext(AppContext)

  const login = async (loginCandidate: User) => {
    try {
      await httpClient.user.login(loginCandidate)
      window.location.reload()
    } catch (e) {
      setError(e)
    }
  }

  const loginTentative = async (loginCandidate: User) => {
    try {
      const result = (await httpClient.user.loginTentative(loginCandidate)).data
      setLoginCandidate({
        ...result,
        ...loginCandidate,
      })
      setError(undefined)
    } catch (e) {
      setError(e)
    }
  }

  // TODO figure out how to do user based redirects
  if (!!user) {
    if (user.permissions.includes(PERMISSIONS.CAN_MANAGE_USERS)) {
      return <Redirect to={routes.user.index} />
    }

    if (
      user.permissions.includes(PERMISSIONS.CAN_VIEW_DOCUMENTS) ||
      user.permissions.includes(PERMISSIONS.CAN_MANAGE_DOCUMENTS)
    ) {
      return <Redirect to={routes.documents.index} />
    }
  }

  const getInfo = (loginCandidate) => {
    return loginCandidate.twoFAType === TwoFaType.APP
      ? 'Open the Authenticator App on your mobile phone and enter in the generated security code for Gateway in the form below.'
      : 'We just sent you a message with your security code via email. Enter the code in the form below to verify your identity.'
  }

  return (
    <Box align="center" justify="center">
      <Box width="medium" background="white" border="all" margin="medium" pad="medium">
        {loginCandidate ? (
          <TwoFAForm info={getInfo(loginCandidate)} user={loginCandidate} error={error} onSubmit={login} />
        ) : (
          <LoginForm error={error} onSubmit={loginTentative} />
        )}
      </Box>
    </Box>
  )
}

export default withRouter(LoginPage)
