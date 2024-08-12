import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import { avaConfig } from './avaConfig'

export class SimpleBlock {
    private mesh: BABYLON.Mesh | undefined;
    boundingInfo: BABYLON.BoundingInfo | undefined;
    boundingBox: any;
    scene: BABYLON.Scene;
    box: BABYLON.Mesh;

    constructor(mesh: BABYLON.Mesh | undefined, scene: BABYLON.Scene) {
        this.mesh = mesh
        this.scene = scene;
        this.calBoxInfo();
        this.box = this.createSimpleBox();
        this.bindBox(avaConfig.character.height);


    }
    // 计算人物 mesh 的包围盒
    private calBoxInfo() {
        if (this.mesh) {
            this.mesh.refreshBoundingInfo();
            this.boundingInfo = this.mesh.getBoundingInfo();
            this.boundingBox = this.boundingInfo.boundingBox;
            console.log("this.boundingBox",this.boundingBox)
        }

    }
    // 创建包围盒的正方体 mesh
    private createSimpleBox() {
        const box = BABYLON.MeshBuilder.CreateBox('box', {
            width: this.boundingBox.extendSize.x * 2 || avaConfig.character.width,
            height: this.boundingBox.extendSize.y * 2 || avaConfig.character.height,
            depth: this.boundingBox.extendSize.z * 2 || avaConfig.character.depth,
        }, this.scene);
        return box
    }
    //绑定
    private bindBox(aHeight: number) {
        if (this.box && this.mesh) {
            // 将正方体 mesh 绑定到人物 mesh 上，并使其透明
            this.box.parent = this.mesh;
            this.box.position = this.boundingBox.center.equals(BABYLON.Vector3.Zero()) ? new BABYLON.Vector3(0,aHeight/2,0): this.boundingBox.center;
            this.box.material = new BABYLON.StandardMaterial('boxMaterial', this.scene);
            this.box.material.alpha = avaConfig.box.alpha; // 设置透明度
        }

    }


}