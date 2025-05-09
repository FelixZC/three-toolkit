import * as THREE from "three";
import * as kokomi from "kokomi.js";
import { GLTF } from "three-stdlib";
import type Base from './index'
export class Fox extends kokomi.Component {
  base: Base;
  gltf: GLTF;
  animations: kokomi.AnimationManager;
  currentAction: THREE.AnimationAction | null;
  constructor(base: Base) {
    super(base);
    this.base = base;
    this.gltf = this.base.am.items["fox"];
    this.animations = new kokomi.AnimationManager(
      this.base,
      this.gltf.animations,
      this.gltf.scene
    );
    this.currentAction = null;
  }
  addExisting() {
    this.gltf.scene.scale.set(0.02, 0.02, 0.02);
    this.base.scene.add(this.gltf.scene);
  }
  playAction(name: string) {
    if (this.currentAction) {
      this.currentAction.fadeOut(0.5);
    }
    const action = this.animations.actions[name];
    action.reset().fadeIn(0.5).play();
    this.currentAction = action;
  }
}
