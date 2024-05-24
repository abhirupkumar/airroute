import React from 'react';
import MaxWidthWrapper from './MaxWidthWrapper';

const Navbar = () => {

    return (
        <nav className='sticky h-14 inset-x-0 top-0 z-50 w-full border-b border-gray-200 backdrop-blur-lg transition-all'>
            <MaxWidthWrapper>
                <div className='flex h-14 items-center justify-center border-b border-zinc-200'>
                    <a
                        href='/'
                        className='flex z-40 font-semibold'>
                        <span className='flex space-x-4 items-center justify-center'>
                            <p className='font-mono text-xl bg-gradient-to-r from-[#FD9248] via-[#FA1768] to-[#F001FF] bg-clip-text text-transparent font-semibold'>AirRoute</p>
                        </span>
                    </a>
                </div>
            </MaxWidthWrapper>
        </nav>
    )
}

export default Navbar