import { merge } from "lodash-es";
import { Scene } from "../base";
import { DefaultHinter, Hintable, Hinter } from "../base/hint";
import { Player } from "../base/player";
import { Renderer } from "../base/renderer";
import { FontOptions } from "../options/font-options";
import { DefaultShadowOptions, ShadowOptions } from "../options/shadow-options";
import { EnhancedCanvasRenderingContext2D } from "../utils/enhance-ctx";
import Pos from "../utils/position";
import { Component } from "./component";
export abstract class BaseComponent implements Component, Hintable {
  alpha: number | ((n: number) => number);
  pos: Pos | ((n: number) => Pos);
  protected cAlpha: number;
  protected cPos: Pos;
  hinter: Hinter = new DefaultHinter();
  renderer: Renderer;
  player: Player;

  constructor(init?: Partial<BaseComponent>) {
    Object.assign(this, init);
    if (this.scene) {
      this.renderer = this.scene.renderer;
      this.player = this.scene.player;
    }
  }
  scene: Scene;

  shadow: ShadowOptions;
  font: FontOptions;
  ctx: EnhancedCanvasRenderingContext2D;

  update(options: any = {}): void {
    merge(this, options);
    this.shadow = merge(new DefaultShadowOptions(), this.shadow);
  }

  saveCtx(): void {
    this.ctx.save();
  }
  preRender() {
    const n = this.player.cFrame;

    if (this.pos === undefined) this.pos = { x: 0, y: 0 };
    this.cAlpha =
      this.alpha instanceof Function
        ? this.alpha(n / this.player.fps)
        : this.alpha;
    this.cPos = this.getValue(this.pos, n);
    this.ctx.globalAlpha = this.cAlpha;
    this.ctx.translate(this.cPos.x, this.cPos.y);
    if (this.shadow && this.shadow.enable) {
      this.ctx.shadowBlur = this.shadow.blur;
      this.ctx.shadowColor = this.shadow.color;
      this.ctx.shadowOffsetX = this.shadow.offset.x;
      this.ctx.shadowOffsetY = this.shadow.offset.y;
    }
  }

  abstract render(): void;

  restoreCtx(): void {
    this.ctx.restore();
  }

  draw() {
    try {
      this.saveCtx();
      this.preRender();
      this.render();
      this.restoreCtx();
    } catch (e) {
      console.error(e);
    }
  }

  protected getValue(obj: any, n: number): any {
    return obj instanceof Function ? obj(n) : obj;
  }
}
