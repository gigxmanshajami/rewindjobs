import { useState } from 'react';
// import { usePhone } from '../context/PhoneContext';

const PhoneNumberPopup = () => {
    // const [phoneNumber, setPhoneNumber] = useState('');// Use context to get the setPhoneNumber
    const [phoneNumber, setPhoneNumber] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1);


    const togglePopup = () => {
        setShowPopup(!showPopup);
        setStep(1); // Reset to Step 1 when opening the popup
    };

    // Handle phone number submission
    const handlePhoneSubmit = (e) => {
        e.preventDefault();
        console.log("Phone number submitted:", phoneNumber);
        // Here, you would trigger the OTP send via Firebase or your backend.
        setStep(2); // Proceed to OTP verification step
    };

    // Handle OTP submission
    const handleOtpSubmit = (e) => {
        e.preventDefault();
        console.log("OTP submitted:", otp);
        // Here, you would verify the OTP via Firebase or your backend.
        setShowPopup(false); // Close the popup after verification
    };

    return (
        <>
            {/* Button to trigger popup */}
            {/* <button
                className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                onClick={togglePopup}
            >
                Enter Phone Number
            </button> */}

            {/* Popup Overlay */}
            {showPopup && (
                <div
                    className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ${showPopup ? 'opacity-100' : 'opacity-0'
                        }`}
                    onClick={togglePopup} // Clicking outside the popup closes it
                >
                    {/* Popup content */}
                    <div
                        className={`bg-white p-8 rounded-lg shadow-lg max-w-md w-full transform transition-transform duration-300 ${showPopup ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                            }`}
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the popup
                    >
                        {step === 1 ? (
                            <>
                                {/* Step 1: Phone Number Input */}
                                <h2 className="text-xl font-semibold text-gray-700 mb-4">Enter your mobile number</h2>

                                {/* Form for phone number */}
                                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-600">
                                            Mobile Number
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            required
                                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            placeholder="Enter your phone number"
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-4">
                                        <button
                                            type="button"
                                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                            onClick={togglePopup}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                        >
                                            Send OTP
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <>
                                {/* Step 2: OTP Verification */}
                                <h2 className="text-xl font-semibold text-gray-700 mb-4">Enter the OTP</h2>

                                {/* Form for OTP */}
                                <form onSubmit={handleOtpSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="otp" className="block text-sm font-medium text-gray-600">
                                            OTP Code
                                        </label>
                                        <input
                                            type="text"
                                            id="otp"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            required
                                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            placeholder="Enter the OTP"
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-4">
                                        <button
                                            type="button"
                                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                            onClick={togglePopup}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                        >
                                            Verify OTP
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default PhoneNumberPopup;
