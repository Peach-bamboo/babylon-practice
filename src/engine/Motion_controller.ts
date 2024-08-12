import * as BABYLON from 'babylonjs';
import { Vector3 } from 'babylonjs';
// import { EnterController } from './Enter_controller';
import { AddCallback, Keys } from './types';
import { avaConfig } from './avaConfig'


export class MontionController {
  private mesh: BABYLON.Mesh;
  private keys: { [key: string]: boolean };
  private forward: BABYLON.DeepImmutableObject<Vector3>;
  private forwardOp: BABYLON.DeepImmutableObject<Vector3>;
  private matrix: BABYLON.Matrix;
  // line: BABYLON.LinesMesh;
  scene: BABYLON.Scene;

  
  

  constructor(mesh: BABYLON.Mesh, scene: BABYLON.Scene,keys:Keys) {
    this.mesh = mesh;
    this.scene = scene;
    this.keys = keys;
    this.matrix = BABYLON.Matrix.Identity();
    this.forward = new BABYLON.Vector3(0, 0, 1);
    this.forwardOp = this.forward.negate();

    // this.line = BABYLON.MeshBuilder.CreateLines("f", {points: [this.mesh.position.add(new BABYLON.Vector3(0, 3, 0)), this.mesh.position.add(new BABYLON.Vector3(0, 3, 0)).add(this.forward.scale(3))], updatable: true});

    
  }


  public updateCharacterPosition : AddCallback = () => {
    // 更新角色位置逻辑
    if (this.mesh) {
      const moveSpeed = this.keys[avaConfig.keyType.speedUp] ? avaConfig.character.runSpeed : avaConfig.character.walkSpeed; // 根据是否按下Shift键设置速度
      const forward = this.keys[avaConfig.keyType.back]? this.forwardOp : this.forward;
      this.mesh.moveWithCollisions(forward.scale(moveSpeed))
      // }
    }
  }
  public updateCharacterRotation: AddCallback = () => {
    let angle = 0;
    if (this.mesh) {
      if (this.keys[avaConfig.keyType.turnLeft]) {
        angle = -avaConfig.character.rotation;
        BABYLON.Matrix.RotationYToRef(angle, this.matrix);
        BABYLON.Vector3.TransformNormalToRef(this.forward,this.matrix, this.forward);
        this.mesh.addRotation(0, -avaConfig.character.rotation, 0); // 向左转
      } else if (this.keys[avaConfig.keyType.turnRight]) {
        angle = avaConfig.character.rotation;
        BABYLON.Matrix.RotationYToRef(angle, this.matrix);
        BABYLON.Vector3.TransformNormalToRef(this.forward,this.matrix, this.forward);
        this.mesh.addRotation(0, avaConfig.character.rotation, 0); // 向左转
      }
    }
  }
  public changeCheckCollisions(status: boolean) {
    if (this.mesh) {
      this.mesh.checkCollisions = status;
    }
  }
}

