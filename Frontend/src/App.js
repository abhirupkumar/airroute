import logo from './logo.svg';
import './App.css';
import MaxWidthWrapper from './components/MaxWidthWrapper';
import Navbar from './components/Navbar';
import Globe from './components/Globe';
import StarsCanvas from './components/StarBackground';
import InputForm from './components/InputForm';
import MapWithRoute from './components/MapWithRoute';
import { useRef, useEffect, useState } from 'react';
import airports from './data/airports.json';

export default function App() {

  const [routesData, setRoutesData] = useState(null);
  const [routes, setRoutes] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  const airportsData = airports["airports"];

  const handleClick = () => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRouteSubmit = async (start, end) => {
    setLoading(true);
    const response = await fetch(`https://airnavigation.onrender.com/shortest_path?start=${start.id}&end=${end.id}&prev`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ start: start.id, end: end.id })
    });
    const data = await response.json();
    if (data && data.error) {
      setError(data.error);
      setRoutesData(null);
      setLoading(false);
      return;
    }
    else {
      const routes = airportsData.filter((airport) => data.route.includes(airport.id));
      const sortedRoutes = data.route.map((id) => routes.find((route) => route.id === id));
      setRoutesData(sortedRoutes);
      setError("");
      setLoading(false);
    }
  };

  useEffect(() => {
    setRoutes(routesData);
  }, [routesData])

  return (
    <>
      <StarsCanvas />
      <Navbar />
      <MaxWidthWrapper className='mb-12 flex flex-col items-center justify-center text-center'>
        <div className="flex lg:flex-row flex-col-reverse lg:justify-between justify-center gap-x-2 w-full">
          <div className='flex flex-col justify-center items-center lg:w-1/2 w-full'>
            <div className='mx-auto mb-4 flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full border border-gray-200 bg-white px-7 py-2 shadow-md backdrop-blur transition-all hover:border-gray-300 hover:bg-white/90'>
              <p className='text-sm font-semibold text-gray-700'>
                AirRoute is now public!
              </p>
            </div>
            <h1 className='max-w-4xl text-5xl font-bold md:text-6xl lg:text-7xl'>
              Find your flight{' '}
              <span className='bg-gradient-to-r from-[#FD9248] via-[#FA1768] to-[#F001FF] bg-clip-text text-transparent'>route</span>{' '}
              in seconds.
            </h1>
            <p className='mt-5 max-w-prose text-zinc-300 sm:text-lg'>
              AirRoute allows you to find out the best possible route amidst all the traffic. Simply provide your starting point and destination to know your route.
            </p>
            <button onClick={handleClick} className="inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 mt-5">
              Get started
            </button>
          </div>
          <div className='lg:w-1/2 w-full'>
            <Globe />
          </div>
        </div>

        <div ref={ref} className="flex flex-col items-center p-4 w-full">
          <h1 className="text-3xl font-semibold mb-4 italic">Enter your journey details</h1>
          <InputForm loading={loading} onSubmit={handleRouteSubmit} />
          {routes && routes != null && <MapWithRoute routesData={routes} />}
          {error && error != "" && <p className="text-xl text-red-500">{error}</p>}
        </div>

      </MaxWidthWrapper>
    </>
  )
}