// src/navigation/AuthNavigator.js
// Handles the pre-login flow only. AuthContext.status decides Register vs
// Login (see context/AuthContext.js bootstrap logic); this component just
// adds local screen switching for "Forgot PIN?" within that.
import React, { useState } from 'react';
// import { RegisterScreen, LoginScreen, ForgetPinScreen } from '../screens/auth';
import { useAuthContext } from '../context/AuthContext';
import ForgetPinScreen from '../screens/auth/ForgetPinScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import LoginScreen from '../screens/auth/LoginScreen';

export default function AuthNavigator() {
    const { status, goToRegister, goToLogin } = useAuthContext();
    const [showForgetPin, setShowForgetPin] = useState(false);

    if (showForgetPin) {
        return <ForgetPinScreen onBackToLogin={() => setShowForgetPin(false)} />;
    }

    if (status === 'register') {
        return <RegisterScreen onGoToLogin={goToLogin} />;
    }

    // status === 'login'
    return (
        <LoginScreen
            onGoToRegister={goToRegister}
            onGoToForgetPin={() => setShowForgetPin(true)}
        />
    );
}