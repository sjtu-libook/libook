import classnames from 'classnames'

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
