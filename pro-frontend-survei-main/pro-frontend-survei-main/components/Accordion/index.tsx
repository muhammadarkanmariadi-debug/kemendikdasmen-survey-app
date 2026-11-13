"use client"
import React, { ReactElement, ReactNode, useEffect, useState } from "react"

type PropsAccordion = {
    children: ReactNode,
}

type AccordionElement = {
    title: string,
    content: ReactNode,
    check?: boolean,
}

const Accordion = (props: PropsAccordion) => {
    const [accordion, setAccordion] = useState<AccordionElement[]>()
    const [selectedAccordion, setSelectedAccordion] = useState<number>(-1)

    const handleTab = (index: number) => {
        if (selectedAccordion != index) setSelectedAccordion(index)
        else setSelectedAccordion(-1)
    }

    useEffect(() => {
        let tempChild = React.Children.toArray(props.children) as ReactElement[]
        let tempTabs: AccordionElement[] = []
        for (let index = 0; index < tempChild.length; index++) {
            let tempTitle: string = (tempChild[index].props as { id: string }).id
            let check: boolean | undefined = (tempChild[index].props as { defaultChecked?: boolean })?.defaultChecked
            if (tempTitle !== "") {
                tempTabs.push({
                    content: tempChild[index],
                    title: tempTitle, check
                })
            }

        }

        setAccordion([...tempTabs])
    }, [props.children])

    return (
        <div>
            {
                accordion?.map((acc, index) => (
                    <div className="w-full border my-1" key={`keyAccordion${index}`}>
                        <div className="w-full flex p-2 bg-slate-50 cursor-pointer"
                            onClick={() => handleTab(index)}>

                            <strong className="text-primary flex gap-1 items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
                                </svg>
                                {acc.title}
                            </strong>
                            <div className="ml-auto">
                                {
                                    index == selectedAccordion ?
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                                        </svg> :
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                        </svg>

                                }
                                <span className={`bi bi-caret-${index == selectedAccordion ? 'up' : 'down'}`}></span>
                            </div>

                        </div>

                        <div className={`w-full transition-all overflow-hidden ${index == selectedAccordion ? `h-auto` : `h-0`}`}
                            style={{ transition: `height 0.3s ease`, overflow: 'hidden', height: `${index == selectedAccordion ? `auto` : 0}` }}>
                            <div className="m-2">
                                {acc.content}
                            </div>
                        </div>
                    </div>
                ))
            }
        </div>
    )



}
export default Accordion