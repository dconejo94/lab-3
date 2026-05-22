import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './screens/HomeScreen';
import AccelerometerScreen from './screens/AccelerometerScreen';
import GyroscopeScreen from './screens/GyroscopeScreen';
import DragonSlayerGame from './screens/DragonSlayerGame';

export default function App() {
  const [screen, setScreen] = useState('home');

  const goHome = () => setScreen('home');

  return (
    <>
      <StatusBar style="light" />
      {screen === 'home' && <HomeScreen onNavigate={setScreen} />}
      {screen === 'accelerometer' && <AccelerometerScreen onBack={goHome} />}
      {screen === 'gyroscope' && <GyroscopeScreen onBack={goHome} />}
      {screen === 'game' && <DragonSlayerGame onBack={goHome} />}
    </>
  );
}
