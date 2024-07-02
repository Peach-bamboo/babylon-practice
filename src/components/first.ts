import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';

class GameEngine {
  private canvas: HTMLCanvasElement;
  private engine: BABYLON.Engine;
  private scene: BABYLON.Scene;
  private character: BABYLON.Mesh | null = null;
  private keys: { [key: string]: boolean } = {};


  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.engine = new BABYLON.Engine(canvas, true);
    this.scene = new BABYLON.Scene(this.engine);
    this.scene.debugLayer.show();
    this.init();
  }


  private init(): void {
    this.setupScene();
    this.loadModel();
    this.addEventListeners();
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }

  private setupScene(): void {
    this.scene.debugLayer.show();
    const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(1, 1, 0), this.scene);
    const camera = new BABYLON.ArcRotateCamera('camera', 0, 0, 10, new BABYLON.Vector3.Zero(), this.scene);
    camera.attachControl(this.canvas, true);
  }

  private loadModel(): void {
    BABYLON.SceneLoader.Append('/oerba_yun_fang_-_final_fantasy_xiii/', 'scene.gltf', this.scene, (scene) => {
      console.log('GLTF file loaded successfully!');
      this.setupCharacter(scene);
    });
  }

  private setupCharacter(scene: BABYLON.Scene): void {
    scene.meshes.forEach((mesh) => {
      console.log('Mesh name:', mesh.name);
    });

    this.character = scene.meshes.find((mesh) => {
      return mesh.id.includes("character") || mesh.name.includes("root") || mesh.name.includes("Character_Root");
    });

    const rootMesh = scene.meshes.find((mesh) => mesh.name === "__root__");
    if (rootMesh) {
      const highlightMaterial = new BABYLON.StandardMaterial("highlightMaterial", scene);
      highlightMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0); // 红色
      rootMesh.material = highlightMaterial;
    } else {
      console.error("Root mesh '__root__' not found!");
    }

    if (!this.character) {
      console.error("Character mesh not found!");
      return;
    }

    console.log('Character root mesh:', this.character);

    const standAnimation = scene.getAnimationGroupByName("[Action Stash].002"); // 站立动画组
    const walkAnimation = scene.getAnimationGroupByName("[Action Stash].001"); // 前进动画组
    const runAnimation = scene.getAnimationGroupByName("[Action Stash].003"); // 跑步动画组

    if (this.character) {
      new Character(this.character, standAnimation, walkAnimation, runAnimation, this.keys, this.engine);
    }
  }

  private addEventListeners(): void {
    window.addEventListener('resize', () => {
      this.engine.resize();
    });

    this.scene.onKeyboardObservable.add((kbInfo) => {
      switch (kbInfo.type) {
        case BABYLON.KeyboardEventTypes.KEYDOWN:
          if (kbInfo.event.key === 'w') this.keys.w = true;
          if (kbInfo.event.key === 'Shift') this.keys.shift = true;
          break;
        case BABYLON.KeyboardEventTypes.KEYUP:
          if (kbInfo.event.key === 'w' || kbInfo.event.key === 'W') this.keys.w = false;
          if (kbInfo.event.key === 'Shift') this.keys.shift = false;
          break;
      }
    });
  }

}

class Character {
  private mesh: BABYLON.Mesh;
  private standAnimation: BABYLON.AnimationGroup | null;
  private walkAnimation: BABYLON.AnimationGroup | null;
  private runAnimation: BABYLON.AnimationGroup | null;
  private keys: { [key: string]: boolean };
  private engine: BABYLON.Engine;
  private stateMachine: StateMachine;

  constructor(
    mesh: BABYLON.Mesh,
    standAnimation: BABYLON.AnimationGroup | null,
    walkAnimation: BABYLON.AnimationGroup | null,
    runAnimation: BABYLON.AnimationGroup | null,
    keys: { [key: string]: boolean },
    engine: BABYLON.Engine
  ) {
    this.mesh = mesh;
    this.standAnimation = standAnimation;
    this.walkAnimation = walkAnimation;
    this.runAnimation = runAnimation;
    this.keys = keys;
    this.engine = engine;

    this.stateMachine = new StateMachine(this.standAnimation, this.walkAnimation, this.runAnimation, this.keys, this.engine);

    this.setupAnimation();
  }

  private setupAnimation(): void {
    this.stateMachine.init();

    this.mesh.getScene().onBeforeRenderObservable.add(() => {
      this.stateMachine.update();
      this.updateCharacterPosition();
    });
  }

  private updateCharacterPosition(): void {
    // 更新角色位置逻辑
    if (this.mesh) {
      const moveSpeed = this.keys.shift ? 0.2 : 0.1; // 根据是否按下Shift键设置速度
      // if (this.keys.w) {
        // const forward = new BABYLON.Vector3(
        //   Math.sin(this.character.rotation.y),
        //   0,
        //   Math.cos(this.character.rotation.y)
        // );
        // this.character.position.addInPlace(forward.scale(moveSpeed));
        const pos = this.mesh.position.add(new BABYLON.Vector3(1,0,0));
        this.mesh.position = pos;
      // }
    }
  }
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
interface State {
  animation: BABYLON.AnimationGroup | null;
  transitions: { [key: string]: () => boolean };
}
// js模块 默认导出和非默认导出
// 类别 
// 获取画布元素并创建游戏引擎实例

const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
const gameEngine = new GameEngine(canvas);
