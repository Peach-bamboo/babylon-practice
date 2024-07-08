import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import { Keys } from './types';

// 输入控制
export class EnterController {
    public keys: Keys = {
        shift: false,
        a: false,
        w: false,
        s: false,
        d: false
    }
    private scene: BABYLON.Scene;
    private _onKeyboardObserver!: BABYLON.Nullable<BABYLON.Observer<BABYLON.KeyboardInfo>>;

    constructor(scene: BABYLON.Scene) {
        this.scene = scene;
    }
    // 按键绑定
    private keyInfoCallBack(kbInfo: BABYLON.KeyboardInfo) {
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
}