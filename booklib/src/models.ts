export interface User {
  id: number
  username: string
}

export interface Timeslice {
  id: number
  from_time: string
  to_time: string
}

export interface RegionGroup {
  id: number
  name: string
}

export interface RegionGroupDetail {
  id: number
  name: string
  capacity: number
}

export interface RegionGroupDetail {
  id: number
  name: string
  capacity: number
  regions: Region[]
}

export interface Region {
  id: number
  name: string
  group: number
  capacity: number
}

export interface RegionDetail {
  id: number
  name: string
  group: RegionGroup
  capacity: number
}


export interface Reservation {
  id: number
  region: RegionDetail
  time: Timeslice
}

export interface RegionReservationInfo {
  reserved: number
  time_id: number
  region_id: number
}

export interface RegionGroupReservationInfo {
  reserved: number
  time_id: number
  region_group_id: number
}

export interface ReservationResult {
  reason: string
  region: RegionDetail
  time: Timeslice
}
