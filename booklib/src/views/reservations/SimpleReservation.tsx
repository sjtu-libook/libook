import { Button } from "@chakra-ui/button"
import { FormControl, FormErrorMessage, FormLabel } from "@chakra-ui/form-control"
import { Box, SimpleGrid, Stack, Text } from "@chakra-ui/layout"
import { Radio, RadioGroup } from "@chakra-ui/radio"
import { Skeleton } from "@chakra-ui/skeleton"
import * as api from 'api'
import LinkButton from "components/LinkButton"
import { Field, FieldProps, Form, Formik } from 'formik'
import { ExclamationTriangleFill, StarFillIcon } from "Icons"
import { concat, filter, find, findIndex, first, last, map, minBy, range, sampleSize, shuffle, sortBy } from "lodash"
import { RegionGroup } from "models"
import moment from "moment"
import { Fragment, useEffect, useMemo, useState } from "react"

import { QuickReservationInfo, RecommendedRegionGroup } from './models'
import { calendarStringOf, dateSelections, orZero } from "./utils"

export function SimpleForm({ onSubmit, initialData }:
  { onSubmit: (data: QuickReservationInfo) => void, initialData?: QuickReservationInfo }) {
  const dates = useMemo(() => dateSelections(3), [])
  const [recommendRegions, setRecommendRegions] = useState<RegionGroup[]>()
  const [error, setError] = useState<string>()

  const validateDate = (dateId: string) => {
    if (!dateId) {
      return "请选择一个日期"
    }
    const dateIdNumber = parseInt(dateId)
    if (dateIdNumber < 0 || dateIdNumber >= dates.length) {
      return "请选择一个日期"
    }
    return null
  }

  useEffect(() => {
    let isCurrent = true
    async function fetchData() {
      const SELECT_GROUP = 12
      const groups = await api.fetchRecommendedRegionGroups()
      const otherGroups = await api.fetchRegionGroups()
      let finalGroups = sampleSize(groups, SELECT_GROUP)
        .map(group => ({ ...group, star: true } as RecommendedRegionGroup))
      if (finalGroups.length < SELECT_GROUP) {
        const otherGroupsSelected = sampleSize(otherGroups, SELECT_GROUP - finalGroups.length)
          .map(group => ({ ...group, star: false } as RecommendedRegionGroup))
        finalGroups = concat(finalGroups, otherGroupsSelected)
      }
      if (isCurrent) {
        setRecommendRegions(finalGroups)
      }
    }

    fetchData().catch(err => { if (isCurrent) setError(err.toString()) })
    return () => { isCurrent = false }
  }, [])

  const DateField = ({ name }: { name: string }) => (
    <Field name={name} validate={validateDate}>
      {({ field, form }: FieldProps<number>) => (
        <FormControl isInvalid={!!(form.errors[name] && form.touched[name])}>
          <FormLabel htmlFor={name}>进馆日期</FormLabel>
          <RadioGroup id={name} {...field}>
            <Stack>
              {dates.map((date, idx: number) =>
                <Radio key={idx} {...field} value={idx.toString()}>
                  {calendarStringOf(date)} ({date.format('L')})
                </Radio>)}
            </Stack>
          </RadioGroup>
          <FormErrorMessage>{form.errors[name]}</FormErrorMessage>
        </FormControl>
      )}
    </Field>)

  const EnumField = <T,>({ name, data, label }:
    { name: string, data: T[], label: string }) => (
      <Field name={name} validate={
        (value: string) => (value !== '' && parseInt(value) <= data.length) ? null : "请选择一个选项"
      }>
        {({ field, form }: FieldProps<number>) => (
          <FormControl isInvalid={!!(form.errors[name] && form.touched[name])}>
            <FormLabel htmlFor={name}>{label}</FormLabel>
            <RadioGroup id={name} {...field}>
              <SimpleGrid columns={[1, null, 2]} spacing={2}>
                {data.map((datum, idx: number) =>
                  <Box>
                    <Radio key={idx} {...field} value={idx.toString()}>
                      {datum}
                    </Radio>
                  </Box>)}
              </SimpleGrid>
            </RadioGroup>
            <FormErrorMessage>{form.errors[name]}</FormErrorMessage>
          </FormControl>
        )}
      </Field>)


  interface FormData {
    dateId: string
    timeId: string
    durationId: string
    locationId: string
  }

  const RegionComponent = (group: RecommendedRegionGroup) => (<Box>
    <Text as="span" mr={1}>{group.name}</Text>
    {group.star && <Text as="span" color="orange.500"><StarFillIcon /></Text>}
  </Box>)

  const hours = useMemo(() => [
    { display: '1 小时', slices: 1 },
    { display: '2 小时', slices: 2 },
    { display: '3 小时', slices: 3 },
    { display: '4 小时', slices: 4 },
    { display: '5 小时', slices: 5 },
    { display: '全天', slices: 24 }
  ], [])

  const times = useMemo(() => [
    { display: '上午', from: 7, to: 13 },
    { display: '下午', from: 13, to: 17 },
    { display: '晚上', from: 18, to: 23 },
  ], [])

  const [loadingText, setLoadingText] = useState<string>()

  return (<Fragment>
    <Formik
      initialValues={{
        dateId: orZero(findIndex(dates, date => date.weekday() === initialData?.date.weekday())).toString(),
        durationId: "0",
        locationId: "0",
        timeId: "0"
      } as FormData}
      onSubmit={async (values) => {
        const date = dates[parseInt(values.dateId)]
        const location = recommendRegions && recommendRegions[parseInt(values.locationId)]
        const timeRange = times[parseInt(values.timeId)]
        const duration = hours[parseInt(values.durationId)]
        if (!location) return
        if (!date) return
        if (!timeRange) return
        if (!duration) return

        try {
          setLoadingText("获取当日开放时间")
          const timeslices = sortBy(await api.fetchTimeslices(
            moment.max(date.startOf('day'), moment()).toISOString(),
            date.endOf('day').toISOString()), 'id')

          if (timeslices.length === 0) {
            throw new Error("该日没有可以预定的时间段")
          }

          setLoadingText("获取区域组信息")
          const group = await api.fetchRegionGroupDetail(location.id)

          setLoadingText("获取当前预定信息")
          const reservations = await api.fetchRegionGroupReservation(group.id, first(timeslices)!, last(timeslices)!)

          setLoadingText("规划中")
          const momentTimeslices = timeslices.map(timeslice => ({
            timeslice,
            time: moment(timeslice.from_time)
          }))

          const shuffleGroup = shuffle(group.regions).map(region => ({
            ...region,
            // find region with least reserved seats
            minReservation: minBy(
              filter(
                reservations,
                reservation => reservation.region_id === region.id)
              , 'reserved') || 0
          }))

          const orderGroup = sortBy(shuffleGroup, 'minReservation')

          for (const region of orderGroup) {
            let allowHour = 0
            let startTime

            for (const timeslice of momentTimeslices) {
              if (!startTime) {
                const hour = timeslice.time.hour()
                if (timeRange.from <= hour && hour + 1 <= timeRange.to) {
                  startTime = timeslice
                } else {
                  continue
                }
              }

              const reservationStatus = find(reservations,
                reservation => reservation.region_id === region.id
                  && reservation.time_id === timeslice.timeslice.id)

              // Then, check if there is enough seat
              if (!reservationStatus || (reservationStatus && reservationStatus.reserved < region.capacity)) {
                allowHour += 1
                if (allowHour >= duration.slices || (duration.slices === 24 && timeslice === last(momentTimeslices))) {
                  onSubmit({
                    date,
                    startTime: startTime.timeslice,
                    endTime: timeslice.timeslice,
                    group: group as RegionGroup,
                    region: region
                  })
                  return
                }
                continue
              }

              startTime = null
              allowHour = 0
            }
          }
          setError("没有匹配的位置")
        } catch (err) {
          setError((err as Error).message)
          console.error(err)
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form>
          <Stack spacing={5}>
            <DateField name="dateId" />
            <EnumField name="timeId" data={map(times, 'display')} label="入馆时间" />
            <EnumField name="durationId" data={map(hours, 'display')} label="时长" />
            {recommendRegions ?
              <EnumField name="locationId" data={map(recommendRegions, RegionComponent)} label="位置" />
              : <SimpleGrid columns={[1, null, 2]} spacing={2}>
                {range(12).map(key => <Skeleton key={key} height="2rem"></Skeleton>)}
              </SimpleGrid>}
            {error && <Text color="yellow.500"><ExclamationTriangleFill /> {error}</Text>}
            <SimpleGrid columns={[1, null, 2]} spacing={3} mt={4}>
              <LinkButton to="/reservations/make/custom" isFullWidth>自选预定</LinkButton>
              <Button
                colorScheme="teal"
                isLoading={isSubmitting}
                loadingText={loadingText}
                type="submit"
                isFullWidth
              >
                下一步
              </Button>
            </SimpleGrid>
          </Stack>
        </Form>
      )}
    </Formik>
  </Fragment>)
}

export function SimpleDisplay({ data }: { data: QuickReservationInfo }) {
  const fromTime = moment(data.startTime.from_time).calendar()
  const toTime = moment(data.endTime.to_time).format('HH:mm')
  return <Stack spacing={2} my={5}>
    <Text fontWeight="bold">预订信息</Text>
    <Text>{data.group.name} - {data.region.name}</Text>
    <Text>{fromTime} ~ {toTime}</Text>
  </Stack>
}
