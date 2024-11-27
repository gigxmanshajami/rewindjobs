import React, { createContext, useContext, useRef } from "react";

const SectionRefsContext = createContext();

export const SectionRefsProvider = ({ children }) => {
    const sectionRefs = useRef({}); // Centralized ref object

    const populateRefs = (fields) => {
        fields.forEach((field) => {
            if (!sectionRefs.current[field]) {
                sectionRefs.current[field] = React.createRef();
            }
        });
    };

    return (
        <SectionRefsContext.Provider value={{ sectionRefs, populateRefs }}>
            {children}
        </SectionRefsContext.Provider>
    );
};

export const useSectionRefs = () => {
    return useContext(SectionRefsContext);
};
