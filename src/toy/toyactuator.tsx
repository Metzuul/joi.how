import { type GenericDeviceMessageAttributes, ActuatorType } from 'buttplug';
import { Stroke } from '../game/GameProvider';

export enum ActuatorMode {
  alwaysOn = 'alwaysOn',
  alwaysOff = 'alwaysOff',
  activeUp = 'activeUp',
  activeDown = 'activeDown',
}

export const ActuatorModeLabels: Record<ActuatorMode, string> = {
  [ActuatorMode.alwaysOn]: 'Always On',
  [ActuatorMode.alwaysOff]: 'Always Off',
  [ActuatorMode.activeUp]: 'Active on Upstroke',
  [ActuatorMode.activeDown]: 'Active on Downstroke',
};

export class ToyActuator implements ToyActuatorSettings {
  index: number;
  actuatorType: ActuatorType;

  constructor(attributes: GenericDeviceMessageAttributes) {
    this.actuatorType = attributes.ActuatorType;
    this.index = attributes.Index;
  }

  getOutput?(stroke: Stroke, intensity: number, pace: number): unknown;
}

export interface ToyActuatorSettings {
  index: number;
  actuatorType: ActuatorType;
}
