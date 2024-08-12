import * as BABYLON from 'babylonjs';
class Ground {
    character: BABYLON.Mesh;
    ground: BABYLON.AbstractMesh;
    scene: BABYLON.Scene;
    constructor(character:BABYLON.Mesh,scene: BABYLON.Scene) {
        this.scene = scene
        this.character = character;
        this.ground = BABYLON.MeshBuilder.CreateGround("ground", {height: 1.5, width: 2.5, subdivisions: 4});
        this.update()
    }
    update():void {
        // 更新角色位置
        // 创建向下的射线
        if (this.character) {
            let ray = new BABYLON.Ray(this.character.position, new BABYLON.Vector3(0, -1, 0), 20);
            this.showRay(ray, this.character.getScene());
            // 检测射线与地面的碰撞
            let hit = this.scene.pickWithRay(ray,  (mesh) => {
                if(mesh.name == '__root__'){
                    console.log("Checking mesh:", mesh.name,"----------", mesh === this.ground);
                    return mesh === this.ground;
                }else{
                    return false;
                }
                
            });  

            if (hit && hit.pickedMesh) {
                console.log("Hit detected on mesh:", hit.pickedMesh.name);
                console.log("Ground mesh:", this.ground.name);
                console.log("Match:", hit.pickedMesh === this.ground);
            }
            
            // 如果射线与地面相交，调整角色位置
            if (hit && hit.pickedPoint && hit.pickedMesh === this.ground) {
                this.character.position.y = hit.pickedPoint.y + 1; // 0.5 是角色的半径，确保角色在地面上方
            }
            // this.character.position.y = 10 + 1;
        }


    }
    // 显示射线
    showRay (ray: BABYLON.Ray, scene: BABYLON.Scene) {
        const rayHelper = new BABYLON.RayHelper(ray);
        rayHelper.show(scene, new BABYLON.Color3(1, 0, 0)); // 红色射线
    };
}
export { Ground };