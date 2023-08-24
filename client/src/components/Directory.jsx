import { useState } from "react"
import { ArrowDownIcon, ArrowRightIcon } from "./Arrows"

const Directory = ({ files, marginLeft = 0.5 }) => {
    const [isExpanded, setIsExpanded] = useState(false)

    const parseMargin = () => {
        return { marginLeft: `${marginLeft}em` }
    }

    const arrowIcon = isExpanded ? <ArrowDownIcon /> : <ArrowRightIcon />

    if (files.type === "file") {
        return (
            <p style={{ ...parseMargin() }}>
                {files.name}
            </p>
        )
    }

    return (
        <div>
            <p
                style={{
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    paddingTop: "3px",
                    paddingBottom: "3px",
                    ...parseMargin()
                }}
                onClick={() => {
                    setIsExpanded(prevValue => !prevValue)
                }}
            >
                {arrowIcon} {files.name}
            </p>
            {
                isExpanded
                &&
                files.items.map((item, index) => (
                    <Directory
                        key={index}
                        files={item}
                        marginLeft={marginLeft + 1.5}
                    />
                ))
            }
        </div>
    )
}

export default Directory