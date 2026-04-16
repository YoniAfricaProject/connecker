import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

export function useNetwork() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      setOnline(state.isConnected !== false && state.isInternetReachable !== false);
    });
    NetInfo.fetch().then((state) => {
      setOnline(state.isConnected !== false && state.isInternetReachable !== false);
    }).catch(() => {});
    return () => unsub();
  }, []);

  return { online };
}
