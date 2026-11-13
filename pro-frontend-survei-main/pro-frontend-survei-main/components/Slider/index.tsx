"use client"

import React, { ReactElement, useRef } from "react"
import { ReactNode, useEffect, useState } from "react"

type SliderPanelElement = {
    content: ReactNode,
}

const SliderPanel = ({ children, onChange }: { children: ReactNode, onChange?: (index: number) => void }) => {
    const [slider, setSlider] = useState<SliderPanelElement[]>([])
    const [currentIndex, setCurrentIndex] = useState<number>(0)
    const currentRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        let tempChild = React.Children.toArray(children) as ReactElement[]
        let tempSlider: SliderPanelElement[] = []
        for (let index = 0; index < tempChild.length; index++) {
            tempSlider.push({
                content: tempChild[index]
            })
        }
        setSlider([...tempSlider])
    }, [children])

    useEffect(() => {
        if (currentRef.current) {
            currentRef.current.scrollTop = 0;
        }
        if (onChange) {
            onChange(currentIndex);
        }
    }, [currentIndex])

    return (
        <div className="w-full text-black border rounded-lg border-primary">
            <div ref={currentRef} className="w-full h-[600] overflow-auto p-5">
                {
                    slider.map((item, index) => (
                        <div
                            key={`keySliderPanel${index}`}
                            className={`w-full ${index === currentIndex ? "block" : "hidden"}`}
                        >
                            {item.content}

                            <div className="flex justify-between gap-2 mt-4">
                                <button
                                    onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                                    disabled={currentIndex === 0} type="button"
                                    className="px-4 py-2 bg-primary text-white rounded disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, slider.length - 1))}
                                    disabled={currentIndex === slider.length - 1} type="button"
                                    className="px-4 py-2 bg-primary text-white rounded disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}
export default SliderPanel