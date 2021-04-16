import { Box } from '@chakra-ui/layout'
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
  "entering": { opacity: 1  },
  "entered": { opacity: 1  },
  "exiting": { opacity: 0  },
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
