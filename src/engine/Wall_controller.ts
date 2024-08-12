import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import { WallSizeType } from './types';

export class WallController {
    private scene: BABYLON.Scene;
    private wallSize1:WallSizeType = {
        height: 1, width: 1, depth: 1
    }
    private wallPos1 = new BABYLON.Vector3(0, 0, 5);

    constructor(scene: BABYLON.Scene) {
        this.scene = scene
    }
    public buildWall1() {
        const wall1 = this.createAirWall(this.wallPos1,this.wallSize1,0.1,true);
        return wall1;
    }
    private createAirWall(position: BABYLON.Vector3, size: WallSizeType,visibility: number,checkCollisions: boolean) {
        const wall = BABYLON.MeshBuilder.CreateBox("airWall", { height: size.height, width: size.width, depth: size.depth }, this.scene);
        wall.position = position;
        wall.visibility = visibility; // 是否使空气墙不可见
        return wall;
    }
    // 开启空气墙的碰撞检测
    public openCollisions(wall:BABYLON.Mesh,isCol:boolean){
        wall.checkCollisions = isCol;
    }
    //删除指定空气墙
    public removeWall(mesh:BABYLON.Mesh){
        mesh.dispose();
    }
}