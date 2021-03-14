import { LinkButton, LinkButtonSelect, ShowWhen, LoadingWhen, ErrorWhen } from './common.js'
import { useEffect, useState } from 'react'
import axios from 'axios'

function LocationReserve({ prevStep, nextStep }) {
    const [regionGroupData, setRegionGroupData] = useState([])
    const [regionData, setRegionData] = useState([])
    const [loading, setLoading] = useState(true)
    const [loading2, setLoading2] = useState(true)
    const [regionGroup, setRegionGroup] = useState(0)
    const [region, setRegion] = useState(0)
    const [error, setError] = useState(null)

    useEffect(() => {
        async function fetchRegionGroups() {
            setLoading(true)
            const result = await axios("/api/region_groups")
            setLoading(false)
            setRegionGroupData(result.data)
            setError(null)
        }

        fetchRegionGroups().catch(err => {
            setError(`无法获取区域组: ${err}`)
        })
    }, [])

    useEffect(() => {
        const regionGroupId = (regionGroupData[regionGroup] || {}).id
        async function fetchRegions() {
            setLoading2(true)
            const result = await axios(`/api/region_groups/${regionGroupId}/detail`)
            setLoading2(false)
            setRegionData(result.data.regions)
            setError(null)
        }
        if (regionGroupId) {
            fetchRegions().catch(err => {
                setError(`无法获取区域详情: ${err}`)
            })
        }
    }, [regionGroupData, regionGroup])

    return (
        <>
            <div className="d-flex flex-row align-items-center justify-content-between px-3">
                <h1 className="d-inline-block">选择地点</h1>
                <LoadingWhen when={loading || loading2} size="3rem" className="text-muted"></LoadingWhen>
            </div>

            <ShowWhen when={!loading}>
                <div className="display-4">
                    <LinkButtonSelect selections={regionGroupData.map(({ id, name }) => ({ key: id, value: name }))} selected={regionGroup} setSelected={setRegionGroup}></LinkButtonSelect>
                </div>
            </ShowWhen>
            <ShowWhen when={!loading2}>
                <div className="display-4">
                    <LinkButtonSelect selections={regionData.map(({ id, name }) => ({ key: id, value: name }))} selected={region} setSelected={setRegion}></LinkButtonSelect>
                </div>
            </ShowWhen>

            <ErrorWhen error={error}></ErrorWhen>

            <div className="display-4 d-flex justify-content-between">
                <LinkButton onClick={prevStep}><i className="bi bi-arrow-left-square"></i></LinkButton>
                <LinkButton onClick={nextStep}><i className="bi bi-arrow-right-square"></i></LinkButton>
            </div>
        </>
    )
}

export default LocationReserve
