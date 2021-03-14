import { LoadingWhen } from "./common"

function DoReserve() {
    return (
        <>
            <div className="px-3">
                <div className="d-flex flex-row align-items-center justify-content-between px-3">
                    <h1 className="d-inline-block">正在预约中</h1>
                    <LoadingWhen when={true} size="3rem" className="text-muted"></LoadingWhen>
                </div>
            </div>
        </>
    )
}

export default DoReserve
