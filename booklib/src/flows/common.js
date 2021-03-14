import classnames from 'classnames'
import { CSSTransition } from 'react-transition-group'

export function LinkButtonEnum({ selections, selected, setSelected }) {
    const onClick = (e) => {
        e.preventDefault()
        const idx = (selected + 1) % selections.length
        setSelected(idx)
    }
    return <button className="libook-big-selection btn btn-link" onClick={onClick}>{selections[selected].value}</button>
}

export function LinkButton({ children, onClick, className }) {
    return <button className={classnames("libook-big-selection btn btn-link", className)} onClick={onClick}>{children}</button>
}

export function Row({ className, children }) {
    return <div className="row"><div className={classnames("col", className)}>{children}</div></div>
}

export function LinkButtonSelect({ selections, selected, setSelected }) {
    return <select className="libook-big-selection form-select btn btn-link"
        value={selected}
        onChange={event => setSelected(parseInt(event.target.value))}>
        {
            selections.map(({ key, value }, idx) => <option value={idx} key={key}>{value}</option>)
        }
    </select>
}

export function ShowWhen({ when, children }) {
    return <CSSTransition in={when} timeout={300} classNames="libook-flow-loading">
        {children}
    </CSSTransition>
}

export function LoadingWhen({ when, size, className }) {
    return when && <div className={classnames("spinner-border", className)} style={{ 'width': size, 'height': size }} role="status">
        <span className="visually-hidden">加载中...</span>
    </div>
}
