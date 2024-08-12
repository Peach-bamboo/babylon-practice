import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import { EnterController } from './Enter_controller';
import { WallController } from './Wall_controller';
import { Character } from './noUse/Character';
import { StateMachineController } from './State_Machine_controller';
import { MontionController } from './Motion_controller';
import { SimpleBlock } from './simpleBlock';
// import { Ground } from './Ground';


export class Init {
    private canvas: HTMLCanvasElement;
    private engine: BABYLON.Engine;
    private scene: BABYLON.Scene;
    character!: Character;
    StateMachineController!: StateMachineController;
    motionController!: MontionController;
    wallController!: WallController;
    wall1!: BABYLON.Mesh;
    EnterController!: EnterController;
    simpleBlock!: SimpleBlock;
    characterMesh: BABYLON.Mesh | undefined;
    // ground: Ground;
    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.engine = new BABYLON.Engine(this.canvas, true);
        this.scene = new BABYLON.Scene(this.engine);
        //open check model
        this.scene.debugLayer.show();
        //设置场景
        this.setupScene();
        // 引入模型
        this.loadModel().then(() => {
            // 输入控制---按键绑定
            this.EnterController = new EnterController(this.scene);
            this.EnterController.bind();

            //运动控制
            this.setupCharacter();

            //设置空气墙
            this.wallController = new WallController(this.scene)
            this.wall1 = this.wallController.buildWall1();

            //角色状态机绑定
            let keys = this.EnterController.getKeys();
            this.StateMachineController = new StateMachineController(this.scene, this.engine, keys);
            this.StateMachineController.init();
            // console.log("this.motionController.updateCharacterRotation", this.motionController.updateCharacterRotation)
            this.StateMachineController.addObserve(this.motionController.updateCharacterPosition, this.motionController.updateCharacterRotation);

            // 打开碰撞
            this.openCollision(true);

            

        });



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
    private loadModel(): Promise<void> {
        return new Promise((resolve, reject) => {
            BABYLON.SceneLoader.Append('/oerba_yun_fang_-_final_fantasy_xiii/', 'scene.gltf', this.scene, (scene) => {
                resolve();
                console.log('GLTF file loaded successfully!');
            }, null, (_scene, message, exception) => {
                reject(exception);
                console.error("Failed to load the model:", message);
            });
        });
    }
    private setupCharacter(): void {
        this.characterMesh = this.scene.meshes.find(mesh => mesh.name === "__root__") as BABYLON.Mesh | undefined;
        if (this.characterMesh) {
            let keys = this.EnterController.getKeys();
            this.motionController = new MontionController(this.characterMesh, this.scene, keys);
        } else {
            console.error("Root mesh '__root__' not found!");
        }
        //建立盒子
        this.simpleBlock = new SimpleBlock(this.characterMesh,this.scene);
    }
    // 开启碰撞----场景+盒子+墙
    private openCollision(status: boolean) {
        // 人物碰撞
        this.motionController.changeCheckCollisions(status);
        // 场景碰撞
        this.scene.collisionsEnabled = status;
        // 空气墙碰撞过
        this.wallController.openCollisions(this.wall1, status)
    }
}