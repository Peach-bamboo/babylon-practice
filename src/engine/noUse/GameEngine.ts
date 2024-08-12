import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import { Character } from './Character';
import { Ground } from '../Ground';

class GameEngine {
  private canvas: HTMLCanvasElement;
  private engine: BABYLON.Engine;
  private scene: BABYLON.Scene;
  private character: Character | null = null;
  private keys: { [key: string]: boolean } = {};
  myGround: BABYLON.AbstractMesh | undefined;

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
    this.buildWall(this.scene);//空气墙
    this.addEventListeners();
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
      // 打印所有网格信息
      scene.meshes.forEach((mesh) => {
        // console.log('Mesh:', mesh.name, mesh);
      });
      this.setupCharacter(scene);
      // this.loadGround(scene)
    }, null, (_scene, message) => {
      console.error("Failed to load the model:", message);
    });
  }
  private loadGround(scene: BABYLON.Scene): void {

    // 创建地形
    this.myGround = BABYLON.MeshBuilder.CreateGroundFromHeightMap("ground", "https://www.babylonjs-playground.com/textures/heightMap.png", {
      width: 100,
      height: 100,
      subdivisions: 50,
      minHeight: 0,
      maxHeight: 10,
      onReady: (mesh) => {
        // 确保地形加载完成后再进行操作
        mesh.position.y = 0;

        // 使用 onBeforeRenderObservable 更新角色位置
        scene.onBeforeRenderObservable.add(() => {
          const characterMesh = scene.meshes.find(mesh => mesh.name === "__root__") as BABYLON.Mesh | undefined;
          if (characterMesh && mesh) {
            new Ground(characterMesh, mesh, scene);
          }
        })
      }
    }, scene);



  }



  private setupCharacter(scene: BABYLON.Scene): void {
    const characterMesh = scene.meshes.find(mesh => mesh.name === "__root__") as BABYLON.Mesh | undefined;
    if (characterMesh) {
      this.character = new Character(characterMesh, scene, this.keys, this.engine);
    } else {
      console.error("Root mesh '__root__' not found!");
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
          if (kbInfo.event.key === 'a' || kbInfo.event.key === 'A') this.keys.a = true;
          if (kbInfo.event.key === 'd' || kbInfo.event.key === 'D') this.keys.d = true;
          break;
        case BABYLON.KeyboardEventTypes.KEYUP:
          if (kbInfo.event.key === 'w' || kbInfo.event.key === 'W') this.keys.w = false;
          if (kbInfo.event.key === 'Shift') this.keys.shift = false;
          if (kbInfo.event.key === 'a' || kbInfo.event.key === 'A') this.keys.a = false;
          if (kbInfo.event.key === 'd' || kbInfo.event.key === 'D') this.keys.d = false;
          break;
      }
    });
  }
  private createAirWall(scene: BABYLON.Scene, position: BABYLON.Vector3, size: SizeType) {
    const wall = BABYLON.MeshBuilder.CreateBox("airWall", { height: size.height, width: size.width, depth: size.depth }, scene);
    wall.position = position;
    wall.visibility = 0.1; // 使空气墙不可见
    wall.checkCollisions = true; // 启用碰撞检测
    return wall;
  }
  private buildWall(scene: BABYLON.Scene) {
    // 创建四面空气墙，形成一个围绕角色的矩形区域
    const wallSize = { height: 10, width: 2, depth: 10 };
    // const wall1 = this.createAirWall(scene, new BABYLON.Vector3(0, 0, 5), wallSize);
    // const wall2 = this.createAirWall(scene, new BABYLON.Vector3(0, 0, -5), wallSize);
    const wall3 = this.createAirWall(scene, new BABYLON.Vector3(0, 0, 5), { height: 1, width: 1, depth: 1 });
    // const wall4 = this.createAirWall(scene, new BABYLON.Vector3(-5, 0, 0), { height: 10, width: 10, depth: 2 });

    scene.collisionsEnabled = true;
    if (this.character) {
      this.character.changeCheckCollisions(true);
    }

  }
}

interface SizeType {
  height: number | undefined,
  width: number | undefined,
  depth: number | undefined
}
export { GameEngine };
