import React, { ReactNode } from 'react';

const MaxWidthWrapper = ({ className, children }) => {
    return (
        <div className={`mx-auto w-full max-w-screen-xl px-2.5 md:px-20 ${className}`}>
            {children}
        </div>
    )
}

export default MaxWidthWrapper;