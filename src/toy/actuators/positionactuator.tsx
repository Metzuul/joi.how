import { ToyActuator, ActuatorMode } from "../toyactuator";
import { type GenericDeviceMessageAttributes } from "buttplug";
import { Stroke } from "../../game/GameProvider";

export class PositionActuator extends ToyActuator implements PositionActuatorSettings {
  mode = ActuatorMode.activeUp;
  minPosition: number = 0;
  maxPosition: number = 1;

  constructor(attributes: GenericDeviceMessageAttributes) {
    super(attributes);
  }

  override getOutput(stroke: Stroke, _intensity: number, pace: number) : PositionData | null {
    const travelMilliseconds = Math.round(1000 / pace);
    switch (this.mode) {
      case ActuatorMode.activeUp:
        return {
          toPosition: stroke === Stroke.up ? this.maxPosition : this.minPosition,
          travelMilliseconds
        }
      case ActuatorMode.activeDown:
        return {
            toPosition: stroke === Stroke.down ? this.maxPosition : this.minPosition,
            travelMilliseconds
        }
      case ActuatorMode.alwaysOn:
      case ActuatorMode.alwaysOff:
        return null;
    }
  }

  mapToRange(input: number): number {
    const slope = this.maxPosition - this.minPosition;
    return this.minPosition + slope * input;
  }
}

export interface PositionActuatorSettings {
  mode: ActuatorMode;
  minPosition: number;
  maxPosition: number;
}

export interface PositionData {
  toPosition: number;
  travelMilliseconds: number;
}