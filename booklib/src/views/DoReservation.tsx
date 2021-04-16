import { Box, Flex, Heading, Spacer, Stack, Text } from "@chakra-ui/layout"
import ScreenContainer from "scaffold/ScreenContainer"
import { ErrorMessage, Field, FieldProps, Form, Formik } from 'formik'
import { FormControl, FormErrorMessage, FormLabel } from "@chakra-ui/form-control"
import { Input } from "@chakra-ui/input"
import { Button } from "@chakra-ui/button"
import { useEffect, useMemo, useState } from "react"
import { Fade, calendarStringOf, dateSelections } from "./reservations/utils"
import { Radio, RadioGroup } from "@chakra-ui/radio"
import moment, { Moment } from "moment"
import { findIndex } from "lodash"

interface ReservationInfo {
  fromTime: number
  toTime: number
  region: number
}

interface Timeslice {
  id: number
  from_time: number
  to_time: number
}

interface ResrvationTimeInfo {
  date: Moment
  startTime: Timeslice
  endTime: Timeslice
}

enum ReservationStep {
  Time = 0,
  Location = 1,
  Confirm = 2,
  InProgress = 3,
  Success = 4
}

function SelectTimeForm({ onSubmit, initialData }: { onSubmit: (data: ResrvationTimeInfo) => void, initialData?: ResrvationTimeInfo }) {
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

  return (<Formik
    initialValues={{
      dateId: (findIndex(dates, date => date.isSame(initialData?.date)) || 0).toString(),
    }}
    onSubmit={async (values) => {
      onSubmit({
        date: dates[parseInt(values.dateId)],
        startTime: {} as Timeslice,
        endTime: {} as Timeslice
      })
    }}
  >
    {({ isSubmitting }) => (
      <Form>
        <DateField name="dateId" />
        <Button
          mt={4}
          colorScheme="teal"
          isLoading={isSubmitting}
          type="submit"
          isFullWidth
        >
          确认
        </Button>
      </Form>
    )}
  </Formik>)
}

function TimeDisplay({ timeInfo, redo }: { timeInfo: ResrvationTimeInfo, redo: () => void }) {
  return (
    <Stack mb={3}>
      <Text fontWeight="bold">进馆日期</Text>
      <Text>{calendarStringOf(timeInfo.date)} ({timeInfo.date.format('L')})</Text>
      <Button onClick={redo}>重新选择</Button>
    </Stack>
  )
}

function DoReservation() {
  const [timeInfo, setTimeInfo] = useState<ResrvationTimeInfo>()
  const [step, setStep] = useState<ReservationStep>(ReservationStep.Time)
  const dateNextStep = (data: ResrvationTimeInfo) => {
    setTimeInfo(data)
    setStep(ReservationStep.Location)
  }
  return (
    <ScreenContainer>
      <Heading mb={3}>自选预约</Heading>
      <Fade inProp={step === ReservationStep.Time}>
        <SelectTimeForm onSubmit={dateNextStep} initialData={timeInfo} />
      </Fade>
      <Fade inProp={step > ReservationStep.Time}>
        {timeInfo &&
          <TimeDisplay timeInfo={timeInfo} redo={() => setStep(ReservationStep.Time)} />}
      </Fade>
    </ScreenContainer>
  )
}

export default DoReservation