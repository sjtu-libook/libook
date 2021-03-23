import sortBy from 'lodash/sortBy'
import last from 'lodash/last'
import clone from 'lodash/clone'

export function mergeReservation(reservations) {
    // sort reservations by from_time
    reservations = sortBy(reservations, reservation => new Date(reservation.time.from_time).getTime())

    // merge them by region / time
    const mergedReservations = []
    reservations.forEach(reservation => {
        const currentReservation = clone(reservation)
        currentReservation.merged_time = { 
            from_time: currentReservation.time.from_time, 
            to_time: currentReservation.time.to_time }
        if (mergedReservations.length === 0) {
            mergedReservations.push(currentReservation)
        } else {
            const lastReservation = last(mergedReservations)
            if (currentReservation.time.from_time === lastReservation.merged_time.to_time && 
                    currentReservation.region.id === lastReservation.region.id) {
                lastReservation.merged_time.to_time = currentReservation.time.to_time
            } else {
                mergedReservations.push(currentReservation)
            }
        }
    })

    return mergedReservations
}
