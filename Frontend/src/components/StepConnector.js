import React from 'react';

const StepConnector = ({ steps }) => {
    return (
        <div className='w-full pt-12 pb-24'>
            <p className="text-white text-xl italic font-semibold">Route</p>
            <div className="flex flex-wrap justify-center mx-auto">
                {steps.map((step, index) => {
                    return (
                        <div className="flex md:flex-row flex-col group my-4 justify-center items-center" key={step.id}>
                            <div className="flex flex-col items-center justify-center max-w-40 border-2 rounded-xl">
                                <div className="font-semibold text-sm leading-none m-2">
                                    {step.name} ({step.id})
                                </div>
                            </div>
                            {index < steps.length - 1 && (
                                <div className="flex flex-col md:flex-row justify-center w-20 items-center relative">
                                    <div className="w-10 z-20 mt-1">
                                        <img src="./icons/airplane.png" alt="airplane" />
                                    </div>
                                    <div className="absolute top-1/2 md:w-full md:h-[2px] h-full w-[2px] bg-border"></div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StepConnector;