import React from 'react';
import Globe from 'react-globe.gl';

const Earth = () => {
    const myData = [
        {
            lat: 29.953204744601763,
            lng: -90.08925929478903,
            altitude: 0.4,
            color: '#00ff33',
        },
        {
            lat: 28.621322361013092,
            lng: 77.20347613099612,
            altitude: 0.4,
            color: '#ff0000',
        },
        {
            lat: -43.1571459086602,
            lng: 172.72338919659848,
            altitude: 0.4,
            color: '#ffff00',
        },
    ];

    return (
        <div className='cursor-move'>
            <Globe width={400} height={400} backgroundColor="#050212" globeImageUrl={"./earth-day.jpg"} pointsData={myData} pointAltitude='altitude' pointColor='color' />
        </div>
    );
}

export default Earth;