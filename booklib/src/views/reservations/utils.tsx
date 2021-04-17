import { Box } from '@chakra-ui/layout'
import last from 'lodash/last'
import sortBy from 'lodash/sortBy'
import { RegionDetail, Reservation, Timeslice } from 'models'
import moment, { CalendarSpec, Moment, MomentInput } from 'moment'
import { PropsWithChildren } from 'react'
import { Transition } from 'react-transition-group'

const calendarDateOnly: CalendarSpec = {
  sameDay: '[今天]',
  nextDay: '[明天]',
  nextWeek: (m?: MomentInput, now?: Moment) => {
    if (now?.week() !== moment(m).week()) {
      return '[下]ddd'
    } else {
      return '[本]ddd'
    }
  },
  lastDay: '[昨天]',
  lastWeek: (m?: MomentInput, now?: Moment) => {
    if (moment(m).week() !== now?.week()) {
      return '[上]ddd'
    } else {
      return '[本]ddd'
    }
  },
  sameElse: 'L',
}

export function calendarStringOf(date: Moment) {
  return date.calendar(calendarDateOnly)
}

export function dateSelections() {
  let day = moment().startOf('day')
  const result = []

  for (let i = 0; i < 7; i++) {
    result.push(moment(day))
    day.add(1, 'days')
  }

  return result
}


const duration = 300

const defaultStyle = {
  transition: `opacity ${duration}ms ease-in-out, max-height ${duration}ms ease-in-out`,
  opacity: 0,
}

const transitionStyles = {
  "entering": { opacity: 1 },
  "entered": { opacity: 1 },
  "exiting": { opacity: 0 },
  "exited": { opacity: 0 },
}

type TransitionState = "entering" | "entered" | "exiting" | "exited"

export const Fade = ({ inProp, children }: PropsWithChildren<{ inProp: boolean }>) => (
  <Transition in={inProp} timeout={duration}>
    { (state: TransitionState) => (
      <Box style={{
        ...defaultStyle,
        ...(transitionStyles[state] || {})
      }}>
        {children}
      </Box>
    )}
  </Transition>
)

export interface MergedReservation {
  merged_time: { from_time: string, to_time: string },
  merged_id: number[]
  id: number
  region: RegionDetail
  time: Timeslice
}

export function mergeReservation(reservations: Reservation[]) {
  // sort reservations by from_time
  reservations = sortBy(reservations, reservation => new Date(reservation.time.from_time).getTime())

  // merge them by region / time
  const mergedReservations: MergedReservation[] = []
  reservations.forEach(reservation => {
    const currentReservation: MergedReservation = {
      ...reservation,
      merged_time: {
        from_time: reservation.time.from_time,
        to_time: reservation.time.to_time
      },
      merged_id: [reservation.id]
    }
    if (mergedReservations.length === 0) {
      mergedReservations.push(currentReservation)
    } else {
      const lastReservation = last(mergedReservations)!
      if (currentReservation.time.from_time === lastReservation.merged_time.to_time &&
        currentReservation.region.id === lastReservation.region.id) {
        lastReservation.merged_time.to_time = currentReservation.time.to_time
        lastReservation.merged_id.push(currentReservation.id)
      } else {
        mergedReservations.push(currentReservation)
      }
    }
  })

  return mergedReservations
}
