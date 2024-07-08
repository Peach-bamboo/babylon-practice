import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import { EnterController } from './Enter_controller';
import { Wall_controller } from './Wall_controller';
import { Character } from './Character';

export class Init {
    private canvas: HTMLCanvasElement;
    private engine: BABYLON.Engine;
    private scene: BABYLON.Scene;
    private wallController: BABYLON.Mesh;
    character!: Character;
    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.engine = new BABYLON.Engine(this.canvas, true);
        this.scene = new BABYLON.Scene(this.engine);
        //open check model
        this.scene.debugLayer.show();
        //设置场景
        this.setupScene();
        // 引入模型
        this.loadModel();
        //角色状态机
        this.setupCharacter();
        // 输入控制---按键绑定
        new EnterController(this.scene).bind();
        this.wallController = new Wall_controller(this.scene).buildWall1();



        // 监听窗口调整大小事件
        window.addEventListener('resize', () => {
            this.engine.resize();
        });
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }
    private setupScene(): void {
        new BABYLON.HemisphericLight('light', new BABYLON.Vector3(1, 1, 0), this.scene);
        const camera = new BABYLON.ArcRotateCamera('camera', 0, 0, 10, BABYLON.Vector3.Zero(), this.scene);
        camera.attachControl(this.canvas, true);
    }
    private loadModel(): void {
        BABYLON.SceneLoader.Append('/oerba_yun_fang_-_final_fantasy_xiii/', 'scene.gltf', this.scene, (scene) => {
            console.log('GLTF file loaded successfully!');
        }, null, (_scene, message) => {
            console.error("Failed to load the model:", message);
        });
    }
    private setupCharacter(): void {
        const characterMesh = this.scene.meshes.find(mesh => mesh.name === "__root__") as BABYLON.Mesh | undefined;
        if (characterMesh) {
            this.character = new Character(characterMesh, this.scene, this.engine);
        } else {
            console.error("Root mesh '__root__' not found!");
        }
    }
}