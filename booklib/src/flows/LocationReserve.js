import { LinkButton, LinkButtonSelect, LoadingWhen, ErrorWhen } from './common.js'
import { useEffect, useState } from 'react'
import minBy from 'lodash/minBy'
import maxBy from 'lodash/maxBy'
import has from 'lodash/has'
import axios from 'axios'

export function reserveToMap(reservations, idOf) {
    const regionMap = {}
    reservations.forEach(reservation => {
        const id = idOf(reservation)
        if (!has(regionMap, id)) {
            regionMap[id] = {
                capacity: reservation.capacity,
                reserved: reservation.reserved,
            }
        }
        const target = regionMap[id]
        target.reserved = Math.max(target.reserved, reservation.reserved)
    })
    return regionMap
}

function useCombinedStatus(initial, other) {
    const [status, setStatus] = useState(initial)
    const result = status || other
    return [result, setStatus]
}

function useTwoStatus() {
    const [statusA, setStatusA] = useState(false)
    const [result, setStatusB] = useCombinedStatus(false, statusA)
    return [result, setStatusA, setStatusB]
}

async function fetchRegionGroups(fromTime, toTime) {
    const result = await axios("/api/region_groups/")
    const reserveResult = await axios({
        url: "/api/reservations/by_all", params: {
            min_time_id: fromTime.id,
            max_time_id: toTime.id
        }
    })
    const reservations = reserveToMap(reserveResult.data, r => r.region_group_id)
    const regionGroup = result.data
    regionGroup.forEach(group => {
        group.reserved = reservations[group.id]?.reserved || 0
    })
    return regionGroup
}

async function fetchRegions(regionGroupId, fromTime, toTime) {
    const result = await axios(`/api/region_groups/${regionGroupId}/detail`)
    const reserveResult = await axios({
        url: "/api/reservations/by_region_group", params: {
            min_time_id: fromTime.id,
            max_time_id: toTime.id,
            region_group_id: regionGroupId
        }
    })
    const reservations = reserveToMap(reserveResult.data, r => r.region_id)
    const regions = result.data.regions
    regions.forEach(region => {
        region.reserved = reservations[region.id]?.reserved || 0
    })
    return regions
}

function LocationReserve({ prevStep, nextStep, timeslice }) {
    const [regionGroupData, setRegionGroupData] = useState([])
    const [regionData, setRegionData] = useState([])
    const [loading, setLoadingA, setLoadingB] = useTwoStatus()
    const [regionGroup, setRegionGroup] = useState(0)
    const [region, setRegion] = useState(0)
    const [error, setErrorA, setErrorB] = useTwoStatus()

    const fromTime = minBy(timeslice, ts => ts.id)
    const toTime = maxBy(timeslice, ts => ts.id)

    useEffect(() => {
        if (fromTime && toTime) {
            setLoadingA(true)
            fetchRegionGroups(fromTime, toTime).then(result => {
                setRegionGroupData(sortBy(result, 'id'))
                setRegionGroup(0)
                setLoadingA(false)
                setErrorA(null)
            }).catch(err => {
                setErrorA(`无法获取区域组: ${err}`)
            })
        }
    }, [setLoadingA, setErrorA, fromTime, toTime])

    useEffect(() => {
        const regionGroupId = (regionGroupData[regionGroup] || {}).id
        if (regionGroupId) {
            setLoadingB(true)
            fetchRegions(regionGroupId, fromTime, toTime).then(result => {
                setRegionData(sortBy(result, 'id'))
                setRegion(0)
                setLoadingB(false)
                setErrorB(null)
            }).catch(err => {
                setErrorB(`无法获取区域详情: ${err}`)
            })
        }
    }, [regionGroupData, regionGroup, setLoadingB, setErrorB, fromTime, toTime])


    const validate = () => !loading

    return (
        <>
            <div className="d-flex flex-row align-items-center justify-content-between px-3">
                <h1 className="d-inline-block">选择地点</h1>
                <LoadingWhen when={loading} size="3rem" className="text-muted"></LoadingWhen>
            </div>

            <div className="display-4">
                <LinkButtonSelect
                    selections={
                        regionGroupData
                            .map(({ id, name, capacity, reserved }) =>
                                ({ key: id, value: `${name} ${reserved}/${capacity}` }))}
                    selected={regionGroup}
                    setSelected={setRegionGroup}></LinkButtonSelect>
            </div>
            <div className="display-4">
                <LinkButtonSelect
                    selections={
                        regionData
                            .map(({ id, name, capacity, reserved }) =>
                                ({ key: id, value: `${name} ${reserved}/${capacity}` }))}
                    selected={region}
                    setSelected={setRegion}></LinkButtonSelect>
            </div>

            <ErrorWhen error={error}></ErrorWhen>

            <div className="display-4 d-flex justify-content-between">
                <LinkButton onClick={prevStep}><i className="bi bi-arrow-left-square"></i></LinkButton>
                <LinkButton
                    onClick={() => nextStep({ regionGroup: regionGroupData[regionGroup], region: regionData[region] })}
                    className={{ "disabled": !validate() }}>
                    <i className="bi bi-arrow-right-square"></i></LinkButton>
            </div>
        </>
    )
}

export default LocationReserve
