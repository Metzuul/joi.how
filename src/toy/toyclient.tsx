import {
  ButtplugClient,
  type ButtplugClientDevice,
  ActuatorType,
} from 'buttplug';
import { ToyActuator } from './toyactuator';
import { Stroke } from '../game/GameProvider';
import { wait, createStateProvider } from '../utils';
import { PositionActuator } from './actuators/positionactuator';
import { VibrationActuator } from './actuators/vibrationactuator';

export class ToyClient {
  actuators: ToyActuator[] = [];

  constructor(private readonly device: ButtplugClientDevice) {
    device.vibrateAttributes.forEach(
      attribute =>
        (this.actuators = [...this.actuators, new VibrationActuator(attribute)])
    );
    device.linearAttributes.forEach(attribute => 
      (this.actuators = [...this.actuators, new PositionActuator(attribute)])
    );
    device.oscillateAttributes.forEach(
      attribute =>
        (this.actuators = [...this.actuators, new ToyActuator(attribute)])
    );
    device.rotateAttributes.forEach(
      attribute =>
        (this.actuators = [...this.actuators, new ToyActuator(attribute)])
    );
  }

  async actuate(stroke: Stroke, intensity: number, pace: number) {
    const vibrationArray: number[] = [];
    let positionalOutput: any = null
    this.actuators.forEach(actuator => {
      switch (actuator.actuatorType) {
        case ActuatorType.Vibrate:
          vibrationArray[actuator.index] = actuator.getOutput?.(
           stroke,
           intensity,
           pace
          ) as number;
          break;
        case ActuatorType.Position:
          positionalOutput = actuator.getOutput?.(stroke, intensity, pace);
          break;
        default:
          break;
      }
    });
    if (vibrationArray.length > 0) {
      await this.device.vibrate(vibrationArray);
    }
    if (positionalOutput) {
      await this.device.linear(positionalOutput.position, positionalOutput.duration);
    }
  }

  async climax() {
    for (let i = 0; i < 15; i++) {
      const strength = Math.max(0, 1 - i * 0.067);
      const vibrationArray: number[] = [];
      this.actuators.forEach(actuator => {
        switch (actuator.actuatorType) {
          case ActuatorType.Vibrate: {
            const vibrationActuator = actuator as VibrationActuator;
            vibrationArray[actuator.index] =
              vibrationActuator.mapToRange(strength);
            break;
          }
          default:
            break;
        }
        if (vibrationArray.length > 0) {
          this.device.vibrate(vibrationArray);
        }
      });
      await wait(400);
    }
  }

  async stop() {
    await this.device.stop();
  }

  get name(): string {
    return this.device.name;
  }
}

export interface ToyClientSettings {
  client: ButtplugClient;
  connection?: string;
  devices: ToyClient[];
  error?: string;
}

export const {
  Provider: ToyClientProvider,
  useProvider: useToyClients,
  useProviderSelector: useToyClientValue,
} = createStateProvider<ToyClientSettings>({
  defaultData: {
    client: new ButtplugClient('JOI.how'),
    devices: [],
  },
});
