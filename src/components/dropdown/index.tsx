import Chevron from "payload/dist/admin/components/icons/Chevron";
import React, { useId, useRef } from "react";

interface Props {
    triggerText: string;
    items: { label: string; action: () => void; }[];
}

export const Dropdown = (props: Props) => {
    const selectRef = useRef<HTMLDivElement | null>(null);

    const toggleMenu = () => {
        if (selectRef.current) {
            const menuList = selectRef.current.querySelector(".menu");

            if (menuList) {
                if (selectRef.current.classList.contains("expanded")) {
                    selectRef.current.classList.remove("expanded");
                    menuList.setAttribute("style", `height: 0px`);
                } else {
                    selectRef.current.classList.add("expanded");
                    menuList.setAttribute("style", `height: ${menuList.scrollHeight}px`);
                }
            }
        }
    };

    return (
        <div ref={selectRef} className="selectMenu">
            <button className="selected" type="button" onClick={() => toggleMenu()}>
                <span>{props.triggerText}</span>
                <span className="icon"><Chevron /></span>
            </button>
            <div className="menu">
                <ul>
                    {props.items.map((item, index) => (
                        <li key={index}>
                            <button type="button" onClick={() => { item.action(); toggleMenu(); }}>
                                {item.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};
