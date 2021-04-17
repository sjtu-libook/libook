import { Button } from "@chakra-ui/button"
import { FormControl, FormErrorMessage, FormLabel } from "@chakra-ui/form-control"
import { HStack, Stack, Text } from "@chakra-ui/layout"
import { Radio, RadioGroup } from "@chakra-ui/radio"
import { Select } from "@chakra-ui/select"
import { Skeleton } from "@chakra-ui/skeleton"
import axios from "axios"
import { Field, FieldProps, Form, Formik, useFormikContext } from 'formik'
import { ExclamationTriangleFill } from "Icons"
import { filter, find, findIndex, sortBy } from "lodash"
import { Timeslice } from 'models'
import moment, { Moment } from "moment"
import { Fragment, useEffect, useMemo, useState } from "react"

import { ReservationTimeInfo } from './models'
import { calendarStringOf, dateSelections } from "./utils"

function filterToNow(timeslices: Timeslice[], now: Moment) {
  return timeslices.filter(timeslice => moment(timeslice.from_time).isAfter(now))
}

export function SelectTimeForm({ reset, onSubmit, initialData }:
  { onSubmit: (data: ReservationTimeInfo) => void, initialData?: ReservationTimeInfo, reset?: () => void }) {
  const dates = useMemo(() => dateSelections(), [])

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

  const validateTimeslice = (timeslices: Timeslice[], timesliceId: string) => {
    if (!timesliceId) {
      return "请选择一个时间"
    }
    const timesliceIdNumber = parseInt(timesliceId)
    if (!find(timeslices, timeslice => timeslice.id === timesliceIdNumber)) {
      return "请选择一个时间"
    }
    return null
  }

  const TimeField = ({ name, timeslices, label, timeField, filterStartTime }:
    {
      label: string, name: string, timeslices: Timeslice[],
      timeField: "from_time" | "to_time",
      filterStartTime?: boolean
    }) => {

    const {
      values: { startTimeId }
    } = useFormikContext<FormData>()
    const newTimeslices = filterStartTime && startTimeId
      ? filter(timeslices, timeslice => timeslice.id >= parseInt(startTimeId))
      : timeslices

    return (<Field name={name} validate={(x: string) => validateTimeslice(timeslices, x)}>
      {({ field, form }: FieldProps<number>) => (
        <FormControl isInvalid={!!(form.errors[name] && form.touched[name])}>
          <FormLabel htmlFor={name}>{label}</FormLabel>
          <Select id={name} {...field}>
            {newTimeslices.map((timeslice) =>
              <option key={timeslice.id.toString()} {...field} value={timeslice.id.toString()}>
                {moment(timeslice[timeField]).local().format('HH:mm')}
              </option>)}
          </Select>
          <FormErrorMessage>{form.errors[name]}</FormErrorMessage>
        </FormControl>
      )}
    </Field>)
  }

  interface FormData {
    dateId: string
    startTimeId: string
    endTimeId: string
  }

  const fetchTimeslices = async (now: Moment) => {
    return (await axios({
      url: "/api/timeslices/",
      params: {
        from_time__gte: now.startOf('day').toISOString(),
        from_time__lte: now.endOf('day').toISOString()
      }
    })).data as Timeslice[]
  }

  const TimeSelections = () => {
    const {
      values: { dateId },
      setFieldValue
    } = useFormikContext<FormData>()
    const [timeslices, setTimeslices] = useState<Timeslice[]>()
    const [error, setError] = useState<string>()
    const isValid = !validateDate(dateId)

    useEffect(() => {
      if (!isValid) {
        return
      }

      let isCurrent = true
      setTimeslices(undefined)
      setError(undefined)
      const now = dates[parseInt(dateId)]

      async function fetchData() {
        const data = await fetchTimeslices(now)
        if (isCurrent) {
          const timeslices = filterToNow(data, moment())
          setTimeslices(sortBy(timeslices, 'id'))
          if (timeslices.length === 0) {
            setError('今日已无法预约')
            setFieldValue("startTimeId", "0")
            setFieldValue("endTimeId", "0")
          } else {
            setFieldValue("startTimeId", timeslices[0]?.id.toString())
            setFieldValue("endTimeId", timeslices[0]?.id.toString())
          }
        }
      }
      fetchData().then().catch(err => setError(err.toString()))
      return () => { isCurrent = false }
    }, [dateId, setFieldValue, isValid])

    return (<Fragment> {timeslices ? <Fragment>
      <TimeField name="startTimeId" timeslices={timeslices || []} label="开始时间" timeField="from_time" />
      <TimeField name="endTimeId" timeslices={timeslices || []} label="结束时间" timeField="to_time" filterStartTime />
    </Fragment> : (isValid && <Fragment>
      <Skeleton height="4.5rem" />
      <Skeleton height="4.5rem" />
    </Fragment>)}
    {error && <Text color="yellow.500"><ExclamationTriangleFill /> {error}</Text>}
    </Fragment>)
  }

  return (<Formik
    initialValues={{
      dateId: (findIndex(dates, date => date.weekday() === initialData?.date.weekday()) || 0).toString(),
      startTimeId: initialData?.startTime.id.toString(),
      endTimeId: initialData?.endTime.id.toString()
    }}
    onSubmit={async (values) => {
      const date = dates[parseInt(values.dateId)]
      const timeslices = await fetchTimeslices(date)
      onSubmit({
        date,
        startTime: find(timeslices, timeslice => timeslice.id === parseInt(values.startTimeId!))!,
        endTime: find(timeslices, timeslice => timeslice.id === parseInt(values.endTimeId!))!
      })
    }}
  >
    {({ isSubmitting }) => (
      <Form>
        <Stack spacing={5}>
          <DateField name="dateId" />
          <TimeSelections />
          <HStack mt={4}>
            {reset && <Button onClick={reset}>取消</Button>}
            <Button
              colorScheme="teal"
              isLoading={isSubmitting}
              type="submit"
              isFullWidth
            >
              下一步
            </Button>
          </HStack>
        </Stack>
      </Form>
    )}
  </Formik>)
}

export function TimeDisplay({ timeInfo }: { timeInfo: ReservationTimeInfo }) {
  const fromTime = moment(timeInfo.startTime.from_time).format('HH:mm')
  const toTime = moment(timeInfo.endTime.to_time).format('HH:mm')
  return (
    <Stack mb={3}>
      <Text fontWeight="bold">进馆日期</Text>
      <Text>{calendarStringOf(timeInfo.date)} ({timeInfo.date.format('L')})</Text>
      <Text fontWeight="bold">时间段</Text>
      <Text>{fromTime} ~ {toTime}</Text>
    </Stack>
  )
}
