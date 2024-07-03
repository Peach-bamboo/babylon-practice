import * as BABYLON from 'babylonjs';
import {Vector3} from 'babylonjs';
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
      if (this.keys.a || this.keys.d) {
        // 更新角色旋转
        this.updateCharacterRotation();
      }

    });
  }

  private updateCharacterPosition(): void {
    // 更新角色位置逻辑
    if (this.mesh) {
      const moveSpeed = this.keys.shift ? 0.02 : 0.01; // 根据是否按下Shift键设置速度
      // const pos = this.mesh.position.add(new BABYLON.Vector3(0, 0, moveSpeed));
      // this.mesh.position = pos;
      const forward = new BABYLON.Vector3(0, 0, 1);
      this.mesh.moveWithCollisions(forward.scale(0.01))
      // }
    }
  }
  private updateCharacterRotation(): void {
    // debugger
    if (this.mesh) {
      if (this.keys.a) {
        this.mesh.addRotation(0,0.05,0); // 向左转
        console.log("this.mesh.rotation",this.mesh.rotation)
      } else if (this.keys.d) {
        this.mesh.rotation =this.mesh.rotation.add(new Vector3(0,-0.05,0));//向右转
        console.log("this.mesh.rotation",this.mesh.rotation)
      }
    }
  }
  public changeCheckCollisions(status:boolean){
    if(this.mesh){
      this.mesh.checkCollisions = status; 
    }
  }
}

export { Character };
