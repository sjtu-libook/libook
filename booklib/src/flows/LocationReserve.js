import { LinkButton, LinkButtonSelect, ShowWhen, LoadingWhen, ErrorWhen } from './common.js'
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

function LocationReserve({ prevStep, nextStep, timeslice }) {
    const [regionGroupData, setRegionGroupData] = useState([])
    const [regionData, setRegionData] = useState([])
    const [loading, setLoading] = useState(true)
    const [loading2, setLoading2] = useState(true)
    const [regionGroup, setRegionGroup] = useState(0)
    const [region, setRegion] = useState(0)
    const [error, setError] = useState(null)

    const fromTime = minBy(timeslice, ts => ts.id)
    const toTime = maxBy(timeslice, ts => ts.id)

    useEffect(() => {
        async function fetchRegionGroups() {
            setLoading(true)
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
                group.capacity = reservations[group.id]?.capacity || 0
                group.reserved = reservations[group.id]?.reserved || 0
            })
            setLoading(false)
            setRegionGroupData(regionGroup)
            setError(null)
        }

        fetchRegionGroups().catch(err => {
            setError(`无法获取区域组: ${err}`)
        })
    }, [fromTime, toTime])

    useEffect(() => {
        const regionGroupId = (regionGroupData[regionGroup] || {}).id
        async function fetchRegions() {
            setLoading2(true)
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
            setLoading2(false)
            setRegionData(regions)
            setError(null)
        }
        if (regionGroupId) {
            fetchRegions().catch(err => {
                setError(`无法获取区域详情: ${err}`)
            })
        }
    }, [regionGroupData, regionGroup, fromTime, toTime])


    const validate = () => !loading && !loading2

    return (
        <>
            <div className="d-flex flex-row align-items-center justify-content-between px-3">
                <h1 className="d-inline-block">选择地点</h1>
                <LoadingWhen when={loading || loading2} size="3rem" className="text-muted"></LoadingWhen>
            </div>

            <ShowWhen when={!loading}>
                <div className="display-4">
                    <LinkButtonSelect
                        selections={
                            regionGroupData
                                .map(({ id, name, capacity, reserved }) =>
                                    ({ key: id, value: `${name} ${reserved}/${capacity}` }))}
                        selected={regionGroup}
                        setSelected={setRegionGroup}></LinkButtonSelect>
                </div>
            </ShowWhen>
            <ShowWhen when={!loading2}>
                <div className="display-4">
                    <LinkButtonSelect
                        selections={
                            regionData
                                .map(({ id, name, capacity, reserved }) =>
                                    ({ key: id, value: `${name} ${reserved}/${capacity}` }))}
                        selected={region}
                        setSelected={setRegion}></LinkButtonSelect>
                </div>
            </ShowWhen>

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
