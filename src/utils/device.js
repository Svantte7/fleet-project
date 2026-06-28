import { useEffect, useMemo, useState } from 'react';

const getDevice = () => {
  if (typeof window === 'undefined') {
    return { isPhone: false, isTouch: false, width: 1024, height: 768 };
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const isTouch = window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
  const isPhone = width <= 720 || (isTouch && Math.min(width, height) <= 820);

  return { isPhone, isTouch, width, height };
};

export function useDevice() {
  const [device, setDevice] = useState(getDevice);

  useEffect(() => {
    const update = () => setDevice(getDevice());
    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  return useMemo(() => device, [device]);
}
