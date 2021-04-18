import axios from "axios"
import { has } from "lodash"
import { 
  RegionGroup, 
  RegionGroupDetail,
  RegionGroupReservationInfo,
  RegionReservationInfo, 
  Reservation,
  Timeslice,
  User } from "models"

export const API_ROOT = process.env.REACT_APP_API_ROOT || ''

export interface RegionGroupReservationDetail {
  id: number
  name: string
  capacity: number
  reserved: number
}

export interface RegionReservationDetail {
  id: number
  name: string
  capacity: number
  reserved: number
}


type ReservationInfo = RegionReservationInfo | RegionGroupReservationInfo

function reserveToMap<T extends ReservationInfo>(
  reservations: T[],
  idOf: (info: T) => number) {
  const regionMap: { [id: number]: { reserved: number } } = {}
  reservations.forEach((reservation: T) => {
    const id = idOf(reservation)
    if (!has(regionMap, id)) {
      regionMap[id] = {
        reserved: reservation.reserved,
      }
    }
    const target = regionMap[id]
    target.reserved = Math.max(target.reserved, reservation.reserved)
  })
  return regionMap
}

export async function fetchRegionGroups() {
  return (await axios(API_ROOT + "/api/region_groups/")).data as RegionGroup[]
}

export async function fetchRecommendedRegionGroups() {
  return (await axios(API_ROOT + "/api/region_groups/recommendation")).data as RegionGroup[]
}

export async function fetchRegionGroupDetail(regionGroupId: number) {
  return (await axios(`${API_ROOT}/api/region_groups/${regionGroupId}/detail`)).data as RegionGroupDetail
}

export async function fetchRegionGroupsReservation(fromTime: Timeslice, toTime: Timeslice) {
  return (await axios({
    url: API_ROOT + "/api/reservations/by_all", params: {
      min_time_id: fromTime.id,
      max_time_id: toTime.id
    }
  })).data as RegionGroupReservationInfo[]
}

export async function fetchRegionGroupsWithReservation(fromTime: Timeslice, toTime: Timeslice) {
  const regionGroups = await fetchRegionGroups()
  const reservationInfo = await fetchRegionGroupsReservation(fromTime, toTime)
  const reservations = reserveToMap(reservationInfo, r => r.region_group_id)
  return regionGroups.map(group => ({
    ...group,
    reserved: reservations[group.id]?.reserved || 0
  } as RegionGroupReservationDetail))
}

export async function fetchRegionGroupReservation(regionGroupId: number, fromTime: Timeslice, toTime: Timeslice) {
  return (await axios({
    url: API_ROOT + "/api/reservations/by_region_group", params: {
      min_time_id: fromTime.id,
      max_time_id: toTime.id,
      region_group_id: regionGroupId
    }
  })).data as RegionReservationInfo[]
}

export async function fetchRegionsWithReservation(regionGroupId: number, fromTime: Timeslice, toTime: Timeslice) {
  const regionGroup = await fetchRegionGroupDetail(regionGroupId)
  const reservationInfo = await fetchRegionGroupReservation(regionGroupId, fromTime, toTime)
  const reservations = reserveToMap(reservationInfo, r => r.region_id)
  return regionGroup.regions.map(region => ({
    ...region,
    reserved: reservations[region.id]?.reserved || 0
  } as RegionReservationDetail))
}


export async function fetchTimeslices(startTime: string, toTime: string) {
  return (await axios({
    url: API_ROOT + "/api/timeslices/",
    params: {
      from_time__gte: startTime,
      from_time__lte: toTime
    }
  })).data as Timeslice[]
}

export async function fetchUser() {
  return (await axios(API_ROOT + "/api/users/self")).data as User
}

export async function cancelReservation(revervationId: number) {
  await axios.delete(`${API_ROOT}/api/reservations/${revervationId}/`)
}

export async function batchReserve(batch: { time: number, region: number}[]) {
  await axios.post(API_ROOT + "/api/reservations/batch", batch)
}

export async function fetchReservations(fromTime: string, toTime: string) {
  return (await axios({
    url:  API_ROOT + "/api/reservations/",
    params: {
      from_time__gte: fromTime,
      from_time__lte: toTime
    }
  })).data as Reservation[]
}
