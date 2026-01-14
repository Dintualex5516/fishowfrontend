// import React, { useEffect, useState } from 'react';

// /* ✅ Required for TypeScript */
// declare global {
//   interface Window {
//     installPWA?: () => void;
//   }
// }

// const PWADownload: React.FC = () => {
//   const [canInstall, setCanInstall] = useState(false);

//   useEffect(() => {
//     const handler = () => {
//       setCanInstall(true);
//     };

//     window.addEventListener('beforeinstallprompt', handler);

//     return () => {
//       window.removeEventListener('beforeinstallprompt', handler);
//     };
//   }, []);

//   const handleDownload = () => {
//     if (!window.installPWA) {
//       alert('App installation is not available right now.');
//       return;
//     }

//     const confirmInstall = window.confirm(
//       'Do you want to download and install the Fishow ERP App on your device?'
//     );

//     if (confirmInstall) {
//       window.installPWA();
//     }
//   };

//   // ⛔ Do not render if install is not possible
// //   if (!canInstall) return null;
// if (!canInstall) {
//   return (
//     <p className="text-sm text-gray-400 text-center">
//       Install not available yet
//     </p>
//   );
// }

//   return (
//     <p
//       onClick={handleDownload}
//       className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium cursor-pointer text-center"
//     >
//       Download App
//     </p>
//   );
// };

// export default PWADownload;


import React, { useEffect, useState } from 'react';

declare global {
  interface Window {
    installPWA?: () => void;
  }
}

const PWADownload: React.FC = () => {
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    let deferredPrompt: any = null;

    const handler = (e: Event) => {
    //   // ✅ THIS IS THE MISSING PART
    //   e.preventDefault();

    //   deferredPrompt = e;
    //   setCanInstall(true);
    const handler = (e: any) => {
  console.log('🔥 beforeinstallprompt FIRED', e);
  e.preventDefault();
  setCanInstall(true);
};

      // ✅ expose install function globally
      window.installPWA = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
        setCanInstall(false);
      };
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  if (!canInstall) {
    return (
      <p className="text-sm text-gray-400 text-center">
        Install not available yet
      </p>
    );
  }

  return (
    <button
      onClick={() => window.installPWA?.()}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
    >
      Download App
    </button>
  );
};

export default PWADownload;
