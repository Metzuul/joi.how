import { useEffect, useState } from 'react';
import { GamePhase, useGameValue } from '../GameProvider';
import { useAutoRef, useVibratorValue, VibrationMode, wait } from '../../utils';
import { useSetting } from '../../settings';
import { ActuatorType } from 'buttplug';

export const GameVibrator = () => {
  const [stroke] = useGameValue('stroke');
  const [intensity] = useGameValue('intensity');
  const [pace] = useGameValue('pace');
  const [phase] = useGameValue('phase');
  const [mode] = useSetting('vibrations');
  const [devices] = useVibratorValue('devices');

  const data = useAutoRef({
    intensity,
    pace,
    devices,
    mode,
  });

  const [currentPhase, setCurrentPhase] = useState(phase);

  useEffect(() => {
    const { intensity, pace, devices, mode } = data.current;
    console.log(`${pace} ${mode}`);
    devices.forEach(device =>
      device.actuators.forEach(() => console.log('actuator activated'))
    );
    devices.forEach(device => {
      const vibrationArray: number[] = [];
      device.actuators.forEach(actuator => {
        switch (actuator.actuatorType) {
          case ActuatorType.Vibrate:
            vibrationArray[actuator.index] = actuator.getOutput?.(
              stroke,
              intensity,
              pace
            ) as number;
            break;
          default:
            break;
        }
      });
      if (vibrationArray.length > 0) {
        device.setVibration(vibrationArray);
      }
    });
  }, [data, stroke]);

  useEffect(() => {
    const { devices, mode } = data.current;
    if (currentPhase == phase) return;
    if ([GamePhase.break, GamePhase.pause].includes(phase)) {
      devices.forEach(device => device.setVibration(0));
    }
    if (phase === GamePhase.climax) {
      (async () => {
        for (let i = 0; i < 15; i++) {
          const strength = Math.max(0, 1 - i * 0.067);
          switch (mode) {
            case VibrationMode.constant:
              devices.forEach(device => device.setVibration(strength));
              break;
            case VibrationMode.thump:
              devices.forEach(device => device.thump(400, strength));
              break;
          }
          await wait(400);
        }
      })();
    }
    setCurrentPhase(phase);
  }, [data, currentPhase, phase]);

  return null;
};
