import { Button } from "@chakra-ui/button"
import { Box, Heading, HStack, Spacer, Stack, Text } from "@chakra-ui/layout"
import { Progress } from "@chakra-ui/progress"
import axios from "axios"
import LinkButton from "components/LinkButton"
import { ExclamationTriangleFill } from "Icons"
import { reverse } from "lodash"
import { Reservation } from "models"
import moment from "moment"
import { useEffect, useState } from "react"
import ScreenContainer from "scaffold/ScreenContainer"

import { MergedReservation, mergeReservation } from "./reservations/utils"

function ReservationItem({ reservation, cancelReservation, isLoading }: {
  reservation: MergedReservation,
  cancelReservation: () => void,
  isLoading: boolean
}) {
  const fromTime = moment(reservation.merged_time.from_time)
  const toTime = moment(reservation.merged_time.to_time)
  const fromTimeCal = fromTime.calendar()
  const toTimeCal = toTime.format('HH:mm')
  const now = moment()

  let btnText: string | null = '取消预约'
  if (fromTime.isBefore(now)) {
    btnText = `取消 ${moment().startOf('hour').format('HH:mm')} 后的预约`
  }
  if (toTime.isBefore(now)) {
    btnText = null
  }

  return <Box p={3} shadow="sm" borderRadius="md" borderWidth={1}>
    <Stack spacing={3}>
      <Text>{fromTimeCal} - {toTimeCal}</Text>
      <Text>{reservation.region.group.name} {reservation.region.name}</Text>
      {btnText && <HStack>
        <Spacer />
        <Button onClick={cancelReservation} isLoading={isLoading}>
          {btnText}
        </Button>
      </HStack>}
    </Stack>
  </Box>
}

function MyReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isCanceling, setIsCalceling] = useState<boolean>(false)
  const [error, setError] = useState<string>()

  const fetchReservations = async () => {
    setIsLoading(true)
    const now = moment()
    const result = await axios({
      url: "/api/reservations/",
      params: {
        from_time__gte: now.startOf('day').toISOString(),
        from_time__lte: now.endOf('day').add(7, 'day').toISOString()
      }
    })
    setIsLoading(false)
    setReservations(result.data)
  }

  useEffect(() => {
    fetchReservations()
      .then(() => setError(undefined))
      .catch(err => {
        setError(`无法获取预约信息: ${err}`)
      })
  }, [])

  const cancelReservation = (reservation: MergedReservation) => {
    async function doCancel() {
      for (const revervationId of reverse(reservation.merged_id)) {
        try {
          await axios.delete(`/api/reservations/${revervationId}/`)
        } catch (err) {
          setError('部分预定已无法取消')
        }
      }
      await fetchReservations()
    }
    setIsCalceling(true)
    doCancel().finally(() => setIsCalceling(false))
  }

  return (<ScreenContainer>
    <Heading mb={3}>我的预约</Heading>
    {error && <Text color="yellow.500" mt={3}><ExclamationTriangleFill /> {error}</Text>}
    {isLoading && <Progress size="xs" isIndeterminate colorScheme="blue" />}
    <Stack spacing={5} mt={5}>
      {reservations.length !== 0 ? mergeReservation(reservations).map(reservation =>
        <ReservationItem
          reservation={reservation}
          key={reservation.id}
          cancelReservation={() => cancelReservation(reservation)}
          isLoading={isCanceling} />) : <Text>今日没有预约。</Text>}
      <Box><LinkButton to="/reservations/make/quick" isFullWidth colorScheme="teal">新预约</LinkButton></Box>
    </Stack>
  </ScreenContainer>
  )
}

export default MyReservations
