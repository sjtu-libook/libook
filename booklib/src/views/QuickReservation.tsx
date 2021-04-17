import { Button } from '@chakra-ui/button'
import { Box, Heading, SimpleGrid, Stack, Text } from '@chakra-ui/layout'
import LinkButton from 'components/LinkButton'
import moment from 'moment'
import { useState } from 'react'
import ScreenContainer from 'scaffold/ScreenContainer'

import ConfirmReservation from './reservations/ConfirmReservation'
import { QuickReservationInfo, ReservationInfo } from './reservations/models'
import { SimpleForm } from './reservations/SimpleReservation'

enum ReservationStep {
  Select = 0,
  Confirm = 1,
  Success = 2
}

function QuickReservation() {
  const [step, setStep] = useState<ReservationStep>(ReservationStep.Select)
  const [quickReservationInfo, setReservationInfo] = useState<QuickReservationInfo>()
  const reservationInfo: ReservationInfo | undefined = quickReservationInfo && {
    fromTime: quickReservationInfo.startTime.id,
    toTime: quickReservationInfo.endTime.id,
    region: quickReservationInfo.region.id
  }

  const selectNextStep = (info: QuickReservationInfo) => {
    setReservationInfo(info)
    setStep(ReservationStep.Confirm)
  }

  const confirmNextStep = () => {
    setStep(ReservationStep.Success)
  }
  const reset = () => setStep(ReservationStep.Select)

  return (
    <ScreenContainer>
      <Heading mb={3}>快速预约</Heading>

      { step === ReservationStep.Select &&
       <SimpleForm initialData={quickReservationInfo} onSubmit={selectNextStep}/>}
      { step > ReservationStep.Select && quickReservationInfo && <Text>{JSON.stringify(quickReservationInfo)}</Text>}
      { step === ReservationStep.Confirm && reservationInfo &&
        <ConfirmReservation
          reset={reset}
          onSubmit={confirmNextStep}
          reservationInfo={reservationInfo} />}
      { step === ReservationStep.Success && quickReservationInfo && <Stack spacing={3}>
        <Text fontWeight="bold">预约成功</Text>
        <Text>您可以在 {moment(quickReservationInfo.startTime.from_time).calendar()} 前取消预约。</Text>
        <SimpleGrid columns={[1, null, 2]} spacing={3}>
          <Box><LinkButton to="/reservations/me" isFullWidth>查看所有预约</LinkButton></Box>
          <Box><Button colorScheme="teal" onClick={reset} isFullWidth>继续预约</Button></Box>
        </SimpleGrid>
      </Stack>}
    </ScreenContainer>
  )
}

export default QuickReservation