import * as BABYLON from 'babylonjs';
import { StateMachine } from './StateMachine';

class Character {
  private mesh: BABYLON.Mesh;
  private stateMachine: StateMachine;
  private keys: { [key: string]: boolean };
  private engine: BABYLON.Engine;

  constructor(mesh: BABYLON.Mesh, scene: BABYLON.Scene, keys: { [key: string]: boolean }, engine: BABYLON.Engine) {
    this.mesh = mesh;
    this.keys = keys;
    this.engine = engine;

    const standAnimation = scene.getAnimationGroupByName("[Action Stash].002");
    const walkAnimation = scene.getAnimationGroupByName("[Action Stash].001");
    const runAnimation = scene.getAnimationGroupByName("[Action Stash].003");

    this.stateMachine = new StateMachine(standAnimation, walkAnimation, runAnimation, this.keys, this.engine);

    this.setupAnimation();
  }

  private setupAnimation(): void {
    this.stateMachine.init();

    this.mesh.getScene().onBeforeRenderObservable.add(() => {
      this.stateMachine.update();
       // 更新角色位置（仅当状态为 walk 时）
       if (this.stateMachine.getCurrentState() === 'walk' || this.stateMachine.getCurrentState() === 'run') {
        this.updateCharacterPosition();
      }
    });
  }

  private updateCharacterPosition(): void {
    // 更新角色位置逻辑
    if (this.mesh) {
        const moveSpeed = this.keys.shift ? 0.02 : 0.01; // 根据是否按下Shift键设置速度
        // if (this.keys.w) {
          // const forward = new BABYLON.Vector3(
          //   Math.sin(this.character.rotation.y),
          //   0,
          //   Math.cos(this.character.rotation.y)
          // );
          // this.character.position.addInPlace(forward.scale(moveSpeed));
          const pos = this.mesh.position.add(new BABYLON.Vector3(0,0,moveSpeed));
          this.mesh.position = pos;
        // }
      }
  }
}

export { Character };
