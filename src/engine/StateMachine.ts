import * as BABYLON from 'babylonjs';

interface State {
  animation: BABYLON.AnimationGroup | null;
  transitions: { [key: string]: () => boolean };
}

class StateMachine {
  private currentState: string = "stand";
  private states: { [key: string]: State };
  private previousAnimationGroup: BABYLON.AnimationGroup | null = null;
  private transitionProgress: number = 0;
  private readonly transitionDuration: number = 0.5;
  private engine: BABYLON.Engine;

  constructor(
    standAnimation: BABYLON.AnimationGroup | null,
    walkAnimation: BABYLON.AnimationGroup | null,
    runAnimation: BABYLON.AnimationGroup | null,
    private keys: { [key: string]: boolean },
    engine: BABYLON.Engine
  ) {
    this.engine = engine;

    this.states = {
      stand: {
        animation: standAnimation,
        transitions: {
          walk: () => this.keys.w && !this.keys.shift,
          run: () => this.keys.w && this.keys.shift
        }
      },
      walk: {
        animation: walkAnimation,
        transitions: {
          stand: () => !this.keys.w,
          run: () => this.keys.w && this.keys.shift
        }
      },
      run: {
        animation: runAnimation,
        transitions: {
          stand: () => !this.keys.w,
          walk: () => this.keys.w && !this.keys.shift
        }
      }
    };
  }

  public init(): void {
    const currentAnimation = this.states[this.currentState].animation;
    if (currentAnimation) {
      currentAnimation.start(true);
    }
  }
  getCurrentState(): string {
    return this.currentState;
  }

  public update(): void {
    const currentState = this.currentState;
    const currentAnimation = this.states[currentState].animation;

    for (let transition in this.states[currentState].transitions) {
      const condition = this.states[currentState].transitions[transition];
      if (condition()) {
        if (currentAnimation) {
          currentAnimation.stop();
        }
        this.currentState = transition;
        const newAnimation = this.states[this.currentState].animation;
        if (newAnimation) {
          newAnimation.start(true);
        }
        break;
      }
    }

    this.updateAnimations();
  }

  private updateAnimations(): void {
    const currentAnimation = this.states[this.currentState].animation;
    if (this.previousAnimationGroup && currentAnimation !== this.previousAnimationGroup) {
      this.transitionProgress += this.engine.getDeltaTime() / (this.transitionDuration * 1000);
      if (this.transitionProgress >= 1.0) {
        this.transitionProgress = 1.0;
        this.previousAnimationGroup.stop();
        this.previousAnimationGroup = null;
      } else {
        this.previousAnimationGroup.setWeightForAllAnimatables(1.0 - this.transitionProgress);
        currentAnimation?.setWeightForAllAnimatables(this.transitionProgress);
      }
    } else {
      this.transitionProgress = 1.0;
    }
    this.previousAnimationGroup = currentAnimation;
  }
}

export { StateMachine };
