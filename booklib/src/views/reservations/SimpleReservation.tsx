import { Button } from "@chakra-ui/button"
import { FormControl, FormErrorMessage, FormLabel } from "@chakra-ui/form-control"
import { HStack, Stack } from "@chakra-ui/layout"
import { Radio, RadioGroup } from "@chakra-ui/radio"
import { Field, FieldProps, Form, Formik } from 'formik'
import { findIndex } from "lodash"
import { useMemo } from "react"

import { QuickReservationInfo } from './models'
import { calendarStringOf, dateSelections } from "./utils"

export function SimpleForm({ reset, onSubmit, initialData }:
  { onSubmit: (data: QuickReservationInfo) => void, initialData?: QuickReservationInfo, reset?: () => void }) {
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

  const EnumField = ({ name, data, label }: { name: string, data: string[], label: string }) => (
    <Field name={name} validate={
      (value: string) => (value !== '' && parseInt(value) <= data.length) ? null : "请选择一个选项"
    }>
      {({ field, form }: FieldProps<number>) => (
        <FormControl isInvalid={!!(form.errors[name] && form.touched[name])}>
          <FormLabel htmlFor={name}>{label}</FormLabel>
          <RadioGroup id={name} {...field}>
            <Stack>
              {data.map((datum, idx: number) =>
                <Radio key={idx} {...field} value={idx.toString()}>
                  {datum}
                </Radio>)}
            </Stack>
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

  const places = [
    "安静",
    "非安静",
    "阳光好",
    "有电脑",
    "人少",
    "小组讨论室",
    "哪里都可以"
  ]


  return (<Formik
    initialValues={{
      dateId: (findIndex(dates, date => date.weekday() === initialData?.date.weekday()) || 0).toString(),
      durationId: "",
      locationId: "",
      timeId: ""
    } as FormData}
    onSubmit={async (values) => {
      const _date = dates[parseInt(values.dateId)]
      onSubmit({} as QuickReservationInfo)
    }}
  >
    {({ isSubmitting }) => (
      <Form>
        <Stack spacing={5}>
          <DateField name="dateId" />
          <EnumField name="timeId" data={['上午', '下午', '晚上']} label="时间段" />
          <EnumField name="durationId" data={['1hr', '2hr', '3hr', '4hr', '全天']} label="时长" />
          <EnumField name="locationId" data={places} label="位置" />
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
