# 燕雲武俠 RPG — Mobile-First MVP

手機優先橫屏武俠動作 RPG，以 Phaser 3 + React + TypeScript + Zustand 建構。

## 技術棧

| 層級 | 技術 |
|---|---|
| 遊戲引擎 | Phaser 3 |
| UI 框架 | React 19 |
| 語言 | TypeScript |
| 狀態管理 | Zustand |
| 建構工具 | Vite |

## 快速開始

```bash
npm install
npm run dev
```

## 建構

```bash
npm run build
npm run preview
```

## 專案結構

```
src/
  core/           遊戲核心（phaserConfig, eventBus, constants, game）
  scenes/         Phaser 場景（Boot, Preload, Village, BambooField, RuinCave, UI）
  entities/       遊戲實體（Player, Enemy, NPC, Interactable）
  systems/        遊戲系統
    combat/       戰鬥（combatSystem, lockOn, stamina, dodge）
    input/        輸入（virtualJoystick, touchInput）
    quest/        任務（questSystem, flagSystem）
    skills/       技能（weaponSystem, mysticArtSystem）
    ai/           AI（patrol, aggro）
    loot/         掉落（lootSystem）
  data/           JSON 內容資料（武器、奇術、任務、NPC、敵人等）
  ui/             React UI
    store/        Zustand 狀態（useGameStore）
    components/   UI 元件（MobileHUD, 各 Bottom Sheet）
  types/          TypeScript 型別定義
```

## 核心功能

- **雙武器系統**：可裝備兩把武器並一鍵切換（青鋒單劍 / 游風折扇）
- **奇術系統**：擒星拿月（拉近敵人/隔空取物）、凌雲踏（短距位移）
- **三個場景**：清河村（Hub）→ 竹林道（探索/戰鬥）→ 破廟地宮（Boss）
- **任務系統**：主線 + 支線 + 奇遇，支援多種完成條件
- **手機 HUD**：左半螢幕虛擬搖桿、右半螢幕戰鬥按鈕、Bottom Sheet 面板
- **自動鎖定**：自動鎖定最近敵人，降低觸控操作負擔

## 操作說明

### 手機
- 左半螢幕拖曳：移動
- 右下按鈕：輕擊 / 重擊 / 閃避 / 奇術 / 換武

### 鍵盤（開發用）
- WASD：移動
- Z：輕擊
- X：重擊
- C：閃避
- V：奇術
- Space：切換武器
