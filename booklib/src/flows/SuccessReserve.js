import { LinkButton } from './common.js'

function SuccessReserve() {
    return (
        <>
            <div className="px-3">
                <h1>预定成功</h1>
            </div>
            <div class="px-3 mt-3 h2 font-weight-normal">
                <p>您可以在 1pm 前取消预约。</p>
            </div>
            <div className="h3 text-right">
                <LinkButton className="text-muted">查看当前预约 <i className="bi bi-arrow-right"></i></LinkButton>
            </div>
            <div className="h3 text-right">
                <LinkButton className="text-muted">继续预约 <i className="bi bi-arrow-right"></i></LinkButton>
            </div>
            <div className="h3 text-right">
                <LinkButton className="text-muted">人流密度 <i className="bi bi-arrow-right"></i></LinkButton>
            </div>
        </>
    );
}

export default SuccessReserve;
