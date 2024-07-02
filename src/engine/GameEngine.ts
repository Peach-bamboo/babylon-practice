import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import { Character } from './Character';

class GameEngine {
  private canvas: HTMLCanvasElement;
  private engine: BABYLON.Engine;
  private scene: BABYLON.Scene;
  private character: Character | null = null;
  private keys: { [key: string]: boolean } = {};

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
    this.addEventListeners();
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }

  private setupScene(): void {
    this.scene.debugLayer.show();
    new BABYLON.HemisphericLight('light', new BABYLON.Vector3(1, 1, 0), this.scene);
    const camera = new BABYLON.ArcRotateCamera('camera', 0, 0, 10, BABYLON.Vector3.Zero(), this.scene);
    camera.attachControl(this.canvas, true);
  }

  private loadModel(): void {
    BABYLON.SceneLoader.Append('/oerba_yun_fang_-_final_fantasy_xiii/', 'scene.gltf', this.scene, (scene) => {
      console.log('GLTF file loaded successfully!');
      // 打印所有网格信息
      scene.meshes.forEach((mesh) => {
        console.log('Mesh:', mesh.name, mesh);
      });
      this.setupCharacter(scene);
    }, null, (_scene, message) => {
      console.error("Failed to load the model:", message);
    });
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
          break;
        case BABYLON.KeyboardEventTypes.KEYUP:
          if (kbInfo.event.key === 'w' || kbInfo.event.key === 'W') this.keys.w = false;
          if (kbInfo.event.key === 'Shift') this.keys.shift = false;
          break;
      }
    });
  }
}

export { GameEngine };
