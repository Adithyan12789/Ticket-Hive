import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegisterTheaterMutation } from '../../Slices/TheaterApiSlice';
import { useVerifyOtpTheaterMutation } from '../../Slices/TheaterApiSlice';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faUser, faPhone } from '@fortawesome/free-solid-svg-icons';
import './TheaterRegisterPage.css';

const TheaterOwnerRegisterPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');  
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    const navigate = useNavigate();
    const [register, { isLoading }] = useRegisterTheaterMutation();
    const [verifyOtp] = useVerifyOtpTheaterMutation();

    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePassword = (password: string) => password.length >= 6;
    const validatePhone = (phone: string) => /^\d{10}$/.test(phone); 

    const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (!validateEmail(email)) {
            toast.error('Invalid email format');
            return;
        }

        if (!validatePassword(password)) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        if (!validatePhone(phone)) {
            toast.error('Invalid phone number format. Enter a 10-digit phone number.');
            return;
        }

        try {
            await register({
                name, email, password, phone: Number(phone)
            }).unwrap();
            toast.success('Registration successful, please verify your OTP');
            setShowOtpModal(true);  
        } catch (err: unknown) {
            const error = err as { data?: { message?: string } };
            toast.error(error.data?.message || 'An error occurred');
        }
    };

    const handleOtpSubmit = async () => {
        setIsVerifying(true);
        try {
            await verifyOtp({ email, otp }).unwrap();
            toast.success('OTP verification successful');
            setShowOtpModal(false);
            navigate('/theater-login');
        } catch (err) {
            const error = err as { data?: { message?: string } };
            toast.error(error.data?.message || 'Invalid OTP');
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <h1 className="pb-5" style={{ fontSize: "30px" }}>Theater Owner Register</h1>
                <form onSubmit={submitHandler}>

                    <div className="input">
                        <div className="input-wrapper">
                            <span className="input-icon">
                                <FontAwesomeIcon icon={faUser} />
                            </span>
                            <input
                                className="login-input"
                                type="text"
                                placeholder="Owner Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                aria-label="Owner Name"
                            />
                        </div>
                    </div>

                    <div className="input">
                        <div className="input-wrapper">
                            <span className="input-icon">
                                <FontAwesomeIcon icon={faEnvelope} />
                            </span>
                            <input
                                className="login-input"
                                type="email"
                                placeholder="Owner Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                aria-label="Owner Email"
                            />
                        </div>
                    </div>

                    <div className="input">
                        <div className="input-wrapper">
                            <span className="input-icon">
                                <FontAwesomeIcon icon={faPhone} />
                            </span>
                            <input
                                className="login-input"
                                type="text"
                                placeholder="Owner Phone Number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                                aria-label="Owner Phone Number"
                                maxLength={10}
                            />
                        </div>
                    </div>

                    <div className="input pb-3">
                        <div className="input-wrapper">
                            <span className="input-icon">
                                <FontAwesomeIcon icon={faLock} />
                            </span>
                            <input
                                className="login-input"
                                type="password"
                                placeholder="Owner Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                aria-label="Owner Password"
                            />
                        </div>
                    </div>

                    <div className="input pb-3">
                        <div className="input-wrapper">
                            <span className="input-icon">
                                <FontAwesomeIcon icon={faLock} />
                            </span>
                            <input
                                className="login-input"
                                type="password"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                aria-label="Confirm Password"
                            />
                        </div>
                    </div>

                    <button className="login-btn" type="submit">
                        {isLoading ? 'Registering...' : 'Register'}
                    </button>

                    <div className="login-now pt-5">
                        <p>Already an Owner? <a href="/theater-login">Login</a></p>
                    </div>
                </form>

                {showOtpModal && (
                    <div className="otp-modal">
                        <div className="otp-modal-content">
                            <h2 className="otp-title">OTP Verification</h2>
                            <p className="otp-text">Enter the OTP sent to your Email</p>
                            <div className="otp-input-container">
                                <input
                                    className="otp-input form-input" 
                                    style={{color: "black"}}
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="Enter OTP"
                                    maxLength={6}
                                    aria-label="OTP"
                                />
                            </div>
                            <button className="modern-btn otp-submit-btn" onClick={handleOtpSubmit} disabled={isVerifying}>
                                {isVerifying ? 'Verifying...' : 'Verify OTP'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TheaterOwnerRegisterPage;
