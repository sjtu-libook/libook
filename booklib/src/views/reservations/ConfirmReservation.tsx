import { Button } from "@chakra-ui/button"
import { useBoolean } from "@chakra-ui/hooks"
import { Box, HStack, Text } from "@chakra-ui/layout"
import axios from "axios"
import { ExclamationTriangleFill } from "Icons"
import { range } from "lodash"
import { ReservationResult } from "models"
import moment from "moment"
import React, { ReactFragment, useState } from "react"

import { ReservationInfo } from "./models"

function ConfirmReservation({ onSubmit, reset, reservationInfo }: {
  onSubmit: () => void,
  reset: () => void,
  reservationInfo: ReservationInfo
}) {
  const [isLoading, setIsLoading] = useBoolean()
  const [error, setError] = useState<ReactFragment>()

  async function batchReserve() {
    await axios.post("/api/reservations/batch",
      range(reservationInfo.fromTime, reservationInfo.toTime + 1).map(time => ({
        time,
        region: reservationInfo.region
      })))
  }

  const doReserve = () => {
    setIsLoading.on()
    batchReserve().then(() => {
      setError(undefined)
      onSubmit()
    }).catch(err => {
      const errorResponse = err.response?.data[0] as ReservationResult
      if (errorResponse) {
        const fromTime = moment(errorResponse.time.from_time).format('HH:mm')
        const toTime = moment(errorResponse.time.to_time).format('HH:mm')
        setError(<>
          <span>{errorResponse.reason}：</span><br />
          {errorResponse.region.group.name} {errorResponse.region.name} &nbsp;
          {fromTime} ~ {toTime}
        </>)
      } else {
        setError(`${err}`)
      }
    }).finally(() => setIsLoading.off())
  }

  return <Box>
    <Text fontWeight="bold">确认要预定吗？</Text>
    {error && <Text color="yellow.500" mt={3}><ExclamationTriangleFill /> {error}</Text>}
    <HStack mt={4}>
      {reset && <Button onClick={reset}>取消</Button>}
      <Button isFullWidth colorScheme="teal" isLoading={isLoading} onClick={doReserve}>确认预定</Button>
    </HStack>
  </Box>
}

export default ConfirmReservation