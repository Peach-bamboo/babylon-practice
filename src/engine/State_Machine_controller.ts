import * as BABYLON from 'babylonjs';
import { AddCallback, Keys, StateMachine, StateName } from './types';
import { avaConfig } from './avaConfig'

export class StateMachineController {
    private scene: BABYLON.Scene;
    private engine: BABYLON.Engine;
    standAnimation: BABYLON.Nullable<BABYLON.AnimationGroup>;
    private walkAnimation!: BABYLON.Nullable<BABYLON.AnimationGroup>;
    private runAnimation!: BABYLON.Nullable<BABYLON.AnimationGroup>;
    private keys: Keys;
    private currentState: StateName = "stand";
    private previousAnimationGroup: BABYLON.AnimationGroup | null = null;
    private transitionProgress: number = avaConfig.character.transitionProgress;
    private readonly transitionDuration: number = avaConfig.character.transitionDuration;
    private statesConfig: StateMachine;
    _onBeforeRenderObserver!: BABYLON.Observer<BABYLON.Scene>;

    constructor(scene: BABYLON.Scene, engine: BABYLON.Engine, keys: Keys) {
        this.scene = scene;
        this.engine = engine;
        this.keys = keys;
        //获取各状态动画
        this.standAnimation = this.scene.getAnimationGroupByName(avaConfig.character.standAnimationName);
        this.walkAnimation = this.scene.getAnimationGroupByName(avaConfig.character.walkAnimationName);
        this.runAnimation = this.scene.getAnimationGroupByName(avaConfig.character.runAnimationName);
        this.statesConfig =
        {
            stand: {
                animation: this.standAnimation,
                transitions: {
                    walk: () => (this.keys[avaConfig.keyType.advance]||this.keys[avaConfig.keyType.back]) && !this.keys[avaConfig.keyType.speedUp],
                    run: () => (this.keys[avaConfig.keyType.advance]||this.keys[avaConfig.keyType.back]) && this.keys[avaConfig.keyType.speedUp]
                }
            },
            walk: {
                animation: this.walkAnimation,
                transitions: {
                    stand: () => !(this.keys[avaConfig.keyType.advance]||this.keys[avaConfig.keyType.back]),
                    run: () => (this.keys[avaConfig.keyType.advance]||this.keys[avaConfig.keyType.back]) && this.keys[avaConfig.keyType.speedUp]
                }
            },
            run: {
                animation: this.runAnimation,
                transitions: {
                    stand: () => !(this.keys[avaConfig.keyType.advance]||this.keys[avaConfig.keyType.back]),
                    walk: () => (this.keys[avaConfig.keyType.advance]||this.keys[avaConfig.keyType.back]) && !this.keys[avaConfig.keyType.speedUp]
                }
            }
        }

    }
    public init(): void {
        const currentAnimation = this.statesConfig[this.currentState].animation;
        if (currentAnimation) {
            currentAnimation.start(true);
        }
    }
    public update(): void {
        const currentAnimation = this.statesConfig[this.currentState].animation;
        for (let transition in this.statesConfig[this.currentState].transitions) {
            if (this.isStateName(transition)) {
                const condition = this.statesConfig[this.currentState].transitions[transition];
                if (condition()) {
                    if (currentAnimation) {
                        currentAnimation.stop();
                    }
                    this.currentState = transition;
                    const newAnimation = this.statesConfig[this.currentState].animation;
                    if (newAnimation) {
                        newAnimation.start(true);
                    }
                    break;
                }
            }

        }

        this.updateAnimations();
    }
    //类型断言
    isStateName(transition: string): transition is StateName {
        return ['stand', 'walk', 'run'].includes(transition);
    }

    public getCurrentState(): StateName {
        return this.currentState;
    }
    private getAnimation() {
        this.standAnimation = this.scene.getAnimationGroupByName(avaConfig.character.standAnimationName);
        this.walkAnimation = this.scene.getAnimationGroupByName(avaConfig.character.walkAnimationName);
        this.runAnimation = this.scene.getAnimationGroupByName(avaConfig.character.runAnimationName);
    }
    private updateAnimations(): void {
        const currentAnimation = this.statesConfig[this.currentState].animation;
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
    private addObserveCallBack(positionCallback: AddCallback | undefined, rotationCallback: AddCallback | undefined) {
        
        this.update();

        // 更新角色位置（仅当状态为 walk 时）
        if (this.getCurrentState() === 'walk' || this.getCurrentState() === 'run') {
            //更新角色位置
            positionCallback && positionCallback()
        }
        if (this.keys.a || this.keys.d) {
            // 更新角色旋转
            rotationCallback && rotationCallback()
        }
        // this.line = BABYLON.MeshBuilder.CreateLines("f", { points: [this.mesh.position.add(new BABYLON.Vector3(0, 3, 0)), this.mesh.position.add(new BABYLON.Vector3(0, 3, 0)).add(this.forward.scale(3))], instance: this.line });
    }
    //挂载监控状态机
    public addObserve(positionCallback: AddCallback | undefined, rotationCallback: AddCallback | undefined) {
        this._onBeforeRenderObserver = this.scene.onBeforeRenderObservable.add(() => this.addObserveCallBack(positionCallback, rotationCallback));
    }
    public removeObserve() {
        if (this._onBeforeRenderObserver) {
            this.scene.onBeforeRenderObservable.remove(this._onBeforeRenderObserver);
        }
    }
}