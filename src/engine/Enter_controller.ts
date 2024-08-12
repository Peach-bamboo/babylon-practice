import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import { Keys } from './types';
import { avaConfig } from './avaConfig'

// 输入控制
export class EnterController {
    public keys: Keys = {};
    private scene: BABYLON.Scene;
    private _onKeyboardObserver!: BABYLON.Nullable<BABYLON.Observer<BABYLON.KeyboardInfo>>;

    constructor(scene: BABYLON.Scene) {
        this.scene = scene;
        this.keys[avaConfig.keyType.advance] = false;
        this.keys[avaConfig.keyType.back] = false;
        this.keys[avaConfig.keyType.speedUp] = false;
        this.keys[avaConfig.keyType.turnLeft] = false;
        this.keys[avaConfig.keyType.turnRight] = false;
    }
    // 按键绑定
    private keyInfoCallBack(kbInfo: BABYLON.KeyboardInfo) {
        switch (kbInfo.type) {
            case BABYLON.KeyboardEventTypes.KEYDOWN:
                if (kbInfo.event.key === avaConfig.keyType.advance ||kbInfo.event.key === avaConfig.keyType.advanceCapital) this.keys[avaConfig.keyType.advance] = true;
                if(kbInfo.event.key === avaConfig.keyType.back || kbInfo.event.key === avaConfig.keyType.backCapital) this.keys[avaConfig.keyType.back] = true;
                if (kbInfo.event.key === avaConfig.keyType.speedUpCapital) this.keys[avaConfig.keyType.speedUp] = true;
                if (kbInfo.event.key === avaConfig.keyType.turnLeft || kbInfo.event.key === avaConfig.keyType.turnLeftCapital) this.keys[avaConfig.keyType.turnLeft] = true;
                if (kbInfo.event.key === avaConfig.keyType.turnRight || kbInfo.event.key === avaConfig.keyType.turnRightCapital) this.keys[avaConfig.keyType.turnRight] = true;
                break;
            case BABYLON.KeyboardEventTypes.KEYUP:
                if (kbInfo.event.key === avaConfig.keyType.advance || kbInfo.event.key === avaConfig.keyType.advanceCapital) this.keys[avaConfig.keyType.advance] = false;
                if (kbInfo.event.key === avaConfig.keyType.back || kbInfo.event.key === avaConfig.keyType.backCapital) this.keys[avaConfig.keyType.back] = false;
                if (kbInfo.event.key === avaConfig.keyType.speedUpCapital) this.keys[avaConfig.keyType.speedUp] = false;
                if (kbInfo.event.key === avaConfig.keyType.turnLeft || kbInfo.event.key === avaConfig.keyType.turnLeftCapital) this.keys[avaConfig.keyType.turnLeft] = false;
                if (kbInfo.event.key === avaConfig.keyType.turnRight || kbInfo.event.key === avaConfig.keyType.turnRightCapital) this.keys[avaConfig.keyType.turnRight] = false;
                break;
        }
    }
    public bind() {
        this._onKeyboardObserver = this.scene.onKeyboardObservable.add((kbInfo: BABYLON.KeyboardInfo) => this.keyInfoCallBack(kbInfo));
    }
    public unbundle() {
        if (this._onKeyboardObserver) {
            this.scene.onKeyboardObservable.remove(this._onKeyboardObserver);
        }
        this._onKeyboardObserver = null;
    }
    public getKeys(){
        return this.keys;
    }
    public setKeys(val: Keys){
        this.keys = val
    }
}