import { Button } from "@chakra-ui/button"
import { FormControl, FormErrorMessage, FormLabel } from "@chakra-ui/form-control"
import { HStack, Stack, Text } from "@chakra-ui/layout"
import { Select } from "@chakra-ui/select"
import { Skeleton } from "@chakra-ui/skeleton"
import * as api from 'api'
import { RegionGroupReservationDetail, RegionReservationDetail } from 'api'
import { Field, FieldProps, Form, Formik, useFormikContext } from 'formik'
import { ExclamationTriangleFill } from "Icons"
import { find, isNaN, sortBy } from "lodash"
import { Timeslice } from 'models'
import { Fragment, useEffect, useState } from "react"

import { ReservationLocationInfo } from "./models"

export function SelectLocationForm({ reset, onSubmit, initialData, startTime, endTime }: {
  onSubmit: (data: ReservationLocationInfo) => void,
  initialData?: ReservationLocationInfo
  startTime: Timeslice,
  endTime: Timeslice
  reset?: () => void
}) {

  interface FormData {
    groupId: string
    regionId: string
  }

  const RegionGroupField = ({ regionGroups, name, validate }: {
    name: string,
    validate: (id: string) => string | null,
    regionGroups: RegionGroupReservationDetail[]
  }) => (
    <Field name={name} validate={validate}>
      {({ field, form }: FieldProps<number>) => (
        <FormControl isInvalid={!!(form.errors[name] && form.touched[name])}>
          <FormLabel htmlFor={name}>区域组</FormLabel>
          <Select id={name} {...field}>
            {regionGroups.map((group) =>
              <option key={group.id.toString()} {...field} value={group.id.toString()}>
                {group.name} ({group.reserved}/{group.capacity})
              </option>)}
          </Select>
          <FormErrorMessage>{form.errors[name]}</FormErrorMessage>
        </FormControl>
      )}
    </Field>)

  const RegionField = ({ name, regions, validate }:
    {
      name: string, regions: RegionReservationDetail[],
      validate: (regionId: string) => string | null
    }) => {
    return (<Field name={name} validate={validate}>
      {({ field, form }: FieldProps<number>) => (
        <FormControl isInvalid={!!(form.errors[name] && form.touched[name])}>
          <FormLabel htmlFor={name}>区域</FormLabel>
          <Select id={name} {...field}>
            {regions.map((region) =>
              <option key={region.id.toString()} {...field} value={region.id.toString()}>
                {region.name} ({region.reserved}/{region.capacity})
              </option>)}
          </Select>
          <FormErrorMessage>{form.errors[name]}</FormErrorMessage>
        </FormControl>
      )}
    </Field>)
  }

  const RegionSelection = ({ regionGroupId }: { regionGroupId: number }) => {
    const {
      setFieldValue
    } = useFormikContext<FormData>()
    const [regions, setRegions] = useState<RegionReservationDetail[]>()
    const [error, setError] = useState<string>()


    function validate(regions: RegionReservationDetail[], regionId: string) {
      const regionIdNumber = parseInt(regionId)
      if (isNaN(regionIdNumber) || !find(regions, region => region.id === regionIdNumber)) {
        return "请选择一个区域"
      }
      return null
    }

    useEffect(() => {
      let isCurrent = true
      setRegions(undefined)
      setError(undefined)

      async function fetchData() {
        const data = await api.fetchRegionsWithReservation(regionGroupId, startTime, endTime)
        if (isCurrent) {
          const regions = sortBy(data, 'id')
          setRegions(regions)
          setFieldValue("regionId", data[0]?.id.toString(), true)
        }
      }
      fetchData().then().catch(err => setError(err.toString()))
      return () => { isCurrent = false }
    }, [setFieldValue, regionGroupId])

    return (<Fragment> {regions ? <Fragment>
      <RegionField name="regionId" regions={regions || []} validate={(x) => validate(regions, x)} />
    </Fragment> : <Skeleton height="4.5rem" />}
    {error && <Text color="yellow.500"><ExclamationTriangleFill /> {error}</Text>}
    </Fragment>)
  }

  const RegionGroupSelection = () => {
    const {
      values: { groupId },
      setFieldValue
    } = useFormikContext<FormData>()
    const [regionGroups, setRegionGroups] = useState<RegionGroupReservationDetail[]>()
    const [error, setError] = useState<string>()

    function validate(groupId: string, regionGroups?: RegionGroupReservationDetail[]) {
      const groupIdNumber = parseInt(groupId)
      if (isNaN(groupIdNumber) || !find(regionGroups, group => group.id === groupIdNumber)) {
        return "请选择一个区域组"
      }
      return null
    }

    useEffect(() => {
      let isCurrent = true
      setRegionGroups(undefined)
      setError(undefined)

      async function fetchData() {
        const data = await api.fetchRegionGroupsWithReservation(startTime, endTime)
        if (isCurrent) {
          const regionGroups = sortBy(data, 'id')
          setRegionGroups(regionGroups)
          setFieldValue("groupId", data[0]?.id.toString(), true)
        }
      }
      fetchData().then().catch(err => setError(err.toString()))
      return () => { isCurrent = false }
    }, [setFieldValue])

    const isValid = !validate(groupId, regionGroups)

    return (<Fragment> {regionGroups ? <Fragment>
      <RegionGroupField
        name="groupId"
        regionGroups={regionGroups || []}
        validate={(x: string) => validate(x, regionGroups)} />
      {isValid ? <RegionSelection regionGroupId={parseInt(groupId)} /> : <Skeleton height="4.5rem" />}
    </Fragment> : <Fragment><Skeleton height="4.5rem" /><Skeleton height="4.5rem" /></Fragment>}
    {error && <Text color="yellow.500"><ExclamationTriangleFill /> {error}</Text>}
    </Fragment>)
  }

  return (<Formik
    initialValues={{
      groupId: initialData?.group.id.toString(),
      regionId: "0"
    }}
    onSubmit={async (values) => {
      const regionGroup = await api.fetchRegionGroupDetail(parseInt(values.groupId!))
      const region = find(regionGroup.regions, region => region.id === parseInt(values.regionId!))
      if (!region) return
      onSubmit({
        region,
        group: regionGroup
      })
    }}
  >
    {({ isSubmitting }) => (
      <Form>
        <Stack spacing={5}>
          <RegionGroupSelection />
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
  </Formik >)
}

export function LocationDisplay({ locationInfo }: { locationInfo: ReservationLocationInfo }) {
  return (
    <Stack mb={3}>
      <Text fontWeight="bold">落座区域</Text>
      <Text>{locationInfo.group.name} - {locationInfo.region.name}</Text>
    </Stack>
  )
}
