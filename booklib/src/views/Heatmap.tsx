import { Box, Heading, Stack, Text, Wrap, WrapItem } from "@chakra-ui/layout"
import { Progress } from "@chakra-ui/progress"
import * as api from 'api'
import LinkButton from "components/LinkButton"
import { ExclamationTriangleFill } from "Icons"
import { filter, first, fromPairs, last, map, range } from "lodash"
import { Region, RegionGroup } from "models"
import { Timeslice } from 'models'
import moment from "moment"
import React, { Fragment, PropsWithChildren, useEffect, useState } from "react"
import { useParams } from "react-router"
import ScreenContainer from "scaffold/ScreenContainer"

interface ReservationInfo {
  reserved: number
  time_id: number
}

const COLOR_MAPPING = [
  "green.300",
  "yellow.300",
  "orange.300",
  "red.300"
]

function colorMapping(threshold: number) {
  return COLOR_MAPPING[Math.floor(threshold * 0.9999 * COLOR_MAPPING.length)]
}

function CapacityIndicator({ color, text, children, border }:
  PropsWithChildren<{ color?: string, text?: string, border?: boolean }>) {
  return <WrapItem
    width="2rem"
    height="2rem"
    borderRadius="md"
    alignItems="center"
    justifyContent="center"
    backgroundColor={color}
    borderWidth={border ? 1 : undefined}>
    {children ? children : <Text fontSize="sm">{text}</Text>}
  </WrapItem>
}

function HeatmapComponent<T extends ReservationInfo>
({ fromTimesliceId, toTimesliceId, capacity, reservations }: {
    fromTimesliceId: number,
    toTimesliceId: number,
    capacity: number,
    reservations: T[]
  }) {
  const reserved = fromPairs(map(reservations, reservation => [reservation.time_id, reservation.reserved]))
  return (<Wrap spacing={1}>
    {
      range(fromTimesliceId, toTimesliceId + 1).map(timeId => {
        const reserveNumber = reserved[timeId] || 0
        return <CapacityIndicator color={colorMapping(reserveNumber / capacity)} text={reserveNumber.toString()} />
      })
    }
  </Wrap>)
}

const TimeBox = ({ timeslices }: { timeslices: Timeslice[] }) => (
  <Wrap spacing={1}>
    {timeslices.map(timeslice =>
      <CapacityIndicator border>
        <Text fontSize="xs" lineHeight="1.2" align="center">
          {moment(timeslice.from_time).format('HH:mm')} <br />
          {moment(timeslice.to_time).format('HH:mm')}
        </Text>
      </CapacityIndicator>
    )}
  </Wrap>
)

export function RegionGroupHeatmap() {
  const [reservations, setReservations] = useState<
    {
      group: RegionGroup,
      reservations: ReservationInfo[]
    }[]
  >()
  const [timeslice, setTimeslices] = useState<{
    firstTimeslice: Timeslice,
    lastTimeslice: Timeslice,
    timeslices: Timeslice[]
  }>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>()

  useEffect(() => {
    let isCurrent = true
    async function fetchData() {
      setIsLoading(true)
      const startOfDay = moment().startOf('day')
      const endOfDay = moment().endOf('day')
      const timeslices = await api.fetchTimeslices(
        startOfDay.toISOString(),
        endOfDay.toISOString())
      const groups = await api.fetchRegionGroups()
      if (timeslices.length === 0) return
      const firstTimeslice = first(timeslices)!
      const lastTimeslice = last(timeslices)!
      const reservations = await api.fetchRegionGroupsReservation(firstTimeslice, lastTimeslice)
      const data = map(groups, group => ({
        fromTimesliceId: firstTimeslice.id,
        toTimesliceId: lastTimeslice.id,
        group,
        reservations: filter(reservations, reservation => reservation.region_group_id === group.id)
      }))
      if (isCurrent) {
        setReservations(data)
        setTimeslices({
          firstTimeslice,
          lastTimeslice,
          timeslices
        })
      }
    }
    fetchData()
      .catch(err => setError(err.toString()))
      .finally(() => setIsLoading(false))
    return () => { isCurrent = false }
  }, [])

  return <ScreenContainer>
    <Heading mb={3}>人流密度</Heading>
    <Stack spacing={5}>
      <Progress size="xs" isIndeterminate colorScheme="blue" visibility={isLoading ? 'visible' : 'hidden'} />
      {error && <Text color="yellow.500" mt={3}><ExclamationTriangleFill /> {error}</Text>}
      {
        reservations && reservations.length > 0 && timeslice && <Fragment>
          <TimeBox timeslices={timeslice.timeslices} />
          {
            reservations.map(reservation =>
              <Stack spacing={2}>
                <Heading size="md">{reservation.group.name}</Heading>
                <Text color="gray.500">可容纳 {reservation.group.capacity} 人</Text>
                <HeatmapComponent
                  key={reservation.group.id}
                  fromTimesliceId={timeslice.firstTimeslice.id}
                  toTimesliceId={timeslice.lastTimeslice.id}
                  capacity={reservation.group.capacity}
                  reservations={reservation.reservations} />
                <Box>
                  <LinkButton size="sm" to={`/reservations/visualize/${reservation.group.id}`}>查看详情</LinkButton>
                </Box>
              </Stack>)
          }
        </Fragment>
      }

    </Stack>
  </ScreenContainer>
}

export function RegionHeatmap() {
  const [reservations, setReservations] = useState<
    {
      region: Region,
      reservations: ReservationInfo[]
    }[]
  >()
  const [timeslice, setTimeslices] = useState<{
    firstTimeslice: Timeslice,
    lastTimeslice: Timeslice,
    timeslices: Timeslice[]
  }>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>()
  const { groupId } = useParams<{ groupId: string }>()

  useEffect(() => {
    let isCurrent = true
    async function fetchData() {
      setIsLoading(true)
      const startOfDay = moment().startOf('day')
      const endOfDay = moment().endOf('day')
      const timeslices = await api.fetchTimeslices(
        startOfDay.toISOString(),
        endOfDay.toISOString())
      const groupIdNumber = parseInt(groupId)
      if (!groupIdNumber) return
      const group = await api.fetchRegionGroupDetail(groupIdNumber)
      if (timeslices.length === 0) return
      const firstTimeslice = first(timeslices)!
      const lastTimeslice = last(timeslices)!
      const reservations = await api.fetchRegionGroupReservation(groupIdNumber, firstTimeslice, lastTimeslice)
      const data = map(group.regions, region => ({
        fromTimesliceId: firstTimeslice.id,
        toTimesliceId: lastTimeslice.id,
        region,
        reservations: filter(reservations, reservation => reservation.region_id === region.id)
      }))
      if (isCurrent) {
        setReservations(data)
        setTimeslices({
          firstTimeslice,
          lastTimeslice,
          timeslices
        })
      }
    }
    fetchData()
      .catch(err => setError(err.toString()))
      .finally(() => setIsLoading(false))
    return () => { isCurrent = false }
  }, [groupId])

  return <ScreenContainer>
    <Heading mb={3}>人流密度</Heading>
    <Stack spacing={5}>
      <Progress size="xs" isIndeterminate colorScheme="blue" visibility={isLoading ? 'visible' : 'hidden'} />
      {error && <Text color="yellow.500" mt={3}><ExclamationTriangleFill /> {error}</Text>}
      {
        reservations && reservations.length > 0 && timeslice && <Fragment>
          <TimeBox timeslices={timeslice.timeslices} />
          {
            reservations.map(reservation =>
              <Stack spacing={2}>
                <Heading size="md">{reservation.region.name}</Heading>
                <Text color="gray.500">可容纳 {reservation.region.capacity} 人</Text>
                <HeatmapComponent
                  key={reservation.region.id}
                  fromTimesliceId={timeslice.firstTimeslice.id}
                  toTimesliceId={timeslice.lastTimeslice.id}
                  capacity={reservation.region.capacity}
                  reservations={reservation.reservations} />
              </Stack>)
          }
        </Fragment>
      }

    </Stack>
  </ScreenContainer>
}
