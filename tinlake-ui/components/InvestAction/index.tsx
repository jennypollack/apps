import { Anchor, Box, Button, Paragraph } from 'grommet'
import * as React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import config, { Pool, UpcomingPool } from '../../config'
import { ensureAuthed } from '../../ducks/auth'
import { PoolData as PoolDataV3, PoolState } from '../../ducks/pool'
import { PoolsState } from '../../ducks/pools'
import { PoolLink } from '../PoolLink'
import { FormModal, InvestmentSteps } from './styles'

interface Props {
  anchor?: React.ReactNode
  pool?: Pool | UpcomingPool
}

const InvestAction: React.FC<Props> = (props: Props) => {
  const [modalIsOpen, setModalIsOpen] = React.useState(false)

  const onOpen = () => setModalIsOpen(true)
  const onClose = () => setModalIsOpen(false)

  const dispatch = useDispatch()

  const pools = useSelector<any, PoolsState>((state) => state.pools)
  const pool = useSelector<any, PoolState>((state) => state.pool)
  const poolData = pool?.data as PoolDataV3 | undefined

  const [status, setStatus] = React.useState<any>(undefined)
  const [agreementLink, setAgreementLink] = React.useState<string | undefined>(undefined)

  const address = useSelector<any, string | null>((state) => state.auth.address)

  const connect = () => {
    dispatch(ensureAuthed())
    setModalIsOpen(false)
  }

  const getOnboardingStatus = async () => {
    if (address) {
      const req = await fetch(`${config.onboardAPIHost}addresses/${address}/status`)
      const body = await req.json()
      console.log({ status: body })
      setStatus(body)

      if (body.agreements.length > 0) {
        const req = await fetch(`${config.onboardAPIHost}agreements/${body.agreements[0].id}/link`)
        const link = await req.text()
        setAgreementLink(link)
      }
    }
  }

  React.useEffect(() => {
    getOnboardingStatus()
  }, [address])

  React.useEffect(() => {
    // if (props.pool) {
    //   const pool = pools.data?.pools.find((pool: PoolData) => {
    //     return 'addresses' in props.pool! && pool.id === (props.pool as Pool).addresses.ROOT_CONTRACT.toLowerCase()
    //   })

    //   if (pool) setStatus(getPoolStatus(pool))

    //   console.log({ status })
    // }

    getOnboardingStatus()
  }, [pools])

  return (
    <>
      {props.pool && (poolData?.senior?.inMemberlist || poolData?.junior?.inMemberlist) && (
        <Box margin={{ left: 'auto' }}>
          <PoolLink href={'/investments'}>
            <Button primary label="Invest" fill={false} />
          </PoolLink>
        </Box>
      )}
      {props.pool && !(poolData?.senior?.inMemberlist || poolData?.junior?.inMemberlist) && (
        <Box margin={{ left: 'auto' }}>
          <Button primary label="Get started" fill={false} onClick={onOpen} />
        </Box>
      )}
      {!props.pool && (
        <Anchor
          onClick={onOpen}
          margin={{ top: 'small', bottom: 'small' }}
          label="Interested in investing in Tinlake pools? Start your onboarding process now"
        />
      )}

      <FormModal opened={modalIsOpen} title={'Interested in investing?'} onClose={onClose} style={{ width: '800px' }}>
        <Paragraph margin={{ top: 'small', bottom: 'small' }}>
          Tinlake has integrated Securitize.io’s automated KYC process for a smooth investor onboarding. Once Securitize
          has verified your documentation you will be provided with your “Securitize iD” which makes you eligible to
          invest in all open Tinlake pools. To invest in an individual pool you will be asked to sign the subscription
          agreement with the pool’s issuer also provided through the Securitize dashboard.
        </Paragraph>

        <InvestmentSteps src="/static/kyc-steps.svg" alt="Investment steps" />

        <Box
          direction="row"
          justify="center"
          width={'40%'}
          margin={{ left: 'auto', right: 'auto' }}
          gap="medium"
          style={{ textAlign: 'center' }}
        >
          {!address && (
            <Box flex={true} justify="between">
              <Paragraph>Please connect with the wallet you want to use for investment.</Paragraph>
              <Button primary label={`Connect`} onClick={connect} fill={false} />
            </Box>
          )}
          {status?.kyc.url && !status.kyc.created && (
            <Box flex={true} justify="between">
              <Paragraph>KYC started, will notify when done, can continue with SubDoc.</Paragraph>
              <Button primary label={`Start KYC`} href={status.kyc.url} fill={false} />
            </Box>
          )}
          {status?.kyc.url && status.kyc.created && !status.kyc.verified && (
            <Box flex={true} justify="between">
              <Paragraph>Onboarding pending, please continue signing subdoc.</Paragraph>
              <Button primary label={`Sign Subscription Agreement`} href={agreementLink} fill={false} />
            </Box>
          )}
        </Box>

        {props.pool && (
          <Paragraph
            margin={{ top: 'medium', bottom: '0', left: 'large', right: 'large' }}
            style={{ textAlign: 'center' }}
          >
            Any questions left? Feel free to reach out to the Issuer directly (see Pool Overview).
          </Paragraph>
        )}

        {!props.pool && (
          <Paragraph
            margin={{ top: 'medium', bottom: '0', left: 'large', right: 'large' }}
            style={{ textAlign: 'center' }}
          >
            Already an eligible Tinlake investor? Head over to the individual pools to get started with signing the
            subscription agreement or login to Securitize and select the respective pool there.
          </Paragraph>
        )}
      </FormModal>
    </>
  )
}

export default InvestAction
