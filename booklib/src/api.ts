import axios from "axios"
import { has } from "lodash"
import { RegionGroup, RegionGroupDetail,RegionGroupReservationInfo, RegionReservationInfo, Timeslice } from "models"

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
  return (await axios("/api/region_groups/")).data as RegionGroup[]
}

export async function fetchRegionGroupDetail(regionGroupId: number) {
  return (await axios(`/api/region_groups/${regionGroupId}/detail`)).data as RegionGroupDetail
}


export async function fetchRegionGroupsWithReservation(fromTime: Timeslice, toTime: Timeslice) {
  const regionGroups = await fetchRegionGroups()
  const reservationInfo = (await axios({
    url: "/api/reservations/by_all", params: {
      min_time_id: fromTime.id,
      max_time_id: toTime.id
    }
  })).data as RegionGroupReservationInfo[]
  const reservations = reserveToMap(reservationInfo, r => r.region_group_id)
  return regionGroups.map(group => ({
    ...group,
    reserved: reservations[group.id]?.reserved || 0
  } as RegionGroupReservationDetail))
}

export async function fetchRegionsWithReservation(regionGroupId: number, fromTime: Timeslice, toTime: Timeslice) {
  const regionGroup = await fetchRegionGroupDetail(regionGroupId)
  const reservationInfo = (await axios({
    url: "/api/reservations/by_region_group", params: {
      min_time_id: fromTime.id,
      max_time_id: toTime.id,
      region_group_id: regionGroupId
    }
  })).data as RegionReservationInfo[]
  const reservations = reserveToMap(reservationInfo, r => r.region_id)
  return regionGroup.regions.map(region => ({
    ...region,
    reserved: reservations[region.id]?.reserved || 0
  } as RegionReservationDetail))
}
