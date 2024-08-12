import * as BABYLON from 'babylonjs';
export type AnimationType = BABYLON.Nullable<BABYLON.AnimationGroup>;
export type TransitionCondition = () => boolean;

// 自定义类型存储
// export type SpecificKeys = {
//     shift: boolean,
//     w: boolean,
//     s: boolean,
//     a: boolean,
//     d: boolean,
// };

export type Keys = {
    [key: string]: boolean;
};
export type WallSizeType = {
    height: number,
    width: number,
    depth: number
}
type State = {
    animation: AnimationType;
    transitions: {
        [key: string]: TransitionCondition;
    };
};

export type StateMachine = {
    [stateName: string]: State;
};

export type StateName = 'stand' | 'walk' | 'run';

export type AddCallback = () => undefined
