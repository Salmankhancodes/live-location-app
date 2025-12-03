"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/button';
import Link from 'next/link';


const ShareLocationPage: React.FC = () => {
  const router = useRouter();
  const [locationPermission, setLocationPermission] = useState<PermissionState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
        setLocationPermission(permissionStatus.state);

        permissionStatus.onchange = () => {
          setLocationPermission(permissionStatus.state);
        };
      } catch (error) {
        console.error('Permission API is not supported', error);
        setLocationPermission(null);
      } finally {
        setLoading(false);
      }
    };
    checkPermission();
  }, []);

  const requestLocationPermission = () => {
    navigator.geolocation.getCurrentPosition(
      () => {
        setLocationPermission('granted');
      },
      () => {
        setLocationPermission('denied');
      }
    );
  };

  const handleProceed = () => {
    router.push('/share-location/mapwindow'); // Navigate to the location sharing screen
  };
  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <div className="p-4">
      {locationPermission === 'granted' ? (
        <div>
          <h2 className="text-xl font-bold mb-4">Location Sharing Enabled</h2>
          <p className="mb-4">You have enabled location sharing 🥳.</p>
          <Button onClick={handleProceed}>Proceed to Share Location</Button>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-bold mb-4">Enable Location Sharing</h2>
          <p className="mb-4">Location permission is blocked. Please enable it from browser settings.</p>
          <Button onClick={requestLocationPermission}>Request Location Permission</Button>
        </div>
      )}
    </div>
  );
};

export default ShareLocationPage;
