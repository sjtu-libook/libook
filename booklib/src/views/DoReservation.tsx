import { Box, Heading, Stack, Text } from '@chakra-ui/layout'
import moment from 'moment'
import { PropsWithChildren, useState } from 'react'
import ScreenContainer from 'scaffold/ScreenContainer'

import ConfirmReservation from './reservations/ConfirmReservation'
import { LocationDisplay, SelectLocationForm } from './reservations/LocationReservation'
import { ReservationInfo, ReservationLocationInfo, ReservationTimeInfo } from './reservations/models'
import { SelectTimeForm, TimeDisplay } from './reservations/TimeReservation'

enum ReservationStep {
  Time = 0,
  Location = 1,
  Confirm = 2,
  Success = 3
}

function ShowWhen({ showProp, children }: PropsWithChildren<{ showProp: boolean }>) {
  return <Box display={showProp ? "unset" : "none"}>
    {children}
  </Box>
}

function DoReservation() {
  const [timeInfo, setTimeInfo] = useState<ReservationTimeInfo>()
  const [locationInfo, setLocationInfo] = useState<ReservationLocationInfo>()
  const [step, setStep] = useState<ReservationStep>(ReservationStep.Time)
  const dateNextStep = (data: ReservationTimeInfo) => {
    setTimeInfo(data)
    setStep(ReservationStep.Location)
  }
  const locationNextStep = (data: ReservationLocationInfo) => {
    setLocationInfo(data)
    setStep(ReservationStep.Confirm)
  }
  const confirmNextStep = () => {
    setStep(ReservationStep.Success)
  }
  const reset = () => setStep(ReservationStep.Time)
  const reservationInfo: ReservationInfo | undefined = timeInfo && locationInfo && {
    fromTime: timeInfo?.startTime.id,
    toTime: timeInfo?.endTime.id,
    region: locationInfo?.region.id
  }

  return (
    <ScreenContainer>
      <Heading mb={3}>自选预约</Heading>

      { step === ReservationStep.Time && <SelectTimeForm onSubmit={dateNextStep} initialData={timeInfo} />}
      { step > ReservationStep.Time && timeInfo && <TimeDisplay timeInfo={timeInfo} />}
      <ShowWhen showProp={step === ReservationStep.Location}>
        {timeInfo &&
          <SelectLocationForm
            reset={reset}
            onSubmit={locationNextStep}
            initialData={locationInfo}
            startTime={timeInfo.startTime}
            endTime={timeInfo.endTime} />}
      </ShowWhen>
      { step > ReservationStep.Location && locationInfo && <LocationDisplay locationInfo={locationInfo} />}
      { step === ReservationStep.Confirm && reservationInfo &&
        <ConfirmReservation
          reset={reset}
          onSubmit={confirmNextStep}
          reservationInfo={reservationInfo} />}
      { step === ReservationStep.Success && timeInfo && <Stack>
        <Text fontWeight="bold">预约成功</Text>
        <Text>您可以在 {moment(timeInfo.startTime.from_time).calendar()} 前取消预约。</Text>
      </Stack>}
    </ScreenContainer>
  )
}

export default DoReservation