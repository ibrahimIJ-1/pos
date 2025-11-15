"use client";

import React, { useEffect, useState } from "react";
import {
  Scanner,
  IDetectedBarcode,
  useDevices,
} from "@yudiel/react-qr-scanner";
import { usePOS } from "@/providers/POSProvider";
import { RefreshCwIcon } from "lucide-react";

const QrScannerModal: React.FC = () => {
  const {
    handleCameraScanned,
    openScanner,
    setOpenScanner,
    lastResult,
    trans,
  } = usePOS();
  const devices = useDevices();
  const [selectedDevice, setSelectedDevice] = useState<MediaDeviceInfo | null>(
    null
  );
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState<number>(-1);
  const [scanCooldown, setScanCooldown] = useState({ active: false });

  useEffect(() => {
    if (devices.length > 0) {
      setSelectedDevice(devices[0]);
      setCurrentDeviceIndex(0);
    }
  }, []);

  const switchDevice = () => {
    if (devices.length <= 0) {
      setSelectedDevice(null);
      setCurrentDeviceIndex(-1);
    }
    if (devices.length - 1 == currentDeviceIndex) {
      setSelectedDevice(devices[0]);
      setCurrentDeviceIndex(0);
    } else {
      setSelectedDevice(devices[currentDeviceIndex + 1]);
      setCurrentDeviceIndex(currentDeviceIndex + 1);
    }
  };

  const handleScan = (codes: IDetectedBarcode[]) => {
    const value = codes?.[0]?.rawValue;
    const format = codes?.[0]?.format;
    if (!value) return;
    if (scanCooldown.active) return;
    setScanCooldown({ active: true });

    handleCameraScanned(value, format);

    setTimeout(() => {
      setScanCooldown({ active: false });
    }, 500);
  };
  if (!openScanner) return null;
  if (devices.length <=0) return null;
  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl p-5 shadow-lg">
        <h3 className="text-center text-xl font-semibold mb-4">
          {trans("Scan Code")}
        </h3>

        <div className="w-full rounded-lg overflow-hidden relative">
          <Scanner
            onScan={handleScan}
            onError={(err) => console.error("Scanner error:", err)}
            sound
            allowMultiple={false}
            paused={scanCooldown.active}
            styles={{
              container: { width: "100%" },
              video: { width: "100%", borderRadius: "10px" },
            }}
            components={{
              finder: true,
            }}
            constraints={{
              deviceId: selectedDevice?.deviceId,
              facingMode: "environment", // Use rear camera
              aspectRatio: 1, // Square aspect ratio
            }}
          />
          <div className="h-px absolute w-[70%] bg-green-500 bottom-1/2 left-1/2 -translate-x-1/2"></div>
          {devices.length > 1 && (
            <button
              onClick={switchDevice}
              className="absolute top-0 left-0 mx-2 my-2 flex justify-center items-center gap-2"
            >
              <RefreshCwIcon size={28} fontWeight={900}/>
            </button>
          )}
        </div>

        <button
          onClick={() => setOpenScanner(false)}
          className="mt-5 w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-lg transition"
        >
          {trans("Close")} {lastResult}
        </button>
      </div>
    </div>
  );
};

export default QrScannerModal;
