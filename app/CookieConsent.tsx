// @ts-nocheck
'use client';
import { useEffect, useState } from 'react';
import Cookie from 'js-cookie';
import {Button} from '@/components/ui/button';

const CookieConsent = () => {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    // Check if the user has already accepted cookies
    const cookieConsent = Cookie.get('cookie-consent');
    
    if (!cookieConsent) {
      setShowConsent(true);
    }
  }, []);

  const handleAccept = () => {
    // Set a cookie that expires in 1 year
    Cookie.set('cookie-consent', 'accepted', { expires: 365 });
    setShowConsent(false);
  };

  return (
    showConsent && (
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 flex justify-between items-center z-50 animate-in">
        <div className="flex items-center">
          <span className="mr-4">This site uses cookies to improve your experience.</span>
        </div>
        <Button
          onClick={handleAccept}
          variant='default'
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300"
        >
          Accept
        </Button>
      </div>
    )
  );
};

export default CookieConsent;
