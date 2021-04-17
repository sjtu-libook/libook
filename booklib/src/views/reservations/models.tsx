import { Region, RegionGroup, Timeslice } from "models"
import { Moment } from "moment"

export interface ReservationInfo {
  fromTime: number
  toTime: number
  region: number
}

export interface ReservationTimeInfo {
  date: Moment
  startTime: Timeslice
  endTime: Timeslice
}

export interface ReservationLocationInfo {
  group: RegionGroup
  region: Region
}

export interface QuickReservationInfo {
  date: Moment
  startTime: Timeslice
  endTime: Timeslice
  group: RegionGroup
  region: Region
}

export interface RecommendedRegionGroup {
  id: number
  name: string
  star: boolean
}
