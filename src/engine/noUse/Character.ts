import * as BABYLON from 'babylonjs';
import { Vector3 } from 'babylonjs';
import { StateMachine } from './StateMachine';
import { EnterController } from '../Enter_controller';


class Character {
  private mesh: BABYLON.Mesh;
  private stateMachine: StateMachine;
  private keys: { [key: string]: boolean };
  private engine: BABYLON.Engine;
  private forward: BABYLON.DeepImmutableObject<Vector3>;
  private matrix: BABYLON.Matrix;
  line: BABYLON.LinesMesh;
  scene: BABYLON.Scene;

  
  

  constructor(mesh: BABYLON.Mesh, scene: BABYLON.Scene, engine: BABYLON.Engine) {
    this.mesh = mesh;
    this.scene = scene;
    this.keys = new EnterController(this.scene).keys;
    this.engine = engine;
    this.matrix = BABYLON.Matrix.Identity();
    this.forward = new BABYLON.Vector3(0, 0, 1);

    this.line = BABYLON.MeshBuilder.CreateLines("f", {points: [this.mesh.position.add(new BABYLON.Vector3(0, 3, 0)), this.mesh.position.add(new BABYLON.Vector3(0, 3, 0)).add(this.forward.scale(3))], updatable: true});


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
      this.line = BABYLON.MeshBuilder.CreateLines("f", {points: [this.mesh.position.add(new BABYLON.Vector3(0, 3, 0)), this.mesh.position.add(new BABYLON.Vector3(0, 3, 0)).add(this.forward.scale(3))], instance:this.line});
    });
  }

  private updateCharacterPosition(): void {
    // 更新角色位置逻辑
    if (this.mesh) {
      const moveSpeed = this.keys.shift ? 0.02 : 0.01; // 根据是否按下Shift键设置速度
      // const pos = this.mesh.position.add(new BABYLON.Vector3(0, 0, moveSpeed));
      // this.mesh.position = pos;
      // const forward = new BABYLON.Vector3(0, 0, 1);
      this.mesh.moveWithCollisions(this.forward.scale(0.01))
      // }
    }
  }
  private updateCharacterRotation(): void {

    // let angle = this.mesh.rotation.y;
    let angle = 0;
    if (this.mesh) {
      if (this.keys.a) {
        angle = 0.05;
        BABYLON.Matrix.RotationYToRef(angle, this.matrix);
        BABYLON.Vector3.TransformNormalToRef(this.forward,this.matrix, this.forward);
        // this.mesh.rotation.y = angle;
        this.mesh.addRotation(0, 0.05, 0); // 向左转
      } else if (this.keys.d) {
        angle = -0.05;
        BABYLON.Matrix.RotationYToRef(angle, this.matrix);
        BABYLON.Vector3.TransformNormalToRef(this.forward,this.matrix, this.forward);
        // this.mesh.rotation.y = angle;
        this.mesh.addRotation(0, -0.05, 0); // 向左转
        // this.mesh.rotation = this.mesh.rotation.add(new Vector3(0, -0.05, 0));//向右转
      }
    }
  }
  public changeCheckCollisions(status: boolean) {
    if (this.mesh) {
      this.mesh.checkCollisions = status;
    }
  }
}

export { Character };
